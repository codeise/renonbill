def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


def get_fixed_cost_from_sheet(sheet, row):
    cost1 = get_value_from_sheet_by_indices(sheet, row, 3)
    cost2 = get_value_from_sheet_by_indices(sheet, row, 4)
    if not is_number(cost2):
        cost2 = 0
    return cost1 + cost2


def get_fixed_cost_from_sheet_by_key(sheet, row):
    cost1 = sheet[row-1]["cost"]
    cost2 = sheet[row-1]["installation_cost"]
    if not is_number(cost2):
        cost2 = 0
    return cost1 + cost2


def get_fixed_cost_from_sheet_by_key_noise(sheet, row, noisematrix, value_type):
    org_val = get_fixed_cost_from_sheet_by_key(sheet, row)
    if noisematrix is None:
        return org_val
    burner_switcher = {
        1: "1-Type B open chamber",
        2: "2-Type C sealed chamber",
        3: "3- Gas/diesel modulating",
        4: "4- Condensing",
        5: "5- Gas/diesel on-off",
        6: "6- Air cooled"
    }
    emitter_switcher = {
        1: "1- Radiators",
        2: "2- Radiators with Valve",
        3: "3- Fan coil",
        4: "4- Floor panels",
        5: "5- Ceiling and wall panels",
        6: "6- Other types"
    }
    dhw_burner_switcher = {
        1: "1- Open chamber centralized",
        2: "2- Sealed chamber autonomous"
    }
    if value_type == "burner_type":
        return  org_val + noisematrix["costs"]["fixed_costs"][burner_switcher[row]]
    elif value_type == "emitter_type":
        return org_val + noisematrix["costs"]["fixed_costs"][emitter_switcher[row]]
    elif value_type == "DHW_burner_type":
        return org_val + noisematrix["costs"]["fixed_costs"][dhw_burner_switcher[row - 1]]


def get_fixed_cost_by_key_from_sheet(sheet, search_name, search_value):
    cost1 = get_value_from_sheet(sheet, search_name, search_value, 'cost')
    cost2 = get_value_from_sheet(sheet, search_name, search_value, 'installation_cost')
    if cost2 == "":
        cost2 = 0
    return cost1 + cost2


def get_fixed_cost_by_key_from_sheet_noise(sheet, search_name, search_value, noisematrix):
    org_val = get_fixed_cost_by_key_from_sheet(sheet, search_name, search_value)
    if noisematrix is None:
        return org_val

    if search_name == "heating":
        search_value = search_value.replace(" ", "_")
    elif search_name == "plant_type" and search_value != "electric_boiler":
        search_value = "dhw_" + search_value
    return org_val + noisematrix["costs"]["fixed_costs"][search_value]


def get_by_city_country(sheet, key, country, city, field, memo):
    return get_value_from_sheet_multi(
        sheet,
        key,
        (("country", country), ("city", city)),
        field,
        memo
    )


def get_value_from_sheet_no_header(sheet, search_name):
    for row in sheet:
        if row[search_name]:
            return row[search_name]
    return None


def get_value_from_sheet(sheet, search_name, search_value, find_name):
    for row in sheet:
        if row[search_name] == search_value:
            return row[find_name]
    return None


def get_value_from_sheet_multi(sheet, key, search_columns, find_column, memo):
    key_tuple_hash = hash((key, search_columns, find_column))
    if key_tuple_hash in memo:
        return memo[key_tuple_hash]
    for row in sheet:
        matches = 0
        for search_column in search_columns:
            row_val = row[search_column[0]]
            search_column_val = search_column[1]
            if isinstance(row_val, str) and isinstance(search_column[1], str):
                row_val = row_val.lower()
                search_column_val = search_column_val.lower()
            if row_val == search_column_val:
                matches += 1
        if matches == len(search_columns):
            memo[key_tuple_hash] = row[find_column]
            return row[find_column]
    return None


# row and column are 1-based not 0-based
def get_value_from_sheet_by_indices(sheet, row_index, column_index):
    ri = 1
    for row in sheet:
        if ri == row_index:
            ci = 1
            for column in row:
                if ci == column_index:
                    return row[column]
                ci += 1
        ri += 1
    return None


# row and column are 1-based not 0-based
def get_value_from_sheet_by_indices2(sheet, row_index, column_name):
    try:
        return sheet[row_index][column_name]
    except Exception:
        return None


# calculate RAD and ROD0 values according to original code
def get_rad_days(row, days):
    rad_days = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    tmp = row['heatingonoff'].split("/")
    stmp = tmp[0].split(".")
    start_day = int(stmp[0])
    start_month = int(stmp[1])

    etmp = tmp[1].split(".")
    end_day = int(etmp[0])
    end_month = int(etmp[1])

    for i in range(start_month, len(days) + 1):
        if i == start_month:
            rad_days[i - 1] = days[i - 1] - start_day + 1
        else:
            rad_days[i - 1] = days[i - 1]

    for i in range(1, end_month + 1):
        if i == end_month:
            rad_days[i - 1] = end_day
        else:
            rad_days[i - 1] = days[i - 1]

    return rad_days


def calculate_rad(city_climate_sheet, memo):
    if memo:
        return memo
    rad_values = []  # RAD array in VB code
    days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for row in city_climate_sheet:
        rad_monthly = [row['january'], row['february'], row['march'], row['april'], row['may'], row['june'],
                       row['july'], row['august'], row['september'], row['october'], row['november'], row['december']]

        rad_days = get_rad_days(row, days)
        rad_tmp = 0
        rad_tmp_total = 0
        for i in range(12):
            rad_tmp = round(rad_tmp + rad_days[i] * rad_monthly[i], 4)
            rad_tmp_total = round(rad_tmp_total + days[i] * rad_monthly[i], 4)
        rad_values.append(
            {
                "country": row["country"],
                "city": row["city"],
                "rad": rad_tmp,
                "rad_total": rad_tmp_total,
                "rad_days": rad_days
            }
        )
    for rv in rad_values:
        memo.append(rv)
    return rad_values


def planned_current_fn(params, fn):
    result = {}
    for key in params["current_params"]:
        result[key] = fn(params["current_params"][key], params["planned_params"][key])
    return result


def get_noise_value(noisematrix, case, param_type, key):
    if noisematrix is None:
        return 0
    return noisematrix[case.id][param_type][key]


def get_vc_noise_value(noisematrix, year, key):
    if noisematrix is None:
        return 0
    return noisematrix["costs"][key][year]


def get_noise_value_constants(noisematrix, key):
    if noisematrix is None:
        return 0
    return noisematrix["constants"][key]


def get_noise_type(params_type):
    if params_type == "current_params":
        return "current"
    else:
        return "planned"


def get_noise_value_fixed_cost_by_name(noisematrix, name):
    if noisematrix is None:
        return 0
    return noisematrix["costs"]["fixed_costs"][name]
