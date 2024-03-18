from casecalc.constants_helpers import calculate_rad, get_by_city_country, get_noise_value, get_noise_type
from casecalc.coefficients_constants import get_coefficients


def lateral(common_params, s_tot, case, noisematrix):
    floor_area = common_params["floor_area"] + get_noise_value(noisematrix, case, "common", "floor_area")
    dispersed_lateral = {}
    if common_params["building_type"] == "multistorey":
        dispersed_lateral["lateral_area"] = s_tot - 2 * floor_area
    elif common_params["building_type"] == "detached house":
        dispersed_lateral["lateral_area"] = s_tot - 2 * floor_area
    elif common_params["building_type"] == "apartment" and common_params["storey_position"] == "top":
        dispersed_lateral["lateral_area"] = s_tot - floor_area
    elif common_params["building_type"] == "apartment" and common_params["storey_position"] == "ground":
        dispersed_lateral["lateral_area"] = s_tot - floor_area
    elif common_params["building_type"] == "apartment" and common_params["storey_position"] == "mid":
        dispersed_lateral["lateral_area"] = s_tot
    return dispersed_lateral


def calculate(params, case, constants, noisematrix, param_type, year):
    tmp = get_noise_type(param_type)
    common_params = case.common_params
    qfloor = 0
    qroof = 0
    nfloor = common_params["floor_count"]
    ndw = common_params["dwelling_count"]
    s_floor = common_params["floor_area"] + get_noise_value(noisematrix, case, "common", "floor_area")
    wh = common_params["wall_height"] + get_noise_value(noisematrix, case, "common", "wall_height")

    transmittance_params = get_transmittance(params, common_params, case, noisematrix, param_type)
    hdd_rad_params = get_hdd_rad(common_params, constants, noisematrix, case, year)
    s_roof = s_floor
    vol = s_floor * wh * nfloor
    vol_risc = vol
    s_netta = s_floor * 0.85
    v_netto = s_netta * (wh - 0.3)
    total_surface_to_vol = common_params["total_surface_area_to_volume_ratio"] + \
                           get_noise_value(noisematrix, case, "common", "total_surface_area_to_volume_ratio")
    s_tot = total_surface_to_vol * vol_risc
    lateral_params = lateral(common_params, s_tot, case, noisematrix)
    win_to_sur_rat = params["window_to_surface_area_ratio"] + \
                     get_noise_value(noisematrix, case, tmp, "window_to_surface_area_ratio")
    s_win = min(win_to_sur_rat * s_floor, lateral_params["lateral_area"])
    s_wall = lateral_params["lateral_area"] - s_win * nfloor
    s_floor_area = s_floor * ndw * nfloor
    g_v = 0.011 * (0.04 * s_floor) * 3600
    fixed_constants = get_coefficients(constants, tmp, noisematrix, case)
    airchangecoeff = fixed_constants["airchangecoeff"]
    # intentionally from params and not from fixed_constants
    sun_factor = params["sun_factor"] + get_noise_value(noisematrix, case, tmp, "sun_factor")
    g_v_2 = airchangecoeff * v_netto
    hdd = hdd_rad_params["hdd"]
    tday = hdd_rad_params["tday"]
    rad = hdd_rad_params["rad"]
    u_win = params["window_transmittance_value"] + get_noise_value(noisematrix, case, tmp, "window_transmittance_value")
    u_w = transmittance_params["uwall"]
    shadow = fixed_constants["shadow"]
    rho_air = fixed_constants["rho_air"]
    cp_air = fixed_constants["cp_air"]
    alfa = fixed_constants["alfa"]
    he = fixed_constants["he"]

    million = 1000000
    sec_in_hour = 3600
    one_over_million = 0.000001
    tf_ratio = 24 * one_over_million
    one = million * one_over_million
    sec_in_day = sec_in_hour * 24
    tf_ratio_hour = sec_in_hour * tf_ratio

    q_v_2 = nfloor * ndw * g_v * rho_air * cp_air * hdd * tf_ratio
    q_v = nfloor * ndw * g_v_2 * rho_air * cp_air * hdd * tf_ratio
    qis = nfloor * ndw * min(5.294 * s_netta - 0.01557 * s_netta ** 2, 450) * tday * tf_ratio_hour
    q_win = nfloor * u_win * s_win * ndw * hdd * tf_ratio_hour
    qsg = nfloor * shadow * sun_factor * s_win * rad * ndw * one
    q_s = shadow * alfa * s_wall * rad * ndw * one
    q_w = u_w * s_wall * ndw * hdd * tf_ratio_hour - u_w / he * q_s
    u_floor = transmittance_params["ufloor"]
    u_roof = transmittance_params["uroof"]

    if common_params["building_type"] == "multistorey" or common_params["building_type"] == "detached house":
        qfloor = u_floor * s_floor * ndw * hdd * tf_ratio_hour
        qsroof = shadow * rad * alfa * s_roof * ndw * one
        qroof = u_roof * s_roof * ndw * hdd * tf_ratio_hour - u_roof / he * qsroof
    elif common_params["building_type"] == "apartment" and common_params["storey_position"] == "top":
        qsroof = shadow * rad * alfa * s_roof * ndw * one
        qroof = u_roof * s_roof * ndw * hdd * tf_ratio_hour - u_roof / he * qsroof
    elif common_params["building_type"] == "apartment" and common_params["storey_position"] == "ground":
        qfloor = u_floor * s_floor * ndw * hdd * tf_ratio_hour

    dhw_load = fixed_constants["dhw_load"]
    cp_water = fixed_constants["cp_water"]
    h_w = q_w * million / (hdd * ndw * sec_in_day)
    h_win = q_win * million / (hdd * ndw * sec_in_day)
    h_v = q_v * million / (hdd * ndw * sec_in_day)
    h_v_2 = q_v_2 * million / (hdd * ndw * sec_in_day)
    q_dhw = nfloor * ndw * (0.04 * s_floor) * dhw_load * cp_water * (45 - 15) * 365 * one_over_million

    return {
        "q_win": q_win,
        "qsg": qsg,
        "q_floor": qfloor,
        "q_roof": qroof,
        "q_v": q_v,
        "q_w": q_w,
        "q_is": qis,
        "q_dhw": q_dhw,
        "s_floor_area": s_floor_area
    }


