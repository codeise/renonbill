from django.db.models import Q

from api.models import BpCase, BpProject, OcProject, BpInvestment


def get_renovation_count_from_bp_cases(case_id, year):
    tmp = BpCase.objects.filter(Q(case_id=case_id) & Q(year=year))
    if tmp.exists():
        return tmp.get().renovation_count
    return 0


def get_government_subsidy_from_bp_cases(case_id, year):
    tmp = BpCase.objects.filter(Q(case_id=case_id) & Q(year=year))
    if tmp.exists():
        return tmp.get().government_subsidy
    return 0


def get_value_from_bp_projects(project_id, investment_name, year):
    tmp = \
        BpProject.objects.filter(Q(project_id=project_id) & Q(investment_id__name=investment_name) & Q(year=year))
    if tmp.exists():
        return tmp.get().value
    return 0


def get_value_from_oc_projects(project_id, investment_name):
    tmp = OcProject.objects.filter(Q(project_id=project_id) & Q(investment__name=investment_name))
    if tmp.exists():
        return tmp.get().value
    return 0


def get_investments_by_bp_project(project_id):
    list_result = [entry for entry in BpProject.objects.filter(project_id=project_id).order_by('investment_id', 'year').values()]
    investments = set()
    for element in list_result:
        investments.add(BpInvestment.objects.filter(pk=element['investment_id']).get())
    return investments


def get_investments_by_oc_project(project_id):
    list_result = [entry for entry in OcProject.objects.filter(project_id=project_id)
        .exclude(investment__name__in=["% of investment financed by FI", "FI Financing rate", "FI Financing duration"])
        .order_by('investment_id').values()]
    investments = set()
    for element in list_result:
        investments.add(BpInvestment.objects.filter(pk=element['investment_id']).get())
    return investments
