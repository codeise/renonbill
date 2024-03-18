import copy

from casecalc.bp_helper_functions import get_renovation_count_from_bp_cases, get_value_from_oc_projects, \
    get_investments_by_bp_project, get_value_from_bp_projects, get_investments_by_oc_project, \
    get_government_subsidy_from_bp_cases
import numpy_financial as npf


def initialize_ui_output(cases, year, bp_list, oc_list, max_scheme_year, financing_duration):
    financial_count = max(max_scheme_year, financing_duration)

    ui_output = {
        'scheme_year': year + max_scheme_year - 1,
        'results': [
            {'name': 'Investment cost of interventions for all buildings (€)'} | dict.fromkeys(range(1, year + 1), 0),
            {'name': 'Investment cost of interventions for all (€, deducting subventions)'} |
            dict.fromkeys(range(1, year + 1), 0),
            {'name': 'Investment financed by the bank (€)'} | dict.fromkeys(range(1, year + 1), 0),
            {'name': 'Remaining investment financed by the utility (€)'} | dict.fromkeys(range(1, year + 1), 0),
            {'name': 'Additional Annual bill savings generated (€/year) '} | dict.fromkeys(range(1, year + 1), 0),
            {'name': 'Additional Yearly energy savings generated (kWh/year)'} | dict.fromkeys(range(1, year + 1), 0)
        ],
        'on_bill_components': [],
        'energy_savings_generated': [],
        'number_of_renovations': [],
        'investments': [
            {'name': 'Investment cost of interventions for all (€, deducting subventions)'} |
            dict.fromkeys(range(1, year + 1), 0),
        ],
        'operational_costs': [
            {'name': 'Financial Repayments'} | dict.fromkeys(range(1, year + financial_count), 0)
        ],
        'revenues': [],
        'cash_values': [
            {'name': 'Cumulated Investments and Costs'} | dict.fromkeys(range(1, year + max_scheme_year), 0),
            {'name': 'Cumulated Revenues'} | dict.fromkeys(range(1, year + max_scheme_year), 0),
            {'name': 'Cash Position'} | dict.fromkeys(range(1, year + max_scheme_year), 0),
        ],
        'energy_savings_total': [],
        'graph_values': []
    }

    for i in range(0, len(cases)):
        ui_output['on_bill_components'].append({'name':  "Case " + str(i + 1)} | dict.fromkeys(range(1, year + 1), 0))
        ui_output['energy_savings_generated'].append({'name':  "Case " + str(i + 1)} | dict.fromkeys(range(1, year + 1), 0))
        ui_output['number_of_renovations'].append({'name': "Case " + str(i + 1)} | dict.fromkeys(range(1, year + 1), 0))
        ui_output['revenues'].append({'name': "Case " + str(i + 1)} | dict.fromkeys(range(1, year + max_scheme_year), 0))
        ui_output['energy_savings_total'].append({'name': "Case " + str(i + 1)} | dict.fromkeys(range(1, year + max_scheme_year), 0))
    for bp_inv in bp_list:
        ui_output['investments'].append({'name': bp_inv.name} | dict.fromkeys(range(1, year + 1), 0))
    for oc_inv in oc_list:
        ui_output['operational_costs'].append(
            {'name': oc_inv.name} | dict.fromkeys(range(1, year + financial_count), 0))

    ui_output['number_of_renovations'].append(
        {'name': 'Total Renovation Counts'} | dict.fromkeys(range(1, year + 1), 0))
    ui_output['investments'].append({'name': 'TOTAL INVESTMENTS PER YEAR'} | dict.fromkeys(range(1, year + 1), 0))
    ui_output['investments'].append({'name': 'CUMULATED INVESTMENTS'} | dict.fromkeys(range(1, year + 1), 0))
    ui_output['operational_costs'].append(
        {'name': 'Total Operational Costs'} | dict.fromkeys(range(1, year + financial_count), 0))
    ui_output['revenues'].append({'name': 'Total Revenues (€)'} | dict.fromkeys(range(1, year + max_scheme_year), 0))
    ui_output['revenues'].append({'name': 'Total Net Profits (€)'} | dict.fromkeys(range(1, year + max_scheme_year), 0))
    ui_output['revenues'].append({'name': 'Cumulated Net Profits (€)'} | dict.fromkeys(range(1, year + max_scheme_year), 0))
    ui_output['revenues'].append({'name': 'Return on Investment (%)'} | dict.fromkeys(range(1, year + max_scheme_year), 0))

    ui_output['energy_savings_total'].append(
        {'name': 'Total Energy Savings'} | dict.fromkeys(range(1, year + max_scheme_year), 0))
    ui_output['energy_savings_total'].append(
        {'name': 'Cumulated Energy Savings'} | dict.fromkeys(range(1, year + max_scheme_year), 0))
    return ui_output


