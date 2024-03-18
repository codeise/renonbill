import React, {useEffect, useState} from 'react';
import {Route, Redirect} from 'react-router-dom';
import {home_route, login_route} from "./constants";
import {fetch, getRefreshedTokens} from "./commonFunctions";
import {BASE_URL} from "./environment_vars";
import {keyValueUpdateAction} from "./actions";

const AuthenticatedRoute = ({component: Component, state, dispatch, ...rest}) => {
    useEffect(() => {
        if (localStorage.getItem('user_id') && (!state["current_user"] || !(state["current_user"].data))) {
            fetch(BASE_URL + 'api/users/' + localStorage.getItem("user_id"), "GET", dispatch, {},
                "current_user")
        }
    }, [])

    return (
        <Route {...rest} render={
            props => {
                if (state && !state.refreshTokensFailed) {
                    return <Component state={state} dispatch={dispatch} {...rest} {...props} />
                } else {
                    return <Redirect to={login_route}/>
                }
            }
        }/>
    )
}

const OnlyGuestRoute = ({component: Component, state, ...rest}) => {
    const [authRedirect, setAuthRedirect] = useState(false)

    useEffect(() => {
        getRefreshedTokens().then(r => {
            if (!r.failed && localStorage.getItem("user_id")) {
                setAuthRedirect(true)
            }
        }).catch(error => {
        })
    }, [])

    return (
        <Route {...rest} render={
            props => {
                return !authRedirect ? <Component state={state} {...rest} {...props} /> : <Redirect to={home_route}/>
            }
        }/>
    )
}

export {AuthenticatedRoute, OnlyGuestRoute};