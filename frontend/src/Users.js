import React, {useCallback, useEffect, useRef, useState} from "react"
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import {XSquare} from "react-bootstrap-icons";
import DeleteUserModal from "./DeleteUserModal";
import AddUserModal from "./AddUserModal";
import {downloadFile, fetch} from "./commonFunctions";
import Table from "./Table";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import {tableStyles} from "./common_styles";
import {keyValueUpdateAction} from "./actions";
import ConstantsTabs from "./ConstantsTabs";
import {BASE_URL} from "./environment_vars";

function Users(props) {
    const MySwal = withReactContent(Swal)

    const prefix = props.prefix + "Users_"
    const dispatch = props.dispatch
    const state = props.state

    const [showAdd, setAddShow] = useState(false);
    const [deleteID, setDeleteID] = useState(null)
    const users = state[prefix + "users"];
    const current_user = state["current_user"]
    const constantsFileName = state[prefix + "constants_file_name"];
    const setConstantsFileName = useCallback(name =>
        dispatch(keyValueUpdateAction(prefix + "constants_file_name", name)), [dispatch, prefix])
    const constants = state[prefix + "constants"]

    const browseFileRef = useRef(null);

    const fetchConstants = useCallback(() => {
        fetch(BASE_URL + 'api/user_constants/' + localStorage.getItem("user_id"), "GET", dispatch, {},
            prefix + "constants")
            .then(r => {
                if (r.status === 200) {
                    setConstantsFileName(r.data.file_name)
                } else if (r.status === 204) {
                    setConstantsFileName("No file uploaded")
                }
            })
    }, [dispatch, prefix, setConstantsFileName])

    useEffect(() => {
        fetchConstants();
    }, [fetchConstants])

    const handleUpload = () => {
        browseFileRef.current?.click();
    };

    const handleDeleteClose = () => {
        setDeleteID(null)
    };
    const handleDeleteShow = (id) => {
        setDeleteID(id)
    };
    const handleDelete = (r) => {
        if (r.status !== 500) {
            fetchUsers().then(() => handleDeleteClose())
        } else {
            MySwal.fire({
                title: "Deleting failed!",
                text: "The user has projects related to it and it can't be deleted!"
            })
        }
    }
    const handleAddClose = () => {
        setAddShow(false)
    };
    const handleAddShow = () => {
        setAddShow(true)
    };
    const handleAdd = () => {
        fetchUsers().then(() => handleAddClose())
    }
    const handleFileChange = (file) => {
        if (!file) return; //if no file is selected and cancel is pressed, this function gets called with file as null
        setConstantsFileName(file.name)
        const formData = new FormData();
        formData.append("constants_file", file, file.name);
        fetch(BASE_URL + 'api/upload_constants/', 'POST', dispatch, formData).then(r => fetchConstants())
    }

    function onClickDownloadConstants() {
        if (constants.data) {
            fetch(BASE_URL + 'api/download_constants/' + localStorage.getItem("user_id"), 'GET',
                dispatch, null, null, null, true)
                .then(r => downloadFile(r.data, constantsFileName))
        } else MySwal.fire({
            title: "Operation failed!",
            text: "No constants uploaded!"
        })
    }

    const actions = [];
    if (current_user && !current_user.isLoading && current_user.data && current_user.data.is_superuser) {
        actions.push(<Button key={0} variant="primary" className="rb-button rb-green-button" size="sm"
                             onClick={handleAddShow}>Add
            User</Button>);
    }
    const columns = [
        {
            name: 'ID',
            selector: 'id',
        },
        {
            name: 'User Name',
            selector: 'username',
        },
        {
            name: 'Email',
            selector: 'email',

        },
        {
            cell: row => {
                return current_user && current_user.data && current_user.data.is_superuser
                && (row.id !== current_user.data.id) ?
                    <Button variant="danger" size="sm" onClick={() => handleDeleteShow(row.id)}><XSquare/></Button>
                    : null
            },
            allowOverflow: true,
            button: true,
            width: '56px',
        }];

    const fetchUsers = () => {
        return fetch(BASE_URL + 'api/users_by_user_permissions/' + current_user.data.id, "GET",
            dispatch, {}, prefix + "users", data => {
                if ((typeof data === 'object' && !Array.isArray(data) && data !== null) || !data) {
                    return null;
                }
                return data;
            })
    }

    useEffect(() => {
        if (current_user && !current_user.isLoading && current_user.data) {
            fetchUsers()
        }
    }, [current_user])

    return (
        (users && !users.isLoading && current_user && !current_user.isLoading &&
            current_user.data && current_user.data.username) ?
            <div>
                <div className="row">
                    {deleteID ? <DeleteUserModal deleteID={deleteID} handleClose={handleDeleteClose} dispatch={dispatch}
                                                 handleDelete={handleDelete}/> : null}
                </div>
                <div className="row">
                    {showAdd ? <AddUserModal handleClose={handleAddClose} handleSave={handleAdd}/> : null}
                </div>
                <Card style={{height: '100%'}} className="MuiPaper-elevation1 mt-4">

                    <Card.Body>
                        <Row style={{paddingLeft: "10px", paddingRight: "10px"}}>
                            <Col sm="8"> <Row>
                                <div className="d-flex mt-1">
                                    <div style={{width: "115px", fontWeight: "600"}}>Constants file:</div>
                                    <div className="ml-1 mr-3">{constantsFileName}</div>
                                </div>
                                <input ref={browseFileRef} onChange={e => handleFileChange(e.target.files[0])}
                                       className="d-none" type="file"/>
                                <Button onClick={handleUpload} variant="warning" size="sm"
                                        className="rb-button rb-yellow-button ml-3">Upload new constants file
                                </Button>
                                <Button variant="warning" size="sm" onClick={onClickDownloadConstants}
                                        className="rb-button rb-yellow-button ml-3">Download
                                    constants
                                    file</Button>
                            </Row></Col>
                            <Col sm="4">
                                <Row className="float-right mt-1">
                                    <div style={{width: "105px", fontWeight: "600"}}>Current user:</div>
                                    <div className="ml-1">{current_user.data.username}</div>
                                </Row>

                            </Col>
                        </Row>


                    </Card.Body>
                </Card>

                {users && users.data ? <Table
                    title="Users"
                    data={users.data}
                    columns={columns}
                    highlightOnHover
                    selectableRows={false}
                    theme="solarized"
                    actions={actions}
                    customStyles={tableStyles}
                /> : null}

                <Card style={{height: '100%'}} className="MuiPaper-elevation1 mt-4">
                    <Card.Body>
                        <Card.Title>Constants</Card.Title>
                        <ConstantsTabs constants={constants}/>
                    </Card.Body>
                </Card>

            </div> : null
    )

}

export default Users