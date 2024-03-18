const Project_EquipmentSetup_heating_default = {
    heating_type: 1,
    burner_type: 1,
    emitter_type: 1,
    solar_check: false,
    solar_perc: 0,
}

const Project_EquipmentSetup_dhw_default = {
    DHW_type: 0,
    DHW_burner_type: 1,
    DHW_solar_check: false,
    DHW_solar_perc: 0,
};

const Project_EquipmentSetup_envelope_default_default = false

const Project_EquipmentSetup_envelope_default = {
    wall_insulation_check: false,
    roof_insulation_check: false,
    floor_insulation_check: false,
    wall_thickness: 0.1,
    roof_thickness: 0.1,
    floor_thickness: 0.1,
    wall_envelope_thermal_conductivity: 0.03,
    roof_envelope_thermal_conductivity: 0.03,
    floor_envelope_thermal_conductivity: 0.03,
    window_transmittance_value: 3, // Envelope properties
    window_to_surface_area_ratio: 0.1, // Envelope properties
}

const Erv_params_default = {
    obf1_avg_calc_years: 20,
    obf2_avg_calc_years: 20,
    obr1_avg_calc_years: 20,
    obr2_avg_calc_years: 20,

    obf1_tenure: 10,
    obf2_tenure: 10,
    obr1_tenure: 10,
    obr2_tenure: 10,

    obf1_utility_WACC: 7,
    obf2_utility_WACC: 7,

    obf2_golden_rule: 10,
    obr2_golden_rule: 10,

    obf1_onBill_amount: 50,
    obf2_onBill_amount: 50,
    obr1_onBill_amount: 50,
    obr2_onBill_amount: 50,

    obr1_utility_margin: 3,
    obr2_utility_margin: 3,

    obr2_bank_rate: 7,
    obr1_bank_rate: 7,

    obr1_invest_repayment: 250,
    obr2_invest_repayment: 250,
}

const default_case_common_params = {
    churn_rate: 0,
    default_churn_rate: 0,
    churn_rate_95: 0,
    default_churn_rate_95: 0,
    ...Erv_params_default,
}

const business_renovation_data = {
    on_bill_component: 0,
    on_bill_scheme: 1,
    energy_savings: 0,
}

const Project_EditCase_temporaryCase_default = {
    country: "",
    city: "",
    building_type: "",
    floor_count: 1,
    dwelling_count: 1,
    storey_position: "mid",
    building_year: "",
    floor_area: 100,
    thermal_transmittance_check: false,
    discount_rate: 0,
    shape: null,
    volume: null,
    ...default_case_common_params,
    ...business_renovation_data,
}

const NonEnergyBenefits_params_default = {
    non_energy_benefit_weight_1: 1,
    non_energy_benefit_weight_2: 1,
    non_energy_benefit_weight_3: 1,
    non_energy_benefit_weight_4: 1,
    non_energy_benefit_weight_5: 1,
    non_energy_benefit_weight_6: 1,
    non_energy_benefit_weight_7: 1,
    non_energy_benefit_rating_1: 0.5,
    non_energy_benefit_rating_2: 0.5,
    non_energy_benefit_rating_3: 0.5,
    non_energy_benefit_rating_4: 0.5,
    non_energy_benefit_rating_5: 0.5,
    non_energy_benefit_rating_6: 0.5,
    non_energy_benefit_rating_7: 0.5,
}

const NonEnergyBenefits_outputData_default = {
    project_score: '',
    lab_total_investment: '',
    lab_total_benefit: ''
}

