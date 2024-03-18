import {Link} from 'react-router-dom';
import React from "react"
import {Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import {getPropsAreEqualFunction} from "./commonFunctions";
import Form from "react-bootstrap/Form";
import {keyValueUpdateAction} from "./actions";
import Button from "react-bootstrap/Button";
import {generateReportExcel} from "./CoreFunctions";


function getVarsFromState(state, prefix) {
    return {
        headerLabel: state[prefix + "headerLabel"],
        subHeaderLabel: state[prefix + "subHeaderLabel"],
    }
}

function getPrefix(prefix = null) {
    return "Report_"
}

const ReportTab = React.memo(function (props) {
    const {dispatch, project_id} = props
    const prefix = getPrefix()
    const state = getVarsFromState(props.state, prefix)
    const {headerLabel, subHeaderLabel} = state;

    return (
        <div>
            <Card>
                <Card.Body>
                    <Row>
                        <Col sm="6">
                            <Form.Label>Header</Form.Label>
                            <Form.Control className="input-style" size="sm" type="text"
                                          onChange={e => dispatch(keyValueUpdateAction(prefix + "headerLabel", e.target.value))}
                                          value={headerLabel}/>
                            <Form.Label className="mt-3">Sub Header</Form.Label>
                            <Form.Control className="input-style" size="sm" type="text"
                                          onChange={e => dispatch(keyValueUpdateAction(prefix + "subHeaderLabel", e.target.value))}
                                          value={subHeaderLabel}/>
                        </Col>
                        <Col sm="6">
                            <Col sm="7">
                                <div style={{marginTop: "30px"}} className="d-flex">
                                    <div className="mb-1 mr-3">
                                        <Link to={"/report/" + project_id}
                                              className="rb-button rb-purple-button btn btn-primary report-button">Open</Link>
                                    </div>
                                    <div className="mb-1">
                                        <Button size="sm"
                                                onClick={e => generateReportExcel(dispatch, project_id, headerLabel, subHeaderLabel)}
                                                className="rb-button rb-purple-button btn btn-primary report-button">Download</Button>
                                    </div>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                    <Row className="mt-3">

                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default ReportTab