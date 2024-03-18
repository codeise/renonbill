import os
from pathlib import Path
from django.core.files import File
from api.services.constants import import_constants
from api.models import Project, Case, Constants
from django.contrib.auth.models import User


def create_user():
    user = User(username='admin', email='admin@admin.com', is_superuser=True)
    user.set_password('Renon303')
    user.save()
    return user


def create_constants(user):
    base_path = Path(__file__).parent
    file_path = (base_path / "../../../stuff/excel_app/tools_default_data.xlsx").resolve()
    with open(file_path, 'rb') as fi:
        file = File(fi, name=os.path.basename(fi.name))
        constants = Constants(user_id=user.id, file=file)
        constants.save()
        constants = import_constants(constants)
    return constants


def create_project(user):
    project = Project.objects.create(
        name='TestProject',
        params={"uncertainty_advanced_flag": -1, "confidence_level": 99,
                "noise_flag": 2, "geometry_noise_check": 1,
                "geometry_confidence": 10, "number_of_monte_carlo_runs": 150,
                "thermal_prop_noise_check": 1, "thermal_prop_confidence": 10,
                "efficiencies_noise_check": 1,
                "efficiencies_confidence": 5,
                "simplified_DHW_load_noise_check": 1,
                "simplified_DHW_load_confidence": 10,
                "environment_noise_check": 1, "environment_confidence": 20,
                "investment_noise_check": 1, "investment_confidence": 10,
                "energy_cost_noise_check": 1, "energy_cost_confidence_today": 1, "energy_cost_confidence_final": 10,
                "Uwall_noise_check": 1, "Uwall_confidence": 15,
                "Uroof_noise_check": 1, "Uroof_confidence": 17,
                "Ufloor_noise_check": 1, "Ufloor_confidence": 18,
                "Sfloor_noise_check": 1, "Sfloor_confidence": 12,
                "sd_vol_ratio_noise_check": 1, "sd_vol_ratio_confidence": 7,
                "wall_height_noise_check": 1, "wall_height_confidence": 5,
                "Uwindows_noise_check": 1, "Uwindows_confidence": 22,
                "window_floor_ratio_noise_check": 1,
                "window_floor_ratio_confidence": 6,
                "wall_thermal_conductivity_noise_check": 1,
                "wall_thermal_conductivity_confidence": 7,
                "wall_thickness_noise_check": 1,
                "wall_thickness_confidence": 4,
                "roof_thermal_conductivity_noise_check": 1,
                "roof_thermal_conductivity_confidence": 3,
                "roof_thickness_noise_check": 1,
                "roof_thickness_confidence": 5,
                "floor_thermal_conductivity_noise_check": 1,
                "floor_thermal_conductivity_confidence": 8,
                "floor_thickness_noise_check": 1,
                "floor_thickness_confidence": 2,
                "he_conv_noise_check": 1, "he_conv_confidence": 8,
                "shadow_noise_check": 1, "shadow_confidence": 35,
                "sun_factor_noise_check": 1, "sun_factor_confidence": 15,
                "alfa_plaster_noise_check": 1,
                "alfa_plaster_confidence": 7,
                "air_change_noise_check": 1, "air_change_confidence": 30,
                "advanced_DHW_load_noise_check": 1,
                "advanced_DHW_load_confidence": 7,
                "regulation_eff_noise_check": 1,
                "regulation_eff_confidence": 4,
                "distribution_eff_noise_check": 1,
                "distribution_eff_confidence": 4,
                "emission_eff_noise_check": 1,
                "emission_eff_confidence": 9,
                "heating_solar_fraction_noise_check": 1,
                "heating_solar_fraction_confidence": 22,
                "heating_burner_eff_noise_check": 1,
                "heating_burner_eff_confidence": 6,
                "heating_pellet_eff_noise_check": 1,
                "heating_pellet_eff_confidence": 5,
                "heating_heat_pump_COP_noise_check": 1,
                "heating_heat_pump_COP_confidence": 19,
                "DHW_solar_fraction_noise_check": 1,
                "DHW_solar_fraction_confidence": 11,
                "DHW_burner_eff_noise_check": 1,
                "DHW_burner_eff_confidence": 7,
                "DHW_electric_boiler_eff_noise_check": 1,
                "DHW_electric_boiler_eff_confidence": 14,
                "DHW_heat_pump_COP_noise_check": 1,
                "DHW_heat_pump_COP_confidence": 12,
                "HDD_noise_check": 1, "HDD_confidence": 22,
                "solar_RAD_noise_check": 1, "solar_RAD_confidence": 18,
                "heating_days_noise_check": 1,
                "heating_days_confidence": 14,
                "discount_rate_noise_check": 1,
                "discount_rate_confidence": 7,
                "fixed_costs_noise_check": 1, "fixed_costs_confidence": 15,
                "fuel_cost_noise_check": 1, "fuel_cost_confidence_today": 1, "fuel_cost_confidence_final": 3,
                "electric_cost_noise_check": 1,
                "electric_cost_confidence_today": 1, "electric_cost_confidence_final": 6,
                "pellet_cost_noise_check": 1, "pellet_cost_confidence_today": 1,
                "pellet_cost_confidence_final": 11,
                "incentives_check": -1, "incentives_amount_%": 60,
                "incentives_refund_years": 15,
                "loan_check": -1, "loan_amount_%": 85,
                "loan_refund_years": 20, "loan_rate": 5,
                "time_horizon_years": 25, "min_Epsav": "", "min_Esav": 10,
                "min_NPV": 1000, "min_IRR": 3, "min_Dpayback": 30,
                "min_loss_risk": 15,
                "min_churn_rate": 20, "min_default_rate": 3, "max_Epsav": "",
                "max_Esav": 75,
                "max_NPV": 15000, "max_IRR": 17, "max_Dpayback": 11,
                "max_loss_risk": 5,
                "max_churn_rate": 5, "max_default_rate": 1, "weight_Epsav": "",
                "weight_Esav": 2, "weight_NPV": 5, "weight_IRR": 1,
                "weight_Dpayback": 7, "weight_loss_risk": 3,
                "weight_churn_rate": 1, "weight_default_rate": 4, "unit_option": "optionkwh"},
        user_id=user.id
    )
    return project