def get_hdd_rad(common_params, constants, noisematrix, case, year):
    p = {}
    country = common_params["country"]
    city = common_params["city"]
    rads = calculate_rad(constants.city_climate, constants.rad_memo)
    p["hdd"] = get_by_city_country(constants.city_climate, "city_climate", country, city, "hdd",
                                   constants.sheet_multi_memo) + get_noise_value(noisematrix, case, "hdd", year)
    p["tday"] = sum(
        get_by_city_country(rads, "rads", country, city, "rad_days", constants.sheet_multi_memo)) + get_noise_value(
        noisematrix, case, "tday", year)
    p["rad"] = get_by_city_country(rads, "rads", country, city, "rad", constants.sheet_multi_memo) + get_noise_value(
        noisematrix, case, "rad", year)
    p["rad_total"] = get_by_city_country(rads, "rads", country, city, "rad_total", constants.sheet_multi_memo)
    return p


def get_hhours(hdd):
    if hdd < 600:
        return 6
    elif 600 <= hdd <= 900:
        return 8
    elif 900.1 <= hdd <= 1400:
        return 10
    elif 1400.1 <= hdd <= 2100:
        return 12
    elif 2100.1 <= hdd <= 3000:
        return 14
    else:
        return 18


def get_transmittance(params, common_params, case, noisematrix, params_type):
    tmp = get_noise_type(params_type)

    uw = common_params["wall_thermal_transmittance"] + \
         get_noise_value(noisematrix, case, "common", "wall_thermal_transmittance")
    wall_cond = params["wall_envelope_thermal_conductivity"] + \
                get_noise_value(noisematrix, case, tmp, "wall_envelope_thermal_conductivity")
    wall_thick = params["wall_thickness"] + get_noise_value(noisematrix, case, tmp, "wall_thickness")

    ur = common_params["roof_thermal_transmittance"] + \
         get_noise_value(noisematrix, case, "common", "roof_thermal_transmittance")
    roof_cond = params["roof_envelope_thermal_conductivity"] + \
                get_noise_value(noisematrix, case, tmp, "roof_envelope_thermal_conductivity")
    roof_thick = params["roof_thickness"] + get_noise_value(noisematrix, case, tmp, "roof_thickness")

    uf = common_params["floor_thermal_transmittance"] + \
         get_noise_value(noisematrix, case, "common", "floor_thermal_transmittance")
    floor_cond = params["floor_envelope_thermal_conductivity"] + \
                 get_noise_value(noisematrix, case, tmp, "floor_envelope_thermal_conductivity")
    floor_thick = params["floor_thickness"] + get_noise_value(noisematrix, case, tmp, "floor_thickness")
    p = {
        "uwall": 1 / (1 / max(uw, 0.001) + wall_thick / wall_cond),
        "uroof": 1 / (1 / max(ur, 0.001) + roof_thick / roof_cond),
        "ufloor": 1 / (1 / max(uf, 0.001) + floor_thick / floor_cond)
    }
    return p
