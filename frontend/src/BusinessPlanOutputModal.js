import React from "react";
import {Modal, Tab, Tabs} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {downloadFile, fetch, getPropsAreEqualFunction} from "./commonFunctions";
import {Col} from "antd";
import Card from "react-bootstrap/Card";
import {Bar, ComposedChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis, Scatter, Legend} from "recharts";
import {
    BPDataTable, getBPData, getBPReportDataFromState,
    getCashValuesColumns,
    getEnergySavingsGeneratedColumns, getEnergySavingsTotalColumns, getGraphValues, getInvestmentsColumns,
    getOnBillComponentsColumns, getOperationalCostsTableColumns,
    getRenovationsColumns,
    getResultsColumns, getRevenuesColumns
} from "./Services/BusinessPlan";
import {downloadBpExcel} from "./CoreFunctions";

function getVarsFromState(state, prefix) {
    return {
        projectParamsBpYear: state["Project_params"].bp_year,
        outputData: state["BusinessPlan_outputData"],
    }
}

function getPrefix(prefix = null) {
    return "BusinessPlanOutputModal_"
}

const BusinessPlanOutputModal = React.memo(function (props) {
    const prefix = getPrefix()
    const state = getVarsFromState(props.state)
    const {handleClose, dispatch} = props
    const {projectParamsBpYear, outputData} = state
    const schemeYear = outputData.data?.scheme_year;
    const graphValues = getGraphValues(outputData.data?.graph_values ?? []);

    let max_year = 0;
    graphValues.forEach(v => {
        if (Object.keys(v).length > max_year) {
            max_year = Object.keys(v).length
        }
    })
    let graph_values = Array.from({length: max_year}, (element, index) => (
        {
            "investments": 0,
            "operational_costs": 0,
            "revenues": 0,
            "profits": 0,
            "cash_position": 0,
            "year": index + 1
        }));
    const graph_keys = ["investments", "operational_costs", "revenues", "profits", "cash_position"];
    graphValues.forEach(function (arr, i) {
        Object.keys(arr).forEach(function (key, index) {
            graph_values[index][graph_keys[i]] = parseFloat(arr[key])
        })
    })

    return (
        !outputData.isLoading && !outputData.isError && Object.keys(outputData.data).length > 0 ?
            <Modal show={true} animation={false} dialogClassName="output-modal-w" onHide={handleClose}
                   id="bpOutputModal">
                <Modal.Header className="rb-modal-header">
                    <Modal.Title className="rb-modal-header-title">RenOnBill Pilot Program - Economic Analysis for Utility (levered)</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col sm="12" className="mt-2 mb-3"><BPDataTable label={"Results"}
                                                                    columns={getResultsColumns(projectParamsBpYear)}
                                                                    data={getBPData(outputData.data?.results ?? [], projectParamsBpYear, "name", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Onbill Components (€)"}
                                     columns={getOnBillComponentsColumns(projectParamsBpYear)}
                                     data={getBPData(outputData.data?.on_bill_components ?? [], projectParamsBpYear, "case_order", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Total Energy Savings (kWh)"}
                                     columns={getEnergySavingsTotalColumns(schemeYear)}
                                     data={getBPData(outputData.data?.energy_savings_total ?? [], schemeYear, "case_order", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Number of energy efficiency renovations"}
                                     columns={getRenovationsColumns(projectParamsBpYear)}
                                     data={getBPData(outputData.data?.number_of_renovations ?? [], projectParamsBpYear, "case_order", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Investments (€)"} columns={getInvestmentsColumns(projectParamsBpYear)}
                                     data={getBPData(outputData.data?.investments ?? [], projectParamsBpYear, "case_order", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Revenues"} columns={getRevenuesColumns(schemeYear)}
                                     data={getBPData(outputData.data?.revenues ?? [], schemeYear, "case_order", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Operational Costs (€)"}
                                     columns={getOperationalCostsTableColumns(projectParamsBpYear)}
                                     data={getBPData(outputData.data?.operational_costs ?? [], projectParamsBpYear, "case_order", true)}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-3">
                        <BPDataTable label={"Cash Values (€)"} columns={getCashValuesColumns(schemeYear)}
                                     data={getBPData(outputData.data?.cash_values ?? [], schemeYear, "name", true)}/>
                    </Col>
                    <Col sm="12" className="mt-5">
                        <div className="mb-2">RenOnBill Pilot Program - Economic Analysis for Utility (levered)</div>
                        <div className="mb-3" align="center">
                            <Card>
                                <ComposedChart width={1200} height={360} data={graph_values}>
                                    <CartesianGrid strokeDasharray="3 3"
                                                   vertical={false}
                                                   horizontal={false}
                                    />
                                    <XAxis dataKey="year" domain={[0, 'dataMax']} unit=" years"/>
                                    <YAxis type="number" width={100} domain={['dataMin', 'dataMax']}
                                           tickFormatter={tick => {
                                               return tick.toLocaleString();
                                           }} unit=" €"/>
                                    <ReferenceLine y={0} stroke="#000"/>
                                    <Tooltip cursor={{strokeDasharray: '3 3'}} formatter={(value) => new Intl.NumberFormat('en').format(value)}/>
                                    <Legend />
                                    <Bar name="Total Investments Per Year (€)" dataKey="investments" fill="#373C78" barSize={25}/>
                                    <Bar name="Total Operational Costs (€)" dataKey="operational_costs" fill="#96C3B3" barSize={25}/>
                                    <Bar name="Total Revenues (€)" dataKey="revenues" fill="#FAAF14" barSize={25}/>
                                    <Scatter name="Total Net Profits (€)" dataKey="profits" line={{stroke: "#505050", strokeWidth: 3}}
                                             fill="#505050"/>
                                    <Scatter name="Cash Position (€)" dataKey="cash_position" line={{stroke: "#C8C8C8", strokeWidth: 3}}
                                             fill="#C8C8C8"/>
                                </ComposedChart>
                            </Card>
                        </div>
                    </Col>
                </Modal.Body>
                <Modal.Footer>
                    <div className="float-right mt-2">
                        <Button className="rb-button rb-blue-button mr-2"
                                onClick={e => downloadBpExcel(dispatch, outputData, projectParamsBpYear, schemeYear, getBPReportDataFromState(props.state))}>Download</Button>
                    </div>
                    <div className="float-right mt-2">
                        <Button className="rb-button rb-red-button mr-2"
                                onClick={handleClose}>Cancel</Button>
                    </div>
                </Modal.Footer>
            </Modal> : null
    );

}, getPropsAreEqualFunction(getVarsFromState, () => null))

export default BusinessPlanOutputModal
