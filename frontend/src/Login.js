import React, {Fragment, useState} from "react"
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import {Redirect} from "react-router-dom";
import {isErrorStatusCode, login, UNAUTHORIZED_STATUS_CODE} from "./commonFunctions";
import {keyValueUpdateAction} from "./actions";
import {home_route, register_route} from "./constants";
import {Image} from "react-bootstrap";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {BASE_URL} from "./environment_vars";

function Login(props) {
    const MySwal = withReactContent(Swal)

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [authRedirect, setAuthRedirect] = useState(false)

    function onSubmit(e) {
        e.preventDefault()
        login(username, password).then(r => {
            props.dispatch(keyValueUpdateAction("refreshTokensFailed", false))
            localStorage.setItem("user_id", r.user_id)
            setAuthRedirect(true)
        }).catch(error => {
            if (error.response) {
                let error_msg = ""
                if (error.response.status === UNAUTHORIZED_STATUS_CODE) {
                    error_msg = error.response.data.detail
                } else if (isErrorStatusCode(error.response.status)) {
                    for (let [key, value] of Object.entries(error.response.data)) {
                        error_msg += key + ": " + value + "\n"
                    }
                }
                MySwal.fire({
                    title: "Login failed!",
                    text: error_msg,
                    showConfirmButton: true,
                })
            }
        })
    }

    return (
        !authRedirect ? <Fragment>
            <div className="login-background font-size-95">
                <Container className="d-flex vh-100">
                    <Row className="m-auto">
                        <Card style={{width: '25rem'}} className="login-padding">
                            <Card.Body>
                                <div className="center">
                                    <Image src="/renonbill_logo.png"
                                           className="rb-login-logo "/>
                                </div>

                                <Form onSubmit={onSubmit}>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control type="text" name="username" placeholder="Enter email"
                                                      onChange={e => setUsername(e.target.value)} value={username}/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" name="password" placeholder="Enter password"
                                                      onChange={e => setPassword(e.target.value)} value={password}/>
                                    </Form.Group>
                                    <a href={register_route}>Not registered yet?</a>
                                    <Button variant="primary"
                                            className="rb-button rb-purple-button w-100 mt-3 login-button"
                                            type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Row>
                </Container>
            </div>
        </Fragment> : <Redirect to={home_route}/>
    )
}

export default Login