import React from "react"
import {Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import {
    ComposedChart,
    ScatterChart,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Scatter,
} from 'recharts';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import DataTable from "react-data-table-component";
import {conditionalRowStyles, tableStyles} from "./common_styles";
import {
    getPropsAreEqualFunction,
} from "./commonFunctions";
import {prefixUpdateAction} from "./actions";
import {
    fetchMCNpvData, fetchNpvData, fetchRatingData, resetMCNPV, resetRatingData, resetReportData
} from "./CoreFunctions";
import {getMCNPVColumns, mcNpvRiskColumns, npvColumns} from "./tables_columns";
import TextInputControl from "./TextInputControl";
import CasesTable from "./CasesTable";
import {editProjectParams} from "./Services/Project";
import _ from 'lodash'
import {fetchCases} from "./Services/Case";

function getVarsFromState(state, prefix) {
    return {
        monteCarloParams: state["MonteCarlo_current"],
        npvData: state[prefix + "npvData"],
        mcnpvData: state[prefix + "mcnpvData"],
        project_params: state["Project_params"],
        params: state[prefix + "params"],
        npvLabel: state[prefix + "npvLabel"],
        mcnpvLabel: state[prefix + "mcnpvLabel"],
        consumptionData: state["Project_Details_consumptionData"],
        cases: state["Project_CasesTable_cases"],
        cases_table_disabled: state["Project_CasesTable_disabled"]
    }
}

function getPrefix(prefix = null) {
    return "FinancialAnalysis_"
}

const UpperGraphs = React.memo(function (props) {
    const prefix = props.prefix
    const state = getVarsFromState(props.state, prefix)
    const dispatch = props.dispatch
    const project_id = props.project_id
    const {project_params, npvData, npvLabel, params} = state
    const taxCheck = project_params["incentives_check"] ?? false;
    const taxAmount = project_params["incentives_amount_%"] ?? 0;
    const taxRefundTime = project_params['incentives_refund_years'] ?? 0;
    const loanCheck = project_params['loan_check'] ?? false;
    const loanAmount = project_params['loan_amount_%'] ?? 0;
    const loanRate = project_params['loan_rate'] ?? 0;
    const loanRefundTime = project_params['loan_refund_years'] ?? 0;
    const timeHorizonYears = project_params['time_horizon_years'] ?? 0;
    const selected_cases_ids = state["cases"].selected.map(c => c.id)

    function runNpv() {
        let pre_npv_promise = Promise.resolve()
        if (!_.isEqual(project_params, params)) {
            pre_npv_promise = resetReportData(dispatch, project_id)
                .then(() => resetRatingData(dispatch, project_id))
                .then(() => fetchRatingData(dispatch, project_id, selected_cases_ids))
                .then(() => resetMCNPV(dispatch))
        }

        pre_npv_promise.then(() => editProjectParams(dispatch, project_id, project_params))
            .then(() => fetchNpvData(dispatch, project_id, selected_cases_ids))
            .then(() => fetchCases(project_id, dispatch, "Project_CasesTable_cases"))

        dispatch(prefixUpdateAction(prefix + "params", project_params))
        dispatch(prefixUpdateAction("ProjectRating_params", params))
    }

    const setParam = (key, value) => {
        const params_map = {
            taxCheck: 'incentives_check',
            taxAmount: 'incentives_amount_%',
            taxRefundTime: 'incentives_refund_years',
            loanCheck: 'loan_check',
            loanAmount: 'loan_amount_%',
            loanRefundTime: 'loan_refund_years',
            timeHorizonYears: 'time_horizon_years',
            loanRate: 'loan_rate',
        }
        dispatch(prefixUpdateAction("Project_params", {[params_map[key]]: value}))
    }

    const intervention_cost = state["consumptionData"]["intervention_cost"]
    const {npv_vector, Labvan, Labelinvest, LabPI, LabIRR, Labvan_max, Labvan_min, pb_zero, dpb_zero} = npvData
    const npv_print_data = [{
        npv: Labvan + " Є",
        irr: LabIRR + " %",
        pi: LabPI,
        pbp: pb_zero,
        dpbp: dpb_zero
    }];

    const npv_graph_data = npv_vector.map(e => {
        return {pv: e}
    })

    function getParamTextbox(key, value, label, min = null, max = null, float = false) {
        let form_control_props = {
            value: value,
            onValChange: (v, id) => setParam(key, v)
        }

        if (float) {
            form_control_props["step"] = 0.01
            form_control_props["is_integer_input"] = false
        }
        if (min !== null) form_control_props["min"] = min
        if (max !== null) form_control_props["max"] = max

        return <React.Fragment>
            <div style={{width: "50px"}}>
                <TextInputControl {...form_control_props} />
            </div>
            <Form.Label className="ml-2">{label}</Form.Label>
        </React.Fragment>
    }

    return <div>
        <CasesTable state={props.state} dispatch={dispatch} project_id={props.project_id}
                    disableUI={true} prefix={"Project_"}/>

        <Row>
            <Col sm="6" className="mt-3">
                <Card className="npv-graph">
                    <Card.Header className="graph-header">NPV (€)</Card.Header>
                    <div className="mt-3">
                        <BarChart width={500} height={350} data={npv_graph_data}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name" height={8} tick={false}/>
                            <YAxis dataKey="pv" domain={[Labvan_min, Labvan_max]}
                                   tickFormatter={tick => {
                                       if(isFinite(tick)){
                                           return Math.round(tick).toLocaleString();
                                       }
                                       else
                                           return tick
                                   }}/>
                            <Tooltip/>
                            <ReferenceLine y={0} stroke="#000"/>
                            <Bar dataKey="pv" fill="#8884d8"/>
                        </BarChart>
                    </div>
                </Card>
                <div className="graph-small-title fa-text">
                    <div className="d-flex">
                        <div className="">intervention cost</div>
                        &nbsp;&nbsp;
                        <div className="important-results">{intervention_cost}</div>
                        <div className="ml-auto mr-5">yrs.</div>
                    </div>
                    <div className="d-flex">
                        <div className="">investment cost</div>
                        &nbsp;&nbsp;&nbsp;
                        <div className="important-results">{Labelinvest}</div>
                    </div>

                </div>

            </Col>
            <Col sm="6" className="mt-3">
                <div className="d-flex">
                    <Button className="fa-small-button rb-button rb-purple-button mr-3"
                            onClick={runNpv}>{npvLabel}</Button>
                    {getParamTextbox("timeHorizonYears", timeHorizonYears, "time horizon, yrs.", 1)}
                </div>
                <Card className="mt-4">
                    <DataTable
                        data={npv_print_data}
                        columns={npvColumns}
                        customStyles={tableStyles}
                        noHeader={true}
                        conditionalRowStyles={conditionalRowStyles}
                    />
                </Card>
                <div className="d-flex mt-4">
                    <div className="flex-even">
                        <Card className="p-3 mr-3">
                            <Form.Check id="tax_incentive" checked={taxCheck}
                                        onChange={() => setParam("taxCheck", !taxCheck)}
                                        label="Tax Incentive"
                                        className="mb-1"/>
                            <div className="form-group d-flex mt-2">
                                {getParamTextbox("taxAmount", taxAmount, "amount %", 0,
                                    100, true)}
                            </div>
                            <div className="form-group d-flex mt-2">
                                {getParamTextbox("taxRefundTime", taxRefundTime, "refund time, yrs.",
                                    0, timeHorizonYears)}
                            </div>
                        </Card>
                    </div>
                    <div className="flex-even">
                        <Card className="p-3">
                            <div className="d-flex">
                                <Form.Check id="loan_check" checked={loanCheck}
                                            onChange={() => setParam("loanCheck", !loanCheck)}
                                            label="Loan" className="mr-4"/>
                                {getParamTextbox("loanRate", loanRate, "loan rate, %", 0,
                                    20, true)}
                            </div>
                            <div className="form-group d-flex mt-2">
                                {getParamTextbox("loanAmount", loanAmount, "loan amount, %", 0,
                                    100, true)}
                            </div>
                            <div className="form-group d-flex mt-2">
                                {getParamTextbox("loanRefundTime", loanRefundTime, "refund time, yrs.",
                                    1, timeHorizonYears)}
                            </div>
                        </Card>
                    </div>
                </div>

            </Col>
        </Row>
        <Row className="mt-3">
            <Col sm="8" style={{maxWidth: "60%"}}>
            </Col>
            <Col sm="4" style={{minWidth: "40%"}}>
            </Col>
        </Row>
    </div>
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))


const LowerGraphs = React.memo(function (props) {
    const state = getVarsFromState(props.state, props.prefix)
    const dispatch = props.dispatch
    const project_id = props.project_id
    const {project_params, mcnpvLabel, mcnpvData, params} = state
    const {graph_ymin, graph_ymax, green_graph, blue_graph, red_graph, bar_graph, print_values} = mcnpvData
    const {
        lab_cond_loss, lab_dpbp_cb05, lab_irr_cb95, lab_irr_cvar, lab_irr_cvar_bp, lab_irr_var, lab_irr_var_bp,
        lab_loss, lab_mc_dpbp, lab_mc_irr, lab_mc_pbp, lab_mc_pi, lab_mc_van, lab_npv_cvar, lab_npv_cvar_bp,
        lab_npv_var, lab_npv_var_bp, lab_pbp_cb05, lab_pbp_cvar, lab_pbp_cvar_bp, lab_pbp_var, lab_pbp_var_bp,
        lab_pi_cb95, lab_van_cb95, nrun, y_max, y_min
    } = print_values
    const selected_cases_ids = state["cases"].selected.map(c => c.id)
    const {confidence_level} = project_params

    const mcValues = [
        {type: "NPV", exp_val: lab_mc_van, confidence: lab_van_cb95, symbol: "€"},
        {type: "IRR", exp_val: lab_mc_irr, confidence: lab_irr_cb95, symbol: "%"},
        {type: "PI", exp_val: lab_mc_pi, confidence: lab_pi_cb95, symbol: ""},
        {type: "PBP", exp_val: lab_mc_pbp, confidence: lab_pbp_cb05, symbol: "yrs."},
        {type: "DPBP", exp_val: lab_mc_dpbp, confidence: lab_dpbp_cb05, symbol: "yrs."},
    ]

    const mcRiskValues = [
        {
            type: "NPV", var: `${lab_npv_var_bp}[${lab_npv_var}]`,
            cvar: `${lab_npv_cvar_bp}[${lab_npv_cvar}]`, symbol: "€"
        },
        {
            type: "IRR", var: `${lab_irr_var_bp}[${lab_irr_var}]`,
            cvar: `${lab_irr_cvar_bp}[${lab_irr_cvar}]`, symbol: "%"
        },
        {
            type: "DPBP", var: `${lab_pbp_var_bp}[${lab_pbp_var}]`,
            cvar: `${lab_pbp_cvar_bp}[${lab_pbp_cvar}]`, symbol: "yrs."
        },
    ]

    const mc_npv_graph = bar_graph.map((v, i) => {
        return {pv: v}
    })

    function runMCNpv() {
        let pre_mc_npv_promise = Promise.resolve()
        if (!_.isEqual(project_params, params)) {
            pre_mc_npv_promise = resetReportData(dispatch, project_id)
                .then(() => resetRatingData(dispatch, project_id))
                .then(() => fetchRatingData(dispatch, project_id, selected_cases_ids))
        }

        pre_mc_npv_promise.then(() => editProjectParams(dispatch, project_id, project_params))
            .then(() => fetchNpvData(dispatch, project_id, selected_cases_ids))
            .then(() => fetchMCNpvData(dispatch, project_id, selected_cases_ids))

        dispatch(prefixUpdateAction(props.prefix + "params", project_params))
        dispatch(prefixUpdateAction("ProjectRating_params", params))
    }

    return <React.Fragment>
        <Col sm="8" style={{maxWidth: "60%"}}>
            <Card>
                <Card.Header className="graph-header">MC NPV (€)</Card.Header>
                <div className="d-flex">
                    <ScatterChart width={450} height={390} margin={{top: 20, right: 20, bottom: 20, left: 30}}>
                        <CartesianGrid/>
                        <XAxis type="number" dataKey="x" height={1} unit="yrs" tick={false}/>
                        <YAxis type="number" dataKey="y" width={45} domain={[graph_ymin, graph_ymax]} allowDataOverflow="true"
                               tickFormatter={tick => {
                                   if(isFinite(tick)){
                                       return Math.round(tick).toLocaleString();
                                   }
                                   else
                                       return tick
                               }}/>
                        <Tooltip cursor={{strokeDasharray: '3 3'}}/>
                        <Scatter data={blue_graph} fill="#8884d8"/>
                        <Scatter data={green_graph} fill="#47B371"/>
                        <Scatter data={red_graph} fill="#d1113e"/>
                    </ScatterChart>

                    <ComposedChart layout="vertical" width={160} height={390} data={mc_npv_graph}
                                   margin={{top: 20, bottom: -10}}>
                        <CartesianGrid/>
                        <XAxis type="number" tick={false}/>
                        <YAxis width={0} type="category" scale="band" tick={false}/>
                        <Tooltip/>
                        <Bar dataKey="pv" fill="#8884d8"/>
                    </ComposedChart>
                </div>
            </Card>
            <div className="d-flex">
                <div className="yrs-label graph-small-title">yrs.</div>
                <div className="graph-small-title fa-text">
                    <div className="d-flex" style={{marginLeft: "-30px"}}>
                        <div className="">Loss risk</div>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <div className="important-results">{lab_loss}</div>
                        &nbsp; %
                    </div>
                    <div className="d-flex" style={{marginLeft: "-30px"}}>
                        <div className="">Cond. loss</div>
                        &nbsp;&nbsp;
                        <div className="important-results">{lab_cond_loss}</div>
                        &nbsp; €
                    </div>
                </div>
            </div>
        </Col>
        <Col sm="4" style={{minWidth: "40%"}}>
            <div className="mb-4">
                <Card>
                    <Card.Body>
                        <div className="d-flex">
                            <div className="fa-title">Monte Carlo Analysis</div>
                            <div style={{width: "70px"}} className="ml-3 mr-2">
                                <Form.Control value={nrun} size="sm" disabled type="number"/>
                            </div>
                            <Button className="ml-2 fa-small-button rb-button rb-purple-button"
                                    disabled={mcnpvLabel === "Running..."}
                                    onClick={runMCNpv}>
                                {mcnpvLabel}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <Card style={{height: "max-content"}}>
                <DataTable data={mcValues} columns={getMCNPVColumns(confidence_level)} customStyles={tableStyles}
                           noHeader={true}
                           conditionalRowStyles={conditionalRowStyles}
                />
            </Card>
            <Card className="mt-4" style={{height: "max-content"}}>
                <DataTable data={mcRiskValues} columns={mcNpvRiskColumns} customStyles={tableStyles} noHeader={true}
                           conditionalRowStyles={conditionalRowStyles}
                />
            </Card>
        </Col>
    </React.Fragment>
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

const FinancialAnalysisTab = React.memo(function (props) {
    const prefix = getPrefix()
    const dispatch = props.dispatch

    return (
        <div>
            <UpperGraphs dispatch={dispatch} project_id={props.project_id} state={props.state} prefix={prefix}/>
            <Row>
                <LowerGraphs dispatch={dispatch} project_id={props.project_id} state={props.state} prefix={prefix}/>
            </Row>
        </div>

    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default FinancialAnalysisTab