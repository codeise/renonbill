import math
import operator

from casecalc.constants_helpers import get_noise_value
from casecalc.mc_output_calcs import convert_graph_to_array, confidence_bound, vets
from casecalc.variable_costs import selected_variable_costs


def get_npv_params(constants):
    vcs = constants.variable_costs
    statics_keys = [
        "tasso_integrale", "return_time", "rata0", "loanyrs", "rataloan0", "qpb", "qvan", "flagdpb", "flagpb"
    ]
    statics = dict.fromkeys(statics_keys, 0)
    p = get_npv_per_case_params()
    return p, statics, vcs


def get_npv_per_case_params():
    return {"van_mc": {}, "van_MCPB": {}, "cashflow": {}, "cashflowAtt": {}, "loan": 0, "rata": 0, "tasso_integrale": 0,
            "rata0": 0, "rataloan0": 0}


def new_van(statics, statics_per_case, vc_f, vc_e, vita, fixed_costs, case, cases, project_params, year, last_case,
            total_area, irun, ui_output, report, pub_rating, outflag, noisematrix, mc_van, tot_area, matrices, project):
    spc = statics_per_case[case.id]
    nvp = init_nvp_locals(vita)
    total_cost = fixed_costs["heating_cost"] + fixed_costs["dhw_cost"]
    if year == 0:
        npv_year_eq_zero(statics, spc, project_params, total_cost)
    if year > 0:
        new_van_year_gt_zero(statics, case, spc, vc_e, vc_f, year, noisematrix)
    if year == vita and last_case:
        area = new_van_area(total_area, project_params)
        for inner_case in cases:
            spc_inner = statics_per_case[inner_case.id]
            for inner_year in range(0, vita + 1):
                nvp["n_mc"][inner_year] = nvp["n_mc"][inner_year] + spc_inner["van_mc"][inner_year]
                nvp["van_MCPB"][inner_year] = nvp["van_MCPB"][inner_year] + spc_inner["van_MCPB"][inner_year]
                nvp["cashflow"][inner_year] = nvp["cashflow"][inner_year] + spc_inner["cashflow"][inner_year]
                nvp["cashflowAtt"][inner_year] = nvp["cashflowAtt"][inner_year] + spc_inner["cashflowAtt"].get(
                    inner_year, 0)
        matrices["matrices_van"][irun] = {}
        matrices["matrices_cash"][irun] = {}
        for inner_year in range(0, vita + 1):
            matrices["matrices_van"][irun][inner_year] = nvp["n_mc"][inner_year]
            matrices["matrices_cash"][irun][inner_year] = nvp["cashflow"][inner_year]

        for inner_year in range(1, vita + 1):
            calc_mcs(matrices["dpb"], "flagdpb", inner_year, irun, nvp["n_mc"], statics, False)
            calc_mcs(matrices["pb"], "flagpb", inner_year, irun, nvp["van_MCPB"], statics, False)
            if inner_year == vita:
                if (nvp["n_mc"][inner_year] - nvp["n_mc"][inner_year - 1]) != 0 and (
                        nvp["van_MCPB"][inner_year] - nvp["van_MCPB"][inner_year - 1]) != 0:
                    if statics["flagdpb"] == 0:
                        calc_mcs(matrices["dpb"], "flagdpb", inner_year, irun, nvp["n_mc"], statics, True)
                    if statics["flagpb"] == 0:
                        calc_mcs(matrices["pb"], "flagpb", inner_year, irun, nvp["van_MCPB"], statics, True)

        if not mc_van:
            one_digit = "{:,.1f}"
            report["financial_values"] = {}
            report["financial_values"]["qNPV"] = {}
            for i in range(0, vita + 1):
                report["financial_values"]["qNPV"][i] = one_digit.format(matrices["matrices_van"][irun][i])
            y_min, y_max = calc_y_values(vita, nvp["n_mc"])
            ui_output["npv_vector"] = convert_graph_to_array(nvp["n_mc"])
            ui_output["Labvan"] = format_s(matrices["matrices_van"][irun][year], area)
            pub_rating["van_mc_zero"] = format_s(matrices["matrices_van"][irun][year], area)
            ui_output["Labelinvest"] = format_s(- matrices["matrices_van"][irun][0], area)
            qirr = irr(case, nvp["cashflow"], year, noisematrix)
            pub_rating["irr"] = qirr
            pub_rating["dpb_zero"] = matrices["dpb"][0]
            if outflag:
                ui_output["LabIRR"] = "{:,.2f}".format(qirr * 100)
                ui_output["Labvan_max"] = format_s(y_max, area)
                ui_output["Labvan_min"] = format_s(y_min, area)
                ui_output["pb_zero"] = one_digit.format(matrices["pb"][0])
                ui_output["dpb_zero"] = one_digit.format(matrices["dpb"][0])
                if matrices["matrices_van"][irun][0] != 0:
                    ui_output["LabPI"] = "{:,.2f}".format(1 - matrices["matrices_van"][irun][year] /
                                                         matrices["matrices_van"][irun][0])
                    report["financial_values"]["LabPI"] = one_digit.format(1 - matrices["matrices_van"][irun][year] /
                                                                          matrices["matrices_van"][irun][0])
            report["financial_values"]["DPBP"] = one_digit.format(matrices["dpb"][0])
            report["vita"] = vita
            return nvp["cashflow"]
        elif irun == project_params["number_of_monte_carlo_runs"]:
            nrun = project_params["number_of_monte_carlo_runs"]
            calculate_mc_van_output(project_params, case, ui_output, vita, nrun, tot_area,
                                    matrices, project, noisematrix, pub_rating, report)
    return None