def format_output(ui_output):
    formated_ui_output = copy.deepcopy(ui_output)
    for dict_name in ["results", "on_bill_components", "energy_savings_generated", "investments", "operational_costs",
                      "revenues", "cash_values", "energy_savings_total"]:
        for selected_dict in formated_ui_output[dict_name]:
            if selected_dict["name"] == "Return on Investment (%)":
                for key in selected_dict.keys():
                    if key != "name":
                        selected_dict[key] = '{:,.0f}'.format(round(float(selected_dict[key]), 0)) + "%"
            else:
                for key in selected_dict.keys():
                    if key != "name":
                        selected_dict[key] = '{:,.0f}'.format(round(float(selected_dict[key]), 0))
    return formated_ui_output


def calculate(project, cases, unitary_costs, bill_savings, energy_savings):
    ordered_cases = cases.order_by('id')
    max_scheme_year = 0
    for case in ordered_cases:
        if case.common_params['on_bill_scheme'] > max_scheme_year:
            max_scheme_year = case.common_params['on_bill_scheme']

    financing_duration = int(get_value_from_oc_projects(project.id, "FI Financing duration"))
    year = project.params['bp_year']
    bp_project_investments = get_investments_by_bp_project(project.id)
    oc_project_investments = get_investments_by_oc_project(project.id)
    ui_output = \
        initialize_ui_output(ordered_cases, year, bp_project_investments,
                             oc_project_investments, max_scheme_year, financing_duration)

    calculate_results(bill_savings, cases, energy_savings, project, ui_output, unitary_costs, year)
    calculate_on_bill_components(ordered_cases, ui_output, year)
    calculate_energy_savings_generated(ordered_cases, energy_savings, ui_output, year)
    calculate_number_of_renovations(cases, ordered_cases, ui_output, year)
    calculate_investments(bp_project_investments, project, ui_output, year)
    revenue_values = calculate_revenue_values(ordered_cases, financing_duration, max_scheme_year, project, ui_output, year)
    calculate_operational_costs(cases, financing_duration, oc_project_investments, project, revenue_values, ui_output,
                                year)
    calculate_revenues(ordered_cases, max_scheme_year, oc_project_investments, revenue_values, ui_output, year,
                       len(bp_project_investments))
    calculate_cash_values(max_scheme_year, project, ui_output, year, oc_project_investments, bp_project_investments, cases)
    calculate_energy_savings_total(ordered_cases, max_scheme_year, ui_output, year)
    ui_output['graph_values'].append(ui_output['investments'][len(bp_project_investments) + 1])
    ui_output['graph_values'].append(ui_output['operational_costs'][len(oc_project_investments) + 1])
    ui_output['graph_values'].append(ui_output['revenues'][len(cases)])
    ui_output['graph_values'].append(ui_output['revenues'][len(cases) + 1])
    ui_output['graph_values'].append(ui_output['cash_values'][2])

    for graph_value in ui_output["graph_values"]:
        for key in graph_value.keys():
            if key != "name":
                graph_value[key] = int(float(graph_value[key]))

    tmp = format_output(ui_output)
    tmp['graph_values'] = ui_output['graph_values']
    return tmp


