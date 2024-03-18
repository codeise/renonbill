import React, {Fragment, useState} from "react"
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import {Image} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import {home_route, login_route} from "./constants";
import Button from "react-bootstrap/Button";
import {Redirect} from "react-router-dom";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {login, register_user} from "./commonFunctions";

function Register(props) {
    const MySwal = withReactContent(Swal)

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [authRedirect, setAuthRedirect] = useState(false)

    function onSubmit(e) {
        e.preventDefault()
        if (password !== confirmPassword) {
            MySwal.fire({
                title: "Error occurred!",
                text: "Passwords do not match!",
                showConfirmButton: true,
            })
        } else {
            register_user(username, email, password, confirmPassword).catch(error => {
                if (error.response && error.response.status === 400) {
                    const errors = error.response.data;
                    let error_msg = "";
                    Object.keys(errors).forEach((k, i) => {
                        error_msg += '\<p\>' + errors[k][0] + '\<\/p\>'
                        if(i + 1 < errors.length) {
                            error_msg += '\<br\/\>'
                        }
                    })
                    Swal.fire({
                        title: "Error occurred!",
                        html: error_msg
                    })
                }
            }).then(() => login(username, password).then(r => {
                localStorage.setItem("user_id", r.user_id)
                setAuthRedirect(true)
            }))
        }
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
                                    <Form.Group>
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control type="text" name="username" placeholder="Enter username"
                                                      onChange={e => setUsername(e.target.value)} value={username}/>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="text" name="email" placeholder="Enter email"
                                                      onChange={e => setEmail(e.target.value)} value={email}/>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" name="password" placeholder="Enter password"
                                                      onChange={e => setPassword(e.target.value)} value={password}/>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control type="password" name="confirm_password"
                                                      placeholder="Enter password again"
                                                      onChange={e => setConfirmPassword(e.target.value)}
                                                      value={confirmPassword}/>
                                    </Form.Group>
                                    <a href={login_route}>Already registered?</a>
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

export default Register