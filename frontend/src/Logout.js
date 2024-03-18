import React, {useEffect, useState} from "react"
import {Redirect} from "react-router-dom";
import {login_route} from "./constants";

function Logout(props) {
    const [logoutRedirect, setLogoutRedirect] = useState(false)

    useEffect(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token")
        setLogoutRedirect(true)
    }, []);

    return logoutRedirect ? <Redirect to={login_route}/> : null
}

export default Logout