def calculate_energy_savings_total(cases, max_scheme_year, ui_output, year):
    case_list = []
    for case in cases:
        case_list.append(case)
    case_count = len(cases)
    for i in range(0, case_count):
        for j in range(1, year + 1):
            for k in range(j, j + case_list[i].common_params["on_bill_scheme"]):
                ui_output['energy_savings_total'][i][k] += ui_output['energy_savings_generated'][i][j]
    for i in range(0, case_count):
        for j in range(1, case_list[i].common_params["on_bill_scheme"] + year):
            ui_output['energy_savings_total'][case_count][j] += ui_output['energy_savings_total'][i][j]
    for i in range(1, max_scheme_year + year):
        if i == 1:
            ui_output['energy_savings_total'][case_count + 1][i] = ui_output['energy_savings_total'][case_count][i]
        else:
            ui_output['energy_savings_total'][case_count + 1][i] = \
                ui_output['energy_savings_total'][case_count + 1][i - 1] + \
                ui_output['energy_savings_total'][case_count][i]


def calculate_cash_values(max_scheme_year, project, ui_output, year, oc_inv, bp_inv, cases):
    for i in range(1, year + max_scheme_year):
        if i == 1:
            ui_output['cash_values'][0][i] = \
                ui_output['operational_costs'][len(oc_inv) + 1][i] - ui_output['investments'][len(bp_inv) + 1][i]
            ui_output['cash_values'][1][i] = ui_output['revenues'][len(cases)][i]
        elif i <= project.params['bp_year']:
            ui_output['cash_values'][0][i] = \
                ui_output['operational_costs'][len(oc_inv) + 1][i] - \
                ui_output['investments'][len(bp_inv) + 1][i] + ui_output['cash_values'][0][i - 1]
            ui_output['cash_values'][1][i] = ui_output['cash_values'][1][i - 1] + ui_output['revenues'][len(cases)][i]
        else:
            ui_output['cash_values'][0][i] = \
                ui_output['operational_costs'][len(oc_inv) + 1][i] + ui_output['cash_values'][0][i - 1]
            ui_output['cash_values'][1][i] = ui_output['cash_values'][1][i - 1] + ui_output['revenues'][len(cases)][i]
        ui_output['cash_values'][2][i] = ui_output['cash_values'][0][i] + ui_output['cash_values'][1][i]


def calculate_revenues(cases, max_scheme_year, oc_project_investments, revenue_values, ui_output, year, bp_count):
    case_count = len(cases)
    for i in range(0, case_count):
        ui_output['revenues'][i] = revenue_values[i]
    for i in range(1, year + max_scheme_year):
        total_revenue = 0
        for j in range(0, case_count):
            total_revenue += ui_output['revenues'][j][i]
        ui_output['revenues'][case_count][i] = total_revenue
        ui_output['revenues'][case_count + 1][i] = \
            ui_output['revenues'][case_count][i] + ui_output['operational_costs'][len(oc_project_investments) + 1][i]
        if i == 1:
            ui_output['revenues'][case_count + 2][i] = ui_output['revenues'][case_count + 1][i]
        else:
            ui_output['revenues'][case_count + 2][i] = \
                ui_output['revenues'][case_count + 2][i - 1] + ui_output['revenues'][case_count + 1][i]
        if i <= year:
            ui_output['revenues'][case_count + 3][i] = (ui_output['revenues'][case_count + 2][i] /
                                                              ui_output['investments'][bp_count + 2][i] - 1) * 100
        else:
            ui_output['revenues'][case_count + 3][i] = (ui_output['revenues'][case_count + 2][i] /
                                                        ui_output['investments'][bp_count + 2][year] - 1) * 100


def calculate_operational_costs(cases, financing_duration, oc_project_investments, project, revenue_values, ui_output,
                                year):
    oc_count = len(oc_project_investments)
    for i in range(1, year + financing_duration):
        ui_output['operational_costs'][0][i] = revenue_values['yearly_loan_fee_payment'][i] * -1
    for i in range(1, year + 1):
        for j in range(1, oc_count + 1):
            ui_output['operational_costs'][j][i] = \
                float(get_value_from_oc_projects(project.id, list(oc_project_investments)[j - 1].name)) * \
                ui_output['number_of_renovations'][len(cases)][i]
            ui_output['operational_costs'][oc_count + 1][i] -= ui_output['operational_costs'][j][i]
    for i in range(1, year + financing_duration):
        ui_output['operational_costs'][oc_count + 1][i] -= ui_output['operational_costs'][0][i]


