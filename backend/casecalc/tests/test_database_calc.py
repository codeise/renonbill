from django.test import SimpleTestCase

from casecalc.consumi import consumi_mc, consumi_van, consumi_van_mc, generate_noise
from casecalc.core_functions import full_consumi
from casecalc.financial import get_npv_params, get_npv_per_case_params
from casecalc.fixed_costs_main import fixed_costs_main
from casecalc.non_energy_benefits import calculate_benefits
from casecalc.public_rating import project_rating_update
from casecalc.tests.data_provider import create_user, create_constants, create_project, create_cases, \
    create_project_no_variance
from casecalc.variable_costs import get_vita


def init_pub_rating():
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


class TestDatabaseCalc(SimpleTestCase):
    databases = {'default'}
    user = None
    project = None
    cases = []
    constants = None

    @classmethod
    def setUp(cls):
        cls.user = create_user()
        cls.constants = create_constants(cls.user)
        cls.project = create_project(cls.user)
        cls.project_no_variance = create_project_no_variance(cls.user)
        cls.cases = create_cases(cls.project)

    def tearDown(self) -> None:
        pass

    @classmethod
    def tearDownClass(cls):
        pass

    def atest_public_rating(self):
        report = {}
        pub_rating = init_pub_rating()
        ui_output = {}
        p, statics, vcs = get_npv_params(self.constants)
        p = {}
        vitamax = get_vita(vcs)
        matrices = {
            "matrices_van": {},
            "matrices_cash": {},
            "dpb": {},
            "pb": {}
        }
        floor_area = 0
        vita = min(self.project.params["time_horizon_years"], vitamax)
        for case in self.cases:
            p[case.id] = get_npv_per_case_params()
        outflag = 1
        for year in range(0, vitamax + 1):  # self.project["number_of_monte_carlo_runs"]
            floor_area = consumi_van(self.cases, self.constants, 0, outflag, self.project, pub_rating, report, statics,
                                     p, ui_output, vita, year, matrices)
        project_rating_update(self.project, pub_rating, ui_output, floor_area, report)

    def atest_non_energy_benefits(self):
        report = {}
        pub_rating = {}
        ui_output = {}
        benefits_output = {}
        p, statics, vcs = get_npv_params(self.constants)
        p = {}
        matrices = {
            "matrices_van": {},
            "matrices_cash": {},
            "dpb": {},
            "pb": {}
        }
        vitamax = 30
        vita = min(self.project.params["time_horizon_years"], vitamax)
        for case in self.cases:
            p[case.id] = get_npv_per_case_params()
        outflag = 1
        total_cost = full_consumi(self.project, self.cases, self.constants, vitamax, statics, p, vita, report,
                                  pub_rating, ui_output, outflag, matrices)
        totals = {
            "project_benefit": 0,
            "project_rating": 0
        }

        for case in self.cases:
            benefits_output[case.id] = {}
            calculate_benefits(case, benefits_output, total_cost, totals, report)

    def atest_costifissie(self):
        report = {}
        p, statics, vcs = get_npv_params(self.constants)
        vitamax = get_vita(vcs)
        sort_output = fixed_costs_main(self.project, self.cases, self.constants, report, None, 0, vitamax)

    def atest_consumi_van_mc(self):
        report = {}
        pub_rating = {}
        ui_output = {}
        p, statics, vcs = get_npv_params(self.constants)
        p = {}
        vitamax = get_vita(vcs)
        vita = min(self.project.params["time_horizon_years"], vitamax)
        for case in self.cases:
            p[case.id] = get_npv_per_case_params()
        outflag = 1
        mc_values = {}
        matrices = {
            "matrices_van": {},
            "matrices_cash": {},
            "dpb": {},
            "pb": {}
                    }
        nrun = self.project.params["number_of_monte_carlo_runs"]
        for irun in range(1, nrun + 1):
            mc_values[irun] = {}
            noise_matrix = generate_noise(self.cases, self.constants, self.project, vitamax, 0)
            for year in range(0, vita + 1):
                consumi_van_mc(self.cases, self.constants, irun, nrun, outflag, self.project, pub_rating, report,
                               statics,
                               p, ui_output, vita, year, vitamax, mc_values, noise_matrix, matrices)

    def atest_consumi_van(self):
        report = {}
        pub_rating = {}
        ui_output = {}
        p, statics, vcs = get_npv_params(self.constants)
        p = {}
        vitamax = get_vita(vcs)
        matrices = {
            "matrices_van": {},
            "matrices_cash": {},
            "dpb": {},
            "pb": {}
        }
        floor_area = 0
        vita = min(self.project.params["time_horizon_years"], vitamax)
        for case in self.cases:
            p[case.id] = get_npv_per_case_params()
        outflag = 1
        for year in range(0, vitamax + 1):  # self.project["number_of_monte_carlo_runs"]
            floor_area = consumi_van(self.cases, self.constants, 0, outflag, self.project, pub_rating, report, statics,
                       p, ui_output, vita, year, matrices)
        project_rating_update(self.project, pub_rating, ui_output, floor_area, report)

    def atest_consumi_mc(self):
        project = self.project_no_variance
        report = {}
        pub_rating = {}
        ui_output = {}
        p, statics, vcs = get_npv_params(self.constants)
        p = {}
        vitamax = 30
        vita = min(project.params["time_horizon_years"], vitamax)
        for case in self.cases:
            p[case.id] = get_npv_per_case_params()
        outflag = 1
        mc_values = {}
        matrices = {
            "matrices_van": {},
            "matrices_cash": {},
            "dpb": {},
            "pb": {}
        }
        nrun = project.params["number_of_monte_carlo_runs"]
        for irun in range(1, nrun + 1):  # self.project["number_of_monte_carlo_runs"]
            mc_values[irun] = {}
            consumi_mc(self.cases, self.constants, irun, nrun, outflag, project,
                       pub_rating, report, statics, p, ui_output, vita, 0, vitamax, mc_values, matrices)
            # year = 0 for MC, loop through year for VAN

    def test_costifissi(self):
        report = {}
        pub_rating = {}
        ui_output = {"t_min": {}, "t_med": {}, "hdd": {}, "rad": {}, "tday": {}}
        p, statics, vcs = get_npv_params(self.constants)
        p = {}
        matrices = {
            "matrices_van": {},
            "matrices_cash": {},
            "dpb": {},
            "pb": {}
        }
        vitamax = 30
        vita = min(self.project.params["time_horizon_years"], vitamax)
        for case in self.cases:
            p[case.id] = get_npv_per_case_params()
        outflag = 1

        full_consumi(self.project, self.cases, self.constants, vitamax, statics, p, vita, report, pub_rating, ui_output,
                     outflag, matrices)
        fixed_costs_main(self.project, self.cases, self.constants, report, None, 0, vitamax)
        self.check_output(ui_output)
        x = 1

    def check_output(self, ui_output):
        self.assertEqual(ui_output["current_heating_en_losses"], "208604")
        self.assertEqual(ui_output["current_heating_fuel_en_consumption"], "2.84e+05")
        self.assertEqual(ui_output["current_heating_electric_en_consumption"], "0")
        self.assertEqual(ui_output["current_heating_solar_en_exploitation"], "0")
        self.assertEqual(ui_output["current_heating_primary_en_consumption"], "2.84e+05")
        self.assertEqual(ui_output["current_heating_fuel_en_bill"], "17940")
        self.assertEqual(ui_output["current_heating_electric_en_bill"], "0")
        self.assertEqual(ui_output["current_heating_en_bill"], "17940")
        self.assertEqual(ui_output["current_dhw_en_losses"], "69910")
        self.assertEqual(ui_output["current_dhw_fuel_en_consumption"], "4394")
        self.assertEqual(ui_output["current_dhw_electric_en_consumption"], "73074")
        self.assertEqual(ui_output["current_dhw_solar_en_exploitation"], "4872")
        self.assertEqual(ui_output["current_dhw_primary_en_consumption"], "150541")
        self.assertEqual(ui_output["current_dhw_fuel_en_bill"], "310")
        self.assertEqual(ui_output["current_dhw_electric_en_bill"], "11180")
        self.assertEqual(ui_output["current_dhw_en_bill"], "11490")
        self.assertEqual(ui_output["details_heating_current_ewall"], "76752")
        self.assertEqual(ui_output["details_heating_current_ewin"], "69486")
        self.assertEqual(ui_output["details_heating_current_efloor"], "61653")
        self.assertEqual(ui_output["details_heating_current_eroof"], "37867")
        self.assertEqual(ui_output["details_heating_current_ev"], "70853")
        self.assertEqual(ui_output["details_heating_current_eis"], "-68270")
        self.assertEqual(ui_output["details_heating_current_eswin"], "-39737")

        self.assertEqual(ui_output["planned_heating_en_losses"], "140492")
        self.assertEqual(ui_output["planned_heating_fuel_en_consumption"], "57353")
        self.assertEqual(ui_output["planned_heating_electric_en_consumption"], "20978")
        self.assertEqual(ui_output["planned_heating_solar_en_exploitation"], "43310")
        self.assertEqual(ui_output["planned_heating_primary_en_consumption"], "99308")
        self.assertEqual(ui_output["planned_heating_fuel_en_bill"], "3325")
        self.assertEqual(ui_output["planned_heating_electric_en_bill"], "3210")
        self.assertEqual(ui_output["planned_heating_en_bill"], "6535")
        self.assertEqual(ui_output["planned_dhw_en_losses"], "69910")
        self.assertEqual(ui_output["planned_dhw_fuel_en_consumption"], "46152")
        self.assertEqual(ui_output["planned_dhw_electric_en_consumption"], "5906")
        self.assertEqual(ui_output["planned_dhw_solar_en_exploitation"], "31909")
        self.assertEqual(ui_output["planned_dhw_primary_en_consumption"], "57963")
        self.assertEqual(ui_output["planned_dhw_fuel_en_bill"], "3258")
        self.assertEqual(ui_output["planned_dhw_electric_en_bill"], "904")
        self.assertEqual(ui_output["planned_dhw_en_bill"], "4162")
        self.assertEqual(ui_output["details_heating_planned_ewall"], "62804")
        self.assertEqual(ui_output["details_heating_planned_ewin"], "73286")
        self.assertEqual(ui_output["details_heating_planned_efloor"], "18265")
        self.assertEqual(ui_output["details_heating_planned_eroof"], "28975")
        self.assertEqual(ui_output["details_heating_planned_ev"], "70853")
        self.assertEqual(ui_output["details_heating_planned_eis"], "-68270")
        self.assertEqual(ui_output["details_heating_planned_eswin"], "-45421")

        self.assertEqual(ui_output["saved_heating_en_losses"], "68113")
        self.assertEqual(ui_output["saved_heating_fuel_en_consumption"], "226535")
        self.assertEqual(ui_output["saved_heating_electric_en_consumption"], "-20978")
        self.assertEqual(ui_output["saved_heating_solar_en_exploitation"], "-43309")
        self.assertEqual(ui_output["saved_heating_primary_en_consumption"], "184580")
        self.assertEqual(ui_output["saved_heating_fuel_en_bill"], "14615")
        self.assertEqual(ui_output["saved_heating_electric_en_bill"], "-3210")
        self.assertEqual(ui_output["saved_heating_en_bill"], "11405")
        self.assertEqual(ui_output["saved_dhw_en_losses"], "0")
        self.assertEqual(ui_output["saved_dhw_fuel_en_consumption"], "-41758")
        self.assertEqual(ui_output["saved_dhw_electric_en_consumption"], "67168")
        self.assertEqual(ui_output["saved_dhw_solar_en_exploitation"], "-27037")
        self.assertEqual(ui_output["saved_dhw_primary_en_consumption"], "92578")
        self.assertEqual(ui_output["saved_dhw_fuel_en_bill"], "-2948")
        self.assertEqual(ui_output["saved_dhw_electric_en_bill"], "10277")
        self.assertEqual(ui_output["saved_dhw_en_bill"], "7329")
        self.assertEqual(ui_output["details_heating_difference_ewall"], "13948")
        self.assertEqual(ui_output["details_heating_difference_ewin"], "-3799")
        self.assertEqual(ui_output["details_heating_difference_efloor"], "43388")
        self.assertEqual(ui_output["details_heating_difference_eroof"], "8892")
        self.assertEqual(ui_output["details_heating_difference_ev"], "0")
        self.assertEqual(ui_output["details_heating_difference_eis"], "0")
        self.assertEqual(ui_output["details_heating_difference_eswin"], "5684")
        self.assertEqual(ui_output["intervention_cost"], "689154")


if __name__ == '__main__':
    TestDatabaseCalc.main()
