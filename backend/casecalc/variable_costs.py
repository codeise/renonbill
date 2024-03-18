from casecalc.constants_helpers import get_value_from_sheet_multi, get_noise_type, get_noise_value, get_vc_noise_value


def get_fuel_cost(sheet, country, year, memo, noisematrix=None):
    noise = get_vc_noise_value(noisematrix, year, "fuel_costs")
    if year == 0:
        year = 1
    return get_value_from_sheet_multi(
        sheet, "variable_costs", (("country", country), ("source", "methane_gas")), "p" + str(year), memo
    ) / 0.656 / 55500 * 1000 + noise


def get_electric_cost(sheet, country, year, memo, noisematrix=None):
    noise = get_vc_noise_value(noisematrix, year, "electric_costs")
    if year == 0:
        year = 1
    return get_value_from_sheet_multi(
        sheet, "variable_costs", (("country", country), ("source", "electric_energy")), "p" + str(year), memo
    ) / 3.6 + noise


def get_pellet_cost(sheet, country, year, memo, noisematrix=None):
    noise = get_vc_noise_value(noisematrix, year, "pellet_costs")
    if year == 0:
        year = 1
    return get_value_from_sheet_multi(
        sheet, "variable_costs", (("country", country), ("source", "pellet")), "p" + str(year), memo
    ) / 19000 * 1000 + noise


def get_vita(sheet):
    row = sheet[0]
    return len(row) - 4


def get_discount_rate(sheet, country, memo):
    return get_value_from_sheet_multi(
        sheet, "variable_costs", (("country", country), ("source", "discount rate")), "variation_rate_per_year", memo
    )


def selected_variable_costs(calc_dispersed_eff, case, vcs, year, noisematrix, params_type, vc_e, vc_f, vc_separated,
                            memo):
    calc_vc = {}

    params = getattr(case, params_type)
    calc_vc[params_type] = {}
    calc_vc_cur = calc_vc[params_type]
    heating_flag = params["heating_type"]
    heating_dhw_flag = params["DHW_type"]
    pellet = 0
    if heating_flag == 2:
        pellet = 1
    country = case.common_params["country"]
    c_disp_eff_curr = calc_dispersed_eff[params_type]
    tmp = get_fuel_cost(vcs, country, year, memo, noisematrix)
    calc_vc_cur["selVC_f"] = c_disp_eff_curr["selq_f"] * tmp
    if pellet == 1:
        calc_vc_cur["selVC_f"] = c_disp_eff_curr["selq_f"] * get_pellet_cost(vcs, country, year, memo, noisematrix)
    calc_vc_cur["selVC_e"] = c_disp_eff_curr["selq_e"] * get_electric_cost(vcs, country, year, memo, noisematrix)
    calc_vc_cur["selVCDHW_f"] = c_disp_eff_curr["selqDHW_f"] * get_fuel_cost(vcs, country, year, memo, noisematrix)
    if pellet == 1 and heating_dhw_flag == 0:
        calc_vc_cur["selVCDHW_f"] = c_disp_eff_curr["selqDHW_f"] * get_pellet_cost(vcs, country, year, memo,
                                                                                   noisematrix)
    calc_vc_cur["selVCDHW_e"] = c_disp_eff_curr["selqDHW_e"] * get_electric_cost(vcs, country, year, memo, noisematrix)
    vc_separated[params_type] = calc_vc_cur

    vc_f[params_type] = calc_vc[params_type]["selVC_f"] + calc_vc[params_type]["selVCDHW_f"]
    vc_e[params_type] = calc_vc[params_type]["selVC_e"] + calc_vc[params_type]["selVCDHW_e"]
