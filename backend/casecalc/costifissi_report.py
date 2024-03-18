import math

from casecalc.constants_helpers import get_noise_value
from casecalc.financial import get_total_case_cost


def init_totals():
    keys = [
        "current_fuel_energy",
        "planned_fuel_energy",
        "saved_fuel_energy",
        "current_fuel_bill",
        "planned_fuel_bill",
        "saved_fuel_bill",
        "current_electric_energy",
        "planned_electric_energy",
        "saved_electric_energy",
        "current_electric_bill",
        "planned_electric_bill",
        "saved_electric_bill",
        "current_heating_energy_loss",
        "planned_heating_energy_loss",
        "saved_heating_energy_loss",
        "current_dhw_energy_loss",
        "planned_dhw_energy_loss",
        "saved_dhw_energy_loss"
    ]
    return dict.fromkeys(keys, 0)


# calc_dispersed_eff = cdf
def costifissi_cos_val(cdf, npv_values, case, total_costs, loan, bonus):
    cos_val = {}
    npv_v_c = npv_values["vc_values"]["current_params"]
    npv_v_p = npv_values["vc_values"]["planned_params"]
    cos_val["current_fuel_energy"] = cdf["current_params"]["selq_f"] + cdf["current_params"]["selqDHW_f"]
    cos_val["planned_fuel_energy"] = cdf["planned_params"]["selq_f"] + cdf["planned_params"]["selqDHW_f"]
    cos_val["saved_fuel_energy"] = cos_val["current_fuel_energy"] - cos_val["planned_fuel_energy"]
    cos_val["current_fuel_bill"] = npv_v_c["selVC_f"] + npv_v_c["selVCDHW_f"]
    cos_val["planned_fuel_bill"] = npv_v_p["selVC_f"] + npv_v_p["selVCDHW_f"]
    cos_val["saved_fuel_bill"] = cos_val["current_fuel_bill"] - cos_val["planned_fuel_bill"]
    cos_val["current_electric_energy"] = cdf["current_params"]["selq_e"] + cdf["current_params"]["selqDHW_e"]
    cos_val["planned_electric_energy"] = cdf["planned_params"]["selq_e"] + cdf["planned_params"]["selqDHW_e"]
    cos_val["saved_electric_energy"] = cos_val["current_electric_energy"] - cos_val["planned_electric_energy"]
    cos_val["current_electric_bill"] = npv_v_c["selVC_e"] + npv_v_c["selVCDHW_e"]
    cos_val["planned_electric_bill"] = npv_v_p["selVC_e"] + npv_v_p["selVCDHW_e"]
    cos_val["saved_electric_bill"] = cos_val["current_electric_bill"] - cos_val["planned_electric_bill"]
    cos_val["current_heating_energy_loss"] = cdf["current_params"]["selq_d"]
    cos_val["planned_heating_energy_loss"] = cdf["planned_params"]["selq_d"]
    cos_val["saved_heating_energy_loss"] = cos_val["current_heating_energy_loss"] - cos_val[
        "planned_heating_energy_loss"]
    cos_val["current_dhw_energy_loss"] = cdf["current_params"]["selqDHW_d"]
    cos_val["planned_dhw_energy_loss"] = cdf["planned_params"]["selqDHW_d"]
    cos_val["saved_dhw_energy_loss"] = cos_val["current_dhw_energy_loss"] - cos_val["planned_dhw_energy_loss"]
    cos_val["cost_loan_bonus"] = get_total_case_cost(total_costs, case)["total_case_cost"] * (1 - loan - bonus)
    cos_val["qvan_m2"] = npv_values["qvan"] / cdf["current_params"]["s_floor_area"]
    if cos_val["cost_loan_bonus"] != 0:
        cos_val["quick_PI"] = 1 + npv_values["qvan"] / cos_val["cost_loan_bonus"]
    else:
        cos_val["quick_PI"] = math.inf
    return cos_val


