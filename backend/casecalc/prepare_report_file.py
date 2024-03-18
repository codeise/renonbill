def create_workbook(workbook, worksheet, data):
    column_names, first_cell, header, part_header, row_names, score, sub_header, text, value_format = \
        set_formats(workbook)

    set_header_project_data(data, first_cell, header, row_names, sub_header, text, worksheet)

    set_investment_data(column_names, data, part_header, row_names, value_format, worksheet)

    set_financial_values(column_names, data, part_header, value_format, worksheet)

    set_project_rating(column_names, data, part_header, row_names, score, text, value_format, workbook, worksheet)

    set_energy_analysis(column_names, data, part_header, row_names, value_format, worksheet)

    set_monte_carlo_values(column_names, data, part_header, row_names, value_format, workbook, worksheet)

    set_non_energy_benefits(column_names, data, part_header, value_format, worksheet)

    set_cases_list(column_names, data, part_header, worksheet)

    set_npv_table(column_names, data, worksheet)


def set_header_project_data(data, first_cell, header, row_names, sub_header, text, worksheet):
    # headers
    worksheet.write(0, 0, "Summary of Intervention", first_cell)
    worksheet.write(0, 4, data["headerLabel"], header)
    worksheet.write(1, 5, data["subHeaderLabel"], sub_header)
    # general project data
    worksheet.write(3, 1, "Country", row_names)
    worksheet.write(3, 2, data["country"], text)
    worksheet.write(4, 1, "num of dwellings", row_names)
    worksheet.write(4, 2, data["number_of_dwellings"], text)
    worksheet.write(5, 1, "total surfase, m2", row_names)
    worksheet.write(5, 2, data["floor_area"], text)


def set_npv_table(column_names, data, worksheet):
    npv_columns = ["year", "NPV", "MC_NPV", "CB+", "CB-"]
    for i in range(0, len(npv_columns)):
        worksheet.write(3, 13 + i, npv_columns[i], column_names)
    is_npv, is_mc_npv = True, True
    if not data["financial_values"]["qNPV"]:
        is_npv = False
    if not data["van_mc_values"]["qNPV"]:
        is_mc_npv = False
    for i in range(0, data["vita"] + 1):
        worksheet.write(3 + i + 1, 13, i)
        fill_npv_values(worksheet, data, i, is_npv, is_mc_npv)


def set_cases_list(column_names, data, part_header, worksheet):
    worksheet.write(45, 1, "Dwelling Indices", part_header)
    cases_columns = ["Num of Dwellings", "Num of Floors", "Country", "City", "Building", "Age", "Plant Area", "Costs",
                     "Investment", "NPV", "NPV/m2", "IRR", "IRR-Drate", "Drate", "PI", "DPBP"]
    for i in range(0, len(cases_columns)):
        worksheet.write(45, 2 + i, cases_columns[i], column_names)
    cases_starting_row = 46
    index = 1
    cases_values = ["dwelling_count", "floor_count", "country", "city", "building_type", "building_year", "floor_area",
                    "discount_rate", "total_case_cost", "cost_loan_bonus", "qvan", "qvan_m2", "qirr", "qirr_discount",
                    "quick_pi", "qpb"]
    for tmp_dict in data["dwellings"]:
        worksheet.write(cases_starting_row, 1, "#" + str(index))
        for i in range(0, len(cases_values)):
            worksheet.write(cases_starting_row, 2 + i, tmp_dict["common_params"][cases_values[i]])
        cases_starting_row += 1
        index += 1


def set_non_energy_benefits(column_names, data, part_header, value_format, worksheet):
    worksheet.write(40, 1, "Non Energy Benefits", part_header)
    benefit_map = {"score": "project_rating", "benefits": "project_benefit"}
    tmp_index = 0
    for key, value in benefit_map.items():
        worksheet.write(40, 2 + tmp_index, key, column_names)
        worksheet.write(41, 2 + tmp_index, data["benefits"][value], value_format)
        tmp_index += 1


