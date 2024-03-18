import {Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {fetch, isErrorStatusCode} from "./commonFunctions"
import Form from "react-bootstrap/Form";
import React, {useState} from "react";
import {BASE_URL} from "./environment_vars";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

function AddUserModal(props) {
    const MySwal = withReactContent(Swal)

    const [username, setUsermame] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function onSubmit(e) {
        e.preventDefault()
        fetch(BASE_URL + 'api/users/', "POST", props.dispatch, {
            "username": username,
            "email": email,
            "password": password,
            "params": {}
        }).then(r => {
            if (isErrorStatusCode(r.status)) {
                let error_msg = ""
                for (let [key, value] of Object.entries(r.data)) {
                    error_msg += key + ": " + value + "\n"
                }
                MySwal.fire({
                    title: "Adding user failed!",
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
                    <Form.Group controlId="formPlaintextEmail">
                        <Form.Label>
                            Username
                        </Form.Label>
                        <Form.Control type="text" placeholder="Username"
                                      onChange={e => setUsermame(e.target.value)} value={username}/>
                    </Form.Group>
                    <Form.Group controlId="exampleForm.ControlInput1">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="name@example.com"
                                      onChange={e => setEmail(e.target.value)} value={email}/>
                    </Form.Group>
                    <Form.Group controlId="formPlaintextPassword">
                        <Form.Label>
                            Password
                        </Form.Label>
                        <Form.Control type="password" placeholder="Password"
                                      onChange={e => setPassword(e.target.value)} value={password}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button type="submit" variant="primary">
                        Create
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );

}

export default AddUserModal