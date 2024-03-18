import React from "react"
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import {Tab, Tabs} from "react-bootstrap";
import Users from "./Users";
import Projects from "./Projects";
import Header from "./Header";

function Home(props) {
    const prefix = "Home_"
    const dispatch = props.dispatch
    const state = props.state

    return (
        <Container className="pt-3">
            <Card>
                <Card.Body className="h-100 bgi"
                           style={{backgroundColor: 'rgb(243 243 243)', backgroundImage: "url(/renonbill_home1.jpg)"}}>
                </Card.Body>
                <Card.Body className="h-100 card-min-height" style={{backgroundColor: 'transparent', zIndex: 999}}>
                    <Header dispatch={dispatch} state={state} comboboxVisible={false} />
                    <Tabs defaultActiveKey="projects" id="uncontrolled-tab-example" className="border-bottom mb-3 ml-0">
                        <Tab eventKey="projects" title="Projects">
                            <Projects prefix={prefix} state={props.state} dispatch={props.dispatch}/>
                        </Tab>
                        <Tab eventKey="users" title="Users">
                            <Users prefix={prefix} state={props.state} dispatch={props.dispatch}/>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Home