def calculate_revenue_values(cases, financing_duration, max_scheme_year, project, ui_output, year):
    revenue_values = {
        'yearly_on_bill': dict.fromkeys(range(1, year + max_scheme_year), 0),
        'yearly_loan_fee_payment': dict.fromkeys(range(1, year + financing_duration), 0),
    }
    case_index = 0
    for case in cases:
        revenue_values[case_index] = {'name': "Case " + str(case_index + 1) + " (€)"} | dict.fromkeys(range(1, year + max_scheme_year), 0)
        for i in range(1, year + 1):
            for j in range(i, i + case.common_params['on_bill_scheme']):
                revenue_values[case_index][j] += ui_output['on_bill_components'][case_index][i]
                revenue_values['yearly_on_bill'][j] += ui_output['on_bill_components'][case_index][i]
        case_index += 1
    pmt_values = {}
    for i in range(1, year + 1):
        pmt_values[i] = float(npf.pmt(float(get_value_from_oc_projects(project.id, "FI Financing rate")) / 100,
                                      financing_duration, ui_output['results'][2][i], 0, 1))
    for i in range(1, year + 1):
        for j in range(i, i + financing_duration):
            if j < year + financing_duration:
                revenue_values['yearly_loan_fee_payment'][j] += pmt_values[i]
    return revenue_values


def calculate_investments(bp_project_investments, project, ui_output, year):
    bp_count = len(bp_project_investments)
    for i in range(1, year + 1):
        ui_output['investments'][0][i] = ui_output['results'][3][i]
        total_bp_investments = 0
        for j in range(1, 1 + bp_count):
            ui_output['investments'][j][i] = float(
                get_value_from_bp_projects(project.id, list(bp_project_investments)[j - 1].name, i))
            total_bp_investments += float(ui_output['investments'][j][i])

        ui_output['investments'][bp_count + 1][i] = float(ui_output['investments'][0][i]) + total_bp_investments
        if i == 1:
            ui_output['investments'][bp_count + 2][i] = ui_output['investments'][bp_count + 1][i]
        else:
            ui_output['investments'][bp_count + 2][i] = ui_output['investments'][bp_count + 2][i - 1] + \
                                                        ui_output['investments'][bp_count + 1][i]


def calculate_number_of_renovations(cases, ordered_cases, ui_output, year):
    for i in range(1, year + 1):
        case_index = 0
        for case in ordered_cases:
            ui_output['number_of_renovations'][case_index][i] = get_renovation_count_from_bp_cases(case.id, i)
            ui_output['number_of_renovations'][len(cases)][i] += ui_output['number_of_renovations'][case_index][i]
            case_index += 1


def calculate_energy_savings_generated(cases, energy_savings, ui_output, year):
    for i in range(1, year + 1):
        case_index = 0
        for case in cases:
            ui_output['energy_savings_generated'][case_index][i] = \
                get_renovation_count_from_bp_cases(case.id, i) * energy_savings[case.id]
            case_index += 1


def calculate_on_bill_components(cases, ui_output, year):
    for i in range(1, year + 1):
        case_index = 0
        for case in cases:
            ui_output['on_bill_components'][case_index][i] = int(get_renovation_count_from_bp_cases(case.id, i)) * \
                                                             case.common_params['on_bill_component']
            case_index += 1


def calculate_results(bill_savings, cases, energy_savings, project, ui_output, unitary_costs, year):
    for i in range(1, year + 1):
        for case in cases:
            ui_output['results'][0][i] += \
                get_renovation_count_from_bp_cases(case.id, i) * unitary_costs[case.id]
            ui_output['results'][1][i] += \
                get_renovation_count_from_bp_cases(case.id, i) * unitary_costs[case.id] * \
                (1 - get_government_subsidy_from_bp_cases(case.id, i) / 100)
            ui_output['results'][4][i] += \
                get_renovation_count_from_bp_cases(case.id, i) * bill_savings[case.id]
            ui_output['results'][5][i] += \
                get_renovation_count_from_bp_cases(case.id, i) * energy_savings[case.id]
        ui_output['results'][2][i] = ui_output['results'][1][i] *(float(get_value_from_oc_projects(project.id, '% of investment financed by FI')) / 100)
        ui_output['results'][3][i] = ui_output['results'][1][i] - ui_output['results'][2][i]