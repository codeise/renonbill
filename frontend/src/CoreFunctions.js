import {calcFetch, downloadFile, fetch} from "./commonFunctions";
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import {BASE_URL} from "./environment_vars";
import {
    FinancialAnalysis_mcnpvData_default, FinancialAnalysis_mcnpvLabel_default, FinancialAnalysis_npvLabel_default,
    Project_EngineeringAnalysis_monteCarloData_default,
    ProjectRating_updateLabel_default
} from "./defaultState";
import {editProjectParams, validateRatingParams} from "./Services/Project";
import React from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

// if case_ids is null it is implied all cases of the project are taken
function fetchConsumptionData(dispatch, project_id, case_ids = null) {
    return calcFetch(dispatch, "consumption_data/", project_id, case_ids,
        "Project_Details_consumptionData").then(r => {
        // if (r.data) { TODO: max_NPV calculation function, for now this is disabled and max_NPV default val is 10000
        //     const max_npv = Math.floor(r.data.intervention_cost * 0.3 * 100 + 0.5) / 100;
        //     dispatchSetField(dispatch, "ProjectRating_params",
        //         "max_NPV", !isNaN(max_npv) ? max_npv : 0)
        // }
    })
}

function fetchMonteCarloData(dispatch, project_id, case_ids = null) {
    return calcFetch(dispatch, "monte_carlo/", project_id, case_ids,
        "Project_EngineeringAnalysis_monteCarloData")
}

function fetchNpvData(dispatch, project_id, case_ids = null) {
    const setNpvLabel = l => dispatch(keyValueUpdateAction("FinancialAnalysis_npvLabel", l))
    setNpvLabel("Running...")
    return calcFetch(dispatch, "npv/", project_id, case_ids,
        "FinancialAnalysis_npvData").then(() => setNpvLabel(FinancialAnalysis_npvLabel_default))
}

function fetchMCNpvData(dispatch, project_id, case_ids = null) {
    const setMCNpvLabel = l => dispatch(keyValueUpdateAction("FinancialAnalysis_mcnpvLabel", l))
    setMCNpvLabel("Running...")

    return calcFetch(dispatch, "mc_npv/", project_id, case_ids,
        "FinancialAnalysis_mcnpvData").then(() => setMCNpvLabel(FinancialAnalysis_mcnpvLabel_default))
}

function fetchRatingData(dispatch, project_id, case_ids = null) {
    const setUpdateLabel = l => dispatch(keyValueUpdateAction("ProjectRating_updateLabel", l))
    setUpdateLabel("Updating...")
    return calcFetch(dispatch, "rating_data/", project_id, case_ids,
        "ProjectRating_data").then(() => setUpdateLabel(ProjectRating_updateLabel_default))
}

function fetchNonEnergyData(dispatch, project_id) {
    return calcFetch(dispatch, "nonenergy_data/", project_id, null,
        "NonEnergyBenefits_outputData")
}

function fetchErvData(dispatch, url, project_id, case_id) {
    return calcFetch(dispatch, url, project_id, [case_id], "Erv_outputData")
}

function fetchReportData(dispatch, project_id) {
    return fetch(BASE_URL + 'api/report_data/', "POST", dispatch, {
        user_id: localStorage.getItem("user_id"),
        project_id: project_id,
    }).then(r => {
        dispatch(prefixUpdateAction("Report_data", r.data))
        return r
    })
}

function generateReportExcel(dispatch, project_id, headerLabel, subHeaderLabel) {
    return fetch(BASE_URL + 'api/generate_report_excel/', 'POST', dispatch,
        {
            user_id: localStorage.getItem("user_id"),
            project_id: project_id,
            headerLabel: headerLabel,
            subHeaderLabel: subHeaderLabel
        }, null, null, true)
        .then(r => downloadFile(r.data, "report.xlsx"))
}

function exportProject(dispatch, project_id, project_name) {
    return fetch(BASE_URL + 'api/export_project/' + project_id, "GET", dispatch, {
        user_id: localStorage.getItem("user_id"),
        project_id: project_id,
    }, null, null, null, true)
        .then(r => downloadFile(JSON.stringify(r.data), project_name + project_id + ".json"))
}

function resetReportData(dispatch, project_id, engineering_analysis = false) {
    return fetch(BASE_URL + 'api/reset_report_data/', "POST", dispatch, {
        user_id: localStorage.getItem("user_id"),
        project_id: project_id,
        engineering_analysis: engineering_analysis,
    })
}

function resetRatingData(dispatch, project_id) {
    return fetch(BASE_URL + 'api/reset_rating_data/', "POST", dispatch, {
        user_id: localStorage.getItem("user_id"),
        project_id: project_id,
    })
}

// EA: Engineering Analysis
function resetEA(dispatch) {
    dispatch(prefixUpdateAction("Project_EngineeringAnalysis_monteCarloData",
        Project_EngineeringAnalysis_monteCarloData_default))
}

function resetMCNPV(dispatch) {
    dispatch(prefixUpdateAction("FinancialAnalysis_mcnpvData", FinancialAnalysis_mcnpvData_default))
}

function calculate_shape(s_v_ratio, wall_height, floor_count, floor_area) {
    return ((s_v_ratio / 2 - 1 / (wall_height * floor_count)) * Math.sqrt(floor_area)).toFixed(2)
}

function calculate_volume(floor_area, floor_count, wall_height) {
    return floor_area * floor_count * wall_height
}

function constantsExist(dispatch, project_id) {
    return fetch(BASE_URL + 'api/constants_exist/' + project_id, "GET", dispatch, {
        user_id: localStorage.getItem("user_id"),
    })
}

function updateProjectRating(dispatch, project_id, params, selected_cases_ids) {
    const MySwal = withReactContent(Swal)
    const errors = validateRatingParams(params)
    if (Object.keys(errors).length === 0) {
        dispatch(keyValueUpdateAction("ProjectRating_validationErrors", {}))
        dispatch(prefixUpdateAction("ProjectRating_params", params))
        dispatch(prefixUpdateAction("FinancialAnalysis_params", params))
        editProjectParams(dispatch, project_id, params)
            .then(() => fetchRatingData(dispatch, project_id, selected_cases_ids))
    } else {
        MySwal.fire({
            title: "Validation errors!",
            html: <div>
                {
                    Object.keys(errors).map((key, index) => <p
                        key={index}>{key}: {errors[key]}</p>)
                }
            </div>
        })
        dispatch(keyValueUpdateAction("ProjectRating_validationErrors", errors))
    }
}

function downloadBpExcel(dispatch, outputData, bp_year, scheme_year, input_dict) {
    return fetch(BASE_URL + 'api/generate_bp_report/', 'POST', dispatch, {
        user_id: localStorage.getItem("user_id"),
        input: input_dict,
        output: outputData.data,
        bp_year: bp_year,
        scheme_year: scheme_year
    }, null, null, true)
        .then(r => downloadFile(r.data, "report.xlsx"))
}

export {
    fetchConsumptionData,
    fetchMonteCarloData,
    calculate_shape,
    calculate_volume,
    fetchNpvData,
    fetchMCNpvData,
    fetchRatingData,
    fetchNonEnergyData,
    fetchReportData,
    generateReportExcel,
    exportProject,
    fetchErvData,
    resetReportData,
    resetEA,
    resetMCNPV,
    resetRatingData,
    updateProjectRating,
    constantsExist,
    downloadBpExcel
}