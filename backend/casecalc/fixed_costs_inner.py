from casecalc.coefficients_constants import get_coefficients
from casecalc.constants_helpers import get_fixed_cost_by_key_from_sheet, is_number, \
    get_fixed_cost_from_sheet_by_key, get_noise_value, get_fixed_cost_from_sheet_by_key_noise, \
    get_fixed_cost_by_key_from_sheet_noise, get_noise_value_constants, get_noise_value_fixed_cost_by_name
from casecalc.dispersed_heat import get_hdd_rad, get_hhours, lateral

# this function only takes planned params, as it calculates planned costs
from casecalc.efficiency import get_effitiency_coefs


def calculate_costs(current_params, planned_params, common_params, constants, e_disp, report, case, noisematrix, year):
    hdd_rad_params = get_hdd_rad(common_params, constants, noisematrix, case, year)
    coefficients = get_coefficients(constants, "none", noisematrix, case)
    efficiency_coefficients = get_effitiency_coefs(constants, "planned_params", noisematrix, case)
    position = common_params["storey_position"]
    ndw = common_params["dwelling_count"]
    s_floor = common_params["floor_area"] + get_noise_value(noisematrix, case, "common", "floor_area")
    buildtype = common_params["building_type"]
    nfloor = common_params["floor_count"]
    s_v = common_params["total_surface_area_to_volume_ratio"] + \
          get_noise_value(noisematrix, case, "common", "total_surface_area_to_volume_ratio")
    h = common_params["wall_height"] + get_noise_value(noisematrix, case, "common", "wall_height")
    curr_win_sur_rat = current_params["window_to_surface_area_ratio"] + \
                       get_noise_value(noisematrix, case, "current", "window_to_surface_area_ratio")
    plan_win_sur_rat = planned_params["window_to_surface_area_ratio"] + \
                       get_noise_value(noisematrix, case, "planned", "window_to_surface_area_ratio")
    s_winratio = plan_win_sur_rat
    dhw_vol = s_floor * nfloor * coefficients["dhw_load"] * 0.04
    mh2o = 12 / 60

    wall_cond = planned_params["wall_envelope_thermal_conductivity"] + \
                get_noise_value(noisematrix, case, "planned", "wall_envelope_thermal_conductivity")
    wall_thick = planned_params["wall_thickness"] + \
                 get_noise_value(noisematrix, case, "planned", "wall_thickness")
    roof_cond = planned_params["roof_envelope_thermal_conductivity"] + \
                get_noise_value(noisematrix, case, "planned", "roof_envelope_thermal_conductivity")
    roof_thick = planned_params["roof_thickness"] + \
                 get_noise_value(noisematrix, case, "planned", "roof_thickness")
    floor_cond = planned_params["floor_envelope_thermal_conductivity"] + \
                 get_noise_value(noisematrix, case, "planned", "floor_envelope_thermal_conductivity")
    floor_thick = planned_params["floor_thickness"] + \
                  get_noise_value(noisematrix, case, "planned", "floor_thickness")
    uisolw = wall_cond / wall_thick
    uisolr = roof_cond / roof_thick
    uisolf = floor_cond / floor_thick
    hdd = hdd_rad_params["hdd"]
    t_base = efficiency_coefficients["t_base"]
    t_min = t_base - 2 * hdd / hdd_rad_params["tday"]
    t_med = t_base - hdd / hdd_rad_params["tday"]
    t_base_t_min = (t_base - t_min) / hdd / 1000
    pgen_ = e_disp / ndw * 1000000 / 3600 / get_hhours(hdd) * t_base_t_min
    pgen = int(pgen_ / 5 + 0.5) * 5
    pgen_hp_ = e_disp / ndw * 1000000 / 3600 / 18 * t_base_t_min
    pgen_hp = int(pgen_hp_ / 5 + 1) * 5
    ssun = e_disp / ndw / hdd_rad_params["rad"] / 0.4

    pgen_dhw = mh2o * coefficients["cp_water"] * (45 - 15) / 1000
    e_dhw = ndw * dhw_vol * coefficients["cp_water"] * (45 - 15) * 365 * 0.000001
    s_sun_dhw = e_dhw / ndw / hdd_rad_params["rad"] / 0.4  # hdd_rad_params["rad_total"]

    sr_ = s_floor
    sf_ = s_floor
    vol_ = h * s_floor * nfloor
    s_tot_ = s_v * vol_
    lateral_params = lateral(common_params, s_tot_, case, noisematrix)
    s_lat = lateral_params["lateral_area"]
    swin_ = min(s_floor * s_winratio * nfloor, s_lat)
    sw_ = s_lat

    cost, cost1, cost2, cost3, cost4, cost5, cost6, cost7, cost8 = 0, 0, 0, 0, 0, 0, 0, 0, 0

    if current_params["heating_type"] != planned_params["heating_type"] or \
            current_params["burner_type"] != planned_params["burner_type"]:
        if planned_params["heating_type"] == 1:
            burner_type = planned_params["burner_type"]
            cost = get_fixed_cost_from_sheet_by_key_noise(constants.heating_dhw["table1"], burner_type,
                                                          noisematrix, "burner_type") * max(15, pgen)
        elif planned_params["heating_type"] == 2:
            cost = get_fixed_cost_by_key_from_sheet_noise(constants.heating_dhw["table1"], "heating", "pellet stove",
                                                          noisematrix) * max(10, pgen)
        elif planned_params["heating_type"] == 3:
            cost = get_fixed_cost_by_key_from_sheet_noise(constants.heating_dhw["table1"], "heating", "heat pump",
                                                          noisematrix) * max(10, pgen_hp)

    if current_params["emitter_type"] != planned_params["emitter_type"]:
        if planned_params["emitter_type"] == 2 and current_params["emitter_type"] == 1:
            cost1 = (get_fixed_cost_from_sheet_by_key_noise(constants.heating_dhw["table3"],
                                                            planned_params["emitter_type"], noisematrix, "emitter_type")
                     - get_fixed_cost_from_sheet_by_key(constants.heating_dhw["table3"],
                                                        current_params["emitter_type"])) \
                    * pgen
        else:
            cost1 = get_fixed_cost_from_sheet_by_key_noise(
                constants.heating_dhw["table3"], planned_params["emitter_type"], noisematrix, "emitter_type") * pgen

    solar_perc = current_params["solar_perc"]
    if not is_number(solar_perc):
        solar_perc = 0

    if bool(planned_params["solar_check"]):
        cost2 = get_fixed_cost_by_key_from_sheet_noise(constants.heating_dhw["table1"], "heating", "solar_heating",
                                                       noisematrix) * ssun * \
                max(0, (planned_params["solar_perc"] - solar_perc))

    if current_params["DHW_type"] != planned_params["DHW_type"] or \
            current_params["DHW_burner_type"] != planned_params["DHW_burner_type"]:
        if planned_params["DHW_type"] == 1:
            cost3 = get_fixed_cost_by_key_from_sheet_noise(constants.heating_dhw["table2"], "plant_type",
                                                           "electric_boiler", noisematrix) * max(50, dhw_vol)
        elif planned_params["DHW_type"] == 2:
            cost3 = get_fixed_cost_from_sheet_by_key_noise(
                constants.heating_dhw["table2"], planned_params["DHW_burner_type"] + 1, noisematrix, "DHW_burner_type") \
                    * max(19, pgen_dhw)
        elif planned_params["DHW_type"] == 3:
            cost3 = get_fixed_cost_by_key_from_sheet_noise(constants.heating_dhw["table2"], "plant_type", "heat_pump",
                                                           noisematrix) * max(50, dhw_vol)

    dhw_solar_perc = current_params["DHW_solar_perc"]
    if not is_number(dhw_solar_perc):
        dhw_solar_perc = 0
    if bool(planned_params["DHW_solar_check"]):
        cost4 = get_fixed_cost_by_key_from_sheet_noise(constants.heating_dhw["table2"], "plant_type", "solar_heater",
                                                       noisematrix) * s_sun_dhw * \
                max(0, (planned_params["DHW_solar_perc"] - dhw_solar_perc))

    if current_params["wall_insulation_check"] != planned_params["wall_insulation_check"]:
        wall_mat_cost = constants.envelope_windows["table1"][1 - 1]["material_cost"]
        wall_ins_cost = constants.envelope_windows["table1"][1 - 1]["installation_cost"]
        cost5 = ((wall_mat_cost * (wall_thick / wall_cond * 0.03 / 0.1) + wall_ins_cost) +
                 get_noise_value_fixed_cost_by_name(noisematrix, "wall_insulation")) * sw_

    if current_params["roof_insulation_check"] != planned_params["roof_insulation_check"]:
        roof_mat_cost = constants.envelope_windows["table1"][2 - 1]["material_cost"]
        roof_ins_cost = constants.envelope_windows["table1"][2 - 1]["installation_cost"]
        cost6 = ((roof_mat_cost * (roof_thick / roof_cond * 0.03 / 0.1) +
                  get_noise_value_fixed_cost_by_name(noisematrix, "roof_insulation")) + roof_ins_cost) * sr_

    if current_params["floor_insulation_check"] != planned_params["floor_insulation_check"]:
        floor_mat_cost = constants.envelope_windows["table1"][3 - 1]["material_cost"]
        floor_ins_cost = constants.envelope_windows["table1"][3 - 1]["installation_cost"]
        cost7 = ((floor_mat_cost * (floor_thick / floor_cond * 0.03 / 0.1) +
                  get_noise_value_fixed_cost_by_name(noisematrix, "floor_insulation")) + floor_ins_cost) * sf_

    curr_win = current_params["window_transmittance_value"] + \
               get_noise_value(noisematrix, case, "current", "window_transmittance_value")
    plan_win = planned_params["window_transmittance_value"] + \
               get_noise_value(noisematrix, case, "planned", "window_transmittance_value")
    if curr_win != plan_win or \
            curr_win_sur_rat != plan_win_sur_rat:
        if plan_win >= 4:  # single glazed
            cost8 = (constants.envelope_windows["table2"][1 - 1]["value"] +
                     get_noise_value_fixed_cost_by_name(noisematrix, "single_glazed_cost")) * swin_
        if plan_win < 4:  # double glazed
            cost8 = (constants.envelope_windows["table2"][2 - 1]["value"] +
                     get_noise_value_fixed_cost_by_name(noisematrix, "single_glazed_cost")) * swin_

    invest_heating = (cost + cost1 + cost2 + cost5 + cost6 + cost7 + cost8) * ndw
    invest_dhw = (cost3 + cost4) * ndw

    report["individual_costs"] = {
        "heating_generator_cost": cost * ndw,
        "heating_emitter_cost": cost1 * ndw,
        "heating_solar_cost": cost2 * ndw,
        "dhw_generator_cost": cost3 * ndw,
        "dhw_solar_cost": cost4 * ndw,
        "window_cost": cost8 * ndw,
        "wall_envelope_cost": cost5 * ndw,
        "roof_envelope_cost": cost6 * ndw,
        "floor_envelope_cost": cost7 * ndw,
        "total_cost": invest_heating + invest_dhw
    }

    return {
        "heating_cost": invest_heating,
        "dhw_cost": invest_dhw,
        "t_min": t_min,
        "t_med": t_med
    }