# noinspection PyTypeChecker
def calculate_mc_van_output(project_params, case, ui_output, vita, nrun, total_area, matrices,
                            project, noisematrix, pub_rating, report):
    if nrun < 2:
        return
    area = 1
    if project_params["unit_option"] in ["optionmjm2", "optionkwhm"]:
        area = total_area
    if area == 0:
        return
    exp_van = {}
    for i in range(0, vita + 1):
        exp_van[i] = 0
        for j in range(1, nrun + 1):
            exp_van[i] += matrices["matrices_van"][j][i] / nrun
    dev_2, cb_1, cb_2 = mat_confidence_bound(matrices["matrices_van"], nrun, vita,
                                             project_params["confidence_level"] / 100)
    pub_rating["exp_van"] = exp_van[vita] / area
    pub_rating["dex_2"] = dev_2[vita] / area
    neg = 0
    for i in range(1, nrun + 1):
        if matrices["matrices_van"][i][vita] <= 0:
            neg += 1

    van_vita_mc = {}
    for i in range(1, nrun + 1):
        van_vita_mc[i] = matrices["matrices_van"][i][vita]

    tmp_arr = sorted(van_vita_mc.items(), key=operator.itemgetter(1), reverse=True)
    for i in range(1, nrun + 1):
        van_vita_mc[i] = tmp_arr[i - 1][1]

    sneg, nneg = 0, 0
    for key, value in van_vita_mc.items():
        if value < 0:
            sneg += value
            nneg += 1
    c_loss = 0
    if nneg > 0:
        c_loss = sneg / nneg

    npv_var_bp, npv_var, npv_cond_var_bp, npv_cond_var = 0, 0, 0, 0

    n_95 = int(nrun * 0.95 + 0.5)
    npv_var_bp = van_vita_mc[n_95]
    npv_var = -(exp_van[vita] - npv_var_bp)

    for i in range(n_95, nrun + 1):
        npv_cond_var_bp += van_vita_mc[i] / (nrun - n_95 + 1)
    npv_cond_var = -(exp_van[vita] - npv_cond_var_bp)

    exp_pi = {}
    for i in range(0, vita + 1):
        exp_pi[i] = 0
        for j in range(1, nrun + 1):
            if matrices["matrices_van"][j][0] != 0:
                exp_pi[i] += (1 - matrices["matrices_van"][j][i] / matrices["matrices_van"][j][0]) / nrun

    vpi = {}
    for i in range(1, nrun + 1):
        vpi[i] = 0
        if matrices["matrices_van"][i][0] != 0:
            vpi[i] = 1 - matrices["matrices_van"][i][vita] / matrices["matrices_van"][i][0]
    dev_pi_2 = confidence_bound(vpi, project)
    vpb, vdpb = {}, {}
    exp_pbp, exp_dpbp = 0, 0
    for i in range(1, nrun + 1):
        vpb[i] = matrices["pb"][i]
        vdpb[i] = matrices["dpb"][i]
        exp_pbp += matrices["pb"][i] / nrun
        exp_dpbp += matrices["dpb"][i] / nrun
    dev_pbp_2 = confidence_bound(vpb, project)
    dev_dpbp_2 = confidence_bound(vdpb, project)

    pub_rating["exp_dpbp"] = exp_dpbp
    pub_rating["dev_dpbp_2"] = dev_dpbp_2

    dpb_arr_ordered = sorted(matrices["dpb"].items(), key=operator.itemgetter(1), reverse=True)
    n_05 = int(nrun * 0.05 + 0.5)
    dpb_var_bp = dpb_arr_ordered[n_05 - 1][1]
    dpb_var = -(exp_dpbp - dpb_var_bp)

    dpb_cvar_bp = 0
    for i in range(1, n_05 + 1):
        dpb_cvar_bp += dpb_arr_ordered[i][1] / n_05
    dpb_cvar = -(exp_dpbp - dpb_cvar_bp)

    pub_rating["neg_per_run"] = neg / nrun

    irr_xi, irr_cb_95, irr_var, irr_var_bp, irr_cvar, irr_cvar_bp = \
        irr_mc(project_params["confidence_level"] / 100, nrun, vita, matrices, case, noisematrix)
    pub_rating["irr_xi"] = irr_xi
    pub_rating["irr_cb_95"] = irr_cb_95
    y_min, y_max = calc_y_values(vita, vets_org(exp_van, dev_2))

    one_digit = "{:,.1f}"
    two_digit = "{:,.2f}"

    green_graph_dict = vets_org(exp_van.copy(), dev_2)
    y_min = green_graph_dict[min(green_graph_dict.keys(), key=(lambda k: green_graph_dict[k]))]
    y_max = green_graph_dict[max(green_graph_dict.keys(), key=(lambda k: green_graph_dict[k]))]
    ui_output["graph_ymin"] = round(y_min - (y_max - y_min) * 0.2, 0)
    ui_output["graph_ymax"] = round(y_max + (y_max - y_min) * 0.1, 0)

    delta_y, init_y_min = align_mcnpv_scatter(green_graph_dict, y_max, y_min)
    delta_graph, graph_min = get_delta_graph(green_graph_dict)
    ui_output["green_graph"] = point_graph_conversion(green_graph_dict, y_min, y_max, graph_min, delta_graph, (delta_y, init_y_min))
    ui_output["blue_graph"] = point_graph_conversion(exp_van.copy(), y_min, y_max, graph_min, delta_graph)
    ui_output["red_graph"] = point_graph_conversion(vetd_org(exp_van.copy(), dev_2), y_min, y_max, graph_min, delta_graph)
    ui_output["bar_graph"] = convert_graph_to_array(vector_to_isto_mc(van_vita_mc, 60, y_min, y_max, nrun))
    ui_output["print_values"] = {}
    exp_van_rounded = {}
    for key, value in exp_van.items():
        exp_van_rounded[key] = one_digit.format(value)
    tmp_cb_1, tmp_cb_2 = {}, {}
    for key in cb_1:
        tmp_cb_1[key] = one_digit.format(cb_1[key])
        tmp_cb_2[key] = one_digit.format(cb_2[key])
    report["van_mc_values"] = {
        "qNPV": exp_van_rounded,
        "cb+": tmp_cb_1,
        "cb-": tmp_cb_2,
        "npv": {
            "value": one_digit.format(exp_van[vita]),
            "conf_bound": one_digit.format(dev_2[vita]),
            "value_at_risk": one_digit.format(npv_var_bp),
            "cond_value_at_risk": one_digit.format(npv_cond_var_bp)
        },
        "irr": {
            "value": one_digit.format(irr_xi * 100),
            "conf_bound": one_digit.format(irr_cb_95 * 100),
            "value_at_risk": one_digit.format(irr_var_bp * 100),
            "cond_value_at_risk": one_digit.format(irr_cvar_bp * 100)
        },
        "dpbp": {
            "value": one_digit.format(exp_dpbp),
            "conf_bound": one_digit.format(dev_dpbp_2),
            "value_at_risk": one_digit.format(dpb_var_bp),
            "cond_value_at_risk": one_digit.format(dpb_cvar_bp)
        }
    }

    ui_output["print_values"]["y_max"] = y_max
    ui_output["print_values"]["y_min"] = y_min
    ui_output["print_values"]["nrun"] = nrun
    ui_output["print_values"]["lab_mc_van"] = format_s(exp_van[vita], area)
    ui_output["print_values"]["lab_van_cb95"] = format_ss(dev_2[vita], area)
    ui_output["print_values"]["lab_mc_irr"] = two_digit.format(irr_xi * 100)
    ui_output["print_values"]["lab_irr_cb95"] = two_digit.format(irr_cb_95 * 100)
    ui_output["print_values"]["lab_mc_pi"] = two_digit.format(exp_pi[vita])
    ui_output["print_values"]["lab_pi_cb95"] = two_digit.format(dev_pi_2)
    ui_output["print_values"]["lab_mc_pbp"] = one_digit.format(exp_pbp)
    ui_output["print_values"]["lab_pbp_cb05"] = two_digit.format(dev_pbp_2)
    ui_output["print_values"]["lab_mc_dpbp"] = one_digit.format(exp_dpbp)
    ui_output["print_values"]["lab_dpbp_cb05"] = two_digit.format(dev_dpbp_2)
    ui_output["print_values"]["lab_npv_var_bp"] = format_s(npv_var_bp, area)
    ui_output["print_values"]["lab_npv_var"] = format_s(npv_var, area)
    ui_output["print_values"]["lab_npv_cvar_bp"] = format_s(npv_cond_var_bp, area)
    ui_output["print_values"]["lab_npv_cvar"] = format_s(npv_cond_var, area)
    ui_output["print_values"]["lab_irr_var_bp"] = two_digit.format(irr_var_bp * 100)
    ui_output["print_values"]["lab_irr_var"] = two_digit.format(irr_var * 100)
    ui_output["print_values"]["lab_irr_cvar_bp"] = two_digit.format(irr_cvar_bp * 100)
    ui_output["print_values"]["lab_irr_cvar"] = two_digit.format(irr_cvar * 100)
    ui_output["print_values"]["lab_pbp_var_bp"] = one_digit.format(dpb_var_bp)
    ui_output["print_values"]["lab_pbp_var"] = one_digit.format(dpb_var)
    ui_output["print_values"]["lab_pbp_cvar_bp"] = one_digit.format(dpb_cvar_bp)
    ui_output["print_values"]["lab_pbp_cvar"] = one_digit.format(dpb_cvar)
    ui_output["print_values"]["lab_loss"] = one_digit.format(neg / nrun * 100)
    ui_output["print_values"]["lab_cond_loss"] = format_s(c_loss, area)