def set_monte_carlo_values(column_names, data, part_header, row_names, value_format, workbook, worksheet):
    worksheet.write(33, 1, "Monte Carlo & Risk Analysis", part_header)
    monte_carlo_columns = ["Energy Savings", "Bill Savings", "Intervention Costs", "NPV", "IRR", "DPBP"]
    for i in range(0, len(monte_carlo_columns)):
        worksheet.write(33, 3 + i, monte_carlo_columns[i], column_names)
    monte_carlo_rows = ["Value", "99% Confidence Bounds", "Value at Risk", "Conditional Value at Risk"]
    for i in range(0, len(monte_carlo_rows)):
        worksheet.write(34 + i, 2, monte_carlo_rows[i], row_names)
    monte_carlo_values = ["energy_saving", "bill_savings", "intervention_cost"]
    for i in range(0, len(monte_carlo_values)):
        add_multiple_data_downwards(workbook, worksheet, 34, 3 + i,
                                    data["monte_carlo_values"][monte_carlo_values[i]], value_format)
    mc_npv = ["npv", "irr", "dpbp"]
    for i in range(0, len(mc_npv)):
        add_multiple_data_downwards(workbook, worksheet, 34, 6 + i,
                                    data["van_mc_values"][mc_npv[i]], value_format)


def set_energy_analysis(column_names, data, part_header, row_names, value_format, worksheet):
    worksheet.write(27, 1, "Energy Analysis", part_header)
    energy_columns = ["Fuel Energy consumption, kWh", "Electric Energy consumption, kWh", "Fuel Energy Bill, €",
                      "Electric Energy Bill, €", "Energy consumption, kWh", "Energy Bill, €",
                      "Heating Energy losses, kWh", "DHW Energy losses, kWh", "Energy losses, kWh", ]
    for i in range(0, len(energy_columns)):
        worksheet.write(27, 3 + i, energy_columns[i], column_names)
    energy_rows = ["current", "planned", "savings"]
    for i in range(0, len(energy_rows)):
        worksheet.write(28 + i, 2, energy_rows[i], row_names)
    energy_timings = ["current", "planned", "saved"]
    energy_values = ["fuel_energy", "electric_energy", "fuel_bill", "electric_bill", "energy_cons", "energy_bill",
                     "heating_energy_loss", "dhw_energy_loss", "energy_loss"]
    for i in range(0, len(energy_values)):
        for j in range(0, len(energy_timings)):
            worksheet.write(28 + j, 3 + i, data["total_costifissi_values"]
            ["total_" + energy_timings[j] + "_" + energy_values[i]], value_format)


def set_project_rating(column_names, data, part_header, row_names, score, text, value_format, workbook, worksheet):
    worksheet.write(17, 1, "Project Rating", part_header)
    rating_columns = ["Weights", "Min", "Max", "Values", "Confidence", "Ratings"]
    for i in range(0, len(rating_columns)):
        worksheet.write(17, 3 + i, rating_columns[i], column_names)
    rating_rows = ["Energy Savings, %", "NPV, €", "IRR, %", "Disc. PayBack, yrs.", "Loss Risk, %",
                   "Churn Rate, %", "Default Rate, %"]
    for i in range(0, len(rating_rows)):
        worksheet.write(18 + i, 2, rating_rows[i], row_names)
    rating_values = ["weight_values", "min_values", "max_values", "exp_values", "cb_values", "rating_values"]
    for i in range(0, len(rating_values)):
        add_multiple_data_downwards(workbook, worksheet, 18, 3 + i, data["pub_rating"][rating_values[i]], value_format)
    for i in range(1, 3):
        worksheet.write(25 + i - 1, 8, data["pub_rating"]["score_" + str(i)], score)
        worksheet.write(25 + i - 1, 9, "Score #" + str(i), text)


