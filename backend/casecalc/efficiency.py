from casecalc.coefficients_constants import get_coefficients
from casecalc.constants_helpers import get_value_from_sheet, \
    get_value_from_sheet_no_header, get_noise_value, get_noise_type, get_noise_value_constants
from casecalc.dispersed_heat import get_hdd_rad, calculate
from casecalc.parameters import validate_case_parameters


def read_param_eff(params, common_params, constants, params_type, noisematrix, case, year):
    noise_type = get_noise_type(params_type)
    coefficients = get_coefficients(constants, params_type, noisematrix, case)
    efficiency_coefficients = get_effitiency_coefs(constants, params_type, noisematrix, case)
    conversion = coefficients["eta_conv"]
    regulation_eff = efficiency_coefficients["regul_eff"]
    distribution_eff = efficiency_coefficients["distr_eff"]
    emitter_eff = constants.heating_dhw["table3"][params["emitter_type"] - 1]["efficiency"] + \
        get_noise_value(noisematrix, case, noise_type, "emitter_eff")
    solar_fraction = params["solar_frac"] + get_noise_value(noisematrix, case, noise_type, "solar_frac")
    generator_eff = constants.heating_dhw["table1"][params["burner_type"] - 1]["efficiency"] + \
        get_noise_value(noisematrix, case, noise_type, "generator_eff")
    pellet_eff = efficiency_coefficients["pellet_eff"]
    heat_pump_eff = efficiency_coefficients["hp_eff"]
    heat_pump_dhw_eff = efficiency_coefficients["hp_dhw_eff"]
    hdd_rad_params = get_hdd_rad(common_params, constants, noisematrix, case, year)
    t_base = efficiency_coefficients["t_base"]
    t_med = t_base - hdd_rad_params["hdd"] / hdd_rad_params["tday"]
    etac = 0.6
    chi = min(0.75 * heat_pump_eff / 3.5, 1 / etac)
    dhw_chi = min(0.75 * heat_pump_dhw_eff / 3.5, 1 / etac)
    dteva = 10
    dtcond = 15
    dhw_dteva = 12
    dhw_dtcond = 6
    heat_pump_copr = chi * etac * (t_med + 273 + dteva) / (t_base - t_med + dteva + dtcond)
    heat_pump_dhw_copr = dhw_chi * etac * (t_med + 273 + dhw_dteva) / (50 - t_med + dhw_dteva + dhw_dtcond)
    if params['heating_type'] == 1:  # burner
        eta_genp = generator_eff
        eta_genf = generator_eff
        eta_gene = 1000000000000  #
    elif params['heating_type'] == 2:  # pellet
        eta_genp = pellet_eff
        eta_genf = pellet_eff
        eta_gene = 1000000000000  #
    elif params['heating_type'] == 3:  # heat pump
        eta_genp = heat_pump_copr * conversion
        eta_genf = 1000000000000  #
        eta_gene = heat_pump_copr
    else:
        raise Exception("Invalid heating type")
    eta_p = regulation_eff * distribution_eff * eta_genp * emitter_eff / (1 - solar_fraction)
    eta_f = regulation_eff * distribution_eff * eta_genf * emitter_eff / (1 - solar_fraction)
    eta_e = regulation_eff * distribution_eff * eta_gene * emitter_eff / (1 - solar_fraction)
    eta_s = distribution_eff * emitter_eff / solar_fraction

    solar_dhw_fraction = params["DHW_solar_frac"] + get_noise_value(noisematrix, case, noise_type, "DHW_solar_frac")
    emitter_dhw_eff = constants.heating_dhw["table2"][params["DHW_burner_type"]+1-1]["efficiency"] + \
        get_noise_value(noisematrix, case, noise_type, "emitter_dhw_eff")
    electric_boiler_dhw_eff = constants.heating_dhw["table2"][1-1]["efficiency"] + \
        get_noise_value(noisematrix, case, noise_type, "electric_boiler_dhw_eff")

    if params['DHW_type'] == 0:  # no specific device, uses heating gen
        eta_dhw_genp = eta_genp
        eta_dhw_genf = eta_genf
        eta_dhw_gene = eta_gene
        solar_dhw_fraction = solar_fraction
    elif params['DHW_type'] == 1:  # electic boiler
        eta_dhw_genp = electric_boiler_dhw_eff * conversion
        eta_dhw_genf = 1000000000000  #
        eta_dhw_gene = electric_boiler_dhw_eff
    elif params['DHW_type'] == 2:  # gas burner
        eta_dhw_genp = emitter_dhw_eff
        eta_dhw_genf = emitter_dhw_eff
        eta_dhw_gene = 1000000000000  #
    elif params['DHW_type'] == 3:  # heat pump
        eta_dhw_genp = heat_pump_dhw_copr * conversion
        eta_dhw_genf = 1000000000000  #
        eta_dhw_gene = heat_pump_dhw_copr
    else:
        raise Exception("Invalid dhw type")

    eta_dhw_p = distribution_eff * eta_dhw_genp / (1 - solar_dhw_fraction)
    eta_dhw_f = distribution_eff * eta_dhw_genf / (1 - solar_dhw_fraction)
    eta_dhw_e = distribution_eff * eta_dhw_gene / (1 - solar_dhw_fraction)
    eta_dhw_s = distribution_eff / solar_dhw_fraction

    return {
        "eta_p": eta_p,
        "eta_f": eta_f,
        "eta_e": eta_e,
        "eta_s": eta_s,
        "eta_dhw_p": eta_dhw_p,
        "eta_dhw_f": eta_dhw_f,
        "eta_dhw_e": eta_dhw_e,
        "eta_dhw_s": eta_dhw_s,
    }


