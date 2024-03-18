import {createObjectByYears, fetch, getCaretPosition} from "../commonFunctions";
import {arrayItemUpdateAction, keyValueUpdateAction} from "../actions";
import {BASE_URL} from "../environment_vars";
import TextInputControl from "../TextInputControl";
import React from "react";
import _ from 'lodash'
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import DataTable from "react-data-table-component";
import {bpConditionalRowStyles, project_styles} from "../common_styles";
import CustomDataTable from "../CustomDataTable";

function addBpCases(dispatch, year_count, nrGsValues) {
    return fetch(BASE_URL + 'api/add_bp_cases/', 'POST', dispatch, {
        year_count: year_count,
        nrGsValues: nrGsValues,
    })
}

function getOutputData(dispatch, prefix, project_id, cases_ids) {
    return fetch(BASE_URL + 'api/bp_outputs/', "POST",
        dispatch, {user_id: localStorage.getItem('user_id'), project_id: project_id, case_ids: cases_ids}, prefix)
}

function getInvestmentsByName(name, dispatch, prefix) {
    return fetch(BASE_URL + 'api/search_investments/' + name, "GET", dispatch,
        {user_id: localStorage.getItem('user_id')}, prefix)
}

function updateNrGsValues(dispatch, nrGsValues, cases, cases_bp_data, dbYear) {
    dispatch(keyValueUpdateAction("BusinessPlan_nrGsValues", cases.map(item => {
        const bp_data = cases_bp_data.filter(elem => elem.case_id === item.id)
        let nr_values = {}
        let gs_values = {}
        let data_db_year
        bp_data.forEach(elem => {
            nr_values["year" + elem.year] = elem.renovation_count
            gs_values["year" + elem.year] = elem.government_subsidy
            data_db_year = elem.year

        })
        if (data_db_year - dbYear < 0) {
            [...Array(dbYear - data_db_year).keys()].map(i => {
                nr_values["year" + (data_db_year + (i + 1))] = 0
                gs_values["year" + (data_db_year + (i + 1))] = 0
            })
        }
        return {
            ...nrGsValues.find(elem => {
                return elem.id === item.id
            }),
            case_id: item.id,
            nrValues: nr_values,
            gsValues: gs_values,
        }
    })))
}

function getBPData(data, year, key, put_name) {
    return data.map((item, id) => {
        return {
            [key]: put_name ? item.name : id + 1,
            ...createObjectByYears(year, i =>
                <TextInputControl key={i} value={item[i]} id={id + "year" + i} min={0}
                                  disabled={true}/>)
        }
    })
}

function getGraphValues(data) {
    return data.map(v => _.omit(v, 'name'))
}

const getCustomColumns = projectParamsBpYear => [{
    name: 'investment name',
    selector: 'name',
    style: {minWidth: "110px", maxWidth: "110px"}
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {minWidth: "70px"}
    }
}), [{name: 'delete', selector: 'delete', style: {minWidth: "70px", maxWidth: "70px"}}])

