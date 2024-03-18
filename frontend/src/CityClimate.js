import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {cc_columns} from "./constants_columns";

function CityClimate(props) {
    return (
        <Table
            title="Data"
            data={props.data}
            columns={cc_columns}
            highlightOnHover
            selectableRows={false}
            theme="solarized"
            customStyles={tableStyles}
        />
    )
}

export default CityClimate