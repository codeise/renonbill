import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {vc_columns} from "./constants_columns";

function VariableCosts(props) {
    return (
        <Table
            title="Data"
            data={props.data}
            columns={vc_columns}
            highlightOnHover
            selectableRows={false}
            theme="solarized"
            customStyles={tableStyles}
        />
    )
}

export default VariableCosts