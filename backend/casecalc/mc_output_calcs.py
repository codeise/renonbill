import operator
import math

from casecalc.ui_format import formato


def vets(param, heating_value_name, dhw_value_name):
    return {
        "current_value": param["current_params"][heating_value_name] + param["current_params"][dhw_value_name],
        "planned_value": param["planned_params"][heating_value_name] + param["planned_params"][dhw_value_name]
    }


def init_mc_dict(mc_total_selq_d, mc_total_selq_f, mc_total_selq_e, mc_total_vc_f, mc_total_vc_e, mc_total_cost):
    return {
        "current": {
            "mc_q_d": mc_total_selq_d["current_value"],
            "mc_q_f": mc_total_selq_f["current_value"],
            "mc_q_e": mc_total_selq_e["current_value"],
            "mc_q_total": mc_total_selq_e["current_value"] + mc_total_selq_f["current_value"],
            "mc_vc_f": mc_total_vc_f["current_value"],
            "mc_vc_e": mc_total_vc_e["current_value"],
            "mc_vc_total": mc_total_vc_f["current_value"] + mc_total_vc_e["current_value"],
            "mc_total_cost": 0
        },
        "planned": {
            "mc_q_d": mc_total_selq_d["planned_value"],
            "mc_q_f": mc_total_selq_f["planned_value"],
            "mc_q_e": mc_total_selq_e["planned_value"],
            "mc_q_total": mc_total_selq_e["planned_value"] + mc_total_selq_f["planned_value"],
            "mc_vc_f": mc_total_vc_f["planned_value"],
            "mc_vc_e": mc_total_vc_e["planned_value"],
            "mc_vc_total": mc_total_vc_f["planned_value"] + mc_total_vc_e["planned_value"],
            "mc_total_cost": mc_total_cost
        },
        "saving": {
            "mc_q_d": -mc_total_selq_d["planned_value"] + mc_total_selq_d["current_value"],
            "mc_q_f": -mc_total_selq_f["planned_value"] + mc_total_selq_f["current_value"],
            "mc_q_e": -mc_total_selq_e["planned_value"] + mc_total_selq_e["current_value"],
            "mc_q_total": -mc_total_selq_f["planned_value"] + mc_total_selq_f["current_value"] -
            mc_total_selq_e["planned_value"] + mc_total_selq_e["current_value"],
            "mc_vc_f": -mc_total_vc_f["planned_value"] + mc_total_vc_f["current_value"],
            "mc_vc_e": -mc_total_vc_e["planned_value"] + mc_total_vc_e["current_value"],
            "mc_vc_total": -mc_total_vc_f["planned_value"] + mc_total_vc_f["current_value"] -
            mc_total_vc_e["planned_value"] + mc_total_vc_e["current_value"],
            "mc_total_cost": -mc_total_cost
        }
    }


def somme(mc_values, irun, nrun, project, cp, mc_total_selq_d, mc_total_selq_f, mc_total_selq_e,
          mc_total_vc_f, mc_total_vc_e, mc_total_cost, pub_rating, report):
    mc_values[irun].update(init_mc_dict(mc_total_selq_d, mc_total_selq_f, mc_total_selq_e,
                                        mc_total_vc_f, mc_total_vc_e, mc_total_cost))

    if irun == nrun:
        return {"print_values": mc_output_values(mc_values, nrun, project, cp, pub_rating, report),
                "graph_values": mc_out_isto(nrun, mc_values)}


