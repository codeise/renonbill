import React from "react"
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import Typography from "@material-ui/core/Typography";
import Card from "react-bootstrap/Card";
import {Bar, BarChart} from "recharts";
import Button from "react-bootstrap/Button";
import ComboBox from "./ComboBox";
import DataTable from "react-data-table-component";
import {getBillColumns, getEnergyColumns, getInvestColumns} from "./tables_columns";
import {conditionalRowStyles, energyStyles} from "./common_styles";
import {dispatchSetField, getPropsAreEqualFunction} from "./commonFunctions";
import {fetchMonteCarloData} from "./CoreFunctions";
import {keyValueUpdateAction} from "./actions";
import {Project_EngineeringAnalysis_monteCarloLabel} from "./defaultState";
import {editProjectParams} from "./Services/Project";
import TextInputControl from "./TextInputControl";
import CasesTable from "./CasesTable";

function getVarsFromState(state, prefix) {
    return {
        monteCarloData: state[prefix + "monteCarloData"],
        type: state[prefix + "type"],
        project_params: state["Project_params"],
        monte_carlo_label: state[prefix + "monteCarloLabel"],
        cases: state["Project_CasesTable_cases"],
        cases_table_disabled: state["Project_CasesTable_disabled"]
    }
}

function getPrefix(prefix) {
    return prefix + "EngineeringAnalysis_"
}

