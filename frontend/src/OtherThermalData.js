import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {otd_columns} from "./constants_columns";

function OtherThermalData(props) {
    return (
        <Table
            title="Data"
            data={props.data}
            columns={otd_columns}
            highlightOnHover
            selectableRows={false}
            theme="solarized"
            customStyles={tableStyles}
        />
    )
}

export default OtherThermalData