const MonteCarlo_default = {
    uncertainty_advanced_flag: 0,

    //simplified
    geometry_noise_check: true,
    geometry_confidence: 10,
    thermal_prop_noise_check: false,
    thermal_prop_confidence: 10,
    efficiencies_noise_check: true,
    efficiencies_confidence: 5,
    simplified_DHW_load_noise_check: false,
    simplified_DHW_load_confidence: 10,
    environment_noise_check: true,
    environment_confidence: 20,
    investment_noise_check: false,
    investment_confidence: 10,
    energy_cost_noise_check: false,
    energy_cost_confidence_today: 1,
    energy_cost_confidence_final: 10,
    noise_flag: 1, //1, 2 or 3
    confidence_level: 95, // 95
    //advanced
    //geometry
    Sfloor_noise_check: true,
    Sfloor_confidence: 10,
    sd_vol_ratio_noise_check: false,
    sd_vol_ratio_confidence: 10,
    wall_height_noise_check: true,
    wall_height_confidence: 5,
    window_floor_ratio_noise_check: false,
    window_floor_ratio_confidence: 5,
    //thermal
    Uwall_noise_check: true,
    Uwall_confidence: 20,
    Uroof_noise_check: false,
    Uroof_confidence: 20,
    Ufloor_noise_check: false,
    Ufloor_confidence: 20,
    Uwindows_noise_check: false,
    Uwindows_confidence: 20,
    sun_factor_noise_check: false,
    sun_factor_confidence: 10,
    alfa_plaster_noise_check: false,
    alfa_plaster_confidence: 15,
    //external
    HDD_noise_check: false,
    HDD_confidence: 20,
    solar_RAD_noise_check: false,
    solar_RAD_confidence: 10,
    heating_days_noise_check: false,
    heating_days_confidence: 5,
    he_conv_noise_check: false,
    he_conv_confidence: 10,
    air_change_noise_check: false,
    air_change_confidence: 20,
    shadow_noise_check: false,
    shadow_confidence: 20,
    //ext. insulation
    wall_thermal_conductivity_noise_check: false,
    wall_thermal_conductivity_confidence: 5,
    wall_thickness_noise_check: false,
    wall_thickness_confidence: 5,
    roof_thermal_conductivity_noise_check: false,
    roof_thermal_conductivity_confidence: 5,
    roof_thickness_noise_check: false,
    roof_thickness_confidence: 5,
    floor_thermal_conductivity_noise_check: false,
    floor_thermal_conductivity_confidence: 5,
    floor_thickness_noise_check: false,
    floor_thickness_confidence: 5,
    //dhw
    DHW_electric_boiler_eff_noise_check: false,
    DHW_electric_boiler_eff_confidence: 5,
    advanced_DHW_load_noise_check: false,
    advanced_DHW_load_confidence: 5,
    DHW_burner_eff_noise_check: true,
    DHW_burner_eff_confidence: 5,
    DHW_solar_fraction_noise_check: false,
    DHW_solar_fraction_confidence: 10,
    DHW_heat_pump_COP_noise_check: false,
    DHW_heat_pump_COP_confidence: 15,
    //costs
    fixed_costs_noise_check: false,
    fixed_costs_confidence: 10,
    discount_rate_noise_check: false,
    discount_rate_confidence: 10,
    fuel_cost_noise_check: false,
    fuel_cost_confidence_today: 1,
    fuel_cost_confidence_final: 20,
    electric_cost_noise_check: false,
    electric_cost_confidence_today: 1,
    electric_cost_confidence_final: 20,
    pellet_cost_noise_check: false,
    pellet_cost_confidence_today: 1,
    pellet_cost_confidence_final: 20,
    //heating
    heating_burner_eff_noise_check: true,
    heating_burner_eff_confidence: 5,
    regulation_eff_noise_check: false,
    regulation_eff_confidence: 5,
    heating_pellet_eff_noise_check: false,
    heating_pellet_eff_confidence: 5,
    distribution_eff_noise_check: false,
    distribution_eff_confidence: 5,
    heating_heat_pump_COP_noise_check: false,
    heating_heat_pump_COP_confidence: 15,
    emission_eff_noise_check: false,
    emission_eff_confidence: 5,
    heating_solar_fraction_noise_check: false,
    heating_solar_fraction_confidence: 10,
}

const default_project_rating_params = {
    min_Esav: 5,
    min_NPV: 0,
    max_NPV: 10000,
    min_IRR: 7,
    min_Dpayback: 20,
    min_loss_risk: 10,
    min_churn_rate: 10,
    min_default_rate: 5,
    max_Esav: 60,
    max_IRR: 15,
    max_Dpayback: 5,
    max_loss_risk: 0,
    max_churn_rate: 1,
    max_default_rate: 0,
    weight_Esav: 1,
    weight_NPV: 1,
    weight_IRR: 1,
    weight_Dpayback: 1,
    weight_loss_risk: 1,
    weight_churn_rate: 1,
    weight_default_rate: 1
}
const BusinessPlan_years_default = 6;
const default_project_params = {
    loan_rate: 3,
    loan_check: false,
    unit_option: "optionkwh",
    "loan_amount_%": 80,
    incentives_check: false,
    loan_refund_years: 10,
    "incentives_amount_%": 65,
    incentives_refund_years: 10,
    min_Epsav: "",
    max_Epsav: "",
    number_of_monte_carlo_runs: 100,
    time_horizon_years: 20,
    weight_Epsav: "",
    ...default_project_rating_params,
    ...MonteCarlo_default,
    bp_year: BusinessPlan_years_default
};



