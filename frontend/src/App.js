import './App.css';
import './selectSearch.css';
import 'antd/dist/antd.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Switch,} from "react-router-dom";
import Login from "./Login";
import Projects from "./Projects";
import {useReducer} from "react";
import {init, reducer} from "./reducer"
import Project from "./Project";
import {AuthenticatedRoute, OnlyGuestRoute} from "./AuthRoutes";
import Home from "./Home";
import Logout from "./Logout";
import Report from "./Report";
import Register from "./Register";
import NotFoundPage from "./NotFoundPage";

function App() {
    const [state, dispatch] = useReducer(reducer, 1, init);

    return (
        state ?
            <Router>
                <Switch>
                    <OnlyGuestRoute exact path="/login"
                                    component={Login} dispatch={dispatch} state={state}/>
                    <OnlyGuestRoute exact path="/register"
                                    component={Register} dispatch={dispatch} state={state}/>
                    <AuthenticatedRoute exact path="/logout"
                                        component={Logout} dispatch={dispatch} state={state}/>
                    <AuthenticatedRoute exact path={["/", "/home"]}
                                        component={Home} dispatch={dispatch} state={state}/>
                    <AuthenticatedRoute exact path="/projects"
                                        component={Projects} dispatch={dispatch} state={state}/>
                    <AuthenticatedRoute exact path="/project/:id"
                                        component={Project} dispatch={dispatch} state={state}/>
                    <AuthenticatedRoute exact path="/report/:id"
                                        component={Report} dispatch={dispatch} state={state}/>
                    <AuthenticatedRoute exact path="/project_not_found"
                                        component={NotFoundPage} dispatch={dispatch} state={state}/>
                </Switch>
            </Router> : null
    );
}

export default App;
