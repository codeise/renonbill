from casecalc.dispersed_heat import calculate, get_hdd_rad
from casecalc.efficiency import heating_efficiency
from casecalc.financial import total_investment_costs, new_van
from casecalc.fixed_costs_inner import calculate_costs
from casecalc.mc_output_calcs import somme, vets
from casecalc.parameters import validate_case_parameters
from casecalc.ui_format import heating_values, dhw_values, heating_details, saved_heating, saved_dhw, \
    heating_difference
from casecalc.variable_costs import selected_variable_costs

from casecalc.monte_carlo import set_variance, init_output, noise, set_advanced_variance


def consumi(project, cases, constants, year, irun, statics, statics_per_case, vita, report, pub_rating, ui_output,
            outflag, matrices):
    for case in cases:
        validate_case_parameters(case.current_params)
        validate_case_parameters(case.planned_params)
    total_costs, total_sel_variables, total_vc_variables, cashflow = consumi_common(cases, constants, irun, outflag, project,
                                                                          pub_rating, report, statics, statics_per_case,
                                                                          ui_output, vita, year, None, False,
                                                                          matrices)
    consumi_ui_output(project, total_costs, total_sel_variables, total_vc_variables, ui_output, year)
    return total_costs


def consumi_common(cases, constants, irun, outflag, project, pub_rating, report, statics, statics_per_case, ui_output,
                   vita, year, noisematrix, mc_van, matrices):
    dispersed_heat_values, fixed_costs, schurn, schurn95, sdefau, sdefau95, total_costs, total_sel_variables, \
        total_vc_variables, vc_variables = init_consumi_variables()
    index = 0
    total_number_of_dwellings = 0
    total_floor_area = 0
    for case in cases:
        report["country"] = case.common_params["country"]
        total_number_of_dwellings += case.common_params["dwelling_count"]
        tmp = case.common_params["dwelling_count"] * case.common_params["floor_count"]
        total_floor_area += tmp * case.common_params["floor_area"]
        if "hdd" in ui_output:
            hdd_rad = get_hdd_rad(case.common_params, constants, noisematrix, case, year)
            ui_output["hdd"][case.id] = hdd_rad["hdd"]
            ui_output["rad"][case.id] = round(hdd_rad["rad"] / 3.6, 1)
            ui_output["tday"][case.id] = hdd_rad["tday"]
        calc_dispersed_eff, index, vc_e, vc_f = \
            consumi_dispersed(case, constants, dispersed_heat_values, index, total_sel_variables,
                              total_vc_variables, vc_variables, year, noisematrix)
        if year == 0:
            fixed_costs, schurn, schurn95, sdefau, sdefau95 = \
                consumi_year0_per_case(calc_dispersed_eff, case, constants, fixed_costs, report, schurn, schurn95,
                                       sdefau, sdefau95, total_costs, vc_variables, noisematrix)
        last_case = index == (len(cases))
        cashflow = new_van(statics, statics_per_case, vc_f, vc_e, vita, fixed_costs, case, cases, project.params,
                year, last_case, total_sel_variables["current_params"]["s_floor_area"], irun, ui_output, report,
                pub_rating, outflag, noisematrix, mc_van, total_sel_variables["current_params"]["s_floor_area"],
                matrices, project)
        if "t_min" in ui_output and "t_med" in ui_output:
            if fixed_costs["t_min"] != -1000000 and fixed_costs["t_med"] != -1000000:
                ui_output["t_min"][case.id] = round(fixed_costs["t_min"], 1)
                ui_output["t_med"][case.id] = round(fixed_costs["t_med"], 1)
    if year == 0:
        consumi_year0_bill(pub_rating, schurn, schurn95, sdefau, sdefau95, total_vc_variables)
    if year == 0 or year == 1:
        consumi_year0_year1(pub_rating, total_sel_variables)
    report["number_of_dwellings"] = total_number_of_dwellings
    report["floor_area"] = total_floor_area
    return total_costs, total_sel_variables, total_vc_variables, cashflow


def consumi_year0_year1(pub_rating, total_sel_variables):
    tsvc = total_sel_variables["current_params"]
    tsvp = total_sel_variables["planned_params"]
    esaved = - (tsvp["selq_f"] - tsvc["selq_f"] + tsvp["selqDHW_f"] - tsvc["selqDHW_f"] + tsvp["selq_e"] - tsvc[
        "selq_e"] + tsvp["selqDHW_e"] - tsvc["selqDHW_e"])
    pub_rating["esaved"] = esaved / (tsvc["selq_f"] + tsvc["selqDHW_f"] + tsvc["selq_e"] + tsvc["selqDHW_e"])


def consumi_year0_bill(pub_rating, schurn, schurn95, sdefau, sdefau95, total_vc_variables):
    tvvp = total_vc_variables["planned_params"]
    billnew = tvvp["selVC_f"] + tvvp["selVC_e"] + tvvp["selVCDHW_f"] + tvvp["selVCDHW_e"]
    if billnew != 0:
        pub_rating["schrun_billnew"] = schurn / billnew
        pub_rating["sdeafu_billnew"] = sdefau / billnew
        pub_rating["schrun95_billnew"] = schurn95 / billnew
        pub_rating["sdeafu95_billnew"] = sdefau95 / billnew


