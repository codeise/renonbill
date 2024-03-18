import React, {useEffect, useState} from "react"
import {Col, ProgressBar} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import DataTable from "react-data-table-component";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import {Bar, CartesianGrid, ComposedChart, Tooltip, XAxis, YAxis} from "recharts";
import Button from "react-bootstrap/Button";
import {conditionalRowStyles, project_styles} from "./common_styles";
import {getPropsAreEqualFunction, setCaretPosition} from "./commonFunctions";
import {updateProjectRating} from "./CoreFunctions";
import CasesTable from "./CasesTable";
import {Field} from "./commonComponents";

function getVarsFromState(state, prefix) {
    return {
        project_params: state["Project_params"],
        data: state[prefix + "data"],
        updateLabel: state[prefix + "updateLabel"],
        cases: state["Project_CasesTable_cases"],
        cases_table_disabled: state["Project_CasesTable_disabled"]
    }
}

function getPrefix(prefix = null) {
    return "ProjectRating_"
}

const Graphs = React.memo(function (props) {
    const prefix = getPrefix()
    const state = getVarsFromState(props.state, prefix)
    const {data} = state
    const pub_rating_bar_graph = data["pub_rating_bar_graph"] ? data["pub_rating_bar_graph"].map((v, i) => {
        return {name: `Rating ${i}`, pv: v}
    }) : []
    const {pub_rating_score_1, pub_rating_score_2} = data

    return <Row>
        <Col sm="6">
            <Card className="w-85 mt-3">
                <Card.Header className="graph-header">Ratings</Card.Header>
                <Card.Body>
                    <ComposedChart layout="vertical" width={400} height={320}
                                   data={pub_rating_bar_graph} margin={{bottom: -30}}>
                        <CartesianGrid/>
                        <XAxis type="number" domain={[0, 100]} tick={false}/>
                        <YAxis width={0} dataKey="name" type="category" scale="band" tick={false}/>
                        <Tooltip/>
                        <Bar dataKey="pv" fill="#8884d8"/>
                    </ComposedChart>
                </Card.Body>
            </Card>
        </Col>
        <Col sm="6">
            <Card className="mt-3">
                <Card.Header className="graph-header">Project Score #1</Card.Header>
                <Card.Body>
                    <ProgressBar now={pub_rating_score_1 ?? 0} label={`${pub_rating_score_1 ?? 0}%`}/>
                    <Row className="mt-1">
                        <Col sm="6">
                            <div className="d-flex progress-bar-text-size">
                                <div className="mr-1 font-weight-500">min:</div>
                                <div className="progress-bar-numbers-color">0</div>
                            </div>
                        </Col>
                        <Col sm="6">
                            <div className="d-flex float-right progress-bar-text-size">
                                <div className="mr-1 font-weight-500">max:</div>
                                <div className="progress-bar-numbers-color">100</div>
                            </div>
                        </Col>
                    </Row>

                </Card.Body>
            </Card>
            <Card className="mt-3">
                <Card.Header className="graph-header">Project Score #2</Card.Header>
                <Card.Body>
                    <ProgressBar now={pub_rating_score_2 ?? 0} label={`${pub_rating_score_2 ?? 0}%`}/>
                    <Row className="mt-1">
                        <Col sm="6">
                            <div className="d-flex progress-bar-text-size">
                                <div className="mr-1 font-weight-500">min:</div>
                                <div className="progress-bar-numbers-color">0</div>
                            </div>
                        </Col>
                        <Col sm="6">
                            <div className="d-flex float-right progress-bar-text-size">
                                <div className="mr-1 font-weight-500">max:</div>
                                <div className="progress-bar-numbers-color">100</div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    </Row>
}, getPropsAreEqualFunction((state, prefix) => {
    return {data: state[prefix + "data"]}
}, getPrefix))

