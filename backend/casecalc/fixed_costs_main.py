from casecalc.costifissi_report import costifissi_report_fill, costifissi_report_fill_total, costifissi_totals, \
    init_totals, costifissi_cos_val, costifissi_project_target, costifissi_report_fill_investment
from casecalc.efficiency import heating_efficiency
from casecalc.financial import quick_npv, total_investment_costs
from casecalc.fixed_costs_inner import calculate_costs
from casecalc.parameters import prepare_pp


def fixed_costs_main(project, cases, constants, report, noisematrix, year, vitamax):
    costifissi_case_values = {}
    proj_target = {}
    npv_values = {}
    pp = project.params
    prepare_pp(constants, pp, report)
    total_costs = {"total_heating_cost": 0, "total_dhw_cost": 0, "cases": []}

    if project.params["loan_check"]:
        loan = min(project.params["loan_amount_%"] / 100, 1)
    else:
        loan = 0
    if project.params["incentives_check"] and int(project.params["incentives_refund_years"]) == 0:
        bonus = min(project.params["incentives_amount_%"] / 100, 1)
    else:
        bonus = 0

    for case in cases:
        # Call writeparam(irecord)
        calc_dispersed_eff = heating_efficiency(case, constants, None, 0)
        fixed_costs = calculate_costs(
            case.current_params,
            case.planned_params,
            case.common_params,
            constants,
            calc_dispersed_eff["planned_params"]["selq_d"],
            report,
            case,
            noisematrix,
            year
        )
        total_investment_costs(case, fixed_costs, total_costs)
        # italy_discount = get_discount_rate(vcs, "Italy", constants.sheet_multi_memo)
        npv_values = quick_npv(case, calc_dispersed_eff, constants, fixed_costs, pp, noisematrix, vitamax)
        costifissi_case_values[case.id] = \
            costifissi_cos_val(calc_dispersed_eff, npv_values, case, total_costs, loan, bonus)
        # esaved is here normally
        proj_target[case.id] = costifissi_project_target(case, costifissi_case_values[case.id], npv_values,
                                                         total_costs, noisematrix, year)

    total_project_cost = total_costs["total_heating_cost"] + total_costs["total_dhw_cost"]
    total_project_cost_loan = total_project_cost * (1 - loan)
    costifissi_total_values = init_totals()
    for i in range(1, len(cases) + 1):
        costifissi_totals(costifissi_case_values, costifissi_total_values, cases[i - 1].id)
        costifissi_report_fill(costifissi_case_values, cases[i - 1].id, report)
    costifissi_report_fill_total(costifissi_total_values, report)
    costifissi_report_fill_investment(loan, project, report, total_project_cost, total_project_cost_loan)

    return proj_target