def point_graph_conversion(graph_dict, y_min, y_max, graph_min, delta_graph, align_data=None):
    if not align_data:
        delta_y, init_y_min = align_mcnpv_scatter(graph_dict, y_max, y_min)
    else:
        delta_y, init_y_min = align_data
    for key in graph_dict.keys():
        graph_dict[key] = (graph_dict[key] - graph_min) * (delta_y / delta_graph) + init_y_min
    arr = list(graph_dict.items())
    return map(lambda e: {"x": e[0], "y": e[1]}, arr)


def get_delta_graph(graph_dict):
    graph_min = graph_dict[min(graph_dict.keys(), key=(lambda k: graph_dict[k]))]
    graph_max = graph_dict[max(graph_dict.keys(), key=(lambda k: graph_dict[k]))]
    delta_graph = graph_max - graph_min
    return delta_graph, graph_min


def align_mcnpv_scatter(graph_dict, y_max, y_min):
    delta_y = y_max - y_min
    init_y_min = y_min
    y_min -= delta_y * 0.2
    y_max += delta_y * 0.1
    rat_y = 390 / (y_max - y_min)
    for key in graph_dict.keys():
        graph_dict[key] = -(390 - (graph_dict[key] - y_min) * rat_y)
    return delta_y, init_y_min