def consumi_year0_per_case(calc_dispersed_eff, case, constants, fixed_costs, report, schurn, schurn95, sdefau, sdefau95,
                           total_costs, vc_variables, noisematrix):
    fixed_costs = calculate_costs(
        case.current_params,
        case.planned_params,
        case.common_params,
        constants,
        calc_dispersed_eff["planned_params"]["selq_d"],
        report,
        case,
        noisematrix,
        0  # year
    )
    total_investment_costs(case, fixed_costs, total_costs)
    billnew = (vc_variables[case.id]["planned_params"]["selVC_f"] +
               vc_variables[case.id]["planned_params"]["selVC_e"]) + \
              (vc_variables[case.id]["planned_params"]["selVCDHW_f"] +
               vc_variables[case.id]["planned_params"]["selVCDHW_e"])
    schurn = schurn + billnew * case.common_params["churn_rate"]
    sdefau = sdefau + billnew * case.common_params["default_churn_rate"]
    schurn95 = schurn95 + billnew * case.common_params["churn_rate_95"]
    sdefau95 = sdefau95 + billnew * case.common_params["default_churn_rate_95"]
    return fixed_costs, schurn, schurn95, sdefau, sdefau95


def consumi_dispersed(case, constants, dispersed_heat_values, index, total_sel_variables,
                      total_vc_variables, vc_variables, year, noisematrix):
    index += 1
    # if monte carlo=1 removed here
    dispersed_heat_values[case.id] = {}
    tmp_dh_variables = dispersed_heat_values[case.id]
    vc_variables[case.id] = {}
    tmp_vc_variables = vc_variables[case.id]
    calc_dispersed_eff, vc_e, vc_f = consumi_heat_params(case, constants, tmp_dh_variables, tmp_vc_variables,
                                                         total_sel_variables, total_vc_variables, year, noisematrix)
    return calc_dispersed_eff, index, vc_e, vc_f


def consumi_ui_output(project, total_costs, total_sel_variables, total_vc_variables, ui_output, year):
    # todo: global variables FlagChanges and FlagchangesDHW are changed here
    # todo: carry some of the values from pubrating to report here.
    # In VB code, they do it with integer indexes. I will find a way to implement that

    # WHERE IS THIS CODE: ?
    # For i = 1 To 7
    #
    # If pubRating(i, 2) <> 0 Then
    # myReport.rating(i, 1) = pubRating(i, 2) 'values
    # Else
    # myReport.rating(i, 1) = pubRating(i, 1) 'values
    # End If
    # myReport.rating(i, 2) = pubRating(i, 3) 'values
    #
    # Next i

    total_floor_area = total_sel_variables["current_params"]["s_floor_area"]
    if year == 0:
        for params_type in ["current_params", "planned_params"]:
            if params_type == "current_params":
                c_type = "current"
            else:
                c_type = "planned"

            unit_option = project.params["unit_option"]
            tsl = total_sel_variables[params_type]
            tvc = total_vc_variables[params_type]
            cp = {"unit_type": unit_option, "ui_output": ui_output, "floor_area": total_floor_area}

            # heating values for current and planned
            heating_values(cp, tsl, tvc, c_type)
            # dhw values for current and planned
            dhw_values(c_type, cp, tsl, tvc)
            # current and planned heating details values
            heating_details(c_type, cp, tsl)

        # saved heating values
        tsvc, tsvp, tvvc, tvvp = saved_heating(cp, total_sel_variables, total_vc_variables)
        # saved dhw values
        saved_dhw(cp, total_costs, tsvc, tsvp, tvvc, tvvp)
        # difference heating details values
        heating_difference(cp, tsvc, tsvp)


def consumi_heat_params(case, constants, tmp_dh_variables, tmp_vc_variables, total_sel_variables, total_vc_variables,
                        year, noisematrix):
    calc_dispersed_eff = heating_efficiency(case, constants, noisematrix, year)
    vc_e, vc_f, vc_separated = {}, {}, {}
    for params_type in ["current_params", "planned_params"]:
        vc_separated[params_type] = {}
        params = getattr(case, params_type)

        tmp_dh_variables[params_type] = calculate(params, case, constants, noisematrix, params_type, year)
        tmp_dh_variables[params_type].update(calc_dispersed_eff[params_type])

        tmp_total_sel = total_sel_variables[params_type]
        for tmp in tmp_dh_variables[params_type]:
            tmp_total_sel[tmp] = tmp_total_sel[tmp] + tmp_dh_variables[params_type][tmp]

        selected_variable_costs(calc_dispersed_eff, case, constants.variable_costs, year, noisematrix,
                                params_type, vc_e, vc_f, vc_separated, constants.sheet_multi_memo)
        tmp_vc_variables[params_type] = vc_separated[params_type]

        tmp_total_vc = total_vc_variables[params_type]
        for tmp in tmp_vc_variables[params_type]:
            tmp_total_vc[tmp] = tmp_total_vc[tmp] + tmp_vc_variables[params_type][tmp]
    return calc_dispersed_eff, vc_e, vc_f