def create_project_no_variance(user):
    project = Project.objects.create(
        name='TestProject',
        params={"uncertainty_advanced_flag": -1, "confidence_level": 99,
                "noise_flag": 2, "geometry_noise_check": 0,
                "geometry_confidence": 10, "number_of_monte_carlo_runs": 150,
                "thermal_prop_noise_check": 0, "thermal_prop_confidence": 10,
                "efficiencies_noise_check": 0,
                "efficiencies_confidence": 5,
                "simplified_DHW_load_noise_check": 0,
                "simplified_DHW_load_confidence": 10,
                "environment_noise_check": 0, "environment_confidence": 20,
                "investment_noise_check": 0, "investment_confidence": 10,
                "energy_cost_noise_check": 0, "energy_cost_confidence_today": 1, "energy_cost_confidence_final": 10,
                "Uwall_noise_check": 0, "Uwall_confidence": 15,
                "Uroof_noise_check": 0, "Uroof_confidence": 17,
                "Ufloor_noise_check": 0, "Ufloor_confidence": 18,
                "Sfloor_noise_check": 0, "Sfloor_confidence": 12,
                "sd_vol_ratio_noise_check": 0, "sd_vol_ratio_confidence": 7,
                "wall_height_noise_check": 0, "wall_height_confidence": 5,
                "Uwindows_noise_check": 0, "Uwindows_confidence": 22,
                "window_floor_ratio_noise_check": 0,
                "window_floor_ratio_confidence": 6,
                "wall_thermal_conductivity_noise_check": 0,
                "wall_thermal_conductivity_confidence": 7,
                "wall_thickness_noise_check": 0,
                "wall_thickness_confidence": 4,
                "roof_thermal_conductivity_noise_check": 0,
                "roof_thermal_conductivity_confidence": 3,
                "roof_thickness_noise_check": 0,
                "roof_thickness_confidence": 5,
                "floor_thermal_conductivity_noise_check": 0,
                "floor_thermal_conductivity_confidence": 8,
                "floor_thickness_noise_check": 0,
                "floor_thickness_confidence": 2,
                "he_conv_noise_check": 0, "he_conv_confidence": 8,
                "shadow_noise_check": 0, "shadow_confidence": 35,
                "sun_factor_noise_check": 0, "sun_factor_confidence": 15,
                "alfa_plaster_noise_check": 0,
                "alfa_plaster_confidence": 7,
                "air_change_noise_check": 0, "air_change_confidence": 30,
                "advanced_DHW_load_noise_check": 0,
                "advanced_DHW_load_confidence": 7,
                "regulation_eff_noise_check": 0,
                "regulation_eff_confidence": 4,
                "distribution_eff_noise_check": 0,
                "distribution_eff_confidence": 4,
                "emission_eff_noise_check": 0,
                "emission_eff_confidence": 9,
                "heating_solar_fraction_noise_check": 0,
                "heating_solar_fraction_confidence": 22,
                "heating_burner_eff_noise_check": 0,
                "heating_burner_eff_confidence": 6,
                "heating_pellet_eff_noise_check": 0,
                "heating_pellet_eff_confidence": 5,
                "heating_heat_pump_COP_noise_check": 0,
                "heating_heat_pump_COP_confidence": 19,
                "DHW_solar_fraction_noise_check": 0,
                "DHW_solar_fraction_confidence": 11,
                "DHW_burner_eff_noise_check": 0,
                "DHW_burner_eff_confidence": 7,
                "DHW_electric_boiler_eff_noise_check": 0,
                "DHW_electric_boiler_eff_confidence": 14,
                "DHW_heat_pump_COP_noise_check": 0,
                "DHW_heat_pump_COP_confidence": 12,
                "HDD_noise_check": 0, "HDD_confidence": 22,
                "solar_RAD_noise_check": 0, "solar_RAD_confidence": 18,
                "heating_days_noise_check": 0,
                "heating_days_confidence": 14,
                "discount_rate_noise_check": 0,
                "discount_rate_confidence": 7,
                "fixed_costs_noise_check": 0, "fixed_costs_confidence": 15,
                "fuel_cost_noise_check": 0, "fuel_cost_confidence_today": 1, "fuel_cost_confidence_final": 3,
                "electric_cost_noise_check": 0,
                "electric_cost_confidence_today": 1, "electric_cost_confidence_final": 6,
                "pellet_cost_noise_check": 0, "pellet_cost_confidence_today": 1,
                "pellet_cost_confidence_final": 11,
                "incentives_check": -1, "incentives_amount_%": 60,
                "incentives_refund_years": 15,
                "loan_check": -1, "loan_amount_%": 85,
                "loan_refund_years": 20, "loan_rate": 5,
                "time_horizon_years": 25, "min_Epsav": "", "min_Esav": 10,
                "min_NPV": 1000, "min_IRR": 3, "min_Dpayback": 30,
                "min_loss_risk": 15,
                "min_churn_rate": 20, "min_default_rate": 3, "max_Epsav": "",
                "max_Esav": 75,
                "max_NPV": 15000, "max_IRR": 17, "max_Dpayback": 11,
                "max_loss_risk": 5,
                "max_churn_rate": 5, "max_default_rate": 1, "weight_Epsav": "",
                "weight_Esav": 2, "weight_NPV": 5, "weight_IRR": 1,
                "weight_Dpayback": 7, "weight_loss_risk": 3,
                "weight_churn_rate": 1, "weight_default_rate": 4, "unit_option": "optionkwh"},
        user_id=user.id
    )
    return project