const getOperationalCostsColumns = () => [
    {
        name: '',
        selector: 'name',
        style: {marginBottom: '7px', marginTop: '7px'},
    },
    {
        name: '€/Year',
        selector: 'value',
        style: {marginBottom: '7px', marginTop: '7px'},
    },
    {
        name: 'delete',
        selector: 'delete',
        style: {marginBottom: '7px', marginTop: '7px'},
    }
]
const getConsiderationsOBRColumns = () => [
    {
        name: 'Considerations for OBR schemes',
        selector: 'consideration',
        style: {marginBottom: '7px', marginTop: '7px'}
    },
    {
        name: '',
        selector: 'value',
        style: {marginBottom: '7px', marginTop: '7px'}
    }
]
const getCashValuesColumns = schemeYear => [{
    name: 'Name',
    selector: 'name',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(schemeYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getBusinessPlanColumns = projectParamsBpYear => [{
    name: '',
    selector: 'name'
}].concat((Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        maxWidth: "150px",
    }
})))
const getResultsColumns = projectParamsBpYear => [{
    name: 'Name',
    selector: 'name',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getOnBillComponentsColumns = projectParamsBpYear => [{
    name: 'N',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getEnergySavingsGeneratedColumns = projectParamsBpYear => [{
    name: 'N',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getInvestmentsColumns = projectParamsBpYear => [{
    name: 'Name',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getOperationalCostsTableColumns = projectParamsBpYear => [{
    name: 'Name',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getRevenuesColumns = schemeYear => [{
    name: 'Name',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(schemeYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getEnergySavingsTotalColumns = schemeYear => [{
    name: 'Name',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(schemeYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))
const getRenovationsColumns = projectParamsBpYear => [{
    name: 'N',
    selector: 'case_order',
    minWidth: "150px",
    maxWidth: "150px",
    wrap: 'yes'
}].concat(Array(projectParamsBpYear).fill("").map((c, i) => {
    return {
        name: 'year' + (i + 1),
        selector: 'year' + (i + 1),
        style: {marginBottom: '7px', marginTop: '7px'},
        minWidth: "150px",
        maxWidth: "150px",
        wrap: 'yes'
    }
}))

const BPTextField = ({
                         prefix, dispatch, id, _key, item, setFocus, toUpdate, elemID = null, onValChange = e => {
    }
                     }) => {
    return <Form.Control
        type={"text"}
        size={"sm"}
        id={elemID ? elemID : id + _key}
        key={_key}
        value={item ? item[_key] : ""}
        onChange={e => {
            dispatch(arrayItemUpdateAction(prefix + toUpdate, id,
                _key, e.target.value))
            setFocus({id: e.target.id, pos: getCaretPosition(document.getElementById(e.target.id))})
            onValChange(e)
        }}
    />
};


const BPDataTable = ({label, columns, data, cardClassName = ""}) => {
    return <React.Fragment>
        {label ? <div className="mb-2">{label}</div> : null}
        <Card className={cardClassName}>
            <DataTable columns={columns}
                       data={data}
                       customStyles={project_styles}
                       noHeader={true}
                       conditionalRowStyles={bpConditionalRowStyles}
                       className="sliderTable"/>
        </Card>
    </React.Fragment>
}

const BPCustomDataTable = ({label, columns, data, cardClassName = ""}) => {
    return <React.Fragment>
        {label ? <div className="mb-2">{label}</div> : null}
        <Card className={cardClassName}>
            <CustomDataTable columns={columns} data={data} conditionalRowStyles={bpConditionalRowStyles}/>
        </Card>
    </React.Fragment>
}

const BPLabelTextbox = ({id, onValChange, value, inputsDisabled, minVal, label}) => {
    return <label className="bp-textbox-label">
        {label}
        <TextInputControl id={id} value={value} min={minVal} disabled={inputsDisabled} onValChange={onValChange}/>
    </label>

}

function getBPReportDataFromState(state) {
    const nrGsValues = state["BusinessPlan_nrGsValues"];
    const investmentValues = state["BusinessPlan_investmentsValues"]
    const operationalCostsValues = state["BusinessPlan_operationalCostsValues"]
    const bp_cases = state["BusinessPlan_CasesTable_cases"].data;

    const get_bp_case = id => bp_cases.find(c => c.id === id);

    const get_obj_consecutive = arr => {
        let obj = {}
        for (let i = 1; i <= arr.length; i++) {
            obj[i] = arr[i - 1];
        }
        return obj
    }

    return {
        "case_values": get_obj_consecutive(nrGsValues.map(case_nrGsValues => {
            return {
                nr: Object.keys(case_nrGsValues.nrValues).map(nr_key => case_nrGsValues.nrValues[nr_key]),
                gs: Object.keys(case_nrGsValues.nrValues).map(gs_key => case_nrGsValues.gsValues[gs_key]),
                onbill_component: get_bp_case(case_nrGsValues.case_id).common_params.on_bill_component,
                onbill_scheme: get_bp_case(case_nrGsValues.case_id).common_params.on_bill_scheme,
                energy_savings: get_bp_case(case_nrGsValues.case_id).common_params.energy_savings,
            }
        })),
        "bp_list": get_obj_consecutive(investmentValues.map(investment => {
            const years_obj = _.omit(investment, ['id', 'name'])
            return {
                name: investment.name,
                ...get_obj_consecutive(Object.keys(years_obj).map(_key => years_obj[_key]))
            }
        })),
        "oc_list": get_obj_consecutive(operationalCostsValues.map(oc => [oc.name, oc.value])),
        "obr_list": {
            1: ["% of investment financed by FI", state["BusinessPlan_percentageFinanced"]],
            2: ["FI Financing rate", state["BusinessPlan_financingRate"]],
            3: ["FI Financing duration", state["BusinessPlan_financingDuration"]]
        }
    }
}

function deleteInvestment(dispatch, projectId, investmentName) {
    return fetch(BASE_URL + 'api/delete_investment/', 'POST', dispatch, {
        project_id: projectId,
        investment_name: investmentName,
    })
}

function deleteOperationalCost(dispatch, projectId, ocName) {
    return fetch(BASE_URL + 'api/delete_oc/', 'POST', dispatch, {
        project_id: projectId,
        oc_name: ocName,
    })
}

export {
    addBpCases,
    updateNrGsValues,
    getOutputData,
    getGraphValues,
    getInvestmentsByName,
    getResultsColumns,
    getCustomColumns,
    getOperationalCostsColumns,
    getConsiderationsOBRColumns,
    getCashValuesColumns,
    getBusinessPlanColumns,
    getOnBillComponentsColumns,
    getEnergySavingsGeneratedColumns,
    getInvestmentsColumns,
    getOperationalCostsTableColumns,
    getRevenuesColumns,
    getEnergySavingsTotalColumns,
    getRenovationsColumns,
    BPTextField,
    BPDataTable,
    getBPData,
    getBPReportDataFromState,
    BPLabelTextbox,
    deleteInvestment,
    deleteOperationalCost,
    BPCustomDataTable
}