def init_consumi_variables():
    dispersed_heat_values = {}
    dispersed_heat_keys = [
        "q_win", "qsg", "q_floor", "q_roof", "q_v", "q_w", "q_is", "q_dhw", "s_floor_area", "selq_d", "selq_p",
        "selq_f", "selq_e", "selq_s", "selqDHW_d", "selqDHW_p", "selqDHW_f", "selqDHW_e", "selqDHW_s"
    ]
    total_sel_variables = {
        "current_params": dict.fromkeys(dispersed_heat_keys, 0),
        "planned_params": dict.fromkeys(dispersed_heat_keys, 0)
    }
    vc_variables = {}
    vc_keys = ["selVC_f", "selVC_e", "selVCDHW_f", "selVCDHW_e"]
    total_vc_variables = {
        "current_params": dict.fromkeys(vc_keys, 0),
        "planned_params": dict.fromkeys(vc_keys, 0)
    }
    total_costs = {"total_heating_cost": 0, "total_dhw_cost": 0, "cases": []}
    billnew, schurn, sdefau, schurn95, sdefau95 = 0, 0, 0, 0, 0
    # todo: confirm this is correct, put on this scope as it seems this is global in consumi
    fixed_costs = {"heating_cost": 0, "dhw_cost": 0, "t_min": -1000000, "t_med": -1000000}
    return dispersed_heat_values, fixed_costs, schurn, schurn95, sdefau, sdefau95, total_costs, total_sel_variables, total_vc_variables, vc_variables


def consumi_mc(cases, constants, irun, nrun, outflag, project, pub_rating, report, statics, statics_per_case, ui_output,
               vita, year, vitamax, mc_values, matrices_van):
    noisematrix = generate_noise(cases, constants, project, vitamax, year)

    total_costs, total_sel_variables, total_vc_variables, cashflow = consumi_common(cases, constants, irun, outflag, project,
                                                                          pub_rating, report, statics, statics_per_case,
                                                                          {}, vita, year, noisematrix, False,
                                                                          matrices_van)
    total_floor_area = total_sel_variables["current_params"]["s_floor_area"]
    unit_option = project.params["unit_option"]
    cp = {"unit_type": unit_option, "ui_output": {}, "floor_area": total_floor_area}
    output = somme(mc_values, irun, nrun, project, cp,
                   vets(total_sel_variables, "selq_d", "selqDHW_d"),
                   vets(total_sel_variables, "selq_f", "selqDHW_f"),
                   vets(total_sel_variables, "selq_e", "selqDHW_e"),
                   vets(total_vc_variables, "selVC_f", "selVCDHW_f"),
                   vets(total_vc_variables, "selVC_e", "selVCDHW_e"),
                   total_costs["total_heating_cost"] + total_costs["total_dhw_cost"], pub_rating, report)
    if output is not None:
        ui_output['print_values'] = output['print_values']
        ui_output['graph_values'] = output['graph_values']


def generate_noise(cases, constants, project, vitamax, year):
    noise_type = project.params["noise_flag"]
    index = 0
    noisematrix = {"confidence": {}, "changed": {}}
    if not project.params["uncertainty_advanced_flag"]:
        set_variance(noisematrix, project, constants, vitamax)
    else:
        set_advanced_variance(noisematrix, project, constants, vitamax)
    for case in cases:
        validate_case_parameters(case.current_params)
        validate_case_parameters(case.planned_params)
        noisematrix[case.id] = init_output(case, vitamax)
        index += 1
        hdd_rad = get_hdd_rad(case.common_params, constants, None, case, year)
        noise(constants, noisematrix, case, hdd_rad, vitamax, noise_type)  # mc is always called with year 0
    return noisematrix


def consumi_van(cases, constants, irun, outflag, project,
                pub_rating, report, statics, statics_per_case,
                ui_output, vita, year, matrices_van):
    for case in cases:
        validate_case_parameters(case.current_params)
        validate_case_parameters(case.planned_params)
    total_costs, total_sel_variables, total_vc_variables, cashflow = consumi_common(cases, constants, irun, outflag, project,
                                                                          pub_rating, report, statics, statics_per_case,
                                                                          ui_output, vita, year, None, False,
                                                                          matrices_van)
    return total_sel_variables["current_params"]["s_floor_area"], cashflow, total_costs


def consumi_van_mc(cases, constants, irun, nrun, outflag, project,
                   pub_rating, report, statics, statics_per_case,
                   ui_output, vita, year, vitamax, npv_mc_values, noise_matrix, matrices_van):
    total_costs, total_sel_variables, total_vc_variables, cashflow = consumi_common(cases, constants, irun, outflag, project,
                                                                          pub_rating, report, statics, statics_per_case,
                                                                          ui_output, vita, year, noise_matrix, True,
                                                                          matrices_van)
