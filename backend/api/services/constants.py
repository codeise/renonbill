import math

from api.models import Constants
from api.repositories import constants as constants_repo
from openpyxl import load_workbook

from api.serializers import ConstantsSerializer
from api.services.excel_import import import_standard_table


def safe_append(d, k, v):
    if k not in d:
        d[k] = list()
    if v not in d[k]:
        d[k].append(v)


def get_by_user_id(user_id):
    return constants_repo.get_by_user_id(user_id)


def get_case_data(user_id):
    constants = constants_repo.get_by_user_id(user_id)
    countries = {}

    for cc in constants.city_climate:
        if cc["country"] not in countries:
            countries[cc["country"]] = {}
        safe_append(countries[cc["country"]], "cities", cc["city"])

    td_defaults = {}

    for td in constants.thermal_data:
        td["building_type"] = td["building_type"].lower()
        if td["country"] not in countries:
            countries[td["country"]] = {}

        if td["country"] not in td_defaults:
            td_defaults[td["country"]] = {}

        if td["building_type"] not in td_defaults[td["country"]]:
            td_defaults[td["country"]][td["building_type"]] = {}

        if td["building_year"] not in td_defaults[td["country"]][td["building_type"]]:
            td_defaults[td["country"]][td["building_type"]][td["building_year"]] = {}

        for key in td:
            if key != "country" and key != "building_year" and key != "building_type":
                val = td[key]
                if key == 'disp_v_ratio':
                    val = round(val, 2)
                td_defaults[td["country"]][td["building_type"]][td["building_year"]][key] = val

        safe_append(countries[td["country"]], "building_types", td["building_type"])
        safe_append(countries[td["country"]], "building_years", td["building_year"])

    return {"countries": countries, "td_defaults": td_defaults}


def import_constants(constants):
    wb = load_workbook(filename=constants.file.path, data_only=True)
    return constants_repo.edit_params(constants.id, get_city_climate(wb), get_thermal_data(wb),
                                      get_envelope_windows(wb), get_heating_dhw(wb), get_other_thermal_data(wb),
                                      get_variable_costs(wb), get_default_uncertainty(wb),
                                      import_uncertain_variables(wb))


def get_city_climate(wb):
    config = {
        "key_replacements": {
            'average daily Solar rad [MJ/m^2] South vert. Wall': 'average_daily'
        }
    }
    return import_standard_table(wb['City Climate'], config)


def get_thermal_data(wb):
    config = {
        "key_replacements": {
            'building type': 'building_type',
            'age': 'building_year',
            'Wall thermal transmittance [W/(m2K)': 'wall_trans',
            'Roof thermal transmittance [W/(m2K)': 'roof_trans',
            'Floor thermal transmittance [W/(m2K)': 'floor_trans',
            'Windows thermal transmittance [W/(m2K)': 'windows_trans',
            'S disp/V': 'disp_v_ratio',
            'Swin/Sfloor': 'win_floor_ratio',
        },
    }
    return import_standard_table(wb['Thermal Data'], config)


def get_variable_costs(wb):
    config = {
        "key_replacements": {
            'variation rate \\  year': 'variation_rate_per_year',
        },
        "value_replacements": {
            'electric energy [€/kWh]': 'electric_energy',
            'methane gas   [€/Smc]': 'methane_gas',
            'pellet [€/kg]': 'pellet',
        },
        "repeat_column_value": {
            "country": ""
        }
    }
    return import_standard_table(wb['Variable Costs'], config)