def mc_output_values(mc_values, nrun, project, cp, pub_rating, report):
    mm_values = init_mm_values()
    erate = 0
    verate = {}
    for i in range(1, nrun + 1):
        for name in ["current", "planned", "saving"]:
            mm_values[name]["mm_d"] += mc_values[i][name]["mc_q_d"] / nrun
            mm_values[name]["mm_f"] += mc_values[i][name]["mc_q_f"] / nrun
            mm_values[name]["mm_e"] += mc_values[i][name]["mc_q_e"] / nrun
            mm_values[name]["mm_total"] += mc_values[i][name]["mc_q_total"] / nrun
            mm_values[name]["mm_vc_f"] += mc_values[i][name]["mc_vc_f"] / nrun
            mm_values[name]["mm_vc_e"] += mc_values[i][name]["mc_vc_e"] / nrun
            mm_values[name]["mm_vc_total"] += mc_values[i][name]["mc_vc_total"] / nrun
            mm_values[name]["mm_cost_total"] += mc_values[i][name]["mc_total_cost"] / nrun

        if mc_values[i]["current"]["mc_q_total"] != 0:
            erate += mc_values[i]["saving"]["mc_q_total"] / mc_values[i]["current"]["mc_q_total"] / nrun
            verate[i] = mc_values[i]["saving"]["mc_q_total"] / mc_values[i]["current"]["mc_q_total"]

    pub_rating["erate"] = erate
    erate_cb952 = confidence_bound(verate, project)
    pub_rating["erate_cb952"] = erate_cb952

    sorted_mc_q_total = get_sorted_mc_value(mc_values, "mc_q_total", nrun)
    sorted_mc_vc_total = get_sorted_mc_value(mc_values, "mc_vc_total", nrun)
    sorted_mc_total_cost = get_sorted_mc_value(mc_values, "mc_total_cost", nrun)
    top_bottom_values = {
        "top_five": calc_top_and_bottom(sorted_mc_q_total, mm_values, nrun, True, "mm_total", "e"),
        "bottom_five": calc_top_and_bottom(sorted_mc_q_total, mm_values, nrun, False, "mm_total", "e")
    }
    top_bottom_values["top_five"].update(
        calc_top_and_bottom(sorted_mc_vc_total, mm_values, nrun, True, "mm_vc_total", "b"))
    top_bottom_values["bottom_five"].update(
        calc_top_and_bottom(sorted_mc_vc_total, mm_values, nrun, False, "mm_vc_total", "b"))
    top_bottom_values["top_five"].update(
        calc_top_and_bottom(sorted_mc_total_cost, mm_values, nrun, True, "mm_cost_total", "fix"))
    top_bottom_values["bottom_five"].update(
        calc_top_and_bottom(sorted_mc_total_cost, mm_values, nrun, False, "mm_cost_total", "fix"))

    cb_values = {
        "current": {
            "cbd2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_q_d"), project),
            "cbf2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_q_f"), project),
            "cbe2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_q_e"), project),
            "cbtot2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_q_total"), project),
            "cbvcf2":confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_vc_f"), project),
            "cbvce2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_vc_e"), project),
            "cbvc2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_vc_total"), project),
            "cbfixc2":
                confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "current", "mc_total_cost"), project),

        },
        "planned": {
            "cbd2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_q_d"), project),
            "cbf2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_q_f"), project),
            "cbe2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_q_e"), project),
            "cbtot2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_q_total"), project),
            "cbvcf2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_vc_f"), project),
            "cbvce2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_vc_e"), project),
            "cbvc2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_vc_total"), project),
            "cbfixc2":
                confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "planned", "mc_total_cost"), project),
        },
        "saving": {
            "cbd2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_q_d"), project),
            "cbf2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_q_f"), project),
            "cbe2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_q_e"), project),
            "cbtot2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_q_total"), project),
            "cbvcf2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_vc_f"), project),
            "cbvce2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_vc_e"), project),
            "cbvc2": confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_vc_total"), project),
            "cbfixc2":
                confidence_bound(get_all_mc_values_with_type(mc_values, nrun, "saving", "mc_total_cost"), project),
        }
    }

    one_digit = "{:,.1f}"
    report["monte_carlo_values"] = {
        "energy_saving": {
            "value": one_digit.format(mm_values["saving"]["mm_total"] / 3.6),
            "conf_bound": one_digit.format(cb_values["saving"]["cbtot2"] / 3.6),
            "value_at_risk": one_digit.format(top_bottom_values["top_five"]["evar_bp"]["saving"] / 3.6),
            "cond_value_at_risk": one_digit.format(top_bottom_values["top_five"]["ecvar_bp"]["saving"] / 3.6)
        },
        "bill_savings": {
            "value": one_digit.format(mm_values["saving"]["mm_vc_total"]),
            "conf_bound": one_digit.format(cb_values["saving"]["cbvc2"]),
            "value_at_risk": one_digit.format(top_bottom_values["top_five"]["bvar_bp"]["saving"]),
            "cond_value_at_risk": one_digit.format(top_bottom_values["top_five"]["bcvar_bp"]["saving"])
        },
        "intervention_cost": {
            "value": one_digit.format(- mm_values["saving"]["mm_cost_total"]),
            "conf_bound": one_digit.format(cb_values["saving"]["cbfixc2"]),
            "value_at_risk": one_digit.format(- top_bottom_values["top_five"]["fixvar_bp"]["saving"]),
            "cond_value_at_risk": one_digit.format(- top_bottom_values["top_five"]["fixcvar_bp"]["saving"])
        }
    }
    seperated_ui_output = {
        "current": {},
        "planned": {},
        "saving": {},
    }
    for tmp_name in ["current", "planned", "saving"]:
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_d", True)
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_f", True)
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_e", True)
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_total", True)

        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_d", "cbd2")
        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_f", "cbf2")
        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_e", "cbe2")
        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_total", "cbtot2")

        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_vc_f", True)
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_vc_e", True)
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_vc_total", True)
        format_mc_output(cp, tmp_name, mm_values, seperated_ui_output, "mm_cost_total", True)

        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_vc_f", "cbvcf2")
        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_vc_e", "cbvce2")
        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_vc_total", "cbvc2")
        formatx(tmp_name, mm_values, seperated_ui_output, cb_values, "mm_cost_total", "cbfixc2")
        if tmp_name == "planned":
            top_bottom = "bottom_five"
        else:
            top_bottom = "top_five"
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "evar_bp", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "evar", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "ecvar_bp", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "ecvar", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "bvar_bp", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "bvar", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "bcvar_bp", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "bcvar", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "fixvar_bp", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "fixvar", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "fixcvar_bp", False)
        format_mc_output(cp, tmp_name, top_bottom_values[top_bottom], seperated_ui_output, "fixcvar", False)
    return seperated_ui_output


