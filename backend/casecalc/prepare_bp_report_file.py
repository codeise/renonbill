def create_bp_workbook(workbook, worksheet, input, output, bp_year, scheme_year):
    section_name, table_name, column_name, row_name, cell = set_formats(workbook)

    worksheet.write(0, 0, "INPUTS", section_name)
    table_initial_y = set_inputs(worksheet, table_name, column_name, row_name, cell, input, bp_year)

    worksheet.write(table_initial_y, 0, "OUTPUTS", section_name)
    set_outputs(worksheet, table_name, column_name, row_name, cell, output, bp_year, scheme_year, table_initial_y)


def set_formats(workbook):
    section_name = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 20,
                                      'align': 'center', 'valign': 'top'})
    table_name = workbook.add_format({'bold': True, 'font_name': 'Calibri', 'font_size': 14, 'valign': 'top'})
    column_name = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, 'bg_color': '#D9E1F2',
                                        'align': 'center', 'valign': 'vcenter',
                                        'bottom': 1, 'top': 1, 'text_wrap': True})
    row_name = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, 'valign': 'bottom'})
    cell = workbook.add_format({'font_name': 'Calibri', 'font_size': 11, "bg_color": '#F2F2F2',
                                        'align': 'center', 'valign': 'bottom', 'bottom': 1, 'top': 1})
    return section_name, table_name, column_name, row_name, cell


def add_horizontal_years(worksheet, initial_x, initial_y, year, format):
    for i in range(0, year):
        worksheet.write(initial_y, initial_x + i, "Year " + str(i + 1), format)


def set_inputs(worksheet, table_name, column_name, row_name, cell, input, bp_year):
    table_initial_y = 1
    for key in input["case_values"].keys():
        worksheet.write(table_initial_y, 1, "Case " + key, table_name)
        add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)

        worksheet.write(table_initial_y + 1, 2, "Number of Renovations", row_name)
        for i in range(0, bp_year):
            worksheet.write(table_initial_y + 1, 3 + i, input["case_values"][key]["nr"][i], cell)

        worksheet.write(table_initial_y + 2, 2, "Government Subsidy (%)", row_name)
        for i in range(0, bp_year):
            worksheet.write(table_initial_y + 2, 3 + i, input["case_values"][key]["gs"][i], cell)

        worksheet.write(table_initial_y + 4, 2, "Onbill Component (€)", row_name)
        worksheet.write(table_initial_y + 4, 3, input["case_values"][key]["onbill_component"], cell)
        worksheet.write(table_initial_y + 5, 2, "Onbill Scheme (yrs)", row_name)
        worksheet.write(table_initial_y + 5, 3, input["case_values"][key]["onbill_scheme"], cell)
        worksheet.write(table_initial_y + 6, 2, "Energy Savings (yrs)", row_name)
        worksheet.write(table_initial_y + 6, 3, input["case_values"][key]["energy_savings"], cell)
        table_initial_y += 8
    worksheet.write(table_initial_y, 1, "Investments (€)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)
    for key in input["bp_list"].keys():
        table_initial_y += 1
        for bp_key in input["bp_list"][key].keys():
            if bp_key == "name":
                worksheet.write(table_initial_y, 2, input["bp_list"][key][bp_key], row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(bp_key), input["bp_list"][key][bp_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Operational Costs (€)", table_name)
    for key in input["oc_list"].keys():
        table_initial_y += 1
        worksheet.write(table_initial_y, 2, input["oc_list"][key][0])
        worksheet.write(table_initial_y, 3, input["oc_list"][key][1], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Considerations for OBR schemes", table_name)
    obr_unit = " (%)"
    for key in input["obr_list"].keys():
        if key == "3":
            obr_unit = " (yrs)"
        table_initial_y += 1
        worksheet.write(table_initial_y, 2, input["obr_list"][key][0] + obr_unit)
        worksheet.write(table_initial_y, 3, input["obr_list"][key][1], cell)
    return table_initial_y + 2


def set_outputs(worksheet, table_name, column_name, row_name, cell, output, bp_year, scheme_year, table_initial_y):
    table_initial_y += 1
    worksheet.write(table_initial_y, 1, "Results", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)
    for result in output["results"]:
        table_initial_y += 1
        for result_key in result.keys():
            if result_key == "name":
                worksheet.write(table_initial_y, 2, result[result_key], row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(result_key), result[result_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Onbill Components (€)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)
    for obc in output["on_bill_components"]:
        table_initial_y += 1
        for obc_key in obc.keys():
            if obc_key == "name":
                worksheet.write(table_initial_y, 2, str(obc[obc_key]), row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(obc_key), obc[obc_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Energy savings generated each year (kWh/year)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)
    for esg in output["energy_savings_generated"]:
        table_initial_y += 1
        for esg_key in esg.keys():
            if esg_key == "name":
                worksheet.write(table_initial_y, 2, str(esg[esg_key]), row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(esg_key), esg[esg_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Number of energy efficiency renovations", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)
    for esg in output["number_of_renovations"]:
        table_initial_y += 1
        for esg_key in esg.keys():
            if esg_key == "name":
                if esg[esg_key] == "Total Renovation Counts":
                    worksheet.write(table_initial_y, 2, esg[esg_key], row_name)
                else:
                    worksheet.write(table_initial_y, 2, str(esg[esg_key]), row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(esg_key), esg[esg_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Investments (€)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, bp_year, column_name)
    for investment in output["investments"]:
        table_initial_y += 1
        for investments_key in investment.keys():
            if investments_key == "name":
                worksheet.write(table_initial_y, 2, investment[investments_key], row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(investments_key), investment[investments_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Operational Costs (€)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, scheme_year, column_name)

    for operation_cost in output["operational_costs"]:
        entry_count = 0
        table_initial_y += 1
        for oc_key in operation_cost.keys():
            if oc_key == "name":
                worksheet.write(table_initial_y, 2, operation_cost[oc_key], row_name)
            else:
                if entry_count < scheme_year:
                    worksheet.write(table_initial_y, 2 + int(oc_key), operation_cost[oc_key], cell)
                    entry_count += 1

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Revenues", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, scheme_year, column_name)
    for revenue in output["revenues"]:
        table_initial_y += 1
        for revenue_key in revenue.keys():
            if revenue_key == "name":
                if revenue[revenue_key] in \
                        ["Total Revenues", "Total Net Profits", "Cumulated Net Profits", "Rate of Interests"]:
                    worksheet.write(table_initial_y, 2, revenue[revenue_key], row_name)
                else:
                    worksheet.write(table_initial_y, 2, str(revenue[revenue_key]), row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(revenue_key), revenue[revenue_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Cash Values (€)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, scheme_year, column_name)
    for cash_value in output["cash_values"]:
        table_initial_y += 1
        for cash_value_key in cash_value.keys():
            if cash_value_key == "name":
                worksheet.write(table_initial_y, 2, cash_value[cash_value_key], row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(cash_value_key), cash_value[cash_value_key], cell)

    table_initial_y += 2
    worksheet.write(table_initial_y, 1, "Total Energy Savings (kWh)", table_name)
    add_horizontal_years(worksheet, 3, table_initial_y, scheme_year, column_name)
    for est in output["energy_savings_total"]:
        table_initial_y += 1
        for est_key in est.keys():
            if est_key == "name":
                if est[est_key] in ["Total Energy Savings", "Cumulated Energy Savings"]:
                    worksheet.write(table_initial_y, 2, est[est_key], row_name)
                else:
                    worksheet.write(table_initial_y, 2, str(est[est_key]), row_name)
            else:
                worksheet.write(table_initial_y, 2 + int(est_key), est[est_key], cell)
