import {Col, Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import React from "react";
import Form from "react-bootstrap/Form";
import {_parseInputFloat, dispatchSetField, getPropsAreEqualFunction} from "./commonFunctions";
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import {setEnvelopeDefaults} from "./Services/Case";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {Project_EquipmentSetup_envelope_default} from "./defaultState";
import _ from "lodash"

function getVarsFromState(state, prefix) {
    return {
        default: state[prefix + "default"],
        current: state[prefix + "current"],
        planned: state[prefix + "planned"],
        temporaryCase: state["Project_EditCase_temporaryCase"],
        caseInfoConstants: state["Project_EditCase_caseInfoConstants"]
    }
}

function getPrefix(prefix = null) {
    return "Project_EquipmentSetup_envelope_"
}

const EquipmentEnvelopeModal = React.memo(function (props) {
    const MySwal = withReactContent(Swal)
    const envelope_prefix = getPrefix()
    const dispatch = props.dispatch
    const state = getVarsFromState(props.state, envelope_prefix)
    const isDefault = state["default"]
    const {country, building_type, building_year} = state["temporaryCase"]
    const caseInfoConstants = state["caseInfoConstants"];

    function getCheckboxGroup(type, checkboxes) {
        return checkboxes ? checkboxes.map((checkbox, i) => <div key={i} className="d-flex"
                                                                 style={{marginTop: "1.65rem"}}>
                <div className="label-width"><label htmlFor={checkbox.id}>{checkbox.label}</label></div>
                <div>
                    <Form.Check
                        key={checkbox.id}
                        id={checkbox.id}
                        value={checkbox.value}
                        checked={state[type][checkbox.value]}
                        onChange={e => dispatchSetField(dispatch,
                            envelope_prefix + type, checkbox.value, e.target.checked)}
                    />
                </div>
            </div>
        ) : null
    }

    function getInputBox(type, alias, placeholder, l1, l2, disabled, small_text = null) {
        return <div className="d-flex" style={{marginTop: "23px"}} key={alias}>
            <div className="mr-3">
                <div className="envelope-big-symbol">{l1}</div>
                <div className="small-text letter-next-symbol">{l2}</div>
            </div>
            <div className="envelope-input">
                <Form.Control size="sm" type="number" min={0} onChange={
                    e => dispatchSetField(dispatch, envelope_prefix + type, alias, _parseInputFloat(e.target.value))
                }
                              value={state[type][alias]}
                              disabled={disabled || isDefault}/>
            </div>
            {small_text ? <div className="mt-2 small-text-13 important-text" style={{marginLeft: "7.5px"}}> {small_text}
            </div> : null}
        </div>
    }

    function getFooterCheckboxes(type) {
        return <Col sm={6} className="font-size-95">
            <Row className="pb-4 border envelope-margins">
                <Col sm={6} className="pl-4">
                    <div key="uw" className="d-flex" style={{marginTop: "18px"}}>
                        <div className="mr-3">
                            <div className="envelope-big-symbol">U</div>
                            <div className="small-text letter-next-symbol">win =</div>
                        </div>
                        <div className="envelope-input">
                            <Form.Control size="sm" type="number" min={0}
                                          onChange={e =>
                                              dispatchSetField(dispatch, envelope_prefix + type, "window_transmittance_value",
                                                  _parseInputFloat(e.target.value))}
                                          value={state[type]["window_transmittance_value"]}
                                          disabled={isDefault}/>
                        </div>
                        <div className="mt-2 small-text-13 important-text" style={{marginLeft: "7.5px"}}> single glazed
                        </div>
                    </div>
                </Col>
                <Col sm={6} className="pl-3">
                    <div key="sw" className="d-flex" style={{marginTop: "18px", marginLeft: "12px"}}>
                        <div className="mr-3 d-flex">
                            <div className="envelope-big-symbol">S</div>
                            <div className="small-text s-small-text ">w</div>
                            <div className="ml-2 mr-2">/</div>
                            <div className="envelope-big-symbol">S</div>
                            <div className="small-text s-small-text">floor</div>
                        </div>
                        <div className="envelope-input">
                            <Form.Control size="sm" type="number" min={0}
                                          onChange={e =>
                                              dispatchSetField(dispatch, envelope_prefix + type, "window_to_surface_area_ratio",
                                                  _parseInputFloat(e.target.value))}
                                          value={state[type]["window_to_surface_area_ratio"]}
                                          disabled={isDefault}/>
                        </div>
                    </div>
                </Col>
            </Row>
        </Col>
    }

    function getGroup(type, checkboxes) {
        return <Col sm={6} className="font-size-95">
            <Row className="pb-4 border envelope-margins">
                <Col sm={4} className="pl-4">
                    {getCheckboxGroup(type, checkboxes)}
                </Col>
                <Col sm={4}>
                    {getInputBox(type, "wall_envelope_thermal_conductivity", "0.03", "λ", "w =", !state[type]["wall_insulation_check"])}
                    {getInputBox(type, "roof_envelope_thermal_conductivity", "0.03", "λ", "R =", !state[type]["roof_insulation_check"])}
                    {getInputBox(type, "floor_envelope_thermal_conductivity", "0.03", "λ", "F =", !state[type]["floor_insulation_check"])}
                </Col>
                <Col sm={4} className="">
                    {getInputBox(type, "wall_thickness", "0.1", "S", "w =", !state[type]["wall_insulation_check"])}
                    {getInputBox(type, "roof_thickness", "0.1", "S", "R =", !state[type]["roof_insulation_check"])}
                    {getInputBox(type, "floor_thickness", "0.1", "S", "F =", !state[type]["floor_insulation_check"])}
                </Col>
            </Row>
        </Col>
    }

    return (
        <Modal dialogClassName="modal-90w" show={true} animation={false} onHide={props.handleClose}>
            <Modal.Header closeButton className="rb-modal-header">
                <Modal.Title className="rb-modal-header-title">Envelope properties</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Col sm={5}>
                        <div className="center font-weight-bold" style={{marginLeft: "85px"}}>Current</div>
                    </Col>
                    <Col sm={7} className="d-flex">
                        <div style={{marginLeft: "15px"}}>
                            <Form.Check
                                id={"windowFlagCheck"}
                                label={"default"}
                                checked={isDefault}
                                onChange={e => {
                                    const checked = e.target.checked
                                    if (checked) {
                                        MySwal.fire({
                                            title: 'Do you want to restore the default values?',
                                            showDenyButton: true,
                                            confirmButtonText: 'Yes',
                                            denyButtonText: `No`,
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                dispatch(keyValueUpdateAction(envelope_prefix + "default", checked))
                                                let reset_values = _.pick(Project_EquipmentSetup_envelope_default,
                                                    ['wall_thickness', 'roof_thickness', 'floor_thickness',
                                                        'wall_envelope_thermal_conductivity',
                                                        'roof_envelope_thermal_conductivity',
                                                        'floor_envelope_thermal_conductivity'
                                                    ])
                                                dispatch(prefixUpdateAction(envelope_prefix + "current", reset_values))
                                                dispatch(prefixUpdateAction(envelope_prefix + "planned", reset_values))
                                                setEnvelopeDefaults(country, building_type, building_year,
                                                    caseInfoConstants, dispatch)
                                            }
                                        })
                                    } else {
                                        dispatch(keyValueUpdateAction(envelope_prefix + "default", checked))
                                    }
                                }}
                            />
                        </div>
                        <div className="center font-weight-bold" style={{marginLeft: "135px"}}>Planned</div>
                    </Col>
                </Row>
                <Row>
                    {getGroup("current", props.currentRadios)}
                    {getGroup("planned", props.plannedRadios)}
                </Row>
                <Row className="mt-3">
                    {getFooterCheckboxes("current")}
                    {getFooterCheckboxes("planned")}
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <div className="float-right mt-2"><Button onClick={props.handleClose}
                                                          className="rb-button rb-green-button">Done</Button></div>
            </Modal.Footer>
        </Modal>
    );
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default EquipmentEnvelopeModal