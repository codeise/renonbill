import React, {useCallback, useEffect, useRef, useState} from "react"
import Button from "react-bootstrap/Button";
import Table from "./Table";
import {BoxArrowUp, FolderSymlink, XCircle} from "react-bootstrap-icons";
import {fetch} from "./commonFunctions"
import AddProjectModal from "./AddProjectModal";
import {Redirect} from "react-router-dom";
import {BASE_URL} from "./environment_vars";
import {deleteProject} from "./Services/Project";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {exportProject, constantsExist} from "./CoreFunctions";
import {projectsStyles} from "./common_styles";

function Projects(props) {
    const MySwal = withReactContent(Swal)
    const prefix = props.prefix + "Projects_";
    const dispatch = props.dispatch
    const state = props.state
    const [show, setShow] = useState(false);
    const projects = state[prefix + "projects"];
    const [redirectProjectID, setRedirectProjectID] = useState(null)
    const constants = props.state["Home_Users_constants"]
    const browseFileRef = useRef(null);
    const currentUser = props.state["current_user"]

    const columns = [
        {
            name: 'ID',
            selector: 'id'
        },
        {
            name: 'Project Name',
            selector: 'name'
        },
        {
            name: 'Open',
            cell: row => <Button variant="success" size="sm" className="rb-icon"
                                 onClick={() => {
                                     if (!constants.data) {
                                         MySwal.fire({
                                             title: "Operation failed!",
                                             text: "You must upload constants in order to be able to open projects!"
                                         })
                                     } else {
                                         constantsExist(dispatch, row.id).then(r => {
                                             if (!r.data.exists) {
                                                 MySwal.fire({
                                                     title: "Operation failed!",
                                                     text: "The user must upload constants in order for you to be " +
                                                         "able to open their projects!"
                                                 })
                                             } else setRedirectProjectID(row.id)
                                         })
                                     }
                                 }}>
                <FolderSymlink/>
            </Button>,
            allowOverflow: true,
            button: true,

        },
        {
            name: 'Export',
            cell: row => <Button onClick={e => exportProject(dispatch, row.id, row.name)} variant="warning" size="sm"
                                 className="rb-icon"><BoxArrowUp/></Button>,
            allowOverflow: true,
            button: true,
        },
        {
            name: 'Delete',
            cell: row => <Button variant="danger" size="sm" className="rb-icon"
                                 onClick={() => {
                                     MySwal.fire({
                                         title: 'Are you sure, all cases and the project will be deleted',
                                         showDenyButton: true,
                                         confirmButtonText: 'Yes',
                                         denyButtonText: `No`,
                                     }).then((result) => {
                                         if (result.isConfirmed) {
                                             delProject(row.id)
                                         }
                                     })
                                 }}><XCircle/></Button>,
            allowOverflow: true,
            button: true,
        }];

    const handleFileChange = (file) => {
        if (!file) return; //if no file is selected and cancel is pressed, this function gets called with file as null
        const formData = new FormData();
        formData.append("importFile", file, file.name);
        fetch(BASE_URL + 'api/import_project/', 'POST', dispatch, formData).then(r => fetchProjects())
    }

    const handleClose = () => {
        setShow(false)
    };

    const handleSave = () => {
        fetchProjects().then(() => handleClose())
    }

    const handleShow = () => {
        setShow(true)
    };

    const handleImport = () => {
        browseFileRef.current?.click();
    };

    const actions = [
        <Button variant="primary" size="sm" key="addButton" className="rb-button rb-green-button" onClick={handleShow}>Add
            Project</Button>,
        <Button variant="info" size="sm" key="importButton" className="rb-button rb-blue-button" onClick={handleImport}>Import
            Project</Button>
    ];

    const fetchProjects = () => {
        if (currentUser && !currentUser.isLoading && currentUser.data) {
            if (currentUser.data.is_superuser) {
                return fetch(BASE_URL + 'api/projects/', "GET", dispatch, {}, prefix + "projects")
            } else {
                return fetch(BASE_URL + 'api/user_projects/' + localStorage.getItem("user_id"),
                    "GET", dispatch, {}, prefix + "projects")
            }
        }
    }

    useEffect(() => {
        if (dispatch) fetchProjects()
    }, [currentUser])

    function delProject(id) {
        deleteProject(dispatch, id).then(r => fetchProjects())
    }

    return (
        redirectProjectID ? <Redirect to={"/project/" + redirectProjectID}/> : (
            (projects && !projects.isLoading) ?
                <div>
                    <input ref={browseFileRef} onChange={e => handleFileChange(e.target.files[0])}
                           className="d-none" type="file"/>

                    <div className="row">
                        {show ? <AddProjectModal dispatch={dispatch}
                                                 handleClose={handleClose} handleSave={handleSave}/> : null}
                    </div>

                    <Table selectableRows={false} data={projects.data} columns={columns} actions={actions}
                           title="Projects"
                           handleShow={handleShow}
                           customStyles={projectsStyles}
                    />
                </div>
                : null)
    )
}

export default Projects
