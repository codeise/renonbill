import React from "react";
import {Col, Modal} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import ComboBox from "./ComboBox";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {
    _parseInputFloat,
    dispatchSetField, getKeyByValue,
    getPropsAreEqualFunction, getValues,
    minMaxValidation
} from "./commonFunctions";

function getVarsFromState(state, prefix) {
    return {
        current: state[prefix + "current"],
        planned: state[prefix + "planned"],
    }
}

function getPrefix(prefix = null) {
    return "Project_EquipmentSetup_dhw_"
}

const EquipmentDHWModal = React.memo(function (props) {
    const dhw_prefix = getPrefix()
    const state = getVarsFromState(props.state, dhw_prefix)
    const plant_types = props.plant_types;

    function getGroup(type, radios) {
        return <Col sm={6} className="font-size-95 ">
            <div className="border p-3 pl-5 pr-2">
                {radios ? radios.map((radio, i) => {
                        const form_jsx = <Form.Check key={i}
                                                     id={radio.id}
                                                     type="radio"
                                                     value={radio.value}
                                                     label={radio.label}
                                                     disabled={props.inputsDisabled}
                                                     checked={radio.value === state[type]["DHW_type"]}
                                                     onChange={e => {
                                                         dispatchSetField(props.dispatch, dhw_prefix + type,
                                                             "DHW_type", parseInt(e.target.value))
                                                     }}/>
                        return radio.value !== 2 ? form_jsx : <div>
                            {form_jsx}
                            <ComboBox className="mb-3 modal-input"
                                      value={plant_types[state[type].DHW_burner_type]}
                                      disabled={state[type].DHW_type !== 2}
                                      onChange={e => dispatchSetField(props.dispatch, dhw_prefix + type,
                                          "DHW_burner_type", parseInt(getKeyByValue(plant_types, e.target.value)))}
                                      options={getValues(props.plant_types)}/>
                        </div>
                    }
                ) : null}
                <div className="mt-2 d-flex">
                    <div className="mt-2"><Form.Check id={"DHWSolarCheck_" + type} type="checkbox"
                                                      onChange={e => dispatchSetField(props.dispatch,
                                                          dhw_prefix + type, "DHW_solar_check", e.target.checked)}
                                                      checked={state[type].DHW_solar_check}/></div>
                    <div className="ml-2"><label htmlFor={"DHWSolarCheck_" + type}>solar
                        heating<br/>(integration)</label></div>
                    <div className="ml-4 mt-1" style={{width: "50px"}}>
                        <Form.Control className="input-style" size="sm" type="number" min={0} max={0}
                                      onChange={e =>
                                          minMaxValidation(() => dispatchSetField(props.dispatch, dhw_prefix + type,
                                              "DHW_solar_perc", _parseInputFloat(e.target.value)), e.target.value, 0, 1)}
                                      value={state[type].DHW_solar_perc ?? ""}
                                      disabled={!state[type].DHW_solar_check}
                                      placeholder="0...1"/>
                    </div>
                </div>
            </div>
        </Col>
    }

    return (
        <Modal show={true} animation={false} size="lg" onHide={props.handleClose}>
            <Modal.Header closeButton className="rb-modal-header">
                <Modal.Title className="rb-modal-header-title">DHW Setup</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-background">
                <Row className="mb-3">
                    <Col sm={6}>
                        <div className="center font-weight-bold" style={{marginLeft: "-35px"}}>Current</div>
                    </Col>
                    <Col sm={6}>
                        <div className="center font-weight-bold" style={{marginLeft: "-35px"}}>Planned</div>
                    </Col>
                </Row>
                <Row>
                    {getGroup("current", props.currentRadios)}
                    {getGroup("planned", props.plannedRadios)}
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <div className="float-right mt-2"><Button onClick={props.handleClose}
                                                          className="rb-button rb-green-button">Done</Button></div>
            </Modal.Footer>
        </Modal>
    );
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default EquipmentDHWModal