import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {td_columns} from "./constants_columns";

function ThermalData(props) {
    return (
        <Table
            title="Data"
            data={props.data}
            columns={td_columns}
            highlightOnHover
            selectableRows={false}
            theme="solarized"
            customStyles={tableStyles}
        />
    )
}

export default ThermalData