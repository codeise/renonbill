import math
import random

from api.services.constants import get_heating_types_helper, get_plant_types_helper1
from casecalc.coefficients_constants import get_coefficients
from casecalc.constants_helpers import get_value_from_sheet, get_fixed_cost_by_key_from_sheet
from casecalc.efficiency import get_effitiency_coefs
from casecalc.variable_costs import get_electric_cost, get_pellet_cost
from casecalc.variable_costs import get_fuel_cost, get_discount_rate


def init_output(case, vitamax):
    output = {
        "common": {
        },
        "current": {
        },
        "planned": {
        },
        "hdd": {
        },
        "rad": {
        },
        "tday": {
        },
        "dr": {
        },
    }
    for common_name in case.common_params:
        output["common"][common_name] = 0
    for current_name in case.current_params:
        output["current"][current_name] = 0
    for planned_name in case.planned_params:
        output["planned"][planned_name] = 0
    for i in range(0, vitamax + 1):
        output["hdd"][i] = 0
        output["rad"][i] = 0
        output["tday"][i] = 0
        output["dr"][i] = 0
    return output


def param_diff(case, field):
    return case.current_params[field] != case.planned_params[field]


def noise(constants, output, case, hdd_rad, vitamax, noise_type):
    change_list = define_changes(case)
    dwelling_count = case.common_params["dwelling_count"]
    # he -> From coefficients_constants.py
    # shadow -> From coefficients_constants.py
    # alfa -> From coefficients_constants.py
    # dhw-load -> From coefficients_constants.py
    # eta_conv -> From coefficients_constants.py
    # regul_eff -> From efficiency.py line 93
    # distr_eff -> From efficiency.py line 94
    common_params = [
        "wall_thermal_transmittance", "roof_thermal_transmittance", "floor_thermal_transmittance",
        "floor_area", "total_surface_area_to_volume_ratio", "wall_height"
    ]
    for tmp in common_params:
        noise_server_common(output, case.common_params, tmp, "common", dwelling_count, noise_type, case.id)

    constant_params = [
        "he", "shadow", "alfa", "dhw_load", "eta_conv", "regul_eff", "distr_eff"
    ]
    output["constants"] = {}
    coefficients = get_coefficients(constants, "none", None, case)
    coefficients.update(get_effitiency_coefs(constants, "none", None, case))
    for tmp in constant_params:
        noise_server_common(output, coefficients, tmp, "constants", dwelling_count, noise_type, case.id)
    pellet = get_value_from_sheet(constants.heating_dhw["table1"], 'heating', 'pellet stove', 'efficiency')
    hp = get_value_from_sheet(constants.heating_dhw["table1"], 'heating', 'heat pump', 'efficiency')
    elec_boilder_dhw = constants.heating_dhw["table2"][1 - 1]["efficiency"]
    hp_dhw = get_value_from_sheet(constants.heating_dhw["table2"], 'plant_type', 'heat_pump', 'efficiency')

    # airchangecoeff -> From coefficients_constants.py
    # pellet_eff -> From efficiency.py line 95
    # hp_eff -> from efficiency.py line 96
    # electric_boiler_dhw_eff -> efficiency.py line 51
    # hp_dhw_eff -> efficiency.py line 97
    non_case_val = {"airchangecoeff": coefficients["airchangecoeff"], "pellet_eff": pellet, "hp_eff": hp,
                    "electric_boiler_dhw_eff": elec_boilder_dhw, "hp_dhw_eff": hp_dhw}

    noise_server(output, case, "window_transmittance_value", change_list["win_trans_changed"], noise_type)
    noise_server(output, case, "window_to_surface_area_ratio", change_list["win_ratio_changed"], noise_type)

    noise_server(output, case, "wall_envelope_thermal_conductivity", change_list["wall_insul_changed"], noise_type)
    noise_server(output, case, "wall_thickness", change_list["wall_insul_changed"], noise_type)
    noise_server(output, case, "roof_envelope_thermal_conductivity", change_list["roof_insul_changed"], noise_type)
    noise_server(output, case, "roof_thickness", change_list["roof_insul_changed"], noise_type)
    noise_server(output, case, "floor_envelope_thermal_conductivity", change_list["floor_insul_changed"], noise_type)
    noise_server(output, case, "floor_thickness", change_list["floor_insul_changed"], noise_type)

    noise_server(output, case, "sun_factor",
                 change_list["win_trans_changed"], noise_type)  # From parameters.py validate_case_parameters()
    noise_server_non_case(output, case, non_case_val, "airchangecoeff", change_list["win_trans_changed"], noise_type)

    # from efficiency.py line 14
    noise_server_types(output, case, constants, "emitter_eff", change_list["emitter_changed"],
                       noise_type, "table3", "emitter_type")

    # This value is set inside parameters.py after line 23
    noise_server(output, case, "solar_frac", change_list["solar_changed"], noise_type)

    # from efficiency.py line 16
    noise_server_types(output, case, constants, "generator_eff", change_list["heating_changed"],
                       noise_type, "table1", "burner_type")
    noise_server_non_case(output, case, non_case_val, "pellet_eff", change_list["heating_changed"], noise_type)
    noise_server_non_case(output, case, non_case_val, "hp_eff", change_list["heating_changed"], noise_type)

    # This value is set inside parameters.py after line 27
    noise_server(output, case, "DHW_solar_frac", change_list["dhw_solar_changed"], noise_type)

    # efficiency.py line 52
    noise_server_types(output, case, constants, "emitter_dhw_eff", change_list["dhw_heating_changed"],
                       noise_type, "table2", "DHW_burner_type")

    noise_server_non_case(output, case, non_case_val, "electric_boiler_dhw_eff",
                          change_list["dhw_heating_changed"], noise_type)
    noise_server_non_case(output, case, non_case_val, "hp_dhw_eff", change_list["dhw_heating_changed"], noise_type)

    # dr = get_discount_rate(constants.variable_costs, case.common_params["country"], constants.sheet_multi_memo)
    dr = case.common_params["discount_rate"] / 100
    for i in range(0, vitamax + 1):
        noise_server_hdd(output, i, hdd_rad["hdd"], case.id, noise_type)
        noise_server_rad(output, i, hdd_rad["rad"], case.id, noise_type)
        noise_server_tday(output, i, hdd_rad["tday"], case.id, noise_type)
        noise_server_dr(output, i, dr, case.id, noise_type)

    output["costs"] = {
        "fixed_costs": {},
        "fuel_costs": {},
        "electric_costs": {},
        "pellet_costs": {}
    }
    for i in range(0, vitamax + 1):
        noise_server_vc(output,
                        get_fuel_cost(constants.variable_costs, case.common_params["country"], i,
                                      constants.sheet_multi_memo),
                        "fuel_costs", i, noise_type)
        noise_server_vc(output,
                        get_electric_cost(constants.variable_costs, case.common_params["country"], i,
                                          constants.sheet_multi_memo),
                        "electric_costs", i, noise_type)
        noise_server_vc(output,
                        get_pellet_cost(constants.variable_costs, case.common_params["country"], i,
                                        constants.sheet_multi_memo),
                        "pellet_costs", i, noise_type)

    fixed_costs = get_fixed_costs(constants, output, case.planned_params)
    for tmp in fixed_costs:
        noise_server_fix(output, case, tmp, fixed_costs[tmp], noise_type)
    return output


