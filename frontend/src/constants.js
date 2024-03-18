const login_route = "/login"
const register_route = "/register"
const home_route = "/home"
const project_not_found_route = "/project_not_found"

const monte_carlo_desc_obj = {
    thermal_prop: {
        part1: [
            {
                id: "Uwall_noise_check",
                checkbox_alias: "Uwall_noise_check",
                checkbox_label: "Uwall",
                input_alias: "Uwall_confidence"
            },
            {
                id: "Uroof_noise_check",
                checkbox_alias: "Uroof_noise_check",
                checkbox_label: "Uroof",
                input_alias: "Uroof_confidence"
            },
            {
                id: "Ufloor_noise_check",
                checkbox_alias: "Ufloor_noise_check",
                checkbox_label: "Ufloor",
                input_alias: "Ufloor_confidence"
            }
        ],
        part2: [
            {
                id: "Uwindows_noise_check",
                checkbox_alias: "Uwindows_noise_check",
                checkbox_label: "Uwins.",
                input_alias: "Uwindows_confidence"
            },
            {
                id: "sun_factor_noise_check",
                checkbox_alias: "sun_factor_noise_check",
                checkbox_label: "SunFactor",
                input_alias: "sun_factor_confidence"
            },
            {
                id: "alfa_plaster_noise_check",
                checkbox_alias: "alfa_plaster_noise_check",
                checkbox_label: "AlfaPlaster",
                input_alias: "alfa_plaster_confidence"
            }
        ],
    },
    ext_insulation: {
        part1: [
            {
                id: "wall_thermal_conductivity_noise_check",
                checkbox_alias: "wall_thermal_conductivity_noise_check",
                checkbox_label: "cond (wall)",
                input_alias: "wall_thermal_conductivity_confidence"
            },
            {
                id: "roof_thermal_conductivity_noise_check",
                checkbox_alias: "roof_thermal_conductivity_noise_check",
                checkbox_label: "cond (roof)",
                input_alias: "roof_thermal_conductivity_confidence"
            },
            {
                id: "floor_thermal_conductivity_noise_check",
                checkbox_alias: "floor_thermal_conductivity_noise_check",
                checkbox_label: "cond (floor)",
                input_alias: "floor_thermal_conductivity_confidence"
            }
        ],
        part2: [
            {
                id: "wall_thickness_noise_check",
                checkbox_alias: "wall_thickness_noise_check",
                checkbox_label: "thick (wall)",
                input_alias: "wall_thickness_confidence"
            },
            {
                id: "roof_thickness_noise_check",
                checkbox_alias: "roof_thickness_noise_check",
                checkbox_label: "thick (roof)",
                input_alias: "roof_thickness_confidence"
            },
            {
                id: "floor_thickness_noise_check",
                checkbox_alias: "floor_thickness_noise_check",
                checkbox_label: "thick (floor)",
                input_alias: "floor_thickness_confidence"
            }
        ],
    },
    geometry: {
        part1: [
            {
                id: "Sfloor_noise_check",
                checkbox_alias: "Sfloor_noise_check",
                checkbox_label: "Sfloor",
                input_alias: "Sfloor_confidence"
            },
            {
                id: "sd_vol_ratio_noise_check",
                checkbox_alias: "sd_vol_ratio_noise_check",
                checkbox_label: "Sd/Vol",
                input_alias: "sd_vol_ratio_confidence"
            },
        ],
        part2: [
            {
                id: "wall_height_noise_check",
                checkbox_alias: "wall_height_noise_check",
                checkbox_label: "h",
                input_alias: "wall_height_confidence"
            },
            {
                id: "window_floor_ratio_noise_check",
                checkbox_alias: "window_floor_ratio_noise_check",
                checkbox_label: "Swin/Sfloor",
                input_alias: "window_floor_ratio_confidence"
            },
        ],
    },
    costs: {
        part1: [
            {
                id: "fixed_costs_noise_check",
                checkbox_alias: "fixed_costs_noise_check",
                checkbox_label: "Fixed Costs",
                input_alias: "fixed_costs_confidence"
            },
            {
                id: "discount_rate_noise_check",
                checkbox_alias: "discount_rate_noise_check",
                checkbox_label: "Disc Rate",
                input_alias: "discount_rate_confidence"
            },
            {
                id: "fuel_cost_noise_check",
                checkbox_alias: "fuel_cost_noise_check",
                checkbox_label: "Fuel Energy",
                input_alias: "fuel_cost_confidence_today",
                input_alias_1: "fuel_cost_confidence_final"
            },
            {
                id: "electric_cost_noise_check",
                checkbox_alias: "electric_cost_noise_check",
                checkbox_label: "Elec Energy",
                input_alias: "electric_cost_confidence_today",
                input_alias_1: "electric_cost_confidence_final"
            },
            {
                id: "pellet_cost_noise_check",
                checkbox_alias: "pellet_cost_noise_check",
                checkbox_label: "Pellet Energy",
                input_alias: "pellet_cost_confidence_today",
                input_alias_1: "pellet_cost_confidence_final"
            },
        ],
        part2: [],
    },
    external: {
        part1: [
            {
                id: "HDD_noise_check",
                checkbox_alias: "HDD_noise_check",
                checkbox_label: "HDD",
                input_alias: "HDD_confidence"
            },
            {
                id: "solar_RAD_noise_check",
                checkbox_alias: "solar_RAD_noise_check",
                checkbox_label: "Radiation",
                input_alias: "solar_RAD_confidence"
            },
            {
                id: "heating_days_noise_check",
                checkbox_alias: "heating_days_noise_check",
                checkbox_label: "Heat. days",
                input_alias: "heating_days_confidence"
            }
        ],
        part2: [
            {
                id: "he_conv_noise_check",
                checkbox_alias: "he_conv_noise_check",
                checkbox_label: "he conv",
                input_alias: "he_conv_confidence"
            },
            {
                id: "air_change_noise_check",
                checkbox_alias: "air_change_noise_check",
                checkbox_label: "Air change",
                input_alias: "air_change_confidence"
            },
            {
                id: "shadow_noise_check",
                checkbox_alias: "shadow_noise_check",
                checkbox_label: "Shadow",
                input_alias: "shadow_confidence"
            }
        ],
    },
    dhw: {
        part1: [
            {
                id: "DHW_electric_boiler_eff_noise_check",
                checkbox_alias: "DHW_electric_boiler_eff_noise_check",
                checkbox_label: "eta_elecBoil",
                input_alias: "DHW_electric_boiler_eff_confidence"
            },
            {
                id: "DHW_burner_eff_noise_check",
                checkbox_alias: "DHW_burner_eff_noise_check",
                checkbox_label: "eta_burner",
                input_alias: "DHW_burner_eff_confidence"
            },
            {
                id: "DHW_heat_pump_COP_noise_check",
                checkbox_alias: "DHW_heat_pump_COP_noise_check",
                checkbox_label: "COP_hp",
                input_alias: "DHW_heat_pump_COP_confidence"
            }
        ],
        part2: [
            {
                id: "advanced_DHW_load_noise_check",
                checkbox_alias: "advanced_DHW_load_noise_check",
                checkbox_label: "HW load",
                input_alias: "advanced_DHW_load_confidence"
            },
            {
                id: "DHW_solar_fraction_noise_check",
                checkbox_alias: "DHW_solar_fraction_noise_check",
                checkbox_label: "Solar fract.",
                input_alias: "DHW_solar_fraction_confidence"
            },
        ],
    },
    heating: {
        part1: [
            {
                id: "heating_burner_eff_noise_check",
                checkbox_alias: "heating_burner_eff_noise_check",
                checkbox_label: "eta_burner",
                input_alias: "heating_burner_eff_confidence"
            },
            {
                id: "heating_pellet_eff_noise_check",
                checkbox_alias: "heating_pellet_eff_noise_check",
                checkbox_label: "eta_pellet",
                input_alias: "heating_pellet_eff_confidence"
            },
            {
                id: "heating_heat_pump_COP_noise_check",
                checkbox_alias: "heating_heat_pump_COP_noise_check",
                checkbox_label: "COP_hp",
                input_alias: "heating_heat_pump_COP_confidence"
            },
            {
                id: "heating_solar_fraction_noise_check",
                checkbox_alias: "heating_solar_fraction_noise_check",
                checkbox_label: "Solar fract.",
                input_alias: "heating_solar_fraction_confidence"
            }
        ],
        part2: [
            {
                id: "regulation_eff_noise_check",
                checkbox_alias: "regulation_eff_noise_check",
                checkbox_label: "eta_regul",
                input_alias: "regulation_eff_confidence"
            },
            {
                id: "distribution_eff_noise_check",
                checkbox_alias: "distribution_eff_noise_check",
                checkbox_label: "eta_distrib",
                input_alias: "distribution_eff_confidence"
            },
            {
                id: "emission_eff_noise_check",
                checkbox_alias: "emission_eff_noise_check",
                checkbox_label: "eta emitter",
                input_alias: "emission_eff_confidence"
            },
        ],
    },
}

export {
    login_route, register_route, home_route, project_not_found_route,monte_carlo_desc_obj
}