def vector_to_isto_mc(vector, m, y_min, y_max, nrun):
    sum = 0
    isto = {}
    for i in range(0, m + 1):
        isto[i] = 0
    if y_min == y_max:
        return isto

    for i in range(1, nrun + 1):
        sum += vector[i]
    if sum == 0:
        return isto
    for i in range(1, nrun + 1):
        indice = m - int((vector[i] - y_min) * m / (y_max - y_min))
        if 0 <= indice <= m:
            isto[indice] += 1
    return isto


def vetd_org(dict1, dict2):
    dict_sum = {}
    for key, val in dict1.items():
        dict_sum[key] = dict1[key] - dict2[key]
    return dict_sum


def vets_org(dict1, dict2):
    dict_sum = {}
    for key, val in dict1.items():
        dict_sum[key] = dict1[key] + dict2[key]
    return dict_sum


def irr_mc(confidence, nrun, vita, matrices, case, noisematrix):
    conf = confidence + (1 - confidence) / 2
    irr_dict, v_irr = {}, {}
    sum = 0
    for i in range(1, nrun + 1):
        for j in range(0, vita + 1):
            irr_dict[j] = matrices["matrices_cash"][i][j]
        qirr = irr(case, irr_dict, vita, noisematrix)
        v_irr[i] = qirr
        sum += qirr / nrun
    irr_arr = sorted(v_irr.items(), key=operator.itemgetter(1), reverse=True)
    n_cb1, n_cb2 = int((1 - conf) * nrun + 0.5), int(conf * nrun + 0.5) - 1
    dev = (irr_arr[n_cb1][1] - irr_arr[n_cb2][1]) / 2

    if nrun % 20 == 10:
        n_95 = math.floor(nrun * 0.95 + 0.5) - 1
    else:
        n_95 = math.floor(nrun * 0.95 + 0.5)
    var_bp = irr_arr[n_95][1]
    var = -(sum - var_bp)

    if nrun - n_95 + 1 == 0:
        return sum, dev, var, var_bp, 0, 0
    c_var_bp = 0
    for i in range(n_95, nrun):
        c_var_bp += irr_arr[i][1] / (nrun - n_95)
    c_var = -(sum - c_var_bp)
    return sum, dev, var, var_bp, c_var, c_var_bp


