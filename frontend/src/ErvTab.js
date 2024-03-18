import React, {useEffect} from "react"
import {Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import {getPropsAreEqualFunction, isErrorStatusCode} from "./commonFunctions";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import CasesTable from "./CasesTable";
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import TextInputControl from "./TextInputControl";
import {editCase, editCasesErvParams, fetchCases, updateSelectedCases} from "./Services/Case";
import {
    Erv_calculateLabel_default, Erv_params_default,
} from "./defaultState";
import _ from 'lodash';
import {fetchErvData} from "./CoreFunctions";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function getVarsFromState(state, prefix) {
    return {
        project_cases: state["Project_CasesTable_cases"],
        params: state[prefix + "params"],
        outputData: state[prefix + "outputData"],
        fa_params: state["FinancialAnalysis_params"],
        cases: state[prefix + "CasesTable_cases"],
        cases_table_disabled: state[prefix + "CasesTable_disabled"],
        calculateLabel1: state[prefix + "calculateLabel1"],
        calculateLabel2: state[prefix + "calculateLabel2"],
        calculateLabel3: state[prefix + "calculateLabel3"],
        calculateLabel4: state[prefix + "calculateLabel4"],
        erv_params: state[prefix + "params"]
    }
}

function getPrefix(prefix = null) {
    return "Erv_"
}

const ErvTab = React.memo(function (props) {
    const MySwal = withReactContent(Swal)
    const prefix = getPrefix()
    const state = getVarsFromState(props.state, prefix)
    const {dispatch, project_id} = props
    const {params, fa_params, project_cases, cases, outputData, erv_params} = state
    const {time_horizon_years} = fa_params //vita

    const {
        obf1_bill_savings, obf1_onBill_amount, obf2_bill_savings, obf2_max_onBill, obf2_tenure,
        obr1_bill_savings, obr1_invest_repayment, obr1_amount_util, obr1_amount_bank, obr1_onBill_amount,
        obr2_bill_savings, obr2_max_onBill, obr2_tenure, obr2_amount_util, obr2_amount_bank, obr2_onBill_amount
    } = outputData

    const {
        obf1_avg_calc_years,
        obf2_avg_calc_years,
        obr1_avg_calc_years,
        obr2_avg_calc_years
    } = erv_params

    let selectedCase = null
    if (cases.selected.length === 1) {
        let newSelected = cases.data.filter(c => {
            if (c.id === cases.selected[0].id) return c;
        })
        selectedCase = newSelected[0]
    }
    const inputsDisabled = !selectedCase
    const dwell_count = selectedCase ? selectedCase.common_params['dwelling_count'] : ""
    const setParam = (key, value) => dispatch(prefixUpdateAction(prefix + "params", {[key]: value}))

    useEffect(() => {
        dispatch(prefixUpdateAction(prefix + "CasesTable_cases", {...cases, data: project_cases.data}))
    }, [project_cases])

    useEffect(() => {
        if (selectedCase)
            dispatch(keyValueUpdateAction(prefix + "params", _.pick(selectedCase.common_params, Object.keys(Erv_params_default))))
        else
            dispatch(keyValueUpdateAction(prefix + "params", Erv_params_default))
    }, [selectedCase])

    useEffect(() => {
        if (time_horizon_years) {
            let new_years = {};
            cases.data.forEach(c => {
                ["obf1_avg_calc_years", "obf2_avg_calc_years", "obr1_avg_calc_years", "obr2_avg_calc_years"].forEach(key => {
                    if (c.common_params[key] > time_horizon_years) {
                        new_years[key] = time_horizon_years;
                    }
                })
            })
            if (Object.keys(new_years).length > 0) {
                console.log("calling editcaseservparams", new_years, time_horizon_years)
                dispatch(prefixUpdateAction(prefix + "params", new_years))
                editCasesErvParams(dispatch, project_id, {...params, ...new_years})
            }
        }
    }, [time_horizon_years])

    function getField(label = null, alias = null, isInteger = null, min = undefined, max = undefined,
                      sub_label = null, className = null, style = null, label_className = null,
                      disabled = inputsDisabled, value = null, sub_label_className) {
        let input_props = {min: min, max: max};
        if (isInteger !== null) input_props["is_integer_input"] = isInteger;
        if (value !== null) input_props["value"] = value;

        return <Form.Group as={Row} style={style ?? {}} className={className ?? ""}>
            <Form.Label column sm="6" className="pr-0 pt-0 d-flex">
                <div className={"font-weight-bold mr-2 " + (label_className ?? "")}>{label ?? ""}</div>
                {sub_label ? <div className={"font-size-85 " + (sub_label_className ?? "")}>{sub_label}</div> : null}
            </Form.Label>
            <Col sm="6">
                <TextInputControl value={alias ? params[alias] : ""} {...input_props} disabled={disabled}
                                  onValChange={(v, id) => {
                                      if (alias) setParam(alias, v)
                                  }}/>
            </Col>
        </Form.Group>
    }

    function getOutputField(label, sub_label, value, className = null, style = null) {
        return getField(label, null, null, null, null, sub_label,
            className, style, "erv-result", true, value, "erv-sub-result")
    }

    function setCalculateLabel(value, case_id) {
        dispatch(keyValueUpdateAction(prefix + `calculateLabel${case_id}`, value))
    }

    function calculate(url, case_id) {
        setCalculateLabel("Calculating...", case_id)
        const newSelectedCase = {...selectedCase, common_params: {...selectedCase.common_params, ...params}}
        return editCase(dispatch, selectedCase.id, project_id, newSelectedCase.common_params, newSelectedCase.current_params,
            newSelectedCase.planned_params).then(() => updateSelectedCases(dispatch, 1, [newSelectedCase],
            prefix + "CasesTable_cases"))
            .then(() => fetchErvData(dispatch, url, project_id, case_id)
                .then(r => {
                    if (isErrorStatusCode(r.status)) {
                        MySwal.fire({
                            title: "An error occurred!",
                            text: r.data,
                            showConfirmButton: true,
                        })
                    }
                }))
            .then(() => fetchCases(project_id, dispatch, prefix + "CasesTable_cases"))
            .then(() => fetchCases(project_id, dispatch, "Project_CasesTable_cases")) //TODO see why this causes bug #ER12
            .then(() => setCalculateLabel(Erv_calculateLabel_default, case_id))
    }

    function getCalculateButton(url, section_id) {
        return <Form.Group as={Row}>
            <Col sm="12">
                <Button className="fa-small-button rb-button rb-purple-button float-right"
                        onClick={() => calculate(url, selectedCase.id)} disabled={inputsDisabled}>
                    {state[`calculateLabel${section_id}`]}
                </Button>
            </Col>
        </Form.Group>
    }

    return (
        <div>
            <Row>
                <Col sm="12">
                    <Card className="mt-4">
                        <CasesTable state={props.state} dispatch={dispatch} singular_selection={true}
                                    prefix={prefix} project_id={project_id} disableUI={true}/>
                    </Card>
                </Col>
                <Col sm="6" className="mt-3">
                    <Card className="h-100">
                        <h5 className="card-title ml-3 mt-2">Onbill Financing</h5>
                        <Card.Body>
                            <Form className="font-size-95">
                                {getField("Average Calculation Years", "obf1_avg_calc_years", true,
                                    1, time_horizon_years, "years")}
                                {getField("Tenure,", "obf1_tenure", true, 1, undefined,
                                    "years")}
                                {getField("Utility WACC", "obf1_utility_WACC", false, 0, undefined,
                                    "%", "mb-2")}
                                {getField(null, null, null, undefined, undefined,
                                    null, "mb-2", {visibility: 'hidden'})}

                                {getCalculateButton('erv_first_case/', 1)}

                                {getOutputField("Bill Savings,", "€ / " + obf1_avg_calc_years + " Years / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obf1_bill_savings, "mt-3")}
                                {getOutputField(" OnBill Amount,", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obf1_onBill_amount, "mt-3")}
                            </Form>
                        </Card.Body>
                    </Card>

                </Col>
                <Col sm="6" className="mt-3">
                    <Card>
                        <h5 className="card-title ml-3 mt-2">Onbill Financing With Golden Rule</h5>
                        <Card.Body>
                            <Form className="font-size-95">
                                {getField("Average Calculation Years", "obf2_avg_calc_years", true,
                                    1, time_horizon_years, "years")}
                                {getField("Golden rule", "obf2_golden_rule", false, 0, 100, "%")}
                                {getField("Utility WACC", "obf2_utility_WACC", false, 0, undefined, "%")}
                                {getField("OnBill Amount,", "obf2_onBill_amount", false, 1, undefined,
                                    "€ / month / dwell", "mt-3 mb-2")}

                                {getCalculateButton('erv_second_case/', 2)}

                                {getOutputField("Bill Savings,", "€ / " + obf2_avg_calc_years + " Years / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obf2_bill_savings, "mt-3")}
                                {getOutputField("Max OnBill,", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obf2_max_onBill, "mt-3")}
                                {getOutputField("Tenure,", "years", obf2_tenure, "mt-3")}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col sm="6">
                    <Card className="h-100">
                        <h5 className="card-title ml-3 mt-2">Onbill Repayment</h5>
                        <Card.Body>
                            <Form className="font-size-95">
                                {getField("Average Calculation Years", "obr1_avg_calc_years", true,
                                    1, time_horizon_years, "years")}
                                {getField("Tenure,", "obr1_tenure", true, 1, undefined,
                                    "years")}
                                {getField("Utility Margin", "obr1_utility_margin", false, 0, undefined, "%")}
                                {getField("Bank Rate", "obr1_bank_rate", false, 0, undefined, "%")}
                                {getField(null, null, null, undefined, undefined,
                                    null, "mb-2", {visibility: 'hidden'})}

                                {getCalculateButton('erv_third_case/', 3)}

                                {getOutputField("Invest. Repayment,", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr1_invest_repayment, "mt-3")}
                                {getOutputField("OB Amount Util", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr1_amount_util, "mt-3")}
                                {getOutputField("OB Amount Bank", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr1_amount_bank, "mt-3")}
                                {getOutputField("OnBill Amount", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr1_onBill_amount, "mt-3")}
                                {getOutputField("Bill Savings,", "€ / " + obr1_avg_calc_years + " Years / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr1_bill_savings, "mt-3")}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm="6">
                    <Card>
                        <h5 className="card-title ml-3 mt-2">Onbill Repayment With Golden Rule</h5>
                        <Card.Body>
                            <Form className="font-size-95">
                                {getField("Average Calculation Years", "obr2_avg_calc_years", true,
                                    1, time_horizon_years, "years")}
                                {getField("Golden rule", "obr2_golden_rule", false, 0, 100, "%")}
                                {getField("Utility Margin", "obr2_utility_margin", false, 0,
                                    undefined, "%", "mt-3 mb-2")}
                                {getField("Bank Rate", "obr2_bank_rate", false, 0, undefined,
                                    "%", "mt-3 mb-2")}
                                {getField("Invest. Repayment,", "obr2_invest_repayment", false, 1, undefined,
                                    "€ / month", "mt-3")}

                                {getCalculateButton('erv_fourth_case/', 4)}

                                {getOutputField("Tenure,", "years", obr2_tenure)}
                                {getOutputField("OB Amount Util", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr2_amount_util, "mt-3")}
                                {getOutputField("OB Amount Bank", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr2_amount_bank, "mt-3")}
                                {getOutputField("OnBill Amount", "€ / month / " + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr2_onBill_amount, "mt-3")}
                                {getOutputField("Bill Savings,", "€ / " + obr2_avg_calc_years + " Years /" + (selectedCase ? selectedCase.common_params['dwelling_count'] : "") + " dwell", obr2_bill_savings, "mt-3")}
                                {getOutputField("Max OnBill,", "€ / month / " + dwell_count + " dwell", obr2_max_onBill, "mt-3")}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default ErvTab