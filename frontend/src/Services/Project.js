import {fetch} from "../commonFunctions";
import {BASE_URL} from "../environment_vars";
import React from "react";

function editProjectParams(dispatch, project_id, params) {
    return fetch(BASE_URL + 'api/project_params/' + project_id, "PUT", dispatch, {params: params})
}

function deleteProject(dispatch, id) {
    return fetch(BASE_URL + 'api/projects/' + id, "DELETE", dispatch)
}

function validateRatingParams(params) {
    let errors = {};

    const validate_min = (key_min, key_max, fn, text) => {
        if (!fn(params[key_min], params[key_max]) && errors[key_min] === undefined
            && errors[key_max] === undefined) {
            errors[key_min] = text
        }
    }

    validate_min("min_Esav", "max_Esav", (min, max) => min < max, "must be less than max")
    validate_min("min_NPV", "max_NPV", (min, max) => min < max, "must be less than max")
    validate_min("min_IRR", "max_IRR", (min, max) => min < max, "must be less than max")
    validate_min("min_Dpayback", "max_Dpayback", (min, max) => min > max, "must be greater than max")
    validate_min("min_loss_risk", "max_loss_risk", (min, max) => min > max, "must be greater than max")
    validate_min("min_churn_rate", "max_churn_rate", (min, max) => min > max, "must be greater than max")
    validate_min("min_default_rate", "max_default_rate", (min, max) => min > max, "must be greater than max")

    return errors
}

function fetchDbInvestmentValues(dispatch, project_id) {
    return fetch(BASE_URL + 'api/bp_project_data/' + project_id, "GET",
        dispatch, {user_id: localStorage.getItem('user_id')})
}

function fetchOcValues(dispatch, project_id) {
    return fetch(BASE_URL + 'api/oc_values/' + project_id, "GET",
        dispatch, {user_id: localStorage.getItem('user_id')})
}

function fetchDefaultOcValues(dispatch, project_id) {
    return fetch(BASE_URL + 'api/oc_default_values/' + project_id, "GET",
        dispatch, {user_id: localStorage.getItem('user_id')})
}

export {
    editProjectParams, deleteProject, validateRatingParams, fetchDbInvestmentValues, fetchOcValues, fetchDefaultOcValues
}