def get_fixed_costs(constants, output, params):
    costs = {}
    i = 1
    for name in output["confidence"]["fixed_costs"]:
        tmp = name
        if name.startswith("dhw_"):
            tmp = name.replace("dhw_", "")
        elif name not in ["solar_heating", "electric_boiler"]:
            tmp = name.replace("_", " ")
        if name == "2- Radiators with Valve":
            tmp = "2- Radiators  with Valve"
        if i < 10:
            costs[name] = get_fixed_cost_by_key_from_sheet(constants.heating_dhw["table1"], "heating", tmp)
        elif i < 16:
            costs[name] = get_fixed_cost_by_key_from_sheet(constants.heating_dhw["table3"], "heatingemittertype", tmp)
        elif i < 21:
            costs[name] = get_fixed_cost_by_key_from_sheet(constants.heating_dhw["table2"], "plant_type", tmp)
        elif i == 21:
            costs[name] = (constants.envelope_windows["table1"][1 - 1]["material_cost"] *
                           params["wall_thickness"] / params["wall_envelope_thermal_conductivity"] * 0.03 / 0.1) + \
                          constants.envelope_windows["table1"][1 - 1]["installation_cost"]
        elif i == 22:
            costs[name] = (constants.envelope_windows["table1"][2 - 1]["material_cost"] *
                           params["roof_thickness"] / params["roof_envelope_thermal_conductivity"] * 0.03 / 0.1) + \
                          constants.envelope_windows["table1"][2 - 1]["installation_cost"]
        elif i == 23:
            costs[name] = (constants.envelope_windows["table1"][3 - 1]["material_cost"] *
                           params["floor_thickness"] / params["floor_envelope_thermal_conductivity"] * 0.03 / 0.1) + \
                          constants.envelope_windows["table1"][3 - 1]["installation_cost"]
        elif i == 24:
            costs[name] = constants.envelope_windows["table2"][1 - 1]["value"]
        elif i == 25:
            costs[name] = constants.envelope_windows["table2"][2 - 1]["value"]
        i += 1
    return costs