const ProjectRatingTab = React.memo(function (props) {
    const prefix = getPrefix()
    const dispatch = props.dispatch
    const [currentFocus, setCurrentFocus] = useState(null)
    const project_id = props.project_id
    const state = getVarsFromState(props.state, prefix)
    const {data, project_params, updateLabel} = state
    const selected_cases_ids = state["cases"].selected.map(c => c.id)
    const pub_rating_print_values = data["pub_rating_print_values"] ?? []
    const {confidence_level} = project_params

    useEffect(() => {
        if (currentFocus) {
            setCaretPosition(currentFocus.id, currentFocus.pos)
        }
    })

    const ratingData = [
        {
            id: "Esav",
            weight: project_params["weight_Esav"],
            dimension: "Engineering",
            parameter: "Energy Savings %",
            min: project_params["min_Esav"],
            max: project_params["max_Esav"],
            expVal: pub_rating_print_values["exp_esav"],
            cb95: pub_rating_print_values["cb_esav"],
            rating: pub_rating_print_values["rating_esav"]
        },
        {
            id: "NPV",
            weight: project_params["weight_NPV"],
            dimension: "Financial",
            parameter: "NPV €",
            min: project_params["min_NPV"],
            max: project_params["max_NPV"],
            expVal: pub_rating_print_values["exp_npv"],
            cb95: pub_rating_print_values["cb_npv"],
            rating: pub_rating_print_values["rating_npv"]
        },
        {
            id: "IRR",
            weight: project_params["weight_IRR"],
            dimension: "Financial",
            parameter: "IRR %",
            min: project_params["min_IRR"],
            max: project_params["max_IRR"],
            expVal: pub_rating_print_values["exp_irr"],
            cb95: pub_rating_print_values["cb_irr"],
            rating: pub_rating_print_values["rating_irr"]
        },
        {
            id: "Dpayback",
            weight: project_params["weight_Dpayback"],
            dimension: "Financial",
            parameter: "Disc. Payback yrs.",
            min: project_params["min_Dpayback"],
            max: project_params["max_Dpayback"],
            expVal: pub_rating_print_values["exp_d_payback"],
            cb95: pub_rating_print_values["cb_d_payback"],
            rating: pub_rating_print_values["rating_d_payback"]
        },
        {
            id: "loss_risk",
            weight: project_params["weight_loss_risk"],
            dimension: "Financial",
            parameter: "loss risk %",
            min: project_params["min_loss_risk"],
            max: project_params["max_loss_risk"],
            expVal: pub_rating_print_values["exp_loss_risk"],
            cb95: pub_rating_print_values["cb_loss_risk"],
            rating: pub_rating_print_values["rating_loss_risk"]
        },
        {
            id: "churn_rate",
            weight: project_params["weight_churn_rate"],
            dimension: "Commercial",
            parameter: "Churn Rate %",
            min: project_params["min_churn_rate"],
            max: project_params["max_churn_rate"],
            expVal: pub_rating_print_values["exp_churn_rate"],
            cb95: pub_rating_print_values["cb_churn_rate"],
            rating: pub_rating_print_values["rating_churn_rate"]
        },
        {
            id: "default_rate",
            weight: project_params["weight_default_rate"],
            dimension: "Commercial",
            parameter: "Default Rate %",
            min: project_params["min_default_rate"],
            max: project_params["max_default_rate"],
            expVal: pub_rating_print_values["exp_default_rate"],
            cb95: pub_rating_print_values["cb_default_rate"],
            rating: pub_rating_print_values["rating_default_rate"]
        },
    ]
    let ratingColumns = [
        {
            name: 'Weight',
            selector: 'weight',
            cell: row => <Field type={"weight"} row={row} prefix={"Project_"} dispatch={dispatch}
                                setFocus={setCurrentFocus}
                                min={1} max={null}/>
        },
        {
            name: 'Dimension',
            selector: 'dimension',
        },
        {
            name: 'Parameter',
            selector: 'parameter',
        },
        {
            name: 'Min (0)',
            selector: 'min',
            cell: row => {
                let field_props = {
                    type: "min",
                    row: row,
                    prefix: "Project_",
                    dispatch: dispatch,
                    setFocus: setCurrentFocus
                }
                if (row.id === "Esav") {
                    field_props["min"] = 0;
                    field_props["max"] = 100;
                } else if (row.id === "NPV") {
                    field_props["min"] = 0;
                } else if (row.id === "IRR") {
                    field_props["min"] = 0;
                    field_props["max"] = 100;
                } else {
                    field_props["min"] = 0;
                    field_props["max"] = 100;
                }
                return <Field {...field_props}/>
            }
        },
        {
            name: 'Max (100)',
            selector: 'max',
            cell: row => {
                let field_props = {
                    type: "max",
                    row: row,
                    prefix: "Project_",
                    dispatch: dispatch,
                    setFocus: setCurrentFocus
                }
                if (row.id === "Esav") {
                    field_props["min"] = 0;
                    field_props["max"] = 100;
                } else if (row.id === "NPV") {
                    field_props["min"] = 0;
                } else if (row.id === "IRR") {
                    field_props["min"] = 0;
                    field_props["max"] = 200;
                } else {
                    field_props["min"] = 0;
                    field_props["max"] = 100;
                }
                return <Field {...field_props}/>
            }
        },
        {
            name: 'exp. val',
            selector: 'expVal',
            cell: row => <div className="mt-1 mb-1">
                <Form.Control className="input-style readOnly" size="sm" type="text"
                              value={row.expVal}
                              disabled
                              placeholder="" readOnly={true}/>
            </div>

        },
        {
            name: `${confidence_level}% c.b.`,
            selector: 'cb95',
            cell: row => {
                return <div className="mt-1 mb-1">
                    <Form.Control className="input-style readOnly" size="sm" type="text"
                                  value={parseFloat(row.cb95) === -1000000.0 ? NaN.toString() : row.cb95}
                                  disabled
                                  placeholder="" readOnly={true}/>
                </div>
            }
        },
        {
            name: 'Rating (0...100)',
            selector: 'rating',
            cell: row => <div className="mt-1 mb-1">
                <Form.Control className="input-style readOnly" size="sm" type="text"
                              value={row.rating}
                              disabled
                              placeholder="" readOnly={true}/>
            </div>
        },
    ];

    return (
        <div>
            <CasesTable state={props.state} dispatch={dispatch} prefix={"Project_"}
                        project_id={project_id} disableUI={true}/>

            <Row>
                <Col sm="12">
                    <Button className="mt-3 mb-2 rb-button rb-purple-button float-right"
                            onClick={e => updateProjectRating(dispatch, project_id, project_params, selected_cases_ids)}
                    >{updateLabel}</Button>
                </Col>
            </Row>

            <Row>
                <Col sm="12">
                    <Card>
                        <DataTable
                            data={ratingData}
                            columns={ratingColumns}
                            customStyles={project_styles}
                            noHeader={true}
                            conditionalRowStyles={conditionalRowStyles}
                        />
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col sm="12" className="mt-3 d-flex">
                    <Card className="w-100">
                        <Card.Body className="p-10">
                            For values less than the minimum value the rating is 0 and for values larger than max value
                            rating is 100
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Graphs state={props.state}/>
        </div>
    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default ProjectRatingTab