def get_envelope_windows(wb):
    config_table_1 = {
        "key_replacements": {
            'EXTERNAL INSULATION': 'external_insulation',
            'thermal conductivity': 'thermal_conductivity',
            'material cost €/m2': 'material_cost',
            'installation cost € /m2': 'installation_cost',
        },
        "range": {
            "row_start": 1,
            "row_end": 4,
        }
    }
    config_table_2 = {
        "value_replacements": {
            'single grazed cost, €/m2 (all inclusive)': 'single_grazed_cost',
            'double glazed cost, €/m2 (all inclusive)': 'double_grazed_cost',
        },
        "range": {
            "row_start": 6,
            "row_end": 7,
        },
        "custom_headers": ["cost", None, None, "value"]
    }

    sheet = wb['Envelope & Windows']
    return {
        "table1": import_standard_table(sheet, config_table_1),
        "table2": import_standard_table(sheet, config_table_2),
    }


def get_heating_dhw(wb):
    config_table_1 = {
        "key_replacements": {
            'HEATING (plant type)': 'heating',
            'cost €/kW': 'cost',
            'installation cost €/kW': 'installation_cost',
        },
        "value_replacements": {
            'solar heating (€/m2)': 'solar_heating',
        },
        "range": {
            "row_start": 1,
            "row_end": 13,
            "column_start": 1,
            "column_end": 4
        }
    }
    config_table_2 = {
        "custom_headers": ["plant_type", "efficiency", "cost", "installation_cost"],
        "value_replacements": {
            'electric boiler (€/l)': 'electric_boiler',
            'heat pump  (€/l)': 'heat_pump',
            'solar heater (€/m2)': 'solar_heater',
        },
        "range": {
            "row_start": 15,
            "row_end": 21,
            "column_start": 1,
            "column_end": 4
        }
    }
    config_table_3 = {
        "key_replacements": {
            'HEATING (plant type)': 'heating',
            'cost €/kW': 'cost',
            'installation cost €/kW': 'installation_cost',
        },
        "range": {
            "row_start": 1,
            "row_end": 7,
            "column_start": 5,
            "column_end": 8
        }
    }
    config_table_4 = {
        "key_replacements": {
            'regulation: mean efficiency': 'regulation_mean_efficiency',
            'distribution: mean efficiency': 'distribution_mean_efficiency',
        },
        "range": {
            "row_start": 1,
            "row_end": 2,
            "column_start": 9,
            "column_end": 10
        }
    }
    sheet = wb['Heating & DHW']
    return {
        "table1": import_standard_table(sheet, config_table_1),
        "table2": import_standard_table(sheet, config_table_2),
        "table3": import_standard_table(sheet, config_table_3),
        "table4": import_standard_table(sheet, config_table_4),
    }


def get_other_thermal_data(wb):
    config = {
        "custom_headers": ["description", "value", None, "note"],
    }
    return import_standard_table(wb['Other Thermal Data'], config)


def get_default_uncertainty(wb):
    config_table_1 = {
        "custom_headers": ["simplified_manager", "check", "conf_today", "conf_year"],
        "range": {
            "row_start": 3,
            "row_end": 9,
            "column_start": 1,
            "column_end": 4
        }
    }
    config_table_2 = {
        "custom_headers": ["advanced_manager", "desc", "check", "conf_today"],
        "range": {
            "row_start": 3,
            "row_end": 20,
            "column_start": 7,
            "column_end": 11
        },
        "repeat_column_value": {
            "advanced_manager": ""
        }
    }
    config_table_3 = {
        "custom_headers": ["advanced_manager1", "desc", "check", "conf_today", "conf_year"],
        "range": {
            "row_start": 3,
            "row_end": 28,
            "column_start": 12,
            "column_end": 17
        },
        "repeat_column_value": {
            "advanced_manager1": ""
        }
    }
    config_table_4 = {
        "range": {
            "row_start": 13,
            "row_end": 14,
            "column_start": 1,
            "column_end": 1
        }
    }
    config_table_5 = {
        "range": {
            "row_start": 13,
            "row_end": 14,
            "column_start": 4,
            "column_end": 4
        }
    }

    sheet = wb['Default Uncertainty']
    return {
        "table1": import_standard_table(sheet, config_table_1),
        "table2": import_standard_table(sheet, config_table_2),
        "table3": import_standard_table(sheet, config_table_3),
        "table4": import_standard_table(sheet, config_table_4),
        "table5": import_standard_table(sheet, config_table_5),
    }


