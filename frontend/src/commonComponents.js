import {prefixUpdateAction} from "./actions";
import TextInputControl from "./TextInputControl";
import React, {useEffect} from "react";
import {getCaretPosition} from "./commonFunctions";

const Field = ({type, row, prefix, dispatch, setFocus, min = null, max = null, prefix2 = null}) => {
    if (prefix2 == null) prefix2 = type
    let form_control_props = {
        className: "input-style",
        is_integer_input: false,
        step: 0.01,
        onValChange: (v, id) => {
            dispatch(prefixUpdateAction(prefix + "params", {[id]: v}))
            setFocus({id: id, pos: getCaretPosition(document.getElementById(id))})
        },
        value: row[type],
        name: row.id,
        id: prefix2 + '_' + row.id,
        key: prefix2 + '_' + row.id,
        placeholder: ""
    }
    if (min !== null) form_control_props["min"] = min
    if (max !== null) form_control_props["max"] = max
    return (
        <div className="mt-1 mb-1">
            <TextInputControl {...form_control_props}/>
        </div>
    )
};

export {Field}