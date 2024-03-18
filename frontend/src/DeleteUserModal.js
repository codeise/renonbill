import {Modal} from "react-bootstrap";
import React from "react";
import Button from "react-bootstrap/Button";
import {fetch} from "./commonFunctions";
import {BASE_URL} from "./environment_vars";

function DeleteUserModal(props) {
    function onDelete(e) {
        e.preventDefault()
        fetch(BASE_URL + 'api/users/' + props.deleteID, "DELETE", props.dispatch)
            .then(r => {
                props.handleDelete(r)
            })
    }

    return (
        <Modal animation={false} show={true} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="alert alert-danger">
                    Are you sure you want to delete this user?
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="default" className="outline-close" onClick={props.handleClose}>
                    Close
                </Button>
                <Button variant="danger" onClick={onDelete}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );

}

export default DeleteUserModal