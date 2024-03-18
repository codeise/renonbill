import _ from 'lodash'
import {_parseInputFloat, _parseInputInt} from "./commonFunctions";

function getMinMax(min, max) {
    return _parseInputFloat(min, "") + " | " + _parseInputFloat(max, "");
}

function parseRatingConfidence(confidence) {
    const float_confidence = _parseInputFloat(confidence, "")
    return float_confidence === -1000000.0 ? NaN.toString() : float_confidence
}

function extractReportData(data) {
    const vita = _parseInputInt(data["vita"], 0)
    const vitamax = _parseInputInt(data["vitamax"], 0)
    const investment_values = data["investment_values"] ?? {}
    const financial_values = data["financial_values"] ?? {}
    const pub_rating = data["pub_rating"] ?? {}
    const energy_values = data["total_costifissi_values"] ?? {}
    const mc_values = data["monte_carlo_values"] ?? {}
    const van_mc_values = data["van_mc_values"] ?? {}
    const benefits_values = data["benefits"] ?? {}
    const dwelling_values = data["dwellings"] ?? []

    //investment values
    let {
        loan_check, loan_amount, loan_refund_years, loan_rate, bonus_check, bonus_amount,
        bonus_refund_years, total_cost, total_cost_loan
    } = investment_values
    let loan_amount_p = _parseInputFloat(investment_values["loan_amount_%"], "")
    let bonus_amount_p = _parseInputFloat(investment_values["bonus_amount_%"], "")
    //project rating values
    let [weight1, weight2, weight3, weight4, weight5, weight6, weight7] = (Object.values(pub_rating["weight_values"] ?? {}) ?? [])
    let [min1, min2, min3, min4, min5, min6, min7] = (Object.values(pub_rating["min_values"] ?? {}) ?? [])
    let [max1, max2, max3, max4, max5, max6, max7] = (Object.values(pub_rating["max_values"] ?? {}) ?? [])
    let [exp1, exp2, exp3, exp4, exp5, exp6, exp7] = (Object.values(pub_rating["exp_values"] ?? {}) ?? [])
    let [cb1, cb2, cb3, cb4, cb5, cb6, cb7] = (Object.values(pub_rating["cb_values"] ?? {}) ?? [])
    let [rating1, rating2, rating3, rating4, rating5, rating6, rating7] = (Object.values(pub_rating["rating_values"] ?? {}) ?? [])
    const {score_1, score_2} = pub_rating

    //financial values
    const npv = exp2
    const irr = exp3
    let lab_pi = financial_values["LabPI"]
    let dpbp = financial_values["DPBP"]

    if (loan_check !== undefined && !loan_check) {
        loan_amount = ""
        loan_refund_years = ""
        loan_rate = ""
    }

    if (bonus_check !== undefined && !bonus_check) {
        bonus_amount = ""
        bonus_refund_years = ""
    }
    const qnpv = (financial_values ?? {})["qNPV"] ?? {}
    const mc_qnpv = (van_mc_values ?? {})["qNPV"] ?? {}
    const cbplus = (van_mc_values ?? {})["cb+"] ?? {}
    const cbminus = (van_mc_values ?? {})["cb-"] ?? {}

    //energy values
    const {
        total_current_fuel_energy,
        total_planned_fuel_energy,
        total_saved_fuel_energy,
        total_current_electric_energy,
        total_planned_electric_energy,
        total_saved_electric_energy,
        total_current_fuel_bill,
        total_planned_fuel_bill,
        total_saved_fuel_bill,
        total_current_electric_bill,
        total_planned_electric_bill,
        total_saved_electric_bill,
        total_current_energy_cons,
        total_planned_energy_cons,
        total_saved_energy_cons,
        total_current_energy_bill,
        total_planned_energy_bill,
        total_saved_energy_bill,
        total_current_heating_energy_loss,
        total_planned_heating_energy_loss,
        total_saved_heating_energy_loss,
        total_current_dhw_energy_loss,
        total_planned_dhw_energy_loss,
        total_saved_dhw_energy_loss,
        total_current_energy_loss,
        total_planned_energy_loss,
        total_saved_energy_loss
    } = energy_values

    //monte carlo values
    const energy_saving = mc_values["energy_saving"] ?? {}
    const bill_savings = mc_values["bill_savings"] ?? {}
    const intervention_cost = mc_values["intervention_cost"] ?? {}
    const van_npv = van_mc_values["npv"] ?? {}
    const van_irr = van_mc_values["irr"] ?? {}
    const van_dpbp = van_mc_values["dpbp"] ?? {}
    //non energy benefits values
    const {project_rating, project_benefit} = benefits_values

    const investment_data = [
        {
            columnName: "Intervention Costs",
            amount: _parseInputFloat(total_cost, ""),
            amountPerc: "",
            refundTime: "",
            rate: "",
        },
        {
            columnName: "Loan",
            amount: _parseInputFloat(loan_amount, ""),
            amountPerc: _parseInputFloat(loan_amount_p, ""),
            refundTime: _parseInputFloat(loan_refund_years, ""),
            rate: _parseInputFloat(loan_rate, ""),
        },
        {
            columnName: "Tax Incentive",
            amount: _parseInputFloat(bonus_amount, ""),
            amountPerc: _parseInputFloat(bonus_amount_p, ""),
            refundTime: _parseInputFloat(bonus_refund_years, ""),
            rate: "",
        },
        {
            columnName: "Initial Investment",
            amount: _parseInputFloat(total_cost_loan, ""),
            amountPerc: "",
            refundTime: "",
            rate: "",
        },

    ]
    const financial_analysis_data = [
        {
            timeHorizon: _parseInputFloat(vita, ""),
            InitInvestment: _parseInputFloat(total_cost_loan, ""),
            npv: _parseInputFloat(npv, ""),
            irr: _parseInputFloat(irr, ""),
            pi: _parseInputFloat(lab_pi, ""),
            dpb: _parseInputFloat(dpbp, ""),
        },
    ]
    const project_rating_data = [
        {
            columnName: "Energy Savings, %",
            weights: _parseInputFloat(weight1, ""),
            minMax: getMinMax(min1, max1),
            values: _parseInputFloat(exp1, ""),
            confidence: parseRatingConfidence(cb1),
            ratings: _parseInputFloat(rating1, ""),
        },
        {
            columnName: "NPV, €",
            weights: _parseInputFloat(weight2, ""),
            minMax: getMinMax(min2, max2),
            values: _parseInputFloat(exp2, ""),
            confidence: parseRatingConfidence(cb2),
            ratings: _parseInputFloat(rating2, ""),
        },
        {
            columnName: "IRR, %",
            weights: _parseInputFloat(weight3, ""),
            minMax: getMinMax(min3, max3),
            values: _parseInputFloat(exp3, ""),
            confidence: parseRatingConfidence(cb3),
            ratings: _parseInputFloat(rating3, ""),
        },
        {
            columnName: "Disc. PayBack, yrs.",
            weights: _parseInputFloat(weight4, ""),
            minMax: getMinMax(min4, max4),
            values: _parseInputFloat(exp4, ""),
            confidence: parseRatingConfidence(cb4),
            ratings: _parseInputFloat(rating4, ""),
        },
        {
            columnName: "Loss Risk, %",
            weights: _parseInputFloat(weight5, ""),
            minMax: getMinMax(min5, max5),
            values: _parseInputFloat(exp5, ""),
            confidence: parseRatingConfidence(cb5),
            ratings: _parseInputFloat(rating5, ""),
        },
        {
            columnName: "Churn Rate, %",
            weights: _parseInputFloat(weight6, ""),
            minMax: getMinMax(min6, max6),
            values: _parseInputFloat(exp6, ""),
            confidence: parseRatingConfidence(cb6),
            ratings: _parseInputFloat(rating6, ""),
        },
        {
            columnName: "Default Rate, %",
            weights: _parseInputFloat(weight7, ""),
            minMax: getMinMax(min7, max7),
            values: _parseInputFloat(exp7, ""),
            confidence: parseRatingConfidence(cb7),
            ratings: _parseInputFloat(rating7, ""),
        },
        {
            columnName: "Score #1",
            ratings: _parseInputFloat(score_1, ""),
        },
        {
            columnName: "Score #2",
            ratings: _parseInputFloat(score_2, ""),
        },
    ]
    const energy_analysis_data = [
        {
            columnName: "current",
            fuelCons: _parseInputFloat(total_current_fuel_energy, ""),
            electricCons: _parseInputFloat(total_current_electric_energy, ""),
            fuelBill: _parseInputFloat(total_current_fuel_bill, ""),
            electricBill: _parseInputFloat(total_current_electric_bill, ""),
            consumption: _parseInputFloat(total_current_energy_cons, ""),
            bill: _parseInputFloat(total_current_energy_bill, ""),
        },
        {
            columnName: "planned",
            fuelCons: _parseInputFloat(total_planned_fuel_energy, ""),
            electricCons: _parseInputFloat(total_planned_electric_energy, ""),
            fuelBill: _parseInputFloat(total_planned_fuel_bill, ""),
            electricBill: _parseInputFloat(total_planned_electric_bill, ""),
            consumption: _parseInputFloat(total_planned_energy_cons, ""),
            bill: _parseInputFloat(total_planned_energy_bill, ""),
        },
        {
            columnName: "savings",
            fuelCons: _parseInputFloat(total_saved_fuel_energy, ""),
            electricCons: _parseInputFloat(total_saved_electric_energy, ""),
            fuelBill: _parseInputFloat(total_saved_fuel_bill, ""),
            electricBill: _parseInputFloat(total_saved_electric_bill, ""),
            consumption: _parseInputFloat(total_saved_energy_cons, ""),
            bill: _parseInputFloat(total_saved_energy_bill, ""),
        },
    ]
    const energy_losses_data = [
        {
            columnName: "current",
            heatingLosses: _parseInputFloat(total_current_heating_energy_loss, ""),
            dhwLosses: _parseInputFloat(total_current_dhw_energy_loss, ""),
            energyLosses: _parseInputFloat(total_current_energy_loss, ""),
        },
        {
            columnName: "planned",
            heatingLosses: _parseInputFloat(total_planned_heating_energy_loss, ""),
            dhwLosses: _parseInputFloat(total_planned_dhw_energy_loss, ""),
            energyLosses: _parseInputFloat(total_planned_energy_loss, ""),
        },
        {
            columnName: "savings",
            heatingLosses: _parseInputFloat(total_saved_heating_energy_loss, ""),
            dhwLosses: _parseInputFloat(total_saved_dhw_energy_loss, ""),
            energyLosses: _parseInputFloat(total_saved_energy_loss, ""),
        },
    ]
    const monte_carlo_data = [
        {
            columnName: "value",
            energySavings: _parseInputFloat(energy_saving["value"], ""),
            billSavings: _parseInputFloat(bill_savings["value"], ""),
            interventionCosts: _parseInputFloat(intervention_cost["value"], ""),
            npv: _parseInputFloat(van_npv["value"], ""),
            irr: _parseInputFloat(van_irr["value"], ""),
            dpbp: _parseInputFloat(van_dpbp["value"], ""),
        },
        {
            columnName: "99 % confidence bounds",
            energySavings: _parseInputFloat(energy_saving["conf_bound"], ""),
            billSavings: _parseInputFloat(bill_savings["conf_bound"], ""),
            interventionCosts: _parseInputFloat(intervention_cost["conf_bound"], ""),
            npv: _parseInputFloat(van_npv["conf_bound"], ""),
            irr: _parseInputFloat(van_irr["conf_bound"], ""),
            dpbp: _parseInputFloat(van_dpbp["conf_bound"], ""),
        },
        {
            columnName: "Value at Risk",
            energySavings: _parseInputFloat(energy_saving["value_at_risk"], ""),
            billSavings: _parseInputFloat(bill_savings["value_at_risk"], ""),
            interventionCosts: _parseInputFloat(intervention_cost["value_at_risk"], ""),
            npv: _parseInputFloat(van_npv["value_at_risk"], ""),
            irr: _parseInputFloat(van_irr["value_at_risk"], ""),
            dpbp: _parseInputFloat(van_dpbp["value_at_risk"], ""),
        },
        {
            columnName: " Conditional Value at Risk",
            energySavings: _parseInputFloat(energy_saving["cond_value_at_risk"], ""),
            billSavings: _parseInputFloat(bill_savings["cond_value_at_risk"], ""),
            interventionCosts: _parseInputFloat(intervention_cost["cond_value_at_risk"], ""),
            npv: _parseInputFloat(van_npv["cond_value_at_risk"], ""),
            irr: _parseInputFloat(van_irr["cond_value_at_risk"], ""),
            dpbp: _parseInputFloat(van_dpbp["cond_value_at_risk"], ""),
        },
    ]
    const non_energy_benefits_data = [
        {
            score: _parseInputFloat(project_rating, ""),
            benefits: _parseInputFloat(project_benefit, ""),
        },
    ]
    const dwelling_data = dwelling_values.map(c => {
        const cp = c.common_params
        return {
            indices: "#" + c.id,
            numOfDwellings: cp.dwelling_count,
            nFloors: cp.floor_count,
            country: cp.country,
            city: cp.city,
            building: cp.building_type,
            age: cp.building_year,
            plantArea: cp.floor_area,
            costs: cp.total_case_cost,
            investment: cp.cost_loan_bonus,
            npv: cp.qvan,
            npvm2: cp.qvan_m2,
            irr: cp.qirr,
            irrDrate: cp.qirr_discount,
            drate: cp.discount_rate,
            pi: cp.quick_pi,
            dpbp: cp.qpb,
        }
    })
    const zero_to_vita = _.range(0, vita + 1)
    const npv_table_data = zero_to_vita.map(year => {
        return {
            year: year,
            npv: _parseInputFloat(qnpv[year], 0),
            mc_npv: _parseInputFloat(mc_qnpv[year], 0),
            cbPlus: _parseInputFloat(cbplus[year], 0),
            cbMinus: _parseInputFloat(cbminus[year], 0),
        }
    })

    const npv_graph_data = zero_to_vita.map(year => {
        return {
            x: year,
            y: _parseInputFloat(qnpv[year], 0),
        }
    })

    const mc_npv_graph_data = zero_to_vita.map(year => {
        return {
            x: year,
            y: _parseInputFloat(mc_qnpv[year], 0)
        }
    })

    return {
        investment_data,
        financial_analysis_data,
        project_rating_data,
        energy_analysis_data,
        energy_losses_data,
        monte_carlo_data,
        non_energy_benefits_data,
        dwelling_data,
        npv_table_data,
        npv_graph_data,
        mc_npv_graph_data,
        vitamax,
    }
}

export {extractReportData}