# costifissi_total_values = ctv
def costifissi_report_fill_total(ctv, report):
    one_digit = "{:,.1f}"
    report["total_costifissi_values"] = {
        "total_current_fuel_energy": one_digit.format(ctv["current_fuel_energy"] / 3.6),
        "total_planned_fuel_energy": one_digit.format(ctv["planned_fuel_energy"] / 3.6),
        "total_saved_fuel_energy": one_digit.format(ctv["saved_fuel_energy"] / 3.6),
        "total_current_electric_energy": one_digit.format(ctv["current_electric_energy"] / 3.6),
        "total_planned_electric_energy": one_digit.format(ctv["planned_electric_energy"] / 3.6),
        "total_saved_electric_energy": one_digit.format(ctv["saved_electric_energy"] / 3.6),
        "total_current_fuel_bill": one_digit.format(ctv["current_fuel_bill"]),
        "total_planned_fuel_bill": one_digit.format(ctv["planned_fuel_bill"]),
        "total_saved_fuel_bill": one_digit.format(ctv["saved_fuel_bill"]),
        "total_current_electric_bill": one_digit.format(ctv["current_electric_bill"]),
        "total_planned_electric_bill": one_digit.format(ctv["planned_electric_bill"]),
        "total_saved_electric_bill": one_digit.format(ctv["saved_electric_bill"]),
        "total_current_energy_cons":
            one_digit.format((ctv["current_fuel_energy"] + ctv["current_electric_energy"]) / 3.6),
        "total_planned_energy_cons":
            one_digit.format((ctv["planned_fuel_energy"] + ctv["planned_electric_energy"]) / 3.6),
        "total_saved_energy_cons": one_digit.format((ctv["saved_fuel_energy"] + ctv["saved_electric_energy"]) / 3.6),
        "total_current_energy_bill": one_digit.format(ctv["current_fuel_bill"] + ctv["current_electric_bill"]),
        "total_planned_energy_bill": one_digit.format(ctv["planned_fuel_bill"] + ctv["planned_electric_bill"]),
        "total_saved_energy_bill": one_digit.format(ctv["saved_fuel_bill"] + ctv["saved_electric_bill"]),
        "total_current_heating_energy_loss": one_digit.format(ctv["current_heating_energy_loss"] / 3.6),
        "total_planned_heating_energy_loss": one_digit.format(ctv["planned_heating_energy_loss"] / 3.6),
        "total_saved_heating_energy_loss": one_digit.format(ctv["saved_heating_energy_loss"] / 3.6),
        "total_current_dhw_energy_loss": one_digit.format(ctv["current_dhw_energy_loss"] / 3.6),
        "total_planned_dhw_energy_loss": one_digit.format(ctv["planned_dhw_energy_loss"] / 3.6),
        "total_saved_dhw_energy_loss": one_digit.format(ctv["saved_dhw_energy_loss"] / 3.6),
        "total_current_energy_loss":
            one_digit.format((ctv["current_heating_energy_loss"] + ctv["current_dhw_energy_loss"]) / 3.6),
        "total_planned_energy_loss":
            one_digit.format((ctv["planned_heating_energy_loss"] + ctv["planned_dhw_energy_loss"]) / 3.6),
        "total_saved_energy_loss":
            one_digit.format((ctv["saved_heating_energy_loss"] + ctv["saved_dhw_energy_loss"]) / 3.6)
    }


# costifissi_case_values = ccv
def costifissi_report_fill(ccv, i, report):
    report[i] = {}
    ri = report[i]
    ri["current_fuel_energy"] = ccv[i]["current_fuel_energy"] / 3.6
    ri["planned_fuel_energy"] = ccv[i]["planned_fuel_energy"] / 3.6
    ri["saved_fuel_energy"] = ccv[i]["saved_fuel_energy"] / 3.6
    ri["current_fuel_bill"] = ccv[i]["current_fuel_bill"]
    ri["planned_fuel_bill"] = ccv[i]["planned_fuel_bill"]
    ri["saved_fuel_bill"] = ccv[i]["saved_fuel_bill"]
    ri["current_electric_energy"] = ccv[i]["current_electric_energy"] / 3.6
    ri["planned_electric_energy"] = ccv[i]["planned_electric_energy"] / 3.6
    ri["saved_electric_energy"] = ccv[i]["saved_electric_energy"] / 3.6
    ri["current_electric_bill"] = ccv[i]["current_electric_bill"]
    ri["planned_electric_bill"] = ccv[i]["planned_electric_bill"]
    ri["saved_electric_bill"] = ccv[i]["saved_electric_bill"]
    ri["current_heating_energy_loss"] = ccv[i]["current_heating_energy_loss"] / 3.6
    ri["planned_heating_energy_loss"] = ccv[i]["planned_heating_energy_loss"] / 3.6
    ri["saved_heating_energy_loss"] = ccv[i]["saved_heating_energy_loss"] / 3.6
    ri["current_dhw_energy_loss"] = ccv[i]["current_dhw_energy_loss"] / 3.6
    ri["planned_dhw_energy_loss"] = ccv[i]["planned_dhw_energy_loss"] / 3.6
    ri["saved_dhw_energy_loss"] = ccv[i]["saved_dhw_energy_loss"] / 3.6


