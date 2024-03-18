import axios from "axios";
import {prefixUpdateAction, keyValueUpdateAction} from "./actions"
import _ from "lodash";
import {BASE_URL} from "./environment_vars";

const UNAUTHORIZED_STATUS_CODE = 490

function getNewTokens(username, password) {
    return axios.post(BASE_URL + 'api/token/', {"username": username, "password": password},
        {headers: {'Accept': 'application/json; indent=4'}})
}

function getRefreshedTokens() {
    let refresh_token = localStorage.getItem("refresh_token")
    if (refresh_token) {
        return axios.post(BASE_URL + 'api/token/refresh/', {"refresh": refresh_token},
            {headers: {'Accept': 'application/json; indent=4'}})
    } else {
        return Promise.resolve({
            failed: true
        })
    }
}

function login(name, password) {
    return getNewTokens(name, password).then(r => {
        localStorage.setItem("access_token", r.data["access"])
        localStorage.setItem("refresh_token", r.data["refresh"])
        return {...r.data}
    })
}

function register_user(username, email, password, confirm_password) {
    return axios.post(BASE_URL + 'api/register_user/', {username, email, password, confirm_password})
}

function fetch(url, method, dispatch, data = null, prefix = null, preReducerCallback = null, blob = false) {
    let access_token = localStorage.getItem("access_token");
    if (!access_token) {
        access_token = ""
    }

    if (dispatch && prefix) dispatch(prefixUpdateAction(prefix, {isLoading: true}))

    const fetchHelper = (access_token) => {
        if (!localStorage.getItem("user_id")) {
            dispatch(keyValueUpdateAction("refreshTokensFailed", true))
            return Promise.reject()
        }

        return axios({
            method: method,
            url: url,
            data: data ? data : [],
            responseType: blob ? 'blob' : 'json',
            headers: {
                'Accept': 'application/json; indent=4',
                'Authorization': 'Bearer ' + access_token
            }
        }).then(result => {
            if (dispatch && prefix)
                dispatch(prefixUpdateAction(prefix, {
                    data: preReducerCallback ? preReducerCallback(result.data) : result.data,
                    isError: false,
                }))
            return result
        })
            .catch(error => {
                        if (error.response.status === UNAUTHORIZED_STATUS_CODE) {
                        return getRefreshedTokens().then(r => {
                            if (!r.failed) {
                                localStorage.setItem("access_token", r.data["access"])
                                localStorage.setItem("refresh_token", r.data["refresh"])
                                return fetchHelper(r.data["access"])
                            } else {
                                dispatch(keyValueUpdateAction("refreshTokensFailed", true))
                                return Promise.reject()
                            }
                        })
                    } else if (dispatch && prefix) {
                        dispatch(prefixUpdateAction(prefix, {isError: true, error: error}))
                    }
                    return error
                }
            )
            .then(r => {
                if (dispatch && prefix) dispatch(prefixUpdateAction(prefix, {isLoading: false}))
                if (r === undefined || r === null) {
                    return false;
                }
                if (r.response) {
                    return r.response;
                } else {
                    return r;
                }
            })
    }

    return fetchHelper(access_token);
}

function getErrorsHTML(errors) {
    return Object.keys(errors).reduce((acc, key) =>
        acc + key + ": " + errors[key] + (Object.keys(errors).pop() !== errors[key] ? "<br/>" : ""), "")
}

function dispatchSetField(dispatch, prefix, field_name, value) {
    return dispatch(prefixUpdateAction(prefix, {[field_name]: value}))
}

function getPropsAreEqualFunction(getVarsFromState, getPrefix) {
    return (prevProps, nextProps) => {
        return _.isEqual({...prevProps, state: getVarsFromState(prevProps.state, getPrefix(prevProps.prefix ?? null))},
            {...nextProps, state: getVarsFromState(nextProps.state, getPrefix(nextProps.prefix ?? null))})
    }
}

function isString(val) {
    return typeof val === 'string' || val instanceof String
}

function minMaxValidation(fn, val, min, max) {
    if (isString(val)) {
        val = _parseInputFloat(val)
    }
    if (!(val <= max && val >= min)) return false
    fn()
}

function minValidation(fn, val, min) {
    if (isString(val)) {
        val = _parseInputFloat(val)
    }
    if (val < min) return false
    fn()
}

function maxValidation(fn, val, max) {
    if (isString(val)) {
        val = _parseInputFloat(val)
    }
    if (val > max) return false
    fn()
}

