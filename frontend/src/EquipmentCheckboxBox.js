import React from "react"
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {dispatchSetField} from "./commonFunctions";

function EquipmentCheckboxBox(props) {
    const prefix = props.prefix

    function getGroup(type, checkboxes) {
        return <Col sm={4}>
            {checkboxes ? checkboxes.map((checkbox, i) => {
                return <Form.Check key={i}
                                id={checkbox.id}
                                disabled={props.inputsDisabled}
                                value={checkbox.value}
                                label={checkbox.label}
                                checked={props[type + "_checkboxes"][checkbox.value]}
                                onChange={e => dispatchSetField(props.dispatch,
                                    prefix + type, checkbox.value, e.target.checked)}
                    />
                }
            ) : null}
        </Col>
    }

    return (
        <Form>
            <fieldset>
                <div className="font-size-95">
                    <Form.Group className="equipment-border">
                        <Row>
                            {getGroup("current", props.currentCheckbox)}
                            {getGroup("planned", props.plannedCheckbox)}
                            <Col sm={4} className="m-auto">
                                <Button className="equipment-modal-button rb-button rb-purple-button"
                                        disabled={props.inputsDisabled}
                                        onClick={props.handleShow}>{props.button}</Button>
                            </Col>

                        </Row>
                    </Form.Group>
                </div>
            </fieldset>
        </Form>
    )
}

export default EquipmentCheckboxBox