# costifissi_case_values = ccv, costifissi_total_values = ctv
def costifissi_totals(ccv, ctv, i):
    ctv["current_fuel_energy"] = ctv["current_fuel_energy"] + ccv[i]["current_fuel_energy"]
    ctv["planned_fuel_energy"] = ctv["planned_fuel_energy"] + ccv[i]["planned_fuel_energy"]
    ctv["saved_fuel_energy"] = ctv["saved_fuel_energy"] + ccv[i]["saved_fuel_energy"]
    ctv["current_fuel_bill"] = ctv["current_fuel_bill"] + ccv[i]["current_fuel_bill"]
    ctv["planned_fuel_bill"] = ctv["planned_fuel_bill"] + ccv[i]["planned_fuel_bill"]
    ctv["saved_fuel_bill"] = ctv["saved_fuel_bill"] + ccv[i]["saved_fuel_bill"]
    ctv["current_electric_energy"] = ctv["current_electric_energy"] + ccv[i]["current_electric_energy"]
    ctv["planned_electric_energy"] = ctv["planned_electric_energy"] + ccv[i]["planned_electric_energy"]
    ctv["saved_electric_energy"] = ctv["saved_electric_energy"] + ccv[i]["saved_electric_energy"]
    ctv["current_electric_bill"] = ctv["current_electric_bill"] + ccv[i]["current_electric_bill"]
    ctv["planned_electric_bill"] = ctv["planned_electric_bill"] + ccv[i]["planned_electric_bill"]
    ctv["saved_electric_bill"] = ctv["saved_electric_bill"] + ccv[i]["saved_electric_bill"]
    ctv["current_heating_energy_loss"] = ctv["current_heating_energy_loss"] + ccv[i]["current_heating_energy_loss"]
    ctv["planned_heating_energy_loss"] = ctv["planned_heating_energy_loss"] + ccv[i]["planned_heating_energy_loss"]
    ctv["saved_heating_energy_loss"] = ctv["saved_heating_energy_loss"] + ccv[i]["saved_heating_energy_loss"]
    ctv["current_dhw_energy_loss"] = ctv["current_dhw_energy_loss"] + ccv[i]["current_dhw_energy_loss"]
    ctv["planned_dhw_energy_loss"] = ctv["planned_dhw_energy_loss"] + ccv[i]["planned_dhw_energy_loss"]
    ctv["saved_dhw_energy_loss"] = ctv["saved_dhw_energy_loss"] + ccv[i]["saved_dhw_energy_loss"]


def costifissi_project_target(case, cos_val, npv_values, total_costs, noisematrix, year):
    dr = case.common_params["discount_rate"] / 100 + get_noise_value(noisematrix, case, "dr", year)
    p_t = {
        "total_case_cost": round(get_total_case_cost(total_costs, case)["total_case_cost"], 1),
        "cost_loan_bonus": round(cos_val["cost_loan_bonus"], 1), "qvan": round(npv_values["qvan"], 1),
        "qvan_m2": round(cos_val["qvan_m2"], 3), "qirr": round(npv_values["qirr"], 3) * 100,
        "qirr_discount": round((npv_values["qirr"] - dr), 3) * 100,
        "discount_rate": round(dr, 3) * 100
    }
    if cos_val["quick_PI"] != math.inf:
        p_t["quick_pi"] = round(cos_val["quick_PI"], 3)
    else:
        p_t["quick_pi"] = "inf"  # cos_val["quick_PI"]
    p_t["qpb"] = round(npv_values["qpb"], 1)
    return p_t


def costifissi_report_fill_investment(loan, project, report, total_project_cost, total_project_cost_loan):
    bonus = 0
    if project.params["incentives_check"]:
        bonus = min(project.params["incentives_amount_%"] / 100, 1)

    bonus_amount = bonus * total_project_cost
    if project.params["loan_refund_years"] != 0:
        bonus_amount *= -1
    report["investment_values"] = {
        "loan_check": project.params["loan_check"],
        "loan_amount": "{:,.1f}".format(loan * total_project_cost),
        "loan_amount_%": loan * 100,
        "loan_refund_years": project.params["loan_refund_years"],
        "loan_rate": project.params["loan_rate"],
        "bonus_check": project.params["incentives_check"],
        "bonus_amount": "{:,.1f}".format(bonus_amount),
        "bonus_amount_%": bonus,
        "bonus_refund_years": project.params["incentives_refund_years"],
        "total_cost": "{:,.1f}".format(total_project_cost),
        "total_cost_loan": "{:,.1f}".format(total_project_cost_loan)
    }
