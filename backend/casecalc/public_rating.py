
def project_rating_update(project, pub_rating, ui_output, floor_area, report):
    pub_rating["van_mc_zero"] = float(pub_rating["van_mc_zero"].replace(",", ""))
    if project.params["unit_option"] in ["mjm2", "kwhm"]:
        area = floor_area
    else:
        area = 1
    nd = 7
    na_value = -1000000
    cb = [0] * nd
    r = [0] * nd
    if pub_rating["erate"] != 0:
        r[0] = pub_rating["erate"] * 100
    else:
        r[0] = pub_rating["esaved"] * 100
    if pub_rating["erate_cb952"]:
        cb[0] = pub_rating["erate_cb952"] * 100
    else:
        cb[0] = na_value

    if pub_rating["exp_van"] != 0:
        r[1] = pub_rating["exp_van"] * area
    else:
        r[1] = pub_rating["van_mc_zero"] * area
    if pub_rating["dex_2"] != 0:
        cb[1] = pub_rating["dex_2"] * area
    else:
        cb[1] = na_value

    if pub_rating["irr_xi"] != 0:
        r[2] = pub_rating["irr_xi"] * 100
    else:
        r[2] = pub_rating["irr"] * 100
    if pub_rating["irr_cb_95"]:
        cb[2] = pub_rating["irr_cb_95"] * 100
    else:
        cb[2] = na_value

    if pub_rating["exp_dpbp"] != 0:
        r[3] = pub_rating["exp_dpbp"]
    else:
        r[3] = pub_rating["dpb_zero"]
    if pub_rating["dev_dpbp_2"] != 0:
        cb[3] = pub_rating["dev_dpbp_2"]
    else:
        cb[3] = na_value

    r[4] = pub_rating["neg_per_run"] * 100
    cb[4] = pub_rating["dex_2"] = 0

    r[5] = pub_rating["schrun_billnew"]
    if pub_rating["schrun95_billnew"]:
        cb[5] = pub_rating["schrun95_billnew"]
    else:
        cb[5] = na_value

    r[6] = pub_rating["sdeafu_billnew"]
    if pub_rating["sdeafu95_billnew"] != 0:
        cb[6] = pub_rating["sdeafu95_billnew"]
    else:
        cb[6] = na_value

    min_val = ["min_Esav", "min_NPV", "min_IRR", "min_Dpayback", "min_loss_risk", "min_churn_rate", "min_default_rate"]
    max_val = ["max_Esav", "max_NPV", "max_IRR", "max_Dpayback", "max_loss_risk", "max_churn_rate", "max_default_rate"]
    weight_val = ["weight_Esav", "weight_NPV", "weight_IRR", "weight_Dpayback", "weight_loss_risk",
                  "weight_churn_rate", "weight_default_rate"]

    rr = [0] * nd
    rating_1 = 0
    rating_2 = 0
    sum = 0
    for i in range(0, nd):
        rr[i] = min(max((int(float(str(r[i]).replace(",", "")) - project.params[min_val[i]]) /
                        (int(project.params[max_val[i]]) - project.params[min_val[i]])), 0.000001), 1)
        sum += project.params[weight_val[i]]
        rating_1 += project.params[weight_val[i]] * rr[i]
        rating_2 += project.params[weight_val[i]] / rr[i]

    rating_1 = rating_1 / sum * 100
    rating_2 = sum / rating_2 * 100

    one_digit = "{:,.1f}"
    for i in range (0, 7):
        if cb[i] != -1000000:
            cb[i] = one_digit.format(cb[i])

    ui_output["pub_rating_print_values"] = {
        "exp_esav": one_digit.format(r[0]),
        "exp_npv": one_digit.format(r[1]),
        "exp_irr": one_digit.format(r[2]),
        "exp_d_payback": one_digit.format(r[3]),
        "exp_loss_risk": one_digit.format(r[4]),
        "exp_churn_rate": one_digit.format(r[5]),
        "exp_default_rate": one_digit.format(r[6]),
        "cb_esav": cb[0],
        "cb_npv": cb[1],
        "cb_irr": cb[2],
        "cb_d_payback": cb[3],
        "cb_loss_risk": cb[4],
        "cb_churn_rate": cb[5],
        "cb_default_rate": cb[6],
        "rating_esav": one_digit.format(rr[0] * 100),
        "rating_npv": one_digit.format(rr[1] * 100),
        "rating_irr": one_digit.format(rr[2] * 100),
        "rating_d_payback": one_digit.format(rr[3] * 100),
        "rating_loss_risk": one_digit.format(rr[4] * 100),
        "rating_churn_rate": one_digit.format(rr[5] * 100),
        "rating_default_rate": one_digit.format(rr[6] * 100)
    }

    for i in range(0, nd):
        rr[i] = "{:,.2f}".format(rr[i] * 100)
    ui_output["pub_rating_bar_graph"] = rr
    ui_output["pub_rating_score_1"] = "{:,.2f}".format(rating_1)
    ui_output["pub_rating_score_2"] = "{:,.2f}".format(rating_2)

    report["pub_rating"] = {
        "weight_values": {},
        "min_values": {},
        "max_values": {},
        "exp_values": {
            "1": one_digit.format(pub_rating["erate"] or pub_rating["esaved"]),
            "2": one_digit.format(pub_rating["exp_van"] or pub_rating["van_mc_zero"]),
            "3": one_digit.format(pub_rating["irr_xi"] or pub_rating["irr"]),
            "4": one_digit.format(pub_rating["exp_dpbp"] or pub_rating["dpb_zero"]),
            "5": one_digit.format(pub_rating["neg_per_run"]),
            "6": one_digit.format(pub_rating["schrun_billnew"]),
            "7": one_digit.format(pub_rating["sdeafu_billnew"])
        },
        "cb_values": {
            "1": one_digit.format(pub_rating["erate_cb952"]),
            "2": one_digit.format(pub_rating["dex_2"]),
            "3": one_digit.format(pub_rating["irr_cb_95"]),
            "4": one_digit.format(pub_rating["dev_dpbp_2"]),
            "5": 0,
            "6": one_digit.format(pub_rating["schrun95_billnew"]),
            "7": one_digit.format(pub_rating["sdeafu95_billnew"])
        },
        "rating_values": {
            "1": ui_output["pub_rating_print_values"]["rating_esav"],
            "2": ui_output["pub_rating_print_values"]["rating_npv"],
            "3": ui_output["pub_rating_print_values"]["rating_irr"],
            "4": ui_output["pub_rating_print_values"]["rating_d_payback"],
            "5": ui_output["pub_rating_print_values"]["rating_loss_risk"],
            "6": ui_output["pub_rating_print_values"]["rating_churn_rate"],
            "7": ui_output["pub_rating_print_values"]["rating_default_rate"]
        },
        "score_1": ui_output["pub_rating_score_1"],
        "score_2": ui_output["pub_rating_score_2"]
    }
    for i in range(0, nd):
        report["pub_rating"]["weight_values"][i + 1] = project.params[weight_val[i]]
        report["pub_rating"]["min_values"][i + 1] = project.params[min_val[i]]
        report["pub_rating"]["max_values"][i + 1] = project.params[max_val[i]]


    # for outer_key, outer_val in ui_output["pub_rating_print_values"].items():
    #     i = 1
    #     for inner_key, inner_val in outer_val.items():
    #         report["pub_rating"][outer_key][i] = inner_val
    #         i += 1

    report["pub_rating"]["score_1"] = ui_output["pub_rating_score_1"]
    report["pub_rating"]["score_2"] = ui_output["pub_rating_score_2"]