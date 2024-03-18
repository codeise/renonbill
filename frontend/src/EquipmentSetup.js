import React, {useEffect, useState} from "react"
import Card from "react-bootstrap/Card";
import EquipmentRadioBoxes from "./EquipmentRadioBoxes";
import EquipmentCheckboxBox from "./EquipmentCheckboxBox";
import {Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import EquipmentHeatingModal from "./EquipmentHeatingModal";
import EquipmentDHWModal from "./EquipmentDHWModal";
import EquipmentEnvelopeModal from "./EquipmentEnvelopeModal";
import {fetch, getPropsAreEqualFunction} from "./commonFunctions"
import {setHeating} from "./Services/Case";
import {BASE_URL} from "./environment_vars";

const heatingCurrentRadios = [
    {id: "heatingCurrentRadiosBurner", value: 1, label: "burner"},
    {id: "heatingCurrentRadiosPalletStove", value: 2, label: "pellet stove"},
    {id: "heatingCurrentRadiosHeatPump", value: 3, label: <>heat pump<br/>(splitter)</>}
]
const heatingPlannedRadios = [
    {id: "heatingPlannedRadiosBurner", value: 1, label: "burner"},
    {id: "heatingPlannedRadiosPalletStove", value: 2, label: "pellet stove"},
    {id: "heatingPlannedRadiosHeatPump", value: 3, label: <>heat pump<br/>(splitter)</>}
]

const DHWCurrentRadios = [
    {id: "DHWCurrentRadiosNoDevice", value: 0, label: "no device"},
    {id: "DHWCurrentRadiosElectricBoiler", value: 1, label: "electric boiler"},
    {id: "DHWCurrentRadiosGasBurner", value: 2, label: "gas burner"},
    {id: "DHWCurrentRadiosHeatPump", value: 3, label: "heat pump"}
]
const DHWPlannedRadios = [
    {id: "DHWPlannedRadiosNoDevice", value: 0, label: "no device"},
    {id: "DHWPlannedRadiosElectricBoiler", value: 1, label: "electric boiler"},
    {id: "DHWPlannedRadiosGasBurner", value: 2, label: "gas burner"},
    {id: "DHWPlannedRadiosHeatPump", value: 3, label: "heat pump"}
]

const envelopeCurrentCheckbox = [
    {id: "envelopeCurrentCheckboxWallInsulationCheck", value: "wall_insulation_check", label: "insul. walls"},
    {id: "envelopeCurrentCheckboxRoofInsulationCheck", value: "roof_insulation_check", label: "insul. roof"},
    {id: "envelopeCurrentCheckboxFloorInsulationCheck", value: "floor_insulation_check", label: "insul. floor"}
]
const envelopePlannedCheckbox = [
    {id: "envelopePlannedCheckboxWallInsulationCheck", value: "wall_insulation_check", label: "insul. walls"},
    {id: "envelopePlannedCheckboxRoofInsulationCheck", value: "roof_insulation_check", label: "insul. roof"},
    {id: "envelopePlannedCheckboxFloorInsulationCheck", value: "floor_insulation_check", label: "insul. floor"}
]

function getVarsFromState(state, prefix) {
    return {
        heatingTypes: state[prefix + "heatingTypes"],
        plantTypes: state[prefix + "plantTypes"],
        heating_current: state[prefix + "heating_current"],
        heating_planned: state[prefix + "heating_planned"],
        dhw_current: state[prefix + "dhw_current"],
        dhw_planned: state[prefix + "dhw_planned"],
        envelope_default: state[prefix + "envelope_default"],
        envelope_current: state[prefix + "envelope_current"],
        envelope_planned: state[prefix + "envelope_planned"],
    }
}

function getPrefix(prefix) {
    return prefix + "EquipmentSetup_"
}

const EquipmentSetup = React.memo(function (props) {
    const prefix = getPrefix(props.prefix);
    const dispatch = props.dispatch
    const state = getVarsFromState(props.state, prefix)
    const caseToEdit = props.caseToEdit
    const {heating_current, heating_planned, dhw_current, dhw_planned, envelope_current, envelope_planned} = state

    const [show, setShow] = useState(false);
    const heatingTypes = state["heatingTypes"];
    const plantTypes = state["plantTypes"];

    useEffect(() => {
        fetch(BASE_URL + 'api/heating_types/', 'GET', dispatch,
            {user_id: localStorage.getItem("user_id")}, prefix + "heatingTypes")
            .then(r => fetch(BASE_URL + 'api/plant_types/', 'GET', dispatch,
                {user_id: localStorage.getItem("user_id")}, prefix + "plantTypes"))
    }, [dispatch, prefix])

    useEffect(() => {
        if (caseToEdit && caseToEdit.id) {
            setHeating(dispatch, caseToEdit.current_params, caseToEdit.planned_params)
        }
    }, [dispatch, caseToEdit])

    const handleClose = () => {
        setShow(false)
    }
    const handleShow = () => {
        setShow(true)
    }

    const [showDhW, setShowDHW] = useState(false);
    const handleDHWClose = () => {
        setShowDHW(false)
    }
    const handleDHWShow = () => {
        setShowDHW(true)
    }

    const [showEnvelope, setShowEnvelope] = useState(false);
    const handleEnvelopeClose = () => {
        setShowEnvelope(false)
    }
    const handleEnvelopeShow = () => {
        setShowEnvelope(true)
    }
    return (
        <Card style={{width: '100%', backgroundColor: '#fffffff2'}} className="small-border-radius">
            <Card.Header className="my-card-header bold-headers">
                Equipment Setup
            </Card.Header>
            <Card.Body className="h-100">
                <Row style={{marginBottom: "8px"}}>
                    <Col sm={4} className="font-size-95 bold-headers" style={{paddingLeft: "50px"}}>Current</Col>
                    <Col sm={4} className="font-size-95 bold-headers" style={{paddingLeft: "46px"}}>Planned</Col>
                    <Col sm={4} className="font-size-95 bold-headers" style={{paddingLeft: "32px"}}>Extended Setup</Col>
                </Row>

                <EquipmentRadioBoxes inputsDisabled={props.inputsDisabled} column_name={"heating_type"}
                                     current={heating_current} planned={heating_planned}
                                     currentRadios={heatingCurrentRadios} plannedRadios={heatingPlannedRadios}
                                     button="heating" handleShow={handleShow} state={props.state}
                                     dispatch={dispatch} prefix={prefix + "heating_"}
                />
                <EquipmentRadioBoxes inputsDisabled={props.inputsDisabled} column_name={"DHW_type"}
                                     current={dhw_current} planned={dhw_planned}
                                     currentRadios={DHWCurrentRadios} plannedRadios={DHWPlannedRadios}
                                     button="dhw" handleShow={handleDHWShow} state={props.state}
                                     dispatch={dispatch} prefix={prefix + "dhw_"}/>
                <EquipmentCheckboxBox inputsDisabled={props.inputsDisabled}
                                      current_checkboxes={envelope_current}
                                      planned_checkboxes={envelope_planned}
                                      currentCheckbox={envelopeCurrentCheckbox}
                                      plannedCheckbox={envelopePlannedCheckbox} button="envelope & wins"
                                      handleShow={handleEnvelopeShow} dispatch={dispatch}
                                      state={props.state} prefix={prefix + "envelope_"}/>

                <div className="row">
                    {heatingTypes && heatingTypes.data && show ?
                        <EquipmentHeatingModal state={props.state} dispatch={dispatch}
                                               burner_types={heatingTypes.data.burner_types}
                                               emitter_types={heatingTypes.data.emitter_types}
                                               handleClose={handleClose} currentRadios={heatingCurrentRadios}
                                               plannedRadios={heatingPlannedRadios}/> : null}
                    {plantTypes && plantTypes.data && showDhW ?
                        <EquipmentDHWModal state={props.state} dispatch={dispatch}
                                           plant_types={plantTypes.data.types} currentRadios={DHWCurrentRadios}
                                           plannedRadios={DHWPlannedRadios}
                                           handleClose={handleDHWClose}/> : null}
                    {showEnvelope ? <EquipmentEnvelopeModal
                        state={props.state} dispatch={dispatch}
                        currentRadios={envelopeCurrentCheckbox}
                        plannedRadios={envelopePlannedCheckbox}
                        handleClose={handleEnvelopeClose}
                    /> : null}
                </div>
            </Card.Body>
        </Card>
    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default EquipmentSetup