def define_changes(case):
    change_list = {
        "win_trans_changed": False,
        "win_ratio_changed": False,
        "wall_insul_changed": False,
        "roof_insul_changed": False,
        "floor_insul_changed": False,
        "heating_changed": False,
        "emitter_changed": False,
        "solar_changed": False,
        "dhw_heating_changed": False,
        "dhw_solar_changed": False
    }
    check_windows(case, change_list)
    check_wall_roof_floor(case, change_list)
    check_heating(case, change_list)
    check_dhw(case, change_list)
    return change_list


def check_dhw(case, change_list):
    if param_diff(case, "DHW_type"):
        change_list["dhw_heating_changed"] = True
    if case.current_params["DHW_type"] == 2 and case.planned_params["DHW_type"] == 2:
        if param_diff(case, "DHW_burner_type"):
            change_list["dhw_heating_changed"] = True
    if param_diff(case, "DHW_solar_check"):
        change_list["dhw_solar_changed"] = True
    if case.current_params["DHW_solar_check"] is True and case.planned_params["DHW_solar_check"] is True:
        if param_diff(case, "DHW_solar_perc"):
            change_list["dhw_solar_changed"] = True


def check_heating(case, change_list):
    if param_diff(case, "heating_type"):
        change_list["heating_changed"] = True
    if case.current_params["heating_type"] is True and case.planned_params["heating_type"] is True:
        if param_diff(case, "burner_type"):
            change_list["heating_changed"] = True
    if param_diff(case, "emitter_type"):
        change_list["emitter_changed"] = True
    if param_diff(case, "solar_check"):
        change_list["solar_changed"] = True
    if case.current_params["solar_check"] is True and case.planned_params["solar_check"] is True:
        if param_diff(case, "solar_perc"):
            change_list["solar_changed"] = True


def check_wall_roof_floor(case, change_list):
    if param_diff(case, "wall_insulation_check"):
        change_list["wall_insul_changed"] = True
    if param_diff(case, "roof_insulation_check"):
        change_list["roof_insul_changed"] = True
    if param_diff(case, "floor_insulation_check"):
        change_list["floor_insul_changed"] = True
    if case.current_params["wall_insulation_check"] is True and case.planned_params["wall_insulation_check"] is True:
        if param_diff(case, "wall_envelope_thermal_conductivity"):
            change_list["wall_insul_changed"] = True
        if param_diff(case, "wall_thickness"):
            change_list["wall_insul_changed"] = True
    if case.current_params["roof_insulation_check"] is True and case.planned_params["roof_insulation_check"] is True:
        if param_diff(case, "roof_envelope_thermal_conductivity"):
            change_list["roof_insul_changed"] = True
        if param_diff(case, "roof_thickness"):
            change_list["roof_insul_changed"] = True
    if case.current_params["floor_insulation_check"] is True and case.planned_params["floor_insulation_check"] is True:
        if param_diff(case, "floor_envelope_thermal_conductivity"):
            change_list["floor_insul_changed"] = True
        if param_diff(case, "floor_thickness"):
            change_list["floor_insul_changed"] = True


def check_windows(case, change_list):
    if param_diff(case, "window_transmittance_value"):
        change_list["win_trans_changed"] = True
    if param_diff(case, "window_to_surface_area_ratio"):
        change_list["win_ratio_changed"] = True