def set_financial_values(column_names, data, part_header, value_format, worksheet):
    worksheet.write(14, 1, "Financial Analysis", part_header)
    financial_columns = ["Time horizon", "Initial Investment", "NPV, €", "IRR", "PI", "DPB, yrs."]
    for i in range(0, len(financial_columns)):
        worksheet.write(14, 3 + i, financial_columns[i], column_names)
    worksheet.write(15, 3, data["vita"], value_format)
    worksheet.write(15, 4, data["investment_values"]["total_cost_loan"], value_format)
    worksheet.write(15, 5, data["pub_rating"]["exp_values"]["2"], value_format)
    worksheet.write(15, 6, data["pub_rating"]["exp_values"]["3"], value_format)
    worksheet.write(15, 7, data["financial_values"]["LabPI"], value_format)
    worksheet.write(15, 8, data["financial_values"]["DPBP"], value_format)


def set_investment_data(column_names, data, part_header, row_names, value_format, worksheet):
    worksheet.write(8, 1, "Investment", part_header)
    investment_columns = ["amount", "amount%", "refund time yrs.", "rate%"]
    for i in range(0, len(investment_columns)):
        worksheet.write(8, i + 3, investment_columns[i], column_names)
    investment_rows = ["Intervention cost", "Loan", "Tax Incentive", "Initial Investment"]
    for i in range(0, len(investment_rows)):
        worksheet.write(9 + i, 2, investment_rows[i], row_names)
    worksheet.write(9, 3, data["investment_values"]["total_cost"], value_format)
    loan_values = ["loan_amount", "loan_amount_%", "loan_refund_years", "loan_rate"]
    for i in range(0, len(loan_values)):
        worksheet.write(10, 3 + i, data["investment_values"][loan_values[i]], value_format)
    bonus_values = ["bonus_amount", "bonus_amount_%", "bonus_refund_years"]
    for i in range(0, len(bonus_values)):
        worksheet.write(11, 3 + i, data["investment_values"][bonus_values[i]], value_format)
    worksheet.write(12, 3, data["investment_values"]["total_cost_loan"], value_format)


def set_formats(workbook):
    first_cell = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 20,
                                      'align': 'center', 'valign': 'top'})
    header = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 26, 'valign': 'top'})
    sub_header = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 14, 'valign': 'top'})
    part_header = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 11,
                                       'valign': 'vcenter', 'text_wrap': True})
    column_names = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, 'bg_color': '#D9E1F2',
                                        'align': 'center', 'valign': 'vcenter',
                                        'bottom': 1, 'top': 1, 'text_wrap': True})
    row_names = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, 'valign': 'bottom'})
    value_format = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, "bg_color": '#F2F2F2',
                                        'align': 'center', 'valign': 'bottom', 'bottom': 1, 'top': 1})
    text = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, 'align': 'left', 'valign': 'vcenter'})
    score = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 11, 'align': 'right'})
    return column_names, first_cell, header, part_header, row_names, score, sub_header, text, value_format


def add_multiple_data_downwards(workbook, worksheet, initial_row, initial_column, values_dict, tmpformat=None):
    cell_format = workbook.add_format()
    if tmpformat is not None:
        cell_format = tmpformat
    tmp_row = initial_row
    for key, value in values_dict.items():
        if value == "-1000000.0":
            value = "n/a"
        worksheet.write(tmp_row, initial_column, value, cell_format)
        tmp_row += 1


def fill_npv_values(worksheet, data, index, is_npv, is_mc_npv):
    npv, mc_npv, cb_plus, cb_minus = 0, 0, 0, 0
    if is_npv:
        npv = data["financial_values"]["qNPV"][str(index)]
    if is_mc_npv:
        mc_npv = data["van_mc_values"]["qNPV"][str(index)]
        cb_plus = data["van_mc_values"]["cb+"][str(index)]
        cb_minus = data["van_mc_values"]["cb-"][str(index)]
    worksheet.write(3 + index + 1, 14, npv)
    worksheet.write(3 + index + 1, 15, mc_npv)
    if index != 0:
        worksheet.write(3 + index + 1, 16, cb_plus)
        worksheet.write(3 + index + 1, 17, cb_minus)