const EngineeringAnalysis = React.memo(function (props) {
    const prefix = getPrefix(props.prefix)
    const {dispatch, project_id} = props
    const state = getVarsFromState(props.state, prefix)
    const project_params = state["project_params"]
    const numberOfRuns = project_params["number_of_monte_carlo_runs"]
    const setNumberOfRuns = value => dispatchSetField(dispatch, "Project_params", "number_of_monte_carlo_runs", value)
    const type = state["type"]
    const setType = t => dispatch(keyValueUpdateAction(prefix + "type", t))
    const monteCarloLabel = state["monte_carlo_label"]
    const setMonteCarloLabel = l => dispatch(keyValueUpdateAction(prefix + "monteCarloLabel", l))
    const {print_values} = state["monteCarloData"]
    const {confidence_level} = project_params
    const {
        mm_d, cbd2, mm_f, cbf2, mm_e, cbe2, mm_total, cbtot2, evar_bp, evar, ecvar_bp, ecvar, mm_vc_f, cbvcf2, mm_vc_e,
        cbvce2, mm_vc_total, cbvc2, bvar_bp, bvar, bcvar_bp, bcvar, mm_cost_total, cbfixc2, fixvar_bp, fixvar,
        fixcvar_bp, fixcvar
    } = print_values[type]

    let graph_values = {}
    for (let [key, value] of Object.entries(state["monteCarloData"]["graph_values"][type])) {
        graph_values[key] = value.map(e => {
            return {y: e}
        })
    }

    const selected_cases_ids = state["cases"].selected.map(c => c.id)

    const energyData = [
        {energy: "lost", exp: mm_d, confidence: cbd2},
        {energy: "fuel", exp: mm_f, confidence: cbf2},
        {energy: "electric", exp: mm_e, confidence: cbe2},
        {energy: "Total", exp: mm_total, confidence: cbtot2},
        {energy: "Energy At Risk"},
        {energy: "VaR", exp: evar_bp && evar ? `${evar_bp} [${evar}]` : ""},
        {energy: "CVaR", exp: ecvar_bp && ecvar ? `${ecvar_bp} [${ecvar}]` : ""},
    ]
    const billData = [
        {bill: "fuel", exp: mm_vc_f, confidence: cbvcf2},
        {bill: "electric", exp: mm_vc_e, confidence: cbvce2},
        {bill: "Total", exp: mm_vc_total, confidence: cbvc2},
        {bill: "Bill At Risk"},
        {bill: "VaR", exp: bvar_bp && bvar ? `${bvar_bp} [${bvar}]` : ""},
        {bill: "CVaR", exp: bcvar_bp && bcvar ? `${bcvar_bp} [${bcvar}]` : ""},
    ]
    const investData = [
        {invest: "intervention cost", exp: mm_cost_total, confidence: cbfixc2},
        {invest: "VaR", exp: fixvar_bp && fixvar ? `${fixvar_bp} [${fixvar}]` : ""},
        {invest: "CVaR", exp: fixcvar_bp && fixcvar ? `${fixcvar_bp} [${fixcvar}]` : ""}
    ]

    function getGraph(data, label = null, dataKey = 'y') {
        return <Col sm="4">
            {label ? <Typography color="textSecondary" className="graph-small-title">
                {label}
            </Typography> : null}
            <Card style={{width: "100%"}}>
                <BarChart width={180} height={180} data={data}>
                    <Bar dataKey={dataKey} fill="#8884d8"/>
                </BarChart>
            </Card>
        </Col>
    }

    function getDataTable(data, columns, styles, rowStyles) {
        return <Card className="mt-4">
            <DataTable
                data={data}
                columns={columns}
                customStyles={styles}
                noHeader={true}
                conditionalRowStyles={rowStyles}
            />
        </Card>
    }

    function runMonteCarlo() {
        setMonteCarloLabel("Running...")
        return editProjectParams(dispatch, props.project_id, {...project_params, number_of_monte_carlo_runs: numberOfRuns})
            .then(() => fetchMonteCarloData(dispatch, project_id, selected_cases_ids))
            .then(() => setMonteCarloLabel(Project_EngineeringAnalysis_monteCarloLabel))
    }

    return (
        <Row>
            <CasesTable state={props.state} dispatch={dispatch}
                        prefix={"Project_"} project_id={project_id} disableUI={true}/>

            <Col sm="7" className="mt-3">
                <div className="graphs-title">Energy ({type}) kWh</div>
                <Row>
                    {getGraph(graph_values["mc_q_d"] ?? [], "needed")}
                    {getGraph(graph_values["mc_q_f"] ?? [], "fuel")}
                    {getGraph(graph_values["mc_q_e"] ?? [], "electric")}
                </Row>
                <div className="graphs-title mt-2">Bill ({type}) €</div>
                <Row>
                    {getGraph(graph_values["mc_vc_f"] ?? [], "fuel")}
                    {getGraph(graph_values["mc_vc_e"] ?? [], "electric")}
                    {getGraph(graph_values["mc_vc_total"] ?? [], "energy bill")}
                </Row>
                <div className="graphs-title mt-2">Intervention costs</div>
                <Row>
                    {getGraph(graph_values["mc_total_cost"] ?? [])}
                </Row>
            </Col>
            <Col sm="5" className="mt-3">
                <Row className="mt-1">
                    <Col sm="4">
                        <Button className="equipment-modal-button rb-button rb-purple-button"
                                disabled={monteCarloLabel === "Running..."}
                                onClick={runMonteCarlo}>{monteCarloLabel}
                        </Button>
                    </Col>
                    <Col sm="4">
                        <TextInputControl min={1} value={numberOfRuns} is_integer_input={true}
                                          onValChange={(v, id) => setNumberOfRuns(v)}
                                          placeholder="number of runs"/>
                    </Col>
                    <Col sm="4">
                        <div className="d-flex">
                            <div className="small-combobox">
                                <ComboBox value={type} onChange={e => setType(e.target.value)}
                                          options={["current", "planned", "savings"]}/>

                            </div>
                        </div>
                    </Col>
                </Row>
                <div className="mt-4">
                    {getDataTable(energyData, getEnergyColumns(confidence_level), energyStyles, conditionalRowStyles)}
                    {getDataTable(billData, getBillColumns(confidence_level), energyStyles, conditionalRowStyles)}
                    {getDataTable(investData, getInvestColumns(confidence_level), energyStyles, conditionalRowStyles)}
                </div>
            </Col>
        </Row>
    );
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default EngineeringAnalysis