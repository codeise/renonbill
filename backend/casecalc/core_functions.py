from casecalc.consumi import consumi, consumi_van

# Not called anymore
from casecalc.financial import get_npv_params
from casecalc.fixed_costs_main import fixed_costs_main
from casecalc.variable_costs import get_vita


def full_consumi(project, cases, constants, vitamax, statics, case_statics, vita, report, pub_rating, ui_output,
                 outflag, matrices):
    for year in range(0, vitamax + 1):
        # 0: irun
        total_cost = consumi(project, cases, constants, year, 0, statics, case_statics, vita, report, pub_rating,
                             ui_output, outflag, matrices)
        if year == 0:
            costs = total_cost
    return costs


def fixed_costs(project, cases, constants):
    if len(cases) == 0:
        return {}
    report = {}
    p, statics, vcs = get_npv_params(constants)
    vitamax = get_vita(vcs)
    return fixed_costs_main(project, cases, constants, report, None, 0, vitamax)


def npv(vitamax, cases, constants, outflag, project, pub_rating, report, statics, p, matrices, ui_output, vita):
    floor_area = 0
    cashflow = None
    costs = None
    for year in range(0, vitamax + 1):
        floor_area, tmp_cashflow, tmp_costs = consumi_van(cases, constants, 0, outflag, project, pub_rating, report, statics, p, ui_output,
                                 vita, year, matrices)
        if tmp_cashflow is not None:
            cashflow = tmp_cashflow
        if tmp_costs["cases"]:
            costs = tmp_costs
    return pub_rating, floor_area, cashflow, costs
