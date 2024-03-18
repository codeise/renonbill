import {Col, Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {fetch, isErrorStatusCode} from "./commonFunctions"
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import React, {useState} from "react";
import {default_project_params} from "./defaultState";
import {BASE_URL} from "./environment_vars";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

function AddProjectModal(props) {
    const MySwal = withReactContent(Swal)

    const [name, setName] = useState("");

    function onSubmit(e) {
        e.preventDefault()
        fetch(BASE_URL + 'api/projects/', "POST", props.dispatch, {
            "name": name,
            "user_id": localStorage.getItem("user_id"),
            "params": default_project_params
        }).then(r => {
            if (isErrorStatusCode(r.status)) {
                let error_msg = ""
                for (let [key, value] of Object.entries(r.data)) {
                    error_msg += key + ": " + value + "\n"
                }
                MySwal.fire({
                    title: "Adding project failed!",
                    text: error_msg,
                    showConfirmButton: true,
                })
                props.handleClose()
            } else {
                props.handleSave()
            }
        })
    }

    return (
        <Modal show={true} animation={false} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add new project</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    <Form.Group as={Row} controlId="formPlaintextEmail">
                        <Form.Label column sm="3" className="pr-0">
                            Project Name
                        </Form.Label>
                        <Col sm="9">
                            <Form.Control type="text" placeholder="Name"
                                          onChange={e => setName(e.target.value)} value={name}/>
                        </Col>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button type="submit" variant="primary">
                        Save
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );

}

export default AddProjectModal