const Erv_outputData_default = {
    obf1_bill_savings: "",
    obf2_bill_savings: "",
    obf2_max_onBill: "",
    obr1_amount_util: "",
    obr1_amount_bank: "",
    obr1_bill_savings: "",
    obr2_amount_util: "",
    obr2_amount_bank: "",
    obr2_bill_savings: "",
    obr2_max_onBill: "",
}

const Project_EngineeringAnalysis_monteCarloLabel = "Run Monte Carlo Analysis"
const FinancialAnalysis_npvLabel_default = "Run"
const FinancialAnalysis_mcnpvLabel_default = "Run"
const ProjectRating_updateLabel_default = "Update"
const NonEnergyBenefits_updateLabel_default = "Update"
const Erv_calculateLabel_default = "Calculate"
const FinancialAnalysis_mcnpvData_default = {
    green_graph: [],
    blue_graph: [],
    red_graph: [],
    bar_graph: [],
    print_values: {
        y_max: "",
        y_min: "",
        nrun: "",
        lab_mc_van: "",
        lab_van_cb95: "",
        lab_mc_irr: "",
        lab_irr_cb95: "",
        lab_mc_pi: "",
        lab_pi_cb95: "",
        lab_mc_pbp: "",
        lab_pbp_cb05: "",
        lab_mc_dpbp: "",
        lab_dpbp_cb05: "",
        lab_npv_var_bp: "",
        lab_npv_var: "",
        lab_npv_cvar_bp: "",
        lab_npv_cvar: "",
        lab_irr_var_bp: "",
        lab_irr_var: "",
        lab_irr_cvar_bp: "",
        lab_irr_cvar: "",
        lab_pbp_var_bp: "",
        lab_pbp_var: "",
        lab_pbp_cvar_bp: "",
        lab_pbp_cvar: "",
        lab_loss: "",
        lab_cond_loss: ""
    }
}

const Project_EngineeringAnalysis_monteCarloData_default = {
    print_values: {
        current: {},
        planned: {},
        savings: {},
    },
    graph_values: {
        current: {},
        planned: {},
        savings: {},
    },
};