def mat_confidence_bound(matrices_van, nrun, vita, confidence):
    conf = confidence + (1 - confidence) / 2
    tmp_van = {}
    dev_2, cb_1, cb_2 = {}, {}, {}
    for i in range(0, vita + 1):
        for j in range(1, nrun + 1):
            tmp_van[j] = matrices_van[j][i]
        tmp_arr = sorted(tmp_van.items(), key=operator.itemgetter(1), reverse=True)
        cb_1[i] = tmp_arr[round((1 - conf) * nrun + 0.5) - 1][1]
        cb_2[i] = tmp_arr[round(conf * nrun + 0.5) - 1][1]
        dev_2[i] = abs(cb_1[i] - cb_2[i]) / 2
    return dev_2, cb_1, cb_2


def format_s(val, area):
    if area == 0:
        return ""
    elif area == 1:
        return "{:,.0f}".format(val / area)
    else:
        return "{:,.1f}".format(val / area)


def format_ss(val, area):
    if area == 0:
        return 0
    elif area == 1:
        return "{:,.0f}".format(val / area)
    else:
        return "{:,.2f}".format(val / area)


def init_nvp_locals(vita):
    nvp = {"n_mc": {}, "van_MCPB": {}, "cashflow": {}, "cashflowAtt": {}}
    for inner_year in range(0, vita + 1):
        nvp["n_mc"][inner_year] = 0
        nvp["van_MCPB"][inner_year] = 0
        nvp["cashflow"][inner_year] = 0
        nvp["cashflowAtt"][inner_year] = 0
    return nvp


def calc_y_values(vita, van_mc):
    y_min = van_mc[1]
    y_max = van_mc[1]
    for i in range(0, vita + 1):
        if van_mc[i] > y_max:
            y_max = van_mc[i]
        if van_mc[i] < y_min:
            y_min = van_mc[i]
    if y_min == y_max:
        return 0, 0
    delta = y_max - y_min
    y_min = y_min - delta * 0.2
    y_max = y_max + delta * 0.1
    return y_min, y_max