def format_mc_output(cp, c_type, values_dict, seperated_ui_output, value_name, mm_flag):
    name = c_type + "_" + value_name
    if mm_flag:
        tmp = values_dict[c_type][value_name]
    else:
        tmp = values_dict[value_name][c_type]
    formato(cp, c_type, value_name, tmp)
    seperated_ui_output[c_type][value_name] = cp["ui_output"][name]


def formatx(c_type, mm_values, seperated_ui_output, cb_values, mm_name, cb_name):
    if abs(mm_values[c_type][mm_name]) < 0.01:
        seperated_ui_output[c_type][cb_name] = 0.0
    else:
        seperated_ui_output[c_type][cb_name] = \
            "{:,.1f}".format(cb_values[c_type][cb_name] / abs(mm_values[c_type][mm_name]) * 100)


def init_mm_values():
    return {
        "current": {
            "mm_d": 0,
            "mm_f": 0,
            "mm_e": 0,
            "mm_total": 0,
            "mm_vc_f": 0,
            "mm_vc_e": 0,
            "mm_vc_total": 0,
            "mm_cost_total": 0
        },
        "planned": {
            "mm_d": 0,
            "mm_f": 0,
            "mm_e": 0,
            "mm_total": 0,
            "mm_vc_f": 0,
            "mm_vc_e": 0,
            "mm_vc_total": 0,
            "mm_cost_total": 0
        },
        "saving": {
            "mm_d": 0,
            "mm_f": 0,
            "mm_e": 0,
            "mm_total": 0,
            "mm_vc_f": 0,
            "mm_vc_e": 0,
            "mm_vc_total": 0,
            "mm_cost_total": 0
        }
    }


def confidence_bound(verate, project):
    tmp = project.params["confidence_level"] / 100
    conf = tmp + (1 - tmp) / 2
    tmp_arr = sorted(verate.items(), key=operator.itemgetter(1), reverse=True)
    index1 = round((1 - conf) * len(tmp_arr) + 0.5) - 1
    index2 = round(conf * len(tmp_arr) + 0.5) - 1
    cb1 = tmp_arr[index1][1]
    cb2 = tmp_arr[index2][1]
    return abs(cb1 - cb2) / 2