const defaultState = {
    refreshTokensFailed: false,
    Home_Projects_projects: {
        data: [],
        isLoading: false,
        isError: false
    },
    Home_Users_users: {
        data: [],
        isLoading: false,
        isError: false
    },
    current_user: null,
    Home_Users_constants: null,
    Home_Users_constants_file_name: "",
    Project_params: default_project_params,
    Project_country: null,
    Project_CasesTable_cases: {
        data: [],
        isLoading: false,
        isError: false,
        selectedCount: 0,
        selected: []
    },
    Project_CasesTable_disabled: false,
    Project_EditCase_caseInfoConstants: {
        data: [],
        isLoading: false,
        isError: false
    },
    Project_EditCase_discountRateConstants: {
        data: [],
        isLoading: false,
        isError: false
    },
    ProjectRating_updateLabel: ProjectRating_updateLabel_default,
    ProjectRating_data: {},
    ProjectRating_params: {},
    NonEnergyBenefits_CasesTable_cases: {
        data: [],
        isLoading: false,
        isError: false,
        selectedCount: 0,
        selected: []
    },
    NonEnergyBenefits_CasesTable_disabled: false,
    NonEnergyBenefits_params: NonEnergyBenefits_params_default,
    NonEnergyBenefits_outputData: NonEnergyBenefits_outputData_default,
    NonEnergyBenefits_updateLabel: NonEnergyBenefits_updateLabel_default,
    Header_showMonteCarloSetup: false,
    MonteCarlo_previous: MonteCarlo_default,
    MonteCarlo_current: MonteCarlo_default,
    FinancialAnalysis_npvData: {
        npv_vector: [],
        Labvan: 0,
        Labelinvest: 0,
        LabIRR: 0.00,
        LabPI: 0.00,
        Labvan_max: 0,
        Labvan_min: 0,
        pb_zero: 0.0,
        dpb_zero: 0.0
    },
    FinancialAnalysis_mcnpvData: FinancialAnalysis_mcnpvData_default,
    FinancialAnalysis_params: {},
    FinancialAnalysis_npvLabel: FinancialAnalysis_npvLabel_default,
    FinancialAnalysis_mcnpvLabel: FinancialAnalysis_mcnpvLabel_default,
    Project_EditCase_temporaryCase: Project_EditCase_temporaryCase_default,
    Project_EditCase_validationErrors: {},
    Project_EquipmentSetup_heating_current: Project_EquipmentSetup_heating_default,
    Project_EquipmentSetup_heating_planned: Project_EquipmentSetup_heating_default,
    Project_EquipmentSetup_dhw_current: Project_EquipmentSetup_dhw_default,
    Project_EquipmentSetup_dhw_planned: Project_EquipmentSetup_dhw_default,
    Project_EquipmentSetup_envelope_default: Project_EquipmentSetup_envelope_default_default,
    Project_EquipmentSetup_envelope_current: Project_EquipmentSetup_envelope_default,
    Project_EquipmentSetup_envelope_planned: Project_EquipmentSetup_envelope_default,
    Project_Details_consumptionData: {},
    Project_EngineeringAnalysis_monteCarloData: Project_EngineeringAnalysis_monteCarloData_default,
    Project_EngineeringAnalysis_type: "savings",
    Project_EngineeringAnalysis_monteCarloLabel: Project_EngineeringAnalysis_monteCarloLabel,
    Erv_params: Erv_params_default,
    Erv_outputData: Erv_outputData_default,
    Erv_calculateLabel1: Erv_calculateLabel_default,
    Erv_calculateLabel2: Erv_calculateLabel_default,
    Erv_calculateLabel3: Erv_calculateLabel_default,
    Erv_calculateLabel4: Erv_calculateLabel_default,
    Erv_CasesTable_cases: {
        data: [],
        isLoading: false,
        isError: false,
        selectedCount: 0,
        selected: []
    },
    Erv_CasesTable_disabled: false,
    Report_data: {},
    Report_headerLabel: "Ren On Bill Feasibility Report",
    Report_subHeaderLabel: "AlterFlex Energy Ltd",
    BusinessPlan_CasesTable_cases: {
        data: [],
        isLoading: false,
        isError: false,
        selectedCount: 0,
        selected: []
    },
    BusinessPlan_nrGsValues: [],
    BusinessPlan_investmentsValues: [],
    BusinessPlan_operationalCostsValues: [],
    BusinessPlan_operationalCostsRows: [],
    BusinessPlan_percentageFinanced: 0,
    BusinessPlan_financingRate: 0,
    BusinessPlan_financingDuration: 1,
    BusinessPlan_bp_year: 0,
    BusinessPlan_investmentsID: 1,
    BusinessPlan_ocID: 1,
    BusinessPlan_outputData: {
        data: {},
        isLoading: false,
        isError: false
    },
    BusinessPlan_searchedInvestmentsResult:{
        data: [],
        isLoading: false,
        isError: false
    },
    BusinessPlan_calculationInProgress: false,
}

const default_case_current_params = {
    ...Project_EquipmentSetup_heating_default,
    ...Project_EquipmentSetup_dhw_default,
    ...Project_EquipmentSetup_envelope_default_default,
    ...Project_EquipmentSetup_envelope_default,
}

const default_case_planned_params = {
    ...Project_EquipmentSetup_heating_default,
    ...Project_EquipmentSetup_dhw_default,
    ...Project_EquipmentSetup_envelope_default_default,
    ...Project_EquipmentSetup_envelope_default
}

const default_case_fixed_costs = {}

export {
    Project_EquipmentSetup_heating_default,
    Project_EquipmentSetup_dhw_default,
    Project_EquipmentSetup_envelope_default_default,
    Project_EquipmentSetup_envelope_default,
    Project_EditCase_temporaryCase_default,
    MonteCarlo_default,
    Project_EngineeringAnalysis_monteCarloLabel,
    FinancialAnalysis_npvLabel_default,
    FinancialAnalysis_mcnpvLabel_default,
    ProjectRating_updateLabel_default,
    defaultState,
    default_case_common_params,
    default_case_current_params,
    default_case_planned_params,
    default_case_fixed_costs,
    default_project_params,
    default_project_rating_params,
    NonEnergyBenefits_params_default,
    NonEnergyBenefits_outputData_default,
    NonEnergyBenefits_updateLabel_default,
    Erv_params_default,
    Erv_outputData_default,
    Erv_calculateLabel_default,
    FinancialAnalysis_mcnpvData_default,
    Project_EngineeringAnalysis_monteCarloData_default,
    BusinessPlan_years_default,
}