def calc_mcs(dpb, flag, inner_year, irun, mc_var, statics, apply_if):
    if not dpb:
        dpb[0] = 0
    if irun not in dpb:
        dpb[irun] = 0
    if apply_if or (mc_var[inner_year] > 0 >= mc_var[inner_year - 1]):
        dpb[irun] = ((inner_year - 1) * mc_var[inner_year] - inner_year * mc_var[inner_year - 1]) / (
                mc_var[inner_year] - mc_var[inner_year - 1])
        statics[flag] = 1
    elif dpb[irun] != 0:
        return
    else:
        dpb[irun] = 0
        statics[flag] = 0


def quick_npv(case, calc_dispersed_eff, constants, fixed_costs, project_params, noisematrix, vitamax):
    p, statics, vcs = get_npv_params(constants)
    npv = {}
    qirr = {}
    vita = min(project_params["time_horizon_years"], vitamax)
    vc_separated = {}
    for year in range(0, vita + 1):
        vc_e, vc_f, vc_separated = {}, {}, {}
        for params_type in ["current_params", "planned_params"]:
            vc_separated[params_type] = {}
            selected_variable_costs(calc_dispersed_eff, case, vcs, year, noisematrix,
                                    params_type, vc_e, vc_f, vc_separated, constants.sheet_multi_memo)
        total_cost = fixed_costs["heating_cost"] + fixed_costs["dhw_cost"]
        if year == 0:
            npv_year_eq_zero(statics, p, project_params, total_cost)
        if year > 0:
            npv_year_gt_zero(statics, case, p, vc_e, vc_f, vita, year, noisematrix)
        if year == vita:
            statics["qvan"] = p["van_mc"][year]
            qirr = irr(case, p["cashflow"], year, noisematrix)
            for i in range(0, vita + 1):
                npv[i] = p["van_mc"][i]

    return {
        "qpb": statics["qpb"], "qvan": statics["qvan"], "npv": npv, "qirr": qirr, "vcs": vcs, "vc_values": vc_separated,
        "vita": vita
    }


def new_van_year_gt_zero(s, case, p, vc_e, vc_f, year, noisematrix):
    year_gt_zero_common(case, p, s, vc_e, vc_f, year, noisematrix)
    if p["tasso_integrale"] != 0:
        p["cashflowAtt"][year] = p["cashflow"][year] / p["tasso_integrale"]
        p["van_mc"][year] = p["van_mc"][year - 1] + p["cashflowAtt"][year]
    p["van_MCPB"][year] = p["van_MCPB"][year - 1] + p["cashflow"][year]


def year_gt_zero_common(case, p, s, vc_e, vc_f, year, noisematrix):
    if year > s["return_time"]:
        rata = 0
    else:
        rata = p["rata0"]
    if year > s["loanyrs"]:
        rata_loan = 0
    else:
        rata_loan = p["rataloan0"]
    p["cashflow"][year] = \
        vc_f["current_params"] - vc_f["planned_params"] + vc_e["current_params"] \
        - vc_e["planned_params"] + rata - rata_loan
    p["tasso_integrale"] = p["tasso_integrale"] * (1 + case.common_params["discount_rate"] / 100 +
                                                   get_noise_value(noisematrix, case, "dr", year))
    return rata


def npv_year_gt_zero(s, case, p, vc_e, vc_f, vita, year, noisematrix):
    rata = year_gt_zero_common(case, p, s, vc_e, vc_f, year, noisematrix)
    if p["tasso_integrale"] != 0:
        p["cashflowAtt"][year] = p["cashflow"][year] / p["tasso_integrale"]
        p["van_mc"][year] = p["van_mc"][year - 1] + p["cashflowAtt"][year] + rata / p["tasso_integrale"]
    p["van_MCPB"][year] = p["van_MCPB"][year - 1] + p["cashflow"][year] + rata
    if p["van_mc"][year] > 0 >= p["van_mc"][year - 1]:
        s["qpb"] = ((year - 1) * p["van_mc"][year] - year * p["van_mc"][year - 1]) / \
                   (p["van_mc"][year] - p["van_mc"][year - 1])
        s["flagdpb"] = 1
    if p["van_MCPB"][year] > 0 >= p["van_MCPB"][year - 1]:
        s["flagpb"] = 1
    if year == vita:
        if s["flagdpb"] == 0 and p["van_mc"][year] != p["van_mc"][year - 1]:
            s["qpb"] = ((year - 1) * p["van_mc"][year] - year * p["van_mc"][year - 1]) / \
                       (p["van_mc"][year] - p["van_mc"][year - 1])
        if s["flagpb"] == 0:
            # 'PB = ((year - 1) * van_MCPB(year) - year * van_MCPB(year - 1)) / (van_MCPB(year) - van_MCPB(year - 1))
            pass


