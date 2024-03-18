import rest_framework_simplejwt.exceptions
from django.utils.encoding import smart_str
from django.http import HttpRequest
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from api.models import Project
from api.serializers import CaseSerializer
from api.services import case as case_service
from api.services import project as project_service
from api.services import constants as constants_service
from casecalc.consumi import consumi
from backend import settings
from casecalc.core_functions import fixed_costs, npv
from casecalc.erv_calcs import erv_first_case
import random

from casecalc.financial import get_npv_params, get_npv_per_case_params
from casecalc.variable_costs import get_vita
from hashlib import md5 as md5_constructor
from hashlib import sha1 as sha_constructor


def get_endpoint_common_data(request):
    user_id = request.data["user_id"]
    project_id = request.data["project_id"]
    case_ids = request.data["case_ids"]

    constants = constants_memoization_init(constants_service.get_by_user_id(user_id))
    project = project_service.get_by_id(project_id)

    if not case_ids:
        cases = case_service.get_by_project_id(project_id)
    else:
        cases = case_service.get_by_ids(case_ids)
    if len(cases) == 0:
        return Response({}, status=status.HTTP_200_OK)

    return user_id, project_id, case_ids, constants, project, cases


def constants_memoization_init(constants):
    constants.coefficients_memo = {}
    constants.sheet_multi_memo = {}
    constants.rad_memo = []
    return constants


def get_calc_endpoint_common_data(request, ui_output_init=None):
    common_data = get_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        user_id, project_id, case_ids, constants, project, cases = common_data

    report = project.report_data
    pub_rating = project.rating_data
    ui_output = {}
    if ui_output_init:
        ui_output = ui_output_init
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

    return vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita


def get_all_report_data(user_id, project_id):
    project = project_service.get_by_id(project_id)
    data = project.report_data
    cases = case_service.get_by_project_id(project_id)
    constants = constants_memoization_init(constants_service.get_by_user_id(user_id))
    f_costs = fixed_costs(project, cases, constants)
    for case in cases:
        case.common_params = {**(case.common_params), **(f_costs[case.id])}
    case_serializer = CaseSerializer(cases, many=True)
    data["dwellings"] = case_serializer.data
    return data


def get_erv_endpoint_common_data(request):
    common_data = get_calc_endpoint_common_data(request)
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data
    case_output = {}

    pub_rating, floor_area, cashflow, costs = npv(vitamax, cases, constants, outflag, project, pub_rating, report,
                                                  statics, p, matrices, ui_output, vita)

    return cases[0], cashflow, costs, case_output


def get_bp_common_data(request):
    unitary_costs, bill_savings, energy_savings = {}, {}, {}
    common_data = get_calc_endpoint_common_data(request, {"t_min": {}, "t_med": {}, "hdd": {}, "rad": {}, "tday": {}})
    if type(common_data) is not tuple:
        return common_data
    else:
        vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita = common_data
    single_case_request = HttpRequest()
    single_case_request.data = {
            'user_id': request.data['user_id'],
            'project_id': request.data['project_id'],
        }

    for case in cases:
        single_case_request.data['case_ids'] = [case.id]
        tmp = cases.filter(pk=case.id)
        consumi(project, tmp, constants, 0, 0, statics, p, vita, report, pub_rating, ui_output, outflag, matrices)
        unitary_costs[case.id] = float(ui_output['intervention_cost'].replace(",", ""))

        unnecessary_case, cashflow, costs, case_output = get_erv_endpoint_common_data(single_case_request)
        try:
            erv_first_case(case, cashflow, unitary_costs[case.id], case_output)
        except ValueError as e:
            raise e
        bill_savings[case.id] = float(case_output['obf1_bill_savings'].replace(",", "") )
        energy_savings[case.id] = bill_savings[case.id] * 4
    return project, cases, unitary_costs, bill_savings, energy_savings


def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)
    if type(exc) == rest_framework_simplejwt.exceptions.InvalidToken or \
            type(exc) == rest_framework_simplejwt.exceptions.AuthenticationFailed:
        response.status_code = settings.UNAUTHORIZED_STATUS_CODE
    # Customize your exception handling here
    return response
