def heating_difference(cp, tsvc, tsvp):
    formato(cp, "details_heating_difference", "ewall", tsvc["q_w"] - tsvp["q_w"])
    formato(cp, "details_heating_difference", "ewin", tsvc["q_win"] - tsvp["q_win"])
    formato(cp, "details_heating_difference", "efloor", tsvc["q_floor"] - tsvp["q_floor"])
    formato(cp, "details_heating_difference", "eroof", tsvc["q_roof"] - tsvp["q_roof"])
    formato(cp, "details_heating_difference", "ev", tsvc["q_v"] - tsvp["q_v"])
    formato(cp, "details_heating_difference", "eis", - tsvc["q_is"] + tsvp["q_is"])
    formato(cp, "details_heating_difference", "eswin", - tsvc["qsg"] + tsvp["qsg"])


def saved_dhw(cp, total_costs, tsvc, tsvp, tvvc, tvvp):
    formato(cp, "saved", "dhw_en_losses", tsvc["selqDHW_d"] - tsvp["selqDHW_d"])
    formato(cp, "saved", "dhw_fuel_en_consumption", tsvc["selqDHW_f"] - tsvp["selqDHW_f"])
    formato(cp, "saved", "dhw_electric_en_consumption", tsvc["selqDHW_e"] - tsvp["selqDHW_e"])
    formato(cp, "saved", "dhw_solar_en_exploitation", tsvc["selqDHW_s"] - tsvp["selqDHW_s"])
    formato(cp, "saved", "dhw_primary_en_consumption", tsvc["selqDHW_p"] - tsvp["selqDHW_p"])
    formatob(cp, "saved", "dhw_fuel_en_bill", tvvc["selVCDHW_f"] - tvvp["selVCDHW_f"])
    formatob(cp, "saved", "dhw_electric_en_bill", tvvc["selVCDHW_e"] - tvvp["selVCDHW_e"])
    formatob(cp, "saved", "dhw_en_bill",
             tvvc["selVCDHW_f"] + tvvc["selVCDHW_e"] - tvvp["selVCDHW_f"] - tvvp["selVCDHW_e"])
    formatob(cp, "intervention", "cost", total_costs["total_heating_cost"] + total_costs["total_dhw_cost"])


def saved_heating(cp, total_sel_variables, total_vc_variables):
    tsvc = total_sel_variables["current_params"]
    tsvp = total_sel_variables["planned_params"]
    tvvc = total_vc_variables["current_params"]
    tvvp = total_vc_variables["planned_params"]
    formato(cp, "saved", "heating_en_losses", tsvc["selq_d"] - tsvp["selq_d"])
    formato(cp, "saved", "heating_fuel_en_consumption", tsvc["selq_f"] - tsvp["selq_f"])
    formato(cp, "saved", "heating_electric_en_consumption", tsvc["selq_e"] - tsvp["selq_e"])
    formato(cp, "saved", "heating_solar_en_exploitation", tsvc["selq_s"] - tsvp["selq_s"])
    formato(cp, "saved", "heating_primary_en_consumption", tsvc["selq_p"] - tsvp["selq_p"])
    formatob(cp, "saved", "heating_fuel_en_bill", tvvc["selVC_f"] - tvvp["selVC_f"])
    formatob(cp, "saved", "heating_electric_en_bill", tvvc["selVC_e"] - tvvp["selVC_e"])
    formatob(cp, "saved", "heating_en_bill", tvvc["selVC_f"] + tvvc["selVC_e"] - tvvp["selVC_f"] - tvvp["selVC_e"])
    return tsvc, tsvp, tvvc, tvvp