def create_cases(project):
    cases = [
        Case.objects.create(
            project_id=project.id,
            common_params={"mode": 0, "dwelling_count": 2, "floor_count": 1,
                           "country": "Italy", "city": "Roma", "building_type": "apartment",
                           "building_year": "1991-2005", "floor_area": 115,
                           "storey_position": "mid", "wall_thermal_transmittance": 0.58,
                           "roof_thermal_transmittance": 0.66,
                           "floor_thermal_transmittance": 0.7,
                           "total_surface_area_to_volume_ratio": 0.47, "wall_height": 3.15,
                           "manuel_cost_check": "", "manual_inserted_costs": "",
                           "discount_rate": 8, "churn_rate": 0, "churn_rate_95": 0,
                           "default_churn_rate": 0, "default_churn_rate_95": 0,
                           "envelope_auto_check": 0, "non_energy_benefit_weight_1": 1,
                           "non_energy_benefit_weight_2": 1, "non_energy_benefit_weight_3": 1,
                           "non_energy_benefit_weight_4": 1, "non_energy_benefit_weight_5": 1,
                           "non_energy_benefit_weight_6": 1, "non_energy_benefit_weight_7": 1,
                           "non_energy_benefit_rating_1": 1,
                           "non_energy_benefit_rating_2": 1,
                           "non_energy_benefit_rating_3": 1,
                           "non_energy_benefit_rating_4": 1,
                           "non_energy_benefit_rating_5": 1,
                           "non_energy_benefit_rating_6": 1,
                           "non_energy_benefit_rating_7": 1,
                           "end_dwelling_data": ""},
            planned_params={"heating_type": 3, "burner_type": 1, "emitter_type": 4,
                            "solar_check": 0, "solar_perc": 0, "DHW_type": 3,
                            "DHW_burner_type": 1, "DHW_solar_check": 0, "DHW_solar_perc": 0,
                            "wall_insulation_check": -1, "roof_insulation_check": -1,
                            "floor_insulation_check": -1, "wall_envelope_thermal_conductivity": 0.05,
                            "wall_thickness": 0.13, "roof_envelope_thermal_conductivity": 0.02,
                            "roof_thickness": 0.07, "floor_envelope_thermal_conductivity": 0.04,
                            "floor_thickness": 0.09, "window_flag": "",
                            "window_transmittance_value": 3.6,
                            "window_to_surface_area_ratio": 0.1},
            current_params={"heating_type": 1, "burner_type": 2, "emitter_type": 1,
                            "solar_check": 0, "solar_perc": 0, "DHW_type": 0,
                            "DHW_burner_type": 1, "DHW_solar_check": 0, "DHW_solar_perc": 0,
                            "wall_insulation_check": 0, "roof_insulation_check": 0,
                            "floor_insulation_check": 0, "wall_envelope_thermal_conductivity": 0.03,
                            "wall_thickness": 0.1, "roof_envelope_thermal_conductivity": 0.03,
                            "roof_thickness": 0.1, "floor_envelope_thermal_conductivity": 0.03,
                            "floor_thickness": 0.1, "window_flag": "",
                            "window_transmittance_value": 4.9,
                            "window_to_surface_area_ratio": 0.08}),
        Case.objects.create(
            project_id=project.id,
            common_params={"mode": 0, "dwelling_count": 5, "floor_count": 8,
                           "country": "Italy", "city": "Torino", "building_type": "multistorey",
                           "building_year": ">2005", "floor_area": 90,
                           "storey_position": "--", "wall_thermal_transmittance": 0.78,
                           "roof_thermal_transmittance": 0.84,
                           "floor_thermal_transmittance": 0.88,
                           "total_surface_area_to_volume_ratio": 0.6, "wall_height": 2.97,
                           "manuel_cost_check": "", "manual_inserted_costs": "",
                           "discount_rate": 5, "churn_rate": 0.11, "churn_rate_95": 0.05,
                           "default_churn_rate": 0.08, "default_churn_rate_95": 0.09,
                           "envelope_auto_check": 0, "non_energy_benefit_weight_1": 2,
                           "non_energy_benefit_weight_2": 4, "non_energy_benefit_weight_3": 5,
                           "non_energy_benefit_weight_4": 5, "non_energy_benefit_weight_5": 3,
                           "non_energy_benefit_weight_6": 4, "non_energy_benefit_weight_7": 7,
                           "non_energy_benefit_rating_1": 1,
                           "non_energy_benefit_rating_2": 1,
                           "non_energy_benefit_rating_3": 1,
                           "non_energy_benefit_rating_4": 1,
                           "non_energy_benefit_rating_5": 1,
                           "non_energy_benefit_rating_6": 1,
                           "non_energy_benefit_rating_7": 1,
                           "end_dwelling_data": ""},
            planned_params={"heating_type": 3, "burner_type": 1, "emitter_type": 2,
                            "solar_check": -1, "solar_perc": 0.4, "DHW_type": 2,
                            "DHW_burner_type": 1, "DHW_solar_check": -1,
                            "DHW_solar_perc": 0.4,
                            "wall_insulation_check": -1, "roof_insulation_check": -1,
                            "floor_insulation_check": -1, "wall_envelope_thermal_conductivity": 0.03,
                            "wall_thickness": 0.13, "roof_envelope_thermal_conductivity": 0.05,
                            "roof_thickness": 0.05, "floor_envelope_thermal_conductivity": 0.06,
                            "floor_thickness": 0.12, "window_flag": "",
                            "window_transmittance_value": 3.4,
                            "window_to_surface_area_ratio": 0.07},
            current_params={"heating_type": 2, "burner_type": 1, "emitter_type": 1,
                            "solar_check": 0, "solar_perc": 0, "DHW_type": 1,
                            "DHW_burner_type": 1, "DHW_solar_check": 0, "DHW_solar_perc": 0,
                            "wall_insulation_check": -1, "roof_insulation_check": 0,
                            "floor_insulation_check": 0, "wall_envelope_thermal_conductivity": 0.02,
                            "wall_thickness": 0.09, "roof_envelope_thermal_conductivity": 0.04,
                            "roof_thickness": 0.12, "floor_envelope_thermal_conductivity": 0.015,
                            "floor_thickness": 0.14, "window_flag": "",
                            "window_transmittance_value": 3.85,
                            "window_to_surface_area_ratio": 0.06}),
        Case.objects.create(
            project_id=project.id,
            common_params={"mode": 0, "dwelling_count": 6, "floor_count": 1,
                           "country": "Italy", "city": "Milano", "building_type": "detached house",
                           "building_year": "1946-1960", "floor_area": 125,
                           "storey_position": "--", "wall_thermal_transmittance": 0.7,
                           "roof_thermal_transmittance": 0.83,
                           "floor_thermal_transmittance": 0.85,
                           "total_surface_area_to_volume_ratio": 0.8, "wall_height": 3.4,
                           "manuel_cost_check": "", "manual_inserted_costs": "",
                           "discount_rate": 11, "churn_rate": 0, "churn_rate_95": 0.15,
                           "default_churn_rate": 0, "default_churn_rate_95": 0.12,
                           "envelope_auto_check": 0, "non_energy_benefit_weight_1": 6,
                           "non_energy_benefit_weight_2": 5, "non_energy_benefit_weight_3": 1,
                           "non_energy_benefit_weight_4": 7, "non_energy_benefit_weight_5": 2,
                           "non_energy_benefit_weight_6": 3, "non_energy_benefit_weight_7": 3,
                           "non_energy_benefit_rating_1": 1,
                           "non_energy_benefit_rating_2": 1,
                           "non_energy_benefit_rating_3": 1,
                           "non_energy_benefit_rating_4": 1,
                           "non_energy_benefit_rating_5": 1,
                           "non_energy_benefit_rating_6": 1,
                           "non_energy_benefit_rating_7": 1,
                           "end_dwelling_data": ""},
            planned_params={"heating_type": 2, "burner_type": 1, "emitter_type": 5,
                            "solar_check": 0, "solar_perc": 0, "DHW_type": 1,
                            "DHW_burner_type": 1, "DHW_solar_check": -1,
                            "DHW_solar_perc": 0.7,
                            "wall_insulation_check": -1, "roof_insulation_check": -1,
                            "floor_insulation_check": -1, "wall_envelope_thermal_conductivity": 0.02,
                            "wall_thickness": 0.05, "roof_envelope_thermal_conductivity": 0.06,
                            "roof_thickness": 0.07, "floor_envelope_thermal_conductivity": 0.04,
                            "floor_thickness": 0.14, "window_flag": "",
                            "window_transmittance_value": 3.5,
                            "window_to_surface_area_ratio": 0.11},
            current_params={"heating_type": 1, "burner_type": 5, "emitter_type": 1,
                            "solar_check": 0, "solar_perc": 0, "DHW_type": 1,
                            "DHW_burner_type": 1, "DHW_solar_check": -1,
                            "DHW_solar_perc": 0.4,
                            "wall_insulation_check": 0, "roof_insulation_check": -1,
                            "floor_insulation_check": 0, "wall_envelope_thermal_conductivity": 0.05,
                            "wall_thickness": 0.07, "roof_envelope_thermal_conductivity": 0.06,
                            "roof_thickness": 0.08, "floor_envelope_thermal_conductivity": 0.02,
                            "floor_thickness": 0.13, "window_flag": "",
                            "window_transmittance_value": 4.1,
                            "window_to_surface_area_ratio": 0.08})]
    return cases