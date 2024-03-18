def get_by_key_from_arr(arr, key_val, key_name):
    for e in arr:
        if e[key_name] == key_val:
            return e
    return None


def calculate_benefits(case, benefits_output, total_cost, totals, report):
    nw = 7
    rating = [0] * nw
    weight = [0] * nw
    for i in range(1, nw + 1):
        rating[i - 1] = case.common_params["non_energy_benefit_rating_" + str(i)]
        weight[i - 1] = case.common_params["non_energy_benefit_weight_" + str(i)]
    total_rating = 0
    total_weight = 0

    for i in range(0, nw):
        total_rating += rating[i] * weight[i]
        total_weight += weight[i]
    total_rating = total_rating / total_weight
    benefit = get_by_key_from_arr(total_cost["cases"], case.id, 'case_id')["total_case_cost"] * total_rating
    totals["project_benefit"] += benefit

    if total_cost["total_heating_cost"] + total_cost["total_dhw_cost"] != 0:
        totals["project_rating"] = totals["project_benefit"] / \
                                   (total_cost["total_heating_cost"] + total_cost["total_dhw_cost"])
    report["benefits"] = {
        "project_rating": "{:,.1f}".format(totals["project_rating"]),
        "project_benefit": "{:,.1f}".format(totals["project_benefit"])
    }
    one_digit = "{:,.1f}"
    benefits_output[case.id]["lab_score"] = one_digit.format(total_rating * 100)
    benefits_output["project_score"] = one_digit.format(totals["project_rating"] * 100)
    for i in range(1, nw + 1):
        benefits_output[case.id]["lab_value_" + str(i)] = \
            one_digit.format(weight[i - 1] * rating[i - 1] / total_weight * 100)
    benefits_output[case.id]["lab_investment"] = \
        formatoc(get_by_key_from_arr(total_cost["cases"], case.id, 'case_id')["heating_cost"] +
                 get_by_key_from_arr(total_cost["cases"], case.id, 'case_id')["dhw_cost"])
    benefits_output[case.id]["lab_benefit"] = formatoc(benefit)
    benefits_output["lab_total_investment"] = formatoc(total_cost["total_heating_cost"] + total_cost["total_dhw_cost"])
    benefits_output["lab_total_benefit"] = formatoc(totals["project_benefit"])


def formatoc(value):
    if value > 999999:
        str_format = "{:.1E}"
    else:
        str_format = "{:,.1f}"
    return str_format.format(value)