def import_uncertain_variables(wb):
    config_table_1 = {
        "custom_headers": ["geometric", "value"],
        "range": {
            "row_start": 4,
            "row_end": 7,
            "column_start": 2,
            "column_end": 3
        }
    }
    config_table_2 = {
        "custom_headers": ["thermophysical", "value"],
        "range": {
            "row_start": 4,
            "row_end": 15,
            "column_start": 4,
            "column_end": 5
        }
    }
    config_table_3 = {
        "custom_headers": ["heating_equipment", "value"],
        "range": {
            "row_start": 4,
            "row_end": 16,
            "column_start": 6,
            "column_end": 7
        }
    }
    config_table_4 = {
        "custom_headers": ["external_environment", "value"],
        "range": {
            "row_start": 4,
            "row_end": 9,
            "column_start": 8,
            "column_end": 9
        }
    }
    config_table_5 = {
        "custom_headers": ["economic", "value"],
        "range": {
            "row_start": 4,
            "row_end": 8,
            "column_start": 10,
            "column_end": 11
        }
    }

    sheet = wb['uncertain variables']
    return {
        "table1": import_standard_table(sheet, config_table_1),
        "table2": import_standard_table(sheet, config_table_2),
        "table3": import_standard_table(sheet, config_table_3),
        "table4": import_standard_table(sheet, config_table_4),
        "table5": import_standard_table(sheet, config_table_5)
    }


def get_heating_types(user_id):
    try:
        constants = get_by_user_id(user_id)
    except Constants.DoesNotExist:
        return None
    constants_serializer = ConstantsSerializer(constants, many=False)
    result = get_heating_types_helper(constants_serializer.data['heating_dhw'])
    return result


def get_heating_types_helper(heating_and_dhw):
    table1 = heating_and_dhw['table1']
    table3 = heating_and_dhw['table3']
    table1 = table1[slice(len(table1) - 3)]
    burner_types = map(lambda h: h['heating'], table1)
    emitter_types = map(lambda h: h['heatingemittertype'], table3)
    result = {"burner_types": {}, "emitter_types": {}}
    for i, v in enumerate(burner_types):
        result["burner_types"][i + 1] = ' '.join(v.split())
    for i, v in enumerate(emitter_types):
        result["emitter_types"][i + 1] = ' '.join(v.split())
    return result


def get_plant_types(user_id):
    try:
        constants = get_by_user_id(user_id)
    except Constants.DoesNotExist:
        return None
    constants_serializer = ConstantsSerializer(constants, many=False)
    return get_plant_types_helper2(constants_serializer.data['heating_dhw'])


def get_plant_types_helper(heating_and_dhw):
    table2 = heating_and_dhw['table2']
    return {
        "types": {
            1: table2[1]["plant_type"],
            2: table2[2]["plant_type"]
        }
    }


def get_plant_types_helper2(heating_and_dhw):
    return {
        "types": get_plant_types_helper1(heating_and_dhw)
    }


def get_plant_types_helper1(heating_and_dhw):
    table2 = heating_and_dhw['table2']
    table2 = table2[slice(1, len(table2) - 2)]
    plant_typs = map(lambda h: h['plant_type'], table2)
    result = {}
    for i, v in enumerate(plant_typs):
        result[i + 1] = v
    return result


def get_v_costs(user_id):
    try:
        constants = get_by_user_id(user_id)
    except Constants.DoesNotExist:
        return None
    variable_costs = constants.variable_costs
    countries = {}
    for vc in variable_costs:
        country = vc["country"].capitalize()
        source = vc["source"].replace(" ", "_")
        if country not in countries:
            countries[country] = {}
        if source not in countries[country]:
            countries[country][source] = {}

        countries[country][source] = {
            "variation_rate_per_year": round(vc['variation_rate_per_year'] * 100)
        }

    return countries
