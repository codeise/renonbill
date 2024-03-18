import numpy_financial as npf
import math


def investment_validation(investment):
    if investment <= 0:
        raise ValueError("Investment must be > 0")


def calculate_payment(interest_rate, interest_period, tenure, investment, dwelling_count):
    utility_per_period = interest_rate / (100 * interest_period)
    return (utility_per_period * (1 / (1 - math.pow((1 + utility_per_period), -(tenure * interest_period)))) *
            investment) / dwelling_count


def erv_first_case(case, cashflow, investment, erv_output):
    investment_validation(investment)
    interest_period = 12
    avg_monthly_cashflow = 0
    for i in range(1, case.common_params["obf1_avg_calc_years"] + 1):
        avg_monthly_cashflow += cashflow[i] / (12 * case.common_params["dwelling_count"])

    erv_output["obf1_bill_savings"] = round(avg_monthly_cashflow / case.common_params["obf1_avg_calc_years"], 1)
    utility_per_period = (case.common_params["obf1_utility_WACC"] / 100) / interest_period

    erv_output["obf1_onBill_amount"] = calculate_payment(case.common_params["obf1_utility_WACC"], interest_period,
                                                         case.common_params["obf1_tenure"], investment,
                                                         case.common_params["dwelling_count"])

    format_erv_output(erv_output)


def erv_second_case(case, cashflow, investment, erv_output):
    interest_period = 12
    avg_monthly_cashflow = 0
    for i in range(1, case.common_params["obf2_avg_calc_years"] + 1):
        avg_monthly_cashflow += cashflow[i] / (12 * case.common_params["dwelling_count"])

    erv_output["obf2_bill_savings"] = round(avg_monthly_cashflow / case.common_params["obf2_avg_calc_years"], 1)

    erv_output["obf2_max_onBill"] = \
        round(erv_output["obf2_bill_savings"] * (1 - (case.common_params["obf2_golden_rule"] / 100)), 1)

    erv_output["obf2_tenure"] = calculate_tenure(
        case.common_params["obf2_onBill_amount"] * case.common_params["dwelling_count"],
        (case.common_params["obf2_utility_WACC"] / 100) / interest_period, investment,
        case.common_params["dwelling_count"]) / interest_period
    format_erv_output(erv_output)


def calculate_tenure(payment, interest_rate, investment, dw_count):
    exp = payment / (payment - investment * interest_rate)
    if exp <= 0:
        raise ValueError("Minimum OnBill amount value must be greater than {}"
                         .format(round(investment * interest_rate / dw_count, 1)))
    base = 1 + interest_rate
    return math.log(exp, base)


def erv_third_case(case, cashflow, investment, erv_output):
    investment_validation(investment)
    interest_period = 12
    avg_monthly_cashflow = 0
    for i in range(1, case.common_params["obr1_avg_calc_years"] + 1):
        avg_monthly_cashflow += cashflow[i] / (12 * case.common_params["dwelling_count"])

    erv_output["obr1_bill_savings"] = round(avg_monthly_cashflow / case.common_params["obr1_avg_calc_years"], 1)
    erv_output["obr1_invest_repayment"] = round(investment / (interest_period * case.common_params["obr1_tenure"] *
                                                              case.common_params["dwelling_count"]), 1)

    utility_per_period = (case.common_params["obr1_utility_margin"] / 100) / interest_period
    erv_output["obr1_amount_util"] = calculate_payment(case.common_params["obr1_utility_margin"], interest_period,
                                                       case.common_params["obr1_tenure"], investment,
                                                       case.common_params["dwelling_count"]) - \
                                     erv_output["obr1_invest_repayment"]

    bank_rate_per_period = (case.common_params["obr1_bank_rate"] / 100) / interest_period
    erv_output["obr1_amount_bank"] = calculate_payment(case.common_params["obr1_bank_rate"], interest_period,
                                                       case.common_params["obr1_tenure"], investment,
                                                       case.common_params["dwelling_count"]) - \
                                     erv_output["obr1_invest_repayment"]

    erv_output["obr1_onBill_amount"] = erv_output["obr1_invest_repayment"] + erv_output["obr1_amount_util"] + \
                                       erv_output["obr1_amount_bank"]
    format_erv_output(erv_output)


def erv_fourth_case(case, cashflow, investment, erv_output):
    investment_validation(investment)
    interest_period = 12
    avg_monthly_cashflow = 0
    for i in range(1, case.common_params["obr2_avg_calc_years"] + 1):
        avg_monthly_cashflow += cashflow[i] / (12 * case.common_params["dwelling_count"])

    erv_output["obr2_bill_savings"] = round(avg_monthly_cashflow / case.common_params["obr2_avg_calc_years"], 1)
    erv_output["obr2_max_onBill"] = round(erv_output["obr2_bill_savings"] *
                                          (1 - (case.common_params["obr2_golden_rule"] / 100)), 1)

    erv_output["obr2_tenure"] = investment / (case.common_params["obr2_invest_repayment"] * interest_period *
                                              case.common_params["dwelling_count"])

    erv_output["obr2_amount_util"] = calculate_payment(case.common_params["obr2_utility_margin"], interest_period,
                                                       erv_output["obr2_tenure"], investment,
                                                       case.common_params["dwelling_count"]) - \
                                     case.common_params["obr2_invest_repayment"]

    erv_output["obr2_amount_bank"] = calculate_payment(case.common_params["obr2_bank_rate"], interest_period,
                                                       erv_output["obr2_tenure"], investment,
                                                       case.common_params["dwelling_count"]) - \
                                     case.common_params["obr2_invest_repayment"]

    erv_output["obr2_onBill_amount"] = (case.common_params["obr2_invest_repayment"] + erv_output["obr2_amount_util"] +
                                        erv_output["obr2_amount_bank"]) / case.common_params["dwelling_count"]
    format_erv_output(erv_output)


def format_erv_output(erv_output):
    for key in erv_output.keys():
        if not key.endswith("tenure"):
            erv_output[key] = "{:,.0f}".format(erv_output[key])
        else:
            erv_output[key] = "{:,.1f}".format(erv_output[key])