def heating_details(c_type, cp, tsl):
    formato(cp, "details_heating_" + c_type, "ewall", tsl["q_w"])
    formato(cp, "details_heating_" + c_type, "ewin", tsl["q_win"])
    formato(cp, "details_heating_" + c_type, "efloor", tsl["q_floor"])
    formato(cp, "details_heating_" + c_type, "eroof", tsl["q_roof"])
    formato(cp, "details_heating_" + c_type, "ev", tsl["q_v"])
    formato(cp, "details_heating_" + c_type, "eis", - tsl["q_is"])
    formato(cp, "details_heating_" + c_type, "eswin", - tsl["qsg"])


def dhw_values(c_type, cp, tsl, tvc):
    formato(cp, c_type, "dhw_en_losses", tsl["selqDHW_d"])
    formato(cp, c_type, "dhw_fuel_en_consumption", tsl["selqDHW_f"])
    formato(cp, c_type, "dhw_electric_en_consumption", tsl["selqDHW_e"])
    formato(cp, c_type, "dhw_solar_en_exploitation", tsl["selqDHW_s"])
    formato(cp, c_type, "dhw_primary_en_consumption", tsl["selqDHW_p"])
    formatob(cp, c_type, "dhw_fuel_en_bill", tvc["selVCDHW_f"])
    formatob(cp, c_type, "dhw_electric_en_bill", tvc["selVCDHW_e"])
    formatob(cp, c_type, "dhw_en_bill", tvc["selVCDHW_f"] + tvc["selVCDHW_e"])


def heating_values(cp, tsl, tvc, c_type):
    formato(cp, c_type, "heating_en_losses", tsl["selq_d"])
    formato(cp, c_type, "heating_fuel_en_consumption", tsl["selq_f"])
    formato(cp, c_type, "heating_electric_en_consumption", tsl["selq_e"])
    formato(cp, c_type, "heating_solar_en_exploitation", tsl["selq_s"])
    formato(cp, c_type, "heating_primary_en_consumption", tsl["selq_p"])
    formatob(cp, c_type, "heating_fuel_en_bill", tvc["selVC_f"])
    formatob(cp, c_type, "heating_electric_en_bill", tvc["selVC_e"])
    formatob(cp, c_type, "heating_en_bill", tvc["selVC_f"] + tvc["selVC_e"])


def formato(cp, c_type, name, value):
    original_name = name
    unit_type, ui_output, floor_area, name, strformat1, strformat2 = format_common(cp, name, c_type)
    if value > 999999:
        strformat1, strformat2 = "{:.2e}", "{:.2e}"
    if original_name in ["mm_vc_f", "mm_vc_e", "mm_vc_total", "mm_cost_total", "bvar_bp", "bvar", "bcvar_bp", "bcvar",
                "fixvar_bp", "fixvar", "fixcvar_bp", "fixcvar"]:
        if unit_type in ["optionmj", "optionkwh"]:
            ui_output[name] = strformat1.format(value)
        else:
            ui_output[name] = strformat2.format(value / floor_area)
        return
    if unit_type == "optionmj":
        ui_output[name] = strformat1.format(value)
    elif unit_type == "optionkwh":
        ui_output[name] = strformat1.format(value / 3.6)
    elif unit_type == "optionmjm2":
        ui_output[name] = strformat2.format(value / floor_area)
    elif unit_type == "optionkwhm":
        ui_output[name] = strformat2.format(value / (floor_area * 3.6))


def formatob(cp, c_type, name, value):
    unit_type, ui_output, floor_area, name, strformat1, strformat2 = format_common(cp, name, c_type)
    if value > 999999:
        strformat1, strformat2 = "{:.2e}", "{:.2e}"
    if unit_type in ["optionmj", "optionkwh"]:
        ui_output[name] = strformat1.format(value)
    else:
        ui_output[name] = strformat2.format(value / floor_area)


def format_common(cp, name, c_type):
    unit_type = cp["unit_type"]
    ui_output = cp["ui_output"]
    floor_area = cp["floor_area"]
    name = c_type + "_" + name
    strformat1, strformat2 = "{:,.0f}", "{:,.1f}"
    return unit_type, ui_output, floor_area, name, strformat1, strformat2
