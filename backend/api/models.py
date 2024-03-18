from django.db import models
from django.contrib.auth.models import User


def get_default_rating_data():
    return {
        "esaved": 0,
        "erate": 0,
        "erate_cb952": 0,
        "van_mc_zero": 0,
        "exp_van": 0,
        "dex_2": 0,
        "irr": 0,
        "irr_xi": 0,
        "irr_cb_95": 0,
        "dpb_zero": 0,
        "exp_dpbp": 0,
        "dev_dpbp_2": 0,
        "neg_per_run": 0,
        "schrun_billnew": 0,
        "schrun95_billnew": 0,
        "sdeafu_billnew": 0,
        "sdeafu95_billnew": 0
    }


def get_default_report_data():
    return {
        "pub_rating": {
            "weight_values": {
                "1": 1,
                "2": 1,
                "3": 1,
                "4": 1,
                "5": 1,
                "6": 1,
                "7": 1
            },
            "min_values": {
                "1": 5,
                "2": 0,
                "3": 7,
                "4": 20,
                "5": 10,
                "6": 15,
                "7": 5
            },
            "max_values": {
                "1": 60,
                "2": 10000,
                "3": 15,
                "4": 7,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "exp_values": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "cb_values": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "rating_values": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "score_1": 0,
            "score_2": 0
        },
        "investment_values": {
            "loan_check": False,
            "loan_amount": 0,
            "loan_amount_%": 65,
            "loan_refund_years": 10,
            "loan_rate": 3,
            "bonus_check": False,
            "bonus_amount": 0,
            "bonus_amount_%": 80,
            "bonus_refund_years": 10,
            "total_cost": 0,
            "total_cost_loan": 0
        },
        "total_costifissi_values": {
            "total_current_fuel_energy": 0,
            "total_planned_fuel_energy": 0,
            "total_saved_fuel_energy": 0,
            "total_current_electric_energy": 0,
            "total_planned_electric_energy": 0,
            "total_saved_electric_energy": 0,
            "total_current_fuel_bill": 0,
            "total_planned_fuel_bill": 0,
            "total_saved_fuel_bill": 0,
            "total_current_electric_bill": 0,
            "total_planned_electric_bill": 0,
            "total_saved_electric_bill": 0,
            "total_current_energy_cons": 0,
            "total_planned_energy_cons": 0,
            "total_saved_energy_cons": 0,
            "total_current_energy_bill": 0,
            "total_planned_energy_bill": 0,
            "total_saved_energy_bill": 0,
            "total_current_heating_energy_loss": 0,
            "total_planned_heating_energy_loss": 0,
            "total_saved_heating_energy_loss": 0,
            "total_current_dhw_energy_loss": 0,
            "total_planned_dhw_energy_loss": 0,
            "total_saved_dhw_energy_loss": 0,
            "total_current_energy_loss": 0,
            "total_planned_energy_loss": 0,
            "total_saved_energy_loss": 0
        },
        "financial_values": {
            "qNPV": {},
            "LabPI": 0,
            "DPBP": 0
        },
        "benefits": {
            "project_rating": 0,
            "project_benefit": 0
        },
        "monte_carlo_values": {
            "energy_saving": {
                "value": 0,
                "conf_bound": 0,
                "value_at_risk": 0,
                "cond_value_at_risk": 0
            },
            "bill_savings": {
                "value": 0,
                "conf_bound": 0,
                "value_at_risk": 0,
                "cond_value_at_risk": 0
            },
            "intervention_cost": {
                "value": 0,
                "conf_bound": 0,
                "value_at_risk": 0,
                "cond_value_at_risk": 0
            }
        },
        "van_mc_values": {
            "qNPV": {},
            "cb+": {},
            "cb-": {},
            "npv": {
                "value": 0,
                "conf_bound": 0,
                "value_at_risk": 0,
                "cond_value_at_risk": 0
            },
            "irr": {
                "value": 0,
                "conf_bound": 0,
                "value_at_risk": 0,
                "cond_value_at_risk": 0
            },
            "dpbp": {
                "value": 0,
                "conf_bound": 0,
                "value_at_risk": 0,
                "cond_value_at_risk": 0
            }
        },
        "vita": 30
    }


class Project(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, related_name="projects", on_delete=models.PROTECT)
    params = models.JSONField()
    rating_data = models.JSONField(default=get_default_rating_data)
    report_data = models.JSONField(default=get_default_report_data)

    class Meta:
        db_table = "projects"


class Case(models.Model):
    project = models.ForeignKey(Project, related_name='cases', on_delete=models.CASCADE)
    common_params = models.JSONField()
    current_params = models.JSONField()
    planned_params = models.JSONField()

    class Meta:
        db_table = "cases"


class Constants(models.Model):
    file = models.FileField(upload_to='constants/')
    file_name = models.CharField(default="", max_length=100)
    user = models.OneToOneField(User, related_name='constants', on_delete=models.CASCADE)
    city_climate = models.JSONField(default=dict)
    thermal_data = models.JSONField(default=dict)
    envelope_windows = models.JSONField(default=dict)
    heating_dhw = models.JSONField(default=dict)
    other_thermal_data = models.JSONField(default=dict)
    variable_costs = models.JSONField(default=dict)
    default_uncertainty = models.JSONField(default=dict)
    uncertain_variables = models.JSONField(default=dict)

    class Meta:
        db_table = "constants"


class BpCase(models.Model):
    case = models.ForeignKey(Case, related_name='bp_cases', on_delete=models.CASCADE)
    year = models.IntegerField()
    renovation_count = models.IntegerField()
    government_subsidy = models.IntegerField()

    class Meta:
        db_table = "bp_cases"


class BpInvestment(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "bp_investments"


class BpProject(models.Model):
    project = models.ForeignKey(Project, related_name='bp_projects', on_delete=models.CASCADE)
    year = models.IntegerField()
    investment = models.ForeignKey(BpInvestment, related_name='bp_projects', on_delete=models.CASCADE)
    value = models.TextField()

    class Meta:
        db_table = "bp_projects"


class OcProject(models.Model):
    project = models.ForeignKey(Project, related_name='oc_projects', on_delete=models.CASCADE)
    investment = models.ForeignKey(BpInvestment, related_name='oc_projects', on_delete=models.CASCADE)
    value = models.TextField()

    class Meta:
        db_table = "oc_projects"