def noise_server(output, case, value_name, changed, noise_type):
    val = 0
    if output["changed"][value_name]:
        val = 1
    ndwx = case.common_params["dwelling_count"]
    output[case.id]["current"][value_name] = \
        rumore(case.current_params[value_name] * output["confidence"][value_name] / math.sqrt(ndwx), noise_type) * val
    if changed:
        output[case.id]["planned"][value_name] = \
            rumore(case.planned_params[value_name] * output["confidence"][value_name] / math.sqrt(ndwx), noise_type) \
            * val
    else:
        output[case.id]["planned"][value_name] = output[case.id]["current"][value_name]


def noise_server_non_case(output, case, value_list, value_name, changed, noise_type):
    val = 0
    if output["changed"][value_name]:
        val = 1
    ndwx = case.common_params["dwelling_count"]
    output[case.id]["current"][value_name] = \
        rumore(value_list[value_name] * output["confidence"][value_name] / math.sqrt(ndwx), noise_type) * val
    if changed:
        output[case.id]["planned"][value_name] = \
            rumore(value_list[value_name] * output["confidence"][value_name] / math.sqrt(ndwx), noise_type) \
            * val
    else:
        output[case.id]["planned"][value_name] = output[case.id]["current"][value_name]


def noise_server_types(output, case, constants, value_name, changed, noise_type, table, type_name):
    index_shift = 0 if table == "table2" else 1
    val = 0
    if output["changed"][value_name]:
        val = 1
    ndwx = case.common_params["dwelling_count"]
    current_tmp = constants.heating_dhw[table][case.current_params[type_name] - index_shift]["efficiency"]
    output[case.id]["current"][value_name] = \
        rumore(current_tmp * output["confidence"][value_name] / math.sqrt(ndwx), noise_type) * val
    if changed:
        planned_tmp = constants.heating_dhw[table][case.planned_params[type_name] - index_shift]["efficiency"]
        output[case.id]["planned"][value_name] = \
            rumore(planned_tmp * output["confidence"][value_name] / math.sqrt(ndwx), noise_type) * val
    else:
        output[case.id]["planned"][value_name] = output[case.id]["current"][value_name]


def noise_server_common(output, values_dict, value_name, target, dwelling_count, noise_type, case_id):
    val = 0
    if output["changed"][value_name]:
        val = 1
    # todo call with values dict by case.id
    tmp = \
        rumore(values_dict[value_name] * output["confidence"][value_name] / math.sqrt(dwelling_count), noise_type) * val
    if target == "constants":
        output[target][value_name] = tmp
    else:
        output[case_id][target][value_name] = tmp


def rumore(conf_95, noise_type):
    # return rumore_fix(conf_95, noise_type)
    if noise_type == 1:
        s = conf_95 / 1.96
        val = (random.random() + random.random() + random.random() + random.random() + random.random()
               + random.random() + random.random() + random.random() + random.random() + random.random()
               + random.random() + random.random() - 6) * s
    elif noise_type == 2:
        s = conf_95 / 1.9
        val = (random.random() + random.random() - 1) * s * math.sqrt(6)
    else:  # noise_type == 3:
        s = conf_95 / 1.645
        val = (2 * random.random() - 1) * s * math.sqrt(3)
    return val


def rumore_fix(conf_95, noise_type):
    if noise_type == 1:
        s = conf_95 / 1.96
        val = (7 - 6) * s
    elif noise_type == 2:
        s = conf_95 / 1.9
        val = (1.5 - 1) * s * math.sqrt(6)
    else:  # noise_type == 3:
        s = conf_95 / 1.645
        val = (2 * 0.7 - 1) * s * math.sqrt(3)
    return val


def noise_server_hdd(output, year, hdd, case_id, noise_type):
    output[case_id]["hdd"][year] = \
        rumore(hdd * output["confidence"]["hdd"][year], noise_type) * output["changed"]["hdd"][year]


def noise_server_rad(output, year, rad, case_id, noise_type):
    output[case_id]["rad"][year] = \
        rumore(rad * output["confidence"]["rad"][year], noise_type) * output["changed"]["rad"][year]


