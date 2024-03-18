import copy

from django.db.models import Q
from django.contrib.auth.models import User
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework import status, permissions
from rest_framework.decorators import api_view
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from api.helper_functions import get_calc_endpoint_common_data, get_endpoint_common_data, get_all_report_data, \
    constants_memoization_init, get_erv_endpoint_common_data, get_bp_common_data
from api.services.project import save_rating_data, save_report_data
from backend.serializers import UserSerializer
from backend.settings import MEDIA_ROOT
from api.models import Constants, Project, Case, BpInvestment, get_default_report_data, get_default_rating_data, \
    BpProject, BpCase, OcProject
from api.serializers import CaseSerializer, ProjectSerializer, ConstantsSerializer, BpInvestmentSerializer, \
    BpProjectsSerializer, BpCasesSerializer, OcProjectSerializer, RegisterSerializer
from api.services.constants import get_case_data, import_constants
from api.services import case as case_service
from api.services import project as project_service
from api.services import constants as constants_service
import os.path

from casecalc.bp_calcs import calculate
from casecalc.consumi import consumi, consumi_mc, generate_noise, consumi_van_mc
from casecalc.core_functions import fixed_costs, npv, full_consumi
from casecalc.erv_calcs import erv_first_case, erv_second_case, erv_third_case, erv_fourth_case
from casecalc.financial import get_npv_params, get_npv_per_case_params
from casecalc.fixed_costs_main import fixed_costs_main
from casecalc.non_energy_benefits import calculate_benefits
from casecalc.prepare_bp_report_file import create_bp_workbook
from casecalc.prepare_report_file import create_workbook
from casecalc.public_rating import project_rating_update
import xlsxwriter
import json

from casecalc.variable_costs import get_vita