function getKeyValues(obj) {
    const keys = []
    const values = []
    for (let [key, value] of Object.entries(obj)) {
        keys.push(key)
        values.push(value)
    }

    return {keys: keys, values: values}
}

function getKeys(obj) {
    return getKeyValues(obj)["keys"]
}

function getValues(obj) {
    return getKeyValues(obj)["values"]
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function _parseInputFloat(val, default_val = "") {
    let float_val = parseFloat(val)
    return !isNaN(float_val) ? float_val : default_val
}

function _parseInputInt(val, default_val = "") {
    let int_val = parseInt(val)
    return !isNaN(int_val) ? int_val : default_val
}

function isSuccessStatusCode(status_code) {
    if (typeof status_code === 'string' || status_code instanceof String) parseInt(status_code)
    return Math.floor(status_code / 100) === 2
}

function isErrorStatusCode(status_code) {
    if (typeof status_code === 'string' || status_code instanceof String) parseInt(status_code)
    return Math.floor(status_code / 100) === 4
}

function calcFetch(dispatch, endpoint_name, project_id, case_ids, state_name) {
    return fetch(BASE_URL + 'api/' + endpoint_name, "POST", dispatch, {
        user_id: localStorage.getItem("user_id"),
        project_id: project_id,
        case_ids: case_ids,
    }).then(r => {
        dispatch(prefixUpdateAction(state_name, r.data))
        return r
    })
}

function setCaretPosition(elemId, caretPos) {
    var elem = document.getElementById(elemId);
    if (elem != null) {
        if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            } else
                elem.focus();
        }
    }
}

function getCaretPosition(ctrl) {
    var CaretPos = 0;

    if (ctrl.selectionStart || ctrl.selectionStart == 0) {// Standard.
        CaretPos = ctrl.selectionStart;
    } else if (document.selection) {// Legacy IE
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }

    return (CaretPos);
}

function downloadFile(data, filename) {

    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename); //or any other extension
    document.body.appendChild(link);
    link.click();
}

function createObjectByYears(years, val) {
    let obj = {}
    for (let i = 1; i <= years; i++) {
        obj['year' + i] = val(i);
    }
    return obj
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

function createObjectByCaseCount(val) {
    let obj = {}
    obj['case_id'] = val().case_id
    obj['nrValues'] = val().nrValues
    obj['gsValues'] = val().gsValues
    return obj
}

function addYearToInvestments(investment, investments) {
    investments.map(item => {
        if (item.name === investment.name) {
            item["year" + investment.year] = investment.value
        }
    })
    return investments
}

function addAdditionYears(last_year, dbYear, investments) {
    while (dbYear > last_year) {
        investments.map(item => {
            Object.assign(item, {["year" + (last_year + 1)]: 0})
        })
        last_year++;
    }
    return investments
}

function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function prepareInvestments(data, bp_year, bpInvestmentsID, dispatch, deletion = false) {
    let investments = []
    let id_index = 1
    if (data.data.length) {
        data.data.forEach(item => {
            if (investments.find(investment => investment.name === item.name)) {
                investments = addYearToInvestments(item, investments)
            } else {
                investments.push({
                    'id': id_index,
                    'name': item["name"],
                    ['year' + item["year"]]: item['value']
                })
                id_index++;
            }
        })

        let investments_year_count = Object.keys(investments[0]).length - 2
        investments = addAdditionYears(investments_year_count, bp_year, investments)
    }
    dispatch(keyValueUpdateAction("BusinessPlan_investmentsID",  id_index))
    dispatch(keyValueUpdateAction("BusinessPlan_investmentsValues", investments))
}

export {
    fetch,
    login,
    register_user,
    getRefreshedTokens,
    getErrorsHTML,
    isString,
    _parseInputFloat,
    _parseInputInt,
    dispatchSetField,
    getPropsAreEqualFunction,
    minMaxValidation,
    getKeyValues,
    getKeys,
    getValues,
    getKeyByValue,
    isSuccessStatusCode,
    isErrorStatusCode,
    calcFetch,
    minValidation,
    maxValidation,
    setCaretPosition,
    getCaretPosition,
    downloadFile,
    UNAUTHORIZED_STATUS_CODE,
    createObjectByYears,
    createObjectByCaseCount,
    addYearToInvestments,
    addAdditionYears,
    hasDuplicates,
    isOverflown,
    prepareInvestments,
}