def noise_server_tday(output, year, tday, case_id, noise_type):
    output[case_id]["tday"][year] = \
        rumore(tday * output["confidence"]["tday"][year], noise_type) * output["changed"]["tday"][year]


# dr = discount rate from "Variable Costs" sheet. It can be different for each country
def noise_server_dr(output, year, dr, case_id, noise_type):
    output[case_id]["dr"][year] = \
        rumore(dr * output["confidence"]["dr"][year], noise_type) * output["changed"]["dr"][year]


def noise_server_vc(output, variable_cost, name, year, noise_type):
    output["costs"][name][year] = \
        rumore(variable_cost * output["confidence"][name][year], noise_type) * output["changed"][name][year]


def noise_server_fix(output, case, name, cost, noise_type):
    ndwx = case.common_params["dwelling_count"]
    output["costs"]["fixed_costs"][name] = \
        rumore(cost * output["confidence"]["fixed_costs"][name] / ndwx, noise_type) * \
        output["changed"]["fixed_costs"][name]


def set_variance(output, project, constants, vitamax):
    dhw_load_values, efficiency_values, enviroment_values, geometry_values, thermal_prop_values = get_value_names(False)
    fixed_costs = get_fixed_cost_values(constants)

    assign_confidence_values(project.params["geometry_confidence"], output, geometry_values,
                             project.params["geometry_noise_check"])
    assign_confidence_values(project.params["thermal_prop_confidence"], output, thermal_prop_values,
                             project.params["thermal_prop_noise_check"])
    assign_confidence_values(project.params["efficiencies_confidence"], output, efficiency_values,
                             project.params["efficiencies_noise_check"])
    assign_confidence_values(project.params["simplified_DHW_load_confidence"], output, dhw_load_values,
                             project.params["simplified_DHW_load_noise_check"])
    assign_confidence_values(project.params["environment_confidence"], output, enviroment_values,
                             project.params["environment_noise_check"])
    assign_confidence_values_hdd_rad(project.params["environment_confidence"], output, vitamax,
                                     project.params["environment_noise_check"])
    assign_confidence_values_vc(project.params["energy_cost_confidence_today"],
                                project.params["energy_cost_confidence_final"],
                                output, vitamax,
                                project.params["energy_cost_noise_check"], project.params["time_horizon_years"])
    assign_confidence_values_fixed(project.params["investment_confidence"], output, fixed_costs,
                                   project.params["investment_noise_check"])


def get_fixed_cost_values(constants):
    heating_types = get_heating_types_helper(constants.heating_dhw)
    fixed_costs = {
        "heating_means": {1: "pellet_stove", 2: "heat_pump", 3: "solar_heating"},
        "heating_types_burner": heating_types["burner_types"],
        "heating_types_emitter": heating_types["emitter_types"],
        "heating_dhw_plant_types": get_plant_types_helper1(constants.heating_dhw),
        "heating_dhw_means": {1: "electric_boiler", 2: "dhw_heat_pump", 3: "dhw_solar_heater"},
        "envelope_and_windows": {
            1: "wall_insulation", 2: "roof_insulation", 3: "floor_insulation",
            4: "single_glazed_cost", 5: "double_glazed_cost"
        }
    }
    return fixed_costs


def set_advanced_variance(noisematrix, project, constants, vitamax):
    value_list = get_value_names(True)
    for tmp in value_list:
        changed, conf_value = get_changed_conf_value(project, tmp)
        cb_95 = get_cb(changed, conf_value)
        assign_single_confidence(cb_95, changed, noisematrix, tmp)

    init_hdd_rad_values(noisematrix)
    assign_advanced_confidence_hdd_rad_values(noisematrix, project, vitamax)
    assign_advanced_confidence_vc(noisematrix, project, vitamax)
    assign_advanced_confidence_fixed(noisematrix, project, constants)


def assign_advanced_confidence_fixed(noisematrix, project, constants):
    init_fixed_cost_values(noisematrix)
    fixed_costs = get_fixed_cost_values(constants)
    changed, conf_value = get_changed_conf_value(project, "fixed_costs")
    cb_95 = get_cb(changed, conf_value)
    for arrays in fixed_costs:
        for val_name in fixed_costs[arrays]:
            assign_single_fixed_cost(arrays, cb_95, changed, fixed_costs, noisematrix, val_name)


