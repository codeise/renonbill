import React, {useEffect} from "react";
import Form from "react-bootstrap/Form";
import {
    _parseInputFloat,
    _parseInputInt,
    getPropsAreEqualFunction, maxValidation,
    minMaxValidation,
    minValidation, setCaretPosition
} from "./commonFunctions";
import _ from "lodash"

const TextInputControl = props => {
    const {onValChange, min, max, value} = props
    const default_val = props.default_val ?? (min ?? 0)
    let is_integer_input = props["is_integer_input"] ?? true

    const getNewValue = (val, dot_check = true) => {
        let new_value
        if (is_integer_input) new_value = _parseInputInt(val)
        else if (dot_check && val.length > 1 && val.charAt(val.length - 1) === ".") {
            if (val.substring(0, val.length - 1).indexOf('.') > -1) return null
            return val
        } else new_value = _parseInputFloat(val)
        return new_value
    }

    const isValidInput = text => {
        if (text === "" || text === "-" || text === ".") return true
        return is_integer_input ? !isNaN(parseInt(text)) : !isNaN(parseFloat(text))
    }

    const getValue = value => {
        if(value === "") return value
        if (max && value > max) return max;
        if (min && value < min) return min;
        return value;
    }

    return (
        <Form.Control
            type={"text"}
            size={"sm"}
            onChange={e => {
                if (!onValChange || !isValidInput(e.target.value)) return false
                let new_value = getNewValue(e.target.value)
                const fn = () => onValChange(new_value, e.target.id)
                if (new_value === null) {
                    return false
                } else if (new_value === "") {
                    fn()
                    return false
                }
                if (min !== undefined && max !== undefined) {
                    minMaxValidation(fn, new_value, min, max)
                } else if (min !== undefined) {
                    minValidation(fn, new_value, min)
                } else if (max !== undefined) {
                    maxValidation(fn, new_value, max)
                } else {
                    fn()
                }
            }}
            onBlur={e => {
                const val = e.target.value
                if (!onValChange || !isValidInput(val)) return false

                if (val === "") {
                    onValChange(getNewValue(default_val), e.target.id)
                } else if (val.charAt(val.length - 1) === ".") {
                    onValChange(getNewValue(val, false), e.target.id)
                }
            }}
            onWheel={e => e.target.blur()}
            {..._.omit(props, ["is_integer_input", "onValChange"])}
            value={getValue(value)}
        />
    )
}

export default TextInputControl