@api_view(['POST'])
def auth_test(request):
    return Response({}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_case_constants(request, user_id):
    return Response(get_case_data(user_id), status=status.HTTP_200_OK)


@api_view(['GET'])
def get_cases_by_project_id(request, project_id):
    cases = case_service.get_by_project_id(project_id)
    project = project_service.get_by_id(project_id)
    constants = constants_memoization_init(constants_service.get_by_user_id(project.user_id))
    context = {"fixed_costs": {}}

    report = project.report_data
    pub_rating = project.rating_data
    ui_output = {}

    p, statics, vcs = get_npv_params(constants)
    p = {}
    matrices = {
        "matrices_van": {},
        "matrices_cash": {},
        "dpb": {},
        "pb": {}
    }
    vitamax = get_vita(vcs)
    report['vitamax'] = vitamax

    vita = min(project.params["time_horizon_years"], vitamax)
    for case in cases:
        p[case.id] = get_npv_per_case_params()
    outflag = 1
    for case in cases:
        tmp = [case]
        pub_rating, floor_area, cashflow, costs = npv(vitamax, tmp, constants, outflag, project, pub_rating, report,
                                                      statics, p, matrices, ui_output, vita)
        cases_fixed_costs = fixed_costs(project, tmp, constants)
        if cases_fixed_costs:
            context["fixed_costs"].update(cases_fixed_costs)
        context["fixed_costs"][case.id]["qvan"] = ui_output["Labvan"]
        context["fixed_costs"][case.id]["qirr"] = ui_output["LabIRR"]
        context["fixed_costs"][case.id]["qpb"] = ui_output["dpb_zero"]
        context["fixed_costs"][case.id]["quick_pi"] = ui_output["LabPI"]
        context["fixed_costs"][case.id]["qvan_m2"] = \
            "{:,.0f}".format(float(ui_output["Labvan"].replace(",", "")) /
                             (case.common_params["floor_area"] * case.common_params["dwelling_count"] *
                              case.common_params["floor_count"]))

    case_serializer = CaseSerializer(cases, many=True, context=context)
    return Response(case_serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_projects_by_user_id(request, user_id):
    projects = project_service.get_by_user_id(user_id)
    project_serializer = ProjectSerializer(projects, many=True)
    return Response(project_serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_constants_by_user_id(request, user_id):
    try:
        constants = constants_service.get_by_user_id(user_id)
    except Constants.DoesNotExist:
        return Response({}, status=status.HTTP_204_NO_CONTENT)
    constants_serializer = ConstantsSerializer(constants, many=False)
    return Response(constants_serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def constants_exist(request, project_id):
    try:
        constants_service.get_by_user_id(project_service.get_by_id(project_id).user_id)
        return Response({"exists": True}, status=status.HTTP_200_OK)
    except Constants.DoesNotExist:
        return Response({"exists": False}, status=status.HTTP_200_OK)


@api_view(['POST'])
def upload_constants(request):
    # form = ConstantsForm(request.POST, request.FILES)
    # if form.is_valid():
    user_id = request.user.id
    file = request.FILES['constants_file']
    extension = os.path.splitext(file.name)[1]
    file_name = str(file.name)
    file.name = str(user_id) + str(extension)
    file_path = os.path.join(MEDIA_ROOT, "constants", file.name)
    if os.path.exists(file_path):
        os.remove(file_path)
    try:
        constants = Constants.objects.get(user_id=user_id)
        constants.file = file
    except Constants.DoesNotExist:
        constants = Constants(user_id=user_id, file=file)

    constants.file_name = file_name
    constants.save()
    try:
        import_constants(constants)
    except KeyError:
        return HttpResponse([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # Redirect to the document list after POST
    return HttpResponse(constants, status=status.HTTP_200_OK)


@api_view(['GET'])
def download_constants(request, user_id):
    try:
        constants = constants_service.get_by_user_id(user_id)
    except Constants.DoesNotExist:
        return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    file = constants.file
    data = file.read()

    response = HttpResponse(data, content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename="{}"'.format(constants.file_name)

    return response


@api_view(['GET'])
def get_heating_types(request):
    result = constants_service.get_heating_types(request.user.id)
    if not result:
        return Response({}, status=status.HTTP_204_NO_CONTENT)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_plant_types(request):
    result = constants_service.get_plant_types(request.user.id)
    if not result:
        return Response({}, status=status.HTTP_204_NO_CONTENT)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_consumption_data(request):
    common_data = get_calc_endpoint_common_data(request, {"t_min": {}, "t_med": {}, "hdd": {}, "rad": {}, "tday": {}})
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data

    consumi(project, cases, constants, 0, 0, statics, p, vita, report, pub_rating, ui_output, outflag, matrices)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_rating_data(project.id, pub_rating)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_report_data(project.id, report)
    return Response(ui_output, status=status.HTTP_200_OK)


@api_view(['PUT'])
def edit_project_params(request, project_id):
    if project_service.edit_params(project_id, request.data["params"]):
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_unit_options(request):
    return Response({"optionmjm2": "MJ/m2",
                     "optionmj": "MJ",
                     "optionkwhm": "kWh/m",
                     "optionkwh": "kWh"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_unit_currencies(request):
    return Response({"optionmjm2": "€/m2",
                     "optionmj": "€",
                     "optionkwhm": "€/m2",
                     "optionkwh": "€"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_monte_carlo(request):
    common_data = get_calc_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data
    mc_values = {}
    nrun = project.params["number_of_monte_carlo_runs"]
    for irun in range(1, nrun + 1):
        mc_values[irun] = {}
        consumi_mc(cases, constants, irun, nrun, outflag, project, pub_rating, report, statics,
                   p, ui_output, vita, 0, vitamax, mc_values, matrices)
        # year = 0 for MC, loop through year for VAN
    ui_output['print_values']['savings'] = ui_output['print_values'].pop('saving')
    ui_output['graph_values']['savings'] = ui_output['graph_values'].pop('saving')

    save_rating_data(project.id, pub_rating)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_report_data(project.id, report)
    return Response(ui_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_npv(request):
    common_data = get_calc_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data

    pub_rating, floor_area, cashflow, costs = npv(vitamax, cases, constants, outflag, project, pub_rating, report,
                                                  statics, p, matrices, ui_output, vita)

    save_rating_data(project.id, pub_rating)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_report_data(project.id, report)
    return Response(ui_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_mc_npv(request):
    common_data = get_calc_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data

    mc_values = {}
    nrun = project.params["number_of_monte_carlo_runs"]
    for irun in range(1, nrun + 1):
        mc_values[irun] = {}
        noise_matrix = generate_noise(cases, constants, project, vitamax, 0)
        for year in range(0, vita + 1):
            consumi_van_mc(cases, constants, irun, nrun, outflag, project, pub_rating, report,
                           statics, p, ui_output, vita, year, vitamax, mc_values, noise_matrix, matrices)
        constants.coefficients_memo = {}
    save_rating_data(project.id, pub_rating)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_report_data(project.id, report)
    return Response(ui_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_fixed_costs(request):
    common_data = get_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        user_id, project_id, case_ids, constants, project, cases = common_data

    sorted_output = fixed_costs(project, cases, constants)
    return Response(sorted_output, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_default_discount_rates(request, user_id):
    result = constants_service.get_v_costs(user_id)
    if not result:
        return Response({}, status=status.HTTP_204_NO_CONTENT)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_rating_data(request):
    common_data = get_calc_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data
    pub_rating, floor_area, cashflow, costs = npv(vitamax, cases, constants, outflag, project, pub_rating, report,
                                                  statics, p,
                                                  matrices, ui_output, vita)
    save_rating_data(project.id, pub_rating)
    project_rating_update(project, project.rating_data, ui_output, floor_area, report)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_report_data(project.id, report)
    return Response(ui_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_nonenergy_data(request):
    common_data = get_calc_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data
    benefits_output = {}
    total_cost = full_consumi(project, cases, constants, vitamax, statics, p, vita, report,
                              pub_rating, ui_output, outflag, matrices)
    totals = {
        "project_benefit": 0,
        "project_rating": 0
    }

    for case in cases:
        benefits_output[case.id] = {}
        calculate_benefits(case, benefits_output, total_cost, totals, report)

    save_rating_data(project.id, pub_rating)
    fixed_costs_main(project, cases, constants, report, None, 0, vitamax)
    save_report_data(project.id, report)
    return Response(benefits_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_report_data(request):
    user_id = request.data["user_id"]
    project_id = request.data["project_id"]
    if not project_id or not user_id:
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    return Response(get_all_report_data(user_id, project_id), status=status.HTTP_200_OK)


@api_view(['POST'])
def generate_report_excel(request):
    user_id = int(request.data["user_id"])
    project_id = int(request.data["project_id"])
    header_label = request.data["headerLabel"]
    sub_header_label = request.data["subHeaderLabel"]
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = "attachment; filename=report.xlsx"

    data = get_all_report_data(user_id, project_id)
    data["headerLabel"] = header_label
    data["subHeaderLabel"] = sub_header_label

    # Create an new Excel file and add a worksheet.
    workbook = xlsxwriter.Workbook(response, {'in_memory': True})
    worksheet = workbook.add_worksheet('Report')

    worksheet.set_column('A:A', 40)
    worksheet.set_column('B:B', 17)
    worksheet.set_column('C:C', 20)
    worksheet.set_column('D:N', 16)
    worksheet.set_column('O:R', 13)
    worksheet.set_row(27, 42)
    worksheet.set_row(33, 42)

    create_workbook(workbook, worksheet, data)
    workbook.close()
    return response


@api_view(['GET'])
def export_project(request, project_id):
    project = Project.objects.filter(pk=project_id).get()
    project_serializer = ProjectSerializer(project, many=False)
    project_json = JSONRenderer().render(project_serializer.data)
    response = HttpResponse(project_json, content_type='application/json')
    response['Content-Disposition'] = 'attachment; filename="project.json"'
    return response


@api_view(['POST'])
def import_project(request):
    file = request.FILES['importFile']
    data = json.load(file)
    project_serializer = ProjectSerializer(data=data, many=False)
    if project_serializer.is_valid():
        project_serializer.save()
    project_id = project_serializer.data['id']
    dict_cases = project_serializer.initial_data['cases']
    for dict_case in dict_cases:
        dict_case['project_id'] = project_id
        new_case = Case(project_id=project_id, common_params=dict_case['common_params'],
                        current_params=dict_case['current_params'], planned_params=dict_case['planned_params'])
        new_case.save()
        dict_case['id'] = new_case.id
    new_investments = set()
    for bp_project in project_serializer.initial_data['bp_projects']:
        inv_name = bp_project['investment']["name"]
        new_investments.add(inv_name)
    investments_to_add = []
    for investment in new_investments.difference(set(BpInvestment.objects.all().values_list('name', flat=True))):
        investments_to_add.append(BpInvestment(name=investment))

    BpInvestment.objects.bulk_create(investments_to_add)

    for bp_project in project_serializer.initial_data['bp_projects']:
        bp_project['investment']['id'] = BpInvestment.objects.get(name=bp_project['investment']["name"]).id

    for oc_project in project_serializer.initial_data['oc_projects']:
        oc_project['investment']['id'] = BpInvestment.objects.get(name=oc_project['investment']["name"]).id

    for dict_case in dict_cases:
        bp_cases_to_add = []
        for bp_case in dict_case["bp_cases"]:
            bp_cases_to_add.append(BpCase(case_id=dict_case['id'], year=bp_case['year'],
                                          renovation_count=bp_case['renovation_count'],
                                          government_subsidy=bp_case['government_subsidy']))
        BpCase.objects.bulk_create(bp_cases_to_add)

    oc_projects_to_add = []
    for oc_project in project_serializer.initial_data["oc_projects"]:
        oc_projects_to_add.append(
            OcProject(project_id=project_id, value=oc_project['value'], investment_id=oc_project['investment_id'])
        )
    OcProject.objects.bulk_create(oc_projects_to_add)

    bp_projects_to_add = []
    for bp_project in project_serializer.initial_data["bp_projects"]:
        bp_projects_to_add.append(
            BpProject(project_id=project_id, year=bp_project['year'], value=bp_project['value'],
                      investment_id=bp_project['investment_id'])
        )
    BpProject.objects.bulk_create(bp_projects_to_add)

    return HttpResponse({}, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_erv_first_case(request):
    case, cashflow, costs, case_output = get_erv_endpoint_common_data(request)
    try:
        erv_first_case(case, cashflow, costs["total_heating_cost"] + costs["total_dhw_cost"], case_output)
    except ValueError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
    return Response(case_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_erv_second_case(request):
    case, cashflow, costs, case_output = get_erv_endpoint_common_data(request)
    try:
        erv_second_case(case, cashflow, costs["total_heating_cost"] + costs["total_dhw_cost"], case_output)
    except ValueError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    return Response(case_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_erv_third_case(request):
    case, cashflow, costs, case_output = get_erv_endpoint_common_data(request)
    try:
        erv_third_case(case, cashflow, costs["total_heating_cost"] + costs["total_dhw_cost"], case_output)
    except ValueError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    return Response(case_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def run_erv_fourth_case(request):
    case, cashflow, costs, case_output = get_erv_endpoint_common_data(request)
    try:
        erv_fourth_case(case, cashflow, costs["total_heating_cost"] + costs["total_dhw_cost"], case_output)
    except ValueError as e:
        return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

    return Response(case_output, status=status.HTTP_200_OK)


@api_view(['POST'])
def reset_report_data(request):
    project = Project.objects.filter(pk=request.data["project_id"]).get()
    default_report_data = get_default_report_data()
    report_data = project.report_data
    report_data["pub_rating"]["exp_values"] = default_report_data["pub_rating"]["exp_values"]
    report_data["pub_rating"]["rating_values"] = default_report_data["pub_rating"]["rating_values"]
    report_data["van_mc_values"] = default_report_data["van_mc_values"]
    report_data["investment_values"]["total_cost_loan"] = default_report_data["investment_values"]["total_cost_loan"]
    if request.data["engineering_analysis"]:
        report_data["monte_carlo_values"] = default_report_data["monte_carlo_values"]
    project.save()
    return Response({}, status=status.HTTP_200_OK)


@api_view(['POST'])
def reset_rating_data(request):
    project = Project.objects.filter(pk=request.data["project_id"]).get()
    project.rating_data = get_default_rating_data()
    project.save()
    return Response({}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_users_by_user_permissions(request, user_id):
    user = User.objects.filter(pk=user_id).get()
    if not user.is_superuser:
        return Response({}, status=status.HTTP_200_OK)
    else:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        user_serializer = RegisterSerializer(data=request.data, many=False)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(user_serializer.data['id'], status=status.HTTP_200_OK)


@api_view(['POST'])
def calculate_bp_data(request):
    try:
        project, cases, unitary_costs, bill_savings, energy_savings = get_bp_common_data(request)
        ui_output = calculate(project, cases, unitary_costs, bill_savings, energy_savings)
    except ZeroDivisionError:
        return Response({"error": "You either need to have a renovation for year 1 or add an investment which "
                                  "has a value greater than 0 for year 1"},
                        status=status.HTTP_400_BAD_REQUEST)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(ui_output, status=status.HTTP_200_OK)


def add_investment(investment):
    serializer = BpInvestmentSerializer(data=investment)
    if serializer.is_valid():
        serializer.save()


def add_investment_value(project_id, investment_name, year, value):
    investment = BpInvestment.objects.filter(name=investment_name).first()
    serializer = BpProjectsSerializer(data={'year': year,
                                            'value': value,
                                            'investment_id': investment.id,
                                            'project_id': project_id})
    bp_project_investment = BpProject.objects.filter(
        Q(investment_id=investment.id) & Q(project_id=project_id))
    if bp_project_investment.exists():
        year = bp_project_investment.filter(year=year)
        if year.exists():
            tmp = year.first()
            tmp.value = value
            tmp.save(force_update=True)
        else:
            if serializer.is_valid():
                serializer.save()
    else:
        if serializer.is_valid():
            serializer.save()


def delete_unused_investment_years(project_id):
    project = Project.objects.filter(pk=project_id).get()
    BpProject.objects.filter(Q(project_id=project_id) & Q(year__gt=project.params['bp_year'])).delete()


def delete_unused_investments(project_id, investment_values):
    investment_ids = []
    for values in investment_values:
        investment = BpInvestment.objects.filter(name=values['name']).first()
        if investment:
            investment_ids.append(investment.id)
    BpProject.objects.filter(~Q(investment_id__in=investment_ids) & Q(project_id=project_id)).delete()


@api_view(['POST'])
def add_bp_cases(request):
    add_bp_cases_common(request.data["year_count"], request.data["nrGsValues"])
    return Response("", status=status.HTTP_200_OK)


def add_bp_cases_common(year_count, nrgs_values):
    for caseNrgsValues in nrgs_values:
        cases = BpCase.objects.filter(case_id=caseNrgsValues['case_id']).order_by('year')
        bp_cases_serializer = BpCasesSerializer(cases, many=True)
        bp_cases_data = bp_cases_serializer.data
        if bp_cases_data:
            for i in range(1, year_count + 1):
                if i <= len(bp_cases_data):
                    if bp_cases_data[i - 1]["year"] == i:
                        db_case = BpCase.objects.filter(Q(case_id=caseNrgsValues['case_id']) & Q(year=i)).get()
                        db_case.renovation_count = caseNrgsValues['nrValues']["year" + str(i)]
                        db_case.government_subsidy = caseNrgsValues['gsValues']["year" + str(i)]
                        db_case.save(force_update=True)
                else:
                    add_bp_case(caseNrgsValues, i)
        else:
            for i in range(1, year_count + 1):
                add_bp_case(caseNrgsValues, i)


def add_bp_case(caseNrgsValues, i):
    data = {
        "year": i,
        "renovation_count": caseNrgsValues['nrValues']["year" + str(i)],
        "government_subsidy": caseNrgsValues['gsValues']["year" + str(i)],
        "case_id": caseNrgsValues['case_id']
    }
    serializer = BpCasesSerializer(data=data)
    if serializer.is_valid():
        serializer.save()


def delete_unused_case_years(case_id, year):
    try:
        BpCase.objects.filter(Q(case_id=case_id) & Q(year__gt=year)).delete()
    except BpProject.DoesNotExist:
        return Response({}, status=status.HTTP_201_CREATED)
    return Response({}, status=status.HTTP_201_CREATED)


def add_obr_item(project_id, investment_name, value):
    investment = BpInvestment.objects.filter(name=investment_name).first()
    entry = OcProject.objects.filter(Q(project_id=project_id) & Q(investment_id=investment.id))
    if entry.exists():
        tmp = entry.first()
        tmp.value = value
        tmp.save(force_update=True)
        return Response({}, status=status.HTTP_201_CREATED)
    else:
        request_data = {'value': value,
                        'investment_id': investment.id,
                        'project_id': project_id}
        serializer = OcProjectSerializer(data=request_data)
        if serializer.is_valid():
            serializer.save()


@api_view(['GET'])
def get_bp_case_data(request):
    bp_cases = BpCase.objects.all()
    bp_cases_serializer = BpCasesSerializer(bp_cases, many=True)
    return Response(bp_cases_serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_project_bp_year(request, project_id):
    year = project_service.get_bp_year(project_id)
    return Response(year, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_bp_project_data(request, project_id):
    bp_project_serializer = get_bp_project(project_id)
    return Response(bp_project_serializer.data, status=status.HTTP_200_OK)


def get_bp_project(project_id):
    bp_project_data = BpProject.objects.all().filter(project_id=project_id)
    bp_project_serializer = BpProjectsSerializer(bp_project_data, many=True)
    for data in bp_project_serializer.data:
        data["name"] = BpInvestment.objects.filter(pk=data["investment_id"]).get().name
    return bp_project_serializer


@api_view(['GET'])
def get_oc_values(request, project_id):
    oc_response = []
    default_investment_names = ["% of investment financed by FI", "FI Financing rate", "FI Financing duration"]
    oc_data = OcProject.objects.all().filter(project_id=project_id)
    oc_serializer = OcProjectSerializer(oc_data, many=True)
    for data in oc_serializer.data:
        investment_name = BpInvestment.objects.filter(pk=data["investment_id"]).get().name
        if investment_name not in default_investment_names:
            data["name"] = BpInvestment.objects.filter(pk=data["investment_id"]).get().name
            oc_response.append(data)
    return Response(oc_response, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_oc_default_values(request, project_id):
    oc_response = []
    default_investment_names = ["% of investment financed by FI", "FI Financing rate", "FI Financing duration"]
    oc_data = OcProject.objects.all().filter(project_id=project_id)
    oc_serializer = OcProjectSerializer(oc_data, many=True)
    for data in oc_serializer.data:
        investment_name = BpInvestment.objects.filter(pk=data["investment_id"]).get().name
        if investment_name in default_investment_names:
            data["name"] = BpInvestment.objects.filter(pk=data["investment_id"]).get().name
            oc_response.append(data)
    return Response(oc_response, status=status.HTTP_200_OK)


@api_view(['GET'])
def search_investments(request, name):
    investments = BpInvestment.objects.all().filter(name__istartswith=name).order_by("name")
    investments_serializer = BpInvestmentSerializer(investments, many=True)
    return Response(investments_serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def generate_bp_report(request):
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = "attachment; filename=report.xlsx"

    workbook = xlsxwriter.Workbook(response, {'in_memory': True})
    worksheet = workbook.add_worksheet("Report")
    worksheet.set_column('A:A', 30)
    worksheet.set_column('B:B', 30)
    worksheet.set_column('C:C', 25)
    worksheet.set_column('D:AZ', 20)

    input = copy.deepcopy(request.data["input"])
    for case_value in input['case_values']:
        input['case_values'][case_value]['onbill_component'] = '{:,}'.format(
            int(float(input['case_values'][case_value]['onbill_component'])))

    for bp in input['bp_list']:
        for key in input['bp_list'][bp].keys():
            if key != "name":
                input['bp_list'][bp][key] = '{:,}'.format(int(float(input['bp_list'][bp][key])))
    for oc in input['oc_list']:
        input['oc_list'][oc][1] = '{:,}'.format(int(float(input['oc_list'][oc][1])))

    create_bp_workbook(workbook, worksheet, input, request.data["output"],
                       request.data["bp_year"], request.data["scheme_year"])
    workbook.close()
    return response


def delete_unused_oc_data(project_id, operational_costs):
    current_investment_ids = []
    for values in operational_costs:
        investment = BpInvestment.objects.filter(name=values['name']).first()
        if investment:
            current_investment_ids.append(investment.id)
    OcProject.objects.filter(~Q(investment_id__in=current_investment_ids) & Q(project_id=project_id)).delete()


@api_view(['POST'])
def save_bp_data(request):
    for investment in request.data['investmentsValues']:
        add_investment({'name': investment['name']})
        for key in investment.keys():
            if key != "id" and key != "name":
                add_investment_value(request.data['project_id'], investment['name'], int(key[4:]),
                                     investment[key])
    delete_unused_investment_years(request.data['project_id'])
    delete_unused_investments(request.data['project_id'], request.data['investmentsValues'])
    add_bp_cases_common(request.data['bp_year'], request.data['nrGsValues'])
    for case in request.data['cases']['data']:
        delete_unused_case_years(case['id'], request.data['projectParamsBpYear'])
    for investment in request.data['operationalCostsValues']:
        add_investment({'name': investment['name']})
    for operational_cost in request.data['operationalCostsValues']:
        add_obr_item(request.data['project_id'], operational_cost['name'], operational_cost['value'])
    delete_unused_oc_data(request.data['project_id'], request.data['operationalCostsValues'])
    for obr_item in request.data['obrData']:
        add_obr_item(request.data['project_id'], obr_item['name'], obr_item['value'])
    return Response({}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def delete_investment(request):
    investment = BpInvestment.objects.filter(name=request.data["investment_name"]).first()
    if investment:
        BpProject.objects.filter(Q(investment_id=investment.id) & Q(project_id=request.data["project_id"])).delete()

    bp_project_serializer = get_bp_project(request.data["project_id"])
    return Response(bp_project_serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def delete_oc(request):
    investment = BpInvestment.objects.filter(name=request.data["oc_name"]).first()
    if investment:
        OcProject.objects.filter(Q(investment_id=investment.id) & Q(project_id=request.data["project_id"])).delete()

    return Response({}, status=status.HTTP_200_OK)


@api_view(['POST'])
def edit_cases_erv_params(request):
    cases = Case.objects.all().filter(project_id=request.data["project_id"])
    new_erv_params = request.data["erv_params"]
    for case in cases:
        case.common_params = case.common_params | new_erv_params
        case.save()
    return Response({}, status.HTTP_200_OK)