def assign_advanced_confidence_vc(noisematrix, project, vitamax):
    init_vc_values(noisematrix)
    for tmp in ["fuel_costs", "electric_costs", "pellet_costs"]:
        cb_95_today, cb_95_final, changed = get_cb_changed_vc(project, tmp)
        if tmp == "fuel_costs":
            v = vitamax
        else:
            v = project.params["time_horizon_years"]
        for i in range(0, vitamax + 1):
            assign_cost(cb_95_final, cb_95_today, changed, i, noisematrix, v, tmp)
    pass


def get_cb_changed_vc(project, value_name):
    project_params_map = {
        "fuel_costs": "fuel_cost",
        "electric_costs": "electric_cost",
        "pellet_costs": "pellet_cost"
    }
    cb_95_today = 0
    cb_95_final = 0
    changed = project.params[project_params_map[value_name] + "_noise_check"]
    if changed:
        cb_95_today = project.params[project_params_map[value_name] + "_confidence_today"] / 100
        cb_95_final = project.params[project_params_map[value_name] + "_confidence_final"] / 100
    return cb_95_today, cb_95_final, changed


def assign_advanced_confidence_hdd_rad_values(noisematrix, project, vitamax):
    for tmp in ["hdd", "rad", "tday", "dr"]:
        changed, conf = get_changed_conf_value(project, tmp)
        cb_95 = get_cb(changed, conf)
        for i in range(0, vitamax + 1):
            if tmp == "tday":
                assign_hdd_rad_values(cb_95, changed, i, noisematrix, tmp)
            else:
                assign_advanced_hdd_rad_values(cb_95, changed, i, noisematrix, tmp)


def get_changed_conf_value(project, name):
    if name == "eta_conv":  # they are missing eta_conv on Visual Basic project. This can be added later on
        return 0, 0
    project_param_map = {
        "floor_area": "Sfloor",
        "total_surface_area_to_volume_ratio": "sd_vol_ratio",
        "wall_height": "wall_height",
        "window_to_surface_area_ratio": "window_floor_ratio",
        "shadow": "shadow",
        "wall_thermal_transmittance": "Uwall",
        "roof_thermal_transmittance": "Uroof",
        "floor_thermal_transmittance": "Ufloor",
        "window_transmittance_value": "Uwindows",
        "wall_envelope_thermal_conductivity": "wall_thermal_conductivity",
        "wall_thickness": "wall_thickness",
        "roof_envelope_thermal_conductivity": "roof_thermal_conductivity",
        "roof_thickness": "roof_thickness",
        "floor_envelope_thermal_conductivity": "floor_thermal_conductivity",
        "floor_thickness": "floor_thickness",
        "sun_factor": "sun_factor",
        "alfa": "alfa_plaster",
        "airchangecoeff": "air_change",
        "eta_conv": "",
        "regul_eff": "regulation_eff",
        "distr_eff": "distribution_eff",
        "emitter_eff": "emission_eff",
        "solar_frac": "heating_solar_fraction",
        "generator_eff": "heating_burner_eff",
        "pellet_eff": "heating_pellet_eff",
        "hp_eff": "heating_heat_pump_COP",
        "DHW_solar_frac": "DHW_solar_fraction",
        "emitter_dhw_eff": "DHW_burner_eff",
        "electric_boiler_dhw_eff": "DHW_electric_boiler_eff",
        "hp_dhw_eff": "DHW_heat_pump_COP",
        "dhw_load": "advanced_DHW_load",
        "he": "he_conv",
        "hdd": "HDD",
        "rad": "solar_RAD",
        "tday": "heating_days",
        "dr": "discount_rate",
        "fixed_costs": "fixed_costs"
    }
    return project.params[project_param_map[name] + "_noise_check"], \
           project.params[project_param_map[name] + "_confidence"]