def new_van_area(total_area, project_params):
    area = 1
    if project_params["unit_option"] in ["optionkwhm", "mptionmjm2"]:
        area = total_area
    return area


def npv_year_eq_zero(s, p, project_params, total_cost):
    fixc0 = total_cost
    if bool(project_params["incentives_check"]):
        s["bonus"] = min(project_params["incentives_amount_%"] / 100, 1)
        s["return_time"] = project_params["incentives_refund_years"]
        if s["return_time"] != 0:
            p["rata0"] = s["bonus"] * fixc0 / s["return_time"]
    else:
        s["bonus"] = 0
        p["rata0"] = 0
    if bool(project_params["loan_check"]):
        s["loanyrs"] = project_params["loan_refund_years"]
        p["loan"] = min(project_params["loan_amount_%"] / 100, 1) * fixc0
        s["loan_rate"] = max(min(project_params["loan_rate"] / 100, 1), 0.0000000001)
        p["rataloan0"] = p["loan"] * s["loan_rate"] / (1 - 1 / (1 + s["loan_rate"]) ** s["loanyrs"])
    else:
        p["loan"] = 0
        p["rataloan0"] = 0
    p["tasso_integrale"] = 1
    if s["return_time"] == 0:
        p["van_mc"][0] = -(fixc0 * (1 - s["bonus"]) - p["loan"])
        p["van_MCPB"][0] = -(fixc0 * (1 - s["bonus"]) - p["loan"])
        p["cashflow"][0] = -(fixc0 * (1 - s["bonus"]) - p["loan"])
    else:
        p["van_mc"][0] = -(fixc0 - p["loan"])
        p["van_MCPB"][0] = -(fixc0 - p["loan"])
        p["cashflow"][0] = -(fixc0 - p["loan"])


def irr(case, cashflow, year, noisematrix):
    # if year > project_params["time_horizon_years"]: return
    index, xv, fx0, dfdx0 = 0, 0, 0, 0
    irrflag = True
    x0 = case.common_params["discount_rate"] / 100 + get_noise_value(noisematrix, case, "dr", year)
    x = x0
    while True:
        index += 1
        xv = x
        fx0 = irr_f(xv, cashflow, year)
        if fx0 == 0:
            x = 0
            break
        dfdx0 = irr_fdx(xv, cashflow, year)
        if dfdx0 == 0:
            x = 0
            break
        x = xv - fx0 / dfdx0
        if abs(x - xv) < 0.000001 or index > 50:
            break
    if index > 50:
        irrflag = False
        x = 0

    return x


def irr_f(x, c, n):
    xx = math.copysign(1, x) * min(abs(x), 1000000000)
    irr_sum = 0
    for i in range(1, n + 1):
        irr_sum = irr_sum + c[i] / (1 + xx) ** i
    return irr_sum + c[0]


def irr_fdx(x, c, n):
    xx = math.copysign(1, x) * min(abs(x), 1000000000)
    irr_sum = 0
    for i in range(1, n + 1):
        irr_sum = irr_sum - i * c[i] / (1 + xx) ** (i + 1)
    return irr_sum


def total_investment_costs(case, fixed_costs, total_costs):
    case_total_costs = {
        "case_id": case.id,
        "heating_cost": fixed_costs["heating_cost"],
        "dhw_cost": fixed_costs["dhw_cost"],
        "total_case_cost": fixed_costs["heating_cost"] + fixed_costs["dhw_cost"]
    }
    total_costs["cases"].append(case_total_costs)
    total_costs["total_heating_cost"] = total_costs["total_heating_cost"] + fixed_costs["heating_cost"]
    total_costs["total_dhw_cost"] = total_costs["total_dhw_cost"] + fixed_costs["dhw_cost"]


def get_total_case_cost(total_costs, case):
    for case_total in total_costs["cases"]:
        if case_total["case_id"] == case.id:
            return case_total
    return None
