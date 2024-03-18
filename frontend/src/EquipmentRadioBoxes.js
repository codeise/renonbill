import React from "react"
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {dispatchSetField} from "./commonFunctions";

function EquipmentRadioBoxes(props) {
    const prefix = props.prefix;

    function getGroup(radios, value, type) {
        return <Col sm={4}>
            {radios ? radios.map((radio, i) =>
                <Form.Check key={i}
                            id={radio.id}
                            type="radio"
                            value={radio.value}
                            label={radio.label}
                            disabled={props.inputsDisabled}
                            checked={radio.value === value}
                            onChange={e => {
                                dispatchSetField(props.dispatch, prefix + type,
                                    props.column_name, parseInt(e.target.value))
                            }}
                />
            ) : null}

        </Col>
    }

    return (
        <Form className="font-size-95">
            <fieldset>
                <Form.Group className="equipment-border mb-3">
                    <Row>
                        {getGroup(props.currentRadios, props.current[props.column_name], "current")}
                        {getGroup(props.plannedRadios, props.planned[props.column_name], "planned")}
                        <Col sm={4} className="m-auto">
                            <Button className="equipment-modal-button rb-button rb-purple-button"
                                    disabled={props.inputsDisabled}
                                    onClick={props.handleShow}>{props.button}</Button>
                        </Col>
                    </Row>
                </Form.Group>
            </fieldset>
        </Form>
    )
}

export default EquipmentRadioBoxes