def calc_top_and_bottom(sorted_mc_values, mm_values, nrun, top_bottom, mm_name, return_prefix):
    if top_bottom:
        if nrun % 20 == 10:
            nx = math.floor(nrun * 0.95 + 0.5) - 1
        else:
            nx = math.floor(nrun * 0.95 + 0.5)
        n1 = nx - 1
        n2 = nrun - 1
    else:
        nx = math.floor(nrun * 0.05 + 0.5)
        n1 = 0
        n2 = nx - 1
    evar_bp = {
        "current": sorted_mc_values["current"][n1],
        "planned": sorted_mc_values["planned"][n1],
        "saving": sorted_mc_values["saving"][n1]
    }
    evar = {
        "current": -(mm_values["current"][mm_name] - evar_bp["current"]),
        "planned": -(mm_values["planned"][mm_name] - evar_bp["planned"]),
        "saving": -(mm_values["saving"][mm_name] - evar_bp["saving"]),
    }
    ecvar_bp = {
        "current": 0,
        "planned": 0,
        "saving": 0
    }
    for i in range(n1, n2 + 1):
        ecvar_bp["current"] += sorted_mc_values["current"][i] / (n2 - n1 + 1)
        ecvar_bp["planned"] += sorted_mc_values["planned"][i] / (n2 - n1 + 1)
        ecvar_bp["saving"] += sorted_mc_values["saving"][i] / (n2 - n1 + 1)
    ecvar = {
        "current": -(mm_values["current"][mm_name] - ecvar_bp["current"]),
        "planned": -(mm_values["planned"][mm_name] - ecvar_bp["planned"]),
        "saving": -(mm_values["saving"][mm_name] - ecvar_bp["saving"])
    }
    return {
        return_prefix + "var_bp": evar_bp,
        return_prefix + "var": evar,
        return_prefix + "cvar_bp": ecvar_bp,
        return_prefix + "cvar": ecvar
    }


def get_all_mc_values_with_type(mc_values, nrun, value_type, variable_name):
    tmp = {}
    for i in range(1, nrun + 1):
        tmp[i] = mc_values[i][value_type][variable_name]
    return tmp


def mc_out_isto(nrun, mc_values):
    graph_full_values = {
        "current": {},
        "planned": {},
        "saving": {}
    }
    m = 39
    for tmp in ["current", "planned", "saving"]:
        for val_name in ["mc_q_d", "mc_q_f", "mc_q_e", "mc_vc_f", "mc_vc_e", "mc_vc_total", "mc_total_cost"]:
            graph_full_values[tmp][val_name] = \
                convert_graph_to_array(
                    calc_graph_value(nrun, get_all_mc_values_with_type(mc_values, nrun, tmp, val_name), m))
    return graph_full_values


def calc_graph_value(nrun, mc_value_dict, m):
    isto = {}
    for i in range(1, m + 1):
        isto[i] = 0

    max_val = mc_value_dict[1]
    min_val = mc_value_dict[1]
    total = 0
    for tmp in mc_value_dict:
        if mc_value_dict[tmp] > max_val:
            max_val = mc_value_dict[tmp]
        if mc_value_dict[tmp] < min_val:
            min_val = mc_value_dict[tmp]
        total += mc_value_dict[tmp]
    avg = total / nrun
    if total == 0:
        return isto
    if max_val == min_val:
        return isto

    if abs(max_val - min_val) < 0.01 and avg != 0:
        min_val = avg - 0.5 * avg
        max_val = avg + 0.5 * avg
    if abs(avg) < 0.01:
        max_val = 100
        min_val = -100

    for i in range(1, nrun + 1):
        tmp = mc_value_dict[i]
        indice = int((tmp - min_val) * m / (max_val - min_val))
        if m >= indice >= 1:
            isto[indice] += 1
    return isto


def convert_graph_to_array(graph_dict):
    tmp = list(graph_dict.items())
    val_arr = []
    for i in tmp:
        val_arr.append(int("{:.0f}".format(i[1])))
    return val_arr


def get_sorted_mc_value(mc_values, value_name, nrun):
    all_sorted_arrays = {
        "current": [],
        "planned": [],
        "saving": []
    }
    for type in ["current", "planned", "saving"]:
        for i in range(1, nrun + 1):
            all_sorted_arrays[type].append(mc_values[i][type][value_name])

    for type in ["current", "planned", "saving"]:
        all_sorted_arrays[type].sort(reverse=True)
    return all_sorted_arrays
