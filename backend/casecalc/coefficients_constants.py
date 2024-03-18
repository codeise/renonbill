from casecalc.constants_helpers import get_value_from_sheet, get_noise_value_constants, get_noise_value, get_noise_type


# example of taking variable from constants
# shadow = get_value_from_constants_sheet(constants.other_thermal_data, "description", "shadow", "value")
# example of taking variable from constants by indices
# heating_dhw = get_value_from_constants_sheet_by_indices(constants.heating_dhw["table3"], 2, 2)
def get_coefficients(constants, param_type, noisematrix, case):
    hash_key = hash((param_type, case.id, "empty" if noisematrix is None else "matrix"))
    if hash_key in constants.coefficients_memo:
        return constants.coefficients_memo[hash_key]
    noise_type = get_noise_type(param_type)
    alfa = get_value_from_sheet(constants.other_thermal_data, 'description', 'alfa (plaster)', 'value') + \
        get_noise_value_constants(noisematrix, "alfa")
    shadow = get_value_from_sheet(constants.other_thermal_data, 'description', 'shadow', 'value') + \
        get_noise_value_constants(noisematrix, "shadow")
    dhw_load = get_value_from_sheet(constants.other_thermal_data, 'description',
                                    'DHWload  [kg/person /day]   1 person=25 m2', 'value') + \
        get_noise_value_constants(noisematrix, "dhw_load")
    sun_factor = get_value_from_sheet(constants.other_thermal_data, 'description',
                                      'sun factor (glass transmission coeff.)', 'value')
    airchangecoeff = get_value_from_sheet(constants.other_thermal_data, 'description',
                                          'Airchangecoeff   [1/h]',
                                          'value') + get_noise_value(noisematrix, case, noise_type, "airchangecoeff")
    he = 23 + get_noise_value_constants(noisematrix, "he")
    eta_conv = 0.5 + get_noise_value_constants(noisematrix, "eta_conv")
    fixed_constants = {
        "rho_air": 1.188,
        "cp_air": 1007,
        "he": he,
        "dhw_load": dhw_load,
        "cp_water": 4182,
        "eta_conv": eta_conv,
        "alfa": alfa,
        "shadow": shadow,
        "sun_factor": sun_factor,
        "airchangecoeff": airchangecoeff
    }  # todo: add fixed constants to Constants table and use that JSON param here
    constants.coefficients_memo[hash_key] = fixed_constants
    return fixed_constants
