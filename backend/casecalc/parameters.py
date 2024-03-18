from casecalc.constants_helpers import get_value_from_sheet_multi, get_noise_value, get_noise_type


# modifies params
def validate_case_parameters(params):
    # todo:
    # if global variable irun is 0 reset all arrays related to monte carlo
    # sensitivity is nonsense and can be ignored
    # If sensitivity <> 1 And irun = 0 Then
    # here we need to reset variaboles related to MC based on irun, which we need to pass as argument if
    # we don't resolve this better by isolating monte carlo from this code
    abs_min = 0.000001
    abs_max = 1000000
    if not bool(params["wall_insulation_check"]):
        params["wall_envelope_thermal_conductivity"] = abs_max
        params["wall_thickness"] = abs_min
    if not bool(params["roof_insulation_check"]):
        params["roof_envelope_thermal_conductivity"] = abs_max
        params["roof_thickness"] = abs_min
    if not bool(params["floor_insulation_check"]):
        params["floor_envelope_thermal_conductivity"] = abs_max
        params["floor_thickness"] = abs_min
    if bool(params["solar_check"]):
        params["solar_frac"] = max(min(params["solar_perc"], 1 - abs_min), abs_min)
    else:
        params["solar_frac"] = abs_min
    if bool(params["DHW_solar_check"]):
        params["DHW_solar_frac"] = max(min(params["DHW_solar_perc"], 1 - abs_min), abs_min)
    else:
        params["DHW_solar_frac"] = abs_min
    windows_transmittance_value = params["window_transmittance_value"]
    params["sun_factor"] = (windows_transmittance_value ** 3.5 + 10) / (windows_transmittance_value ** 3.5 + 25)


def prepare_pp(constants, pp, report):
    # start this code is to be moved to UI/React, here is only for reference (except report assignments)
    if bool(int(pp["loan_check"])):
        loan_amount = min(int(pp["loan_amount_%"]) / 100, 1)
    else:
        loan_amount = 0
    if bool(int(pp["incentives_check"])) and int(pp["incentives_refund_years"]) == 0:
        bonus = min(int(pp["incentives_amount_%"]) / 100, 1)
    else:
        bonus = 0
    # end this code is to be moved to UI/React, here is only for reference (except report assignments)
    hdd = get_value_from_sheet_multi(
        constants.city_climate,
        "city_climate",
        (("country", "Italy"), ("city", "Roma")),
        "hdd",
        constants.sheet_multi_memo
    )
    pp["loan_amount"] = loan_amount
    pp["bonus"] = bonus
    pp["hdd"] = hdd
