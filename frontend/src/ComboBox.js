import React from "react"
import Form from "react-bootstrap/Form";

function ComboBox(props) {
    const {options, ...form_props} = props

    return (
        <Form.Control size="sm" as="select" {...form_props}>
            {options ? options.map((option, i) => <option key={i}>{option}</option>) : null}
        </Form.Control>
    )
}

export default ComboBox