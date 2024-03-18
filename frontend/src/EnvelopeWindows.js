import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {ew_table_1_columns, ew_table_2_columns} from "./constants_columns";

function EnvelopeWindows(props) {
    return (
        <div>
            <Table
                title="Table 1"
                data={props.data.table1}
                columns={ew_table_1_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 2"
                data={props.data.table2}
                columns={ew_table_2_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
        </div>
    )
}

export default EnvelopeWindows