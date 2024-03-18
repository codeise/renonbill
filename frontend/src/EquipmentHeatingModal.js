import {Col, Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import React from "react";
import ComboBox from "./ComboBox";
import {
    _parseInputFloat,
    dispatchSetField,
    getKeyByValue,
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
    return "Project_EquipmentSetup_heating_"
}

const EquipmentHeatingModal = React.memo(function (props) {
    const heating_prefix = getPrefix();
    const state = getVarsFromState(props.state, heating_prefix)
    const burner_types = props.burner_types || []
    const emitter_types = props.emitter_types || []

    function getGroup(type, radios) {
        return <Col key={type} sm={6} className="font-size-95 pl-4 mt-3">
            {radios ? radios.map((radio, i) => {
                    let first_radio = i === 0;
                    const form_jsx = <Form.Check key={i}
                                                 type="radio"
                                                 id={radio.id}
                                                 value={radio.value}
                                                 label={radio.label}
                                                 disabled={props.inputsDisabled}
                                                 checked={radio.value === state[type]["heating_type"]}
                                                 onChange={e => {
                                                     dispatchSetField(props.dispatch, heating_prefix + type,
                                                         "heating_type", parseInt(e.target.value))
                                                 }}/>

                    return !first_radio ? form_jsx : <div key={i}>
                        {form_jsx}
                        <ComboBox className="mb-3 modal-input"
                                  value={burner_types[state[type].burner_type]}
                                  disabled={state[type].heating_type !== 1}
                                  onChange={e => dispatchSetField(props.dispatch, heating_prefix + type,
                                      "burner_type", parseInt(getKeyByValue(burner_types, e.target.value)))}
                                  options={getValues(burner_types)}/>
                    </div>
                }
            ) : null}

            <div style={{marginTop: "115px"}}>heat emission
                <ComboBox className="mt-1 modal-input"
                          value={emitter_types[state[type].emitter_type]}
                          onChange={e => {
                              dispatchSetField(props.dispatch, heating_prefix + type,
                                  "emitter_type", parseInt(getKeyByValue(emitter_types, e.target.value)))
                          }}
                          options={getValues(emitter_types)}/>
            </div>
            <div className="mt-4 d-flex">

                <div className="mt-2">
                    <Form.Check id={"solarCheck" + type} type="checkbox" onChange={e => dispatchSetField(props.dispatch,
                        heating_prefix + type, "solar_check", e.target.checked)}
                                checked={state[type].solar_check}/>
                </div>
                <div className="ml-2"><label htmlFor={"solarCheck" + type}>solar
                    heating<br/>(integration)</label></div>
                <div className="ml-4 mt-1 " style={{width: "50px"}}>
                    <Form.Control className="input-style" size="sm" type="number" min={0} max={1}
                                  onChange={e => minMaxValidation(() => dispatchSetField(props.dispatch, heating_prefix + type,
                                          "solar_perc", _parseInputFloat(e.target.value)), e.target.value, 0, 1)
                                  }
                                  value={state[type].solar_perc ?? ""}
                                  disabled={!state[type].solar_check}
                                  placeholder="0...1"/>
                </div>
            </div>
        </Col>
    }

    return (
        <Modal dialogClassName="modal-90w" show={true} animation={false} onHide={props.handleClose}>
            <Modal.Header closeButton className="rb-modal-header">
                <Modal.Title className="rb-modal-header-title">Heating Means Setup</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-2 mt-2">
                    <Col sm={7}>
                        <Row>
                            <Col sm={6} key="current">
                                <div style={{textAlign: "center"}} className="font-weight-bold">Current</div>
                            </Col>
                            <Col sm={6} key="planned">
                                <div style={{textAlign: "center"}} className="font-weight-bold">Planned</div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="ml-0">
                    <Col sm={7} className="border-top border">
                        <Row>
                            {getGroup("current", props.currentRadios)}
                            {getGroup("planned", props.plannedRadios)}
                        </Row>
                    </Col>

                    <Col sm={5}>
                        <div style={{fontSize: "0.9em", backgroundColor: "#f9fddc"}} className="border p-3">
                            1- Type B open chamber heat generators <br/>
                            2- Type C sealed chamber heat generators <br/>
                            3- Gas or diesel heat generators with air blown or premixed modulating burner <br/>
                            4- Condensing gas heat generators <br/>
                            5- Gas or diesel hot air generators with blown or premixed air burner, on-off operator <br/>
                            6- Air-cooled gas hot air generators with sealed chamber with fan in type B or C combustion
                            circuit, on-off operation <br/>
                        </div>
                        <div style={{fontSize: "0.9em", backgroundColor: "#f9fddc"}} className="border p-3 mt-4">
                            1- Radiators <br/>
                            2- Radiators w ThermoStat. Valve <br/>
                            3- Fan coil units <br/>
                            4- Floor panels <br/>
                            5- Ceiling and wall panels <br/>
                            6- Other types
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <div className="float-right mt-2"><Button onClick={props.handleClose}
                                                          className="rb-button rb-green-button">Done</Button></div>
            </Modal.Footer>
        </Modal>
    );

}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default EquipmentHeatingModal