def get_effitiency_coefs(constants, params_type, noisematrix, case):
    noise_type = get_noise_type(params_type)
    regul_eff = get_value_from_sheet_no_header(constants.heating_dhw["table4"], 'regulation_mean_efficiency') + \
        get_noise_value_constants(noisematrix, "regul_eff")
    distr_eff = get_value_from_sheet_no_header(constants.heating_dhw["table4"], 'distribution_mean_efficiency') + \
        get_noise_value_constants(noisematrix, "distr_eff")
    pellet_eff = get_value_from_sheet(constants.heating_dhw["table1"], 'heating', 'pellet stove', 'efficiency') + \
        get_noise_value(noisematrix, case, noise_type, "pellet_eff")
    hp_eff = get_value_from_sheet(constants.heating_dhw["table1"], 'heating', 'heat pump', 'efficiency') + \
        get_noise_value(noisematrix, case, noise_type, "hp_eff")
    hp_dhw_eff = get_value_from_sheet(constants.heating_dhw["table2"], 'plant_type', 'heat_pump', 'efficiency') + \
        get_noise_value(noisematrix, case, noise_type, "hp_dhw_eff")
    t_base = get_value_from_sheet(constants.other_thermal_data, 'description', 'Tb-base temperature for HDD [°C]',
                                  'value')
    p = {
        "regul_eff": regul_eff,
        "distr_eff": distr_eff,
        "pellet_eff": pellet_eff,
        "hp_eff": hp_eff,
        "hp_dhw_eff": hp_dhw_eff,
        "t_base": t_base
    }  # todo: add fixed constants to Constants table and use that JSON param here
    return p


def heating_efficiency(case, constants, noisematrix, year):
    calc_dispersed_eff = {}
    for params_type in ["current_params", "planned_params"]:
        calc_dispersed_eff[params_type] = {}
        # cdec = calc_dispersed_eff_current
        cdec = calc_dispersed_eff[params_type]
        params = getattr(case, params_type)
        validate_case_parameters(params)  # modifies params
        # dhr = dispersed_heat_result
        dhr = calculate(params, case, constants, noisematrix, params_type, year)
        # rper = read_param_eff_result
        rper = read_param_eff(params, case.common_params, constants, params_type, noisematrix, case, year)
        cdec["selq_d"] = \
            dhr["q_v"] + dhr["q_w"] + dhr["q_floor"] + dhr["q_roof"] + dhr["q_win"] - dhr["qsg"] - dhr["q_is"]
        qd_pass = max(cdec["selq_d"], 0)
        cdec["selq_p"] = qd_pass / rper["eta_p"]
        cdec["selq_f"] = qd_pass / rper["eta_f"]
        cdec["selq_e"] = qd_pass / rper["eta_e"]
        cdec["selq_s"] = qd_pass / rper["eta_s"]
        cdec["selq_s"] = qd_pass / rper["eta_s"]
        cdec["selqDHW_d"] = dhr["q_dhw"]
        cdec["selqDHW_p"] = dhr["q_dhw"] / rper["eta_dhw_p"]
        cdec["selqDHW_f"] = dhr["q_dhw"] / rper["eta_dhw_f"]
        cdec["selqDHW_e"] = dhr["q_dhw"] / rper["eta_dhw_e"]
        cdec["selqDHW_s"] = dhr["q_dhw"] / rper["eta_dhw_s"]
        cdec["s_floor_area"] = dhr["s_floor_area"]
    return calc_dispersed_eff