def get_value_names(advanced_flag):
    geometry_values = ["floor_area", "total_surface_area_to_volume_ratio", "wall_height",
                       "window_to_surface_area_ratio", "shadow"]
    thermal_prop_values = ["wall_thermal_transmittance", "roof_thermal_transmittance", "floor_thermal_transmittance",
                           "window_transmittance_value", "wall_envelope_thermal_conductivity", "wall_thickness",
                           "roof_envelope_thermal_conductivity", "roof_thickness",
                           "floor_envelope_thermal_conductivity", "floor_thickness",
                           "sun_factor", "alfa", "airchangecoeff"]
    efficiency_values = ["eta_conv", "regul_eff", "distr_eff", "emitter_eff", "solar_frac", "generator_eff",
                         "pellet_eff", "hp_eff", "DHW_solar_frac", "emitter_dhw_eff",
                         "electric_boiler_dhw_eff", "hp_dhw_eff"]
    dhw_load_values = ["dhw_load"]
    enviroment_values = ["he"]
    if advanced_flag:
        return geometry_values + thermal_prop_values + efficiency_values + dhw_load_values + enviroment_values
    return dhw_load_values, efficiency_values, enviroment_values, geometry_values, thermal_prop_values


def assign_confidence_values(conf_value, output, parmat_values, changed):
    cb_95 = get_cb(changed, conf_value)
    for tmp in parmat_values:
        assign_single_confidence(cb_95, changed, output, tmp)


def get_cb(changed, conf_value):
    cb_95 = 0
    if changed:
        cb_95 = conf_value / 100
    return cb_95


def assign_single_confidence(cb_95, changed, output, tmp):
    output["confidence"][tmp] = cb_95
    output["changed"][tmp] = changed


def assign_confidence_values_hdd_rad(conf_value, output, vitamax, changed):
    cb_95 = get_cb(changed, conf_value)
    init_hdd_rad_values(output)
    for tmp in ["hdd", "rad", "tday", "dr"]:
        for i in range(0, vitamax + 1):
            assign_hdd_rad_values(cb_95, changed, i, output, tmp)


def assign_hdd_rad_values(cb_95, changed, i, output, name):
    output["confidence"][name][i] = 0 if i == 0 else cb_95
    output["changed"][name][i] = False if i == 0 else changed


def assign_advanced_hdd_rad_values(cb_95, changed, i, output, name):
    output["confidence"][name][i] = cb_95
    output["changed"][name][i] = changed


def init_hdd_rad_values(output):
    output["confidence"] = {"hdd": {}, "rad": {}, "tday": {}, "dr": {}} | output["confidence"]
    output["changed"] = {"hdd": {}, "rad": {}, "tday": {}, "dr": {}} | output["changed"]


def assign_confidence_values_vc(conf_value_today, conf_value_final, output, vitamax, changed, vita):
    cb_95_today = 0
    cb_95_final = 0
    if changed:
        cb_95_today = conf_value_today / 100
        cb_95_final = conf_value_final / 100
    init_vc_values(output)
    for tmp in ["fuel_costs", "electric_costs", "pellet_costs"]:
        if tmp == "fuel_costs":
            v = vitamax
        else:
            v = vita
        for i in range(0, vitamax + 1):
            assign_cost(cb_95_final, cb_95_today, changed, i, output, v, tmp)


def assign_cost(cb_95_final, cb_95_today, changed, i, output, v, cost_type):
    output["confidence"][cost_type][i] = cb_95_today + (cb_95_final - cb_95_today) * i / v
    output["changed"][cost_type][i] = changed


def init_vc_values(output):
    output["confidence"] = {"fuel_costs": {}, "electric_costs": {}, "pellet_costs": {}} | output["confidence"]
    output["changed"] = {"fuel_costs": {}, "electric_costs": {}, "pellet_costs": {}} | output["changed"]


def assign_confidence_values_fixed(conf_value, output, fixed_costs, changed):
    cb_95 = get_cb(changed, conf_value)
    init_fixed_cost_values(output)
    for arrays in fixed_costs:
        for val_name in fixed_costs[arrays]:
            assign_single_fixed_cost(arrays, cb_95, changed, fixed_costs, output, val_name)


def init_fixed_cost_values(output):
    output["confidence"] = {"fixed_costs": {}} | output["confidence"]
    output["changed"] = {"fixed_costs": {}} | output["changed"]


def assign_single_fixed_cost(arrays, cb_95, changed, fixed_costs, output, val_name):
    output["confidence"]["fixed_costs"][fixed_costs[arrays][val_name]] = cb_95
    output["changed"]["fixed_costs"][fixed_costs[arrays][val_name]] = changed
