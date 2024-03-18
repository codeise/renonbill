import React from "react"
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import {dispatchSetField} from "./commonFunctions";
import TextInputControl from "./TextInputControl";

function EditCaseFinancialAnalysis(props) {
    const temporaryCase = props.state["Project_EditCase_temporaryCase"]
    const discount_rate = temporaryCase.discount_rate
    const setDiscountRate = dr => dispatchSetField(props.dispatch, "Project_EditCase_temporaryCase",
        "discount_rate", dr)

    return (
        <Card style={{width: '100%', backgroundColor: '#fffffff2'}} className="small-border-radius h-100">
            <Card.Header className="my-card-header bold-headers">
                Financial Analysis
            </Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            Discount Rate
                        </Form.Label>
                        <Col sm="9">
                            <TextInputControl placeholder="Discount Rate" disabled={props.inputsDisabled}
                                              value={discount_rate} min={0} max={99} is_integer_input={false}
                                              onValChange={(v, id) => setDiscountRate(v)}/>
                        </Col>
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
    )
}

export default EditCaseFinancialAnalysis