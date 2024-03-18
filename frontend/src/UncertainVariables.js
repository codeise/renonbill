import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {
    uv_table_1_columns, uv_table_2_columns, uv_table_3_columns,
    uv_table_4_columns, uv_table_5_columns
} from "./constants_columns";

function UncertainVariables(props) {
    return (
        <div>
            <Table
                title="Table 1"
                data={props.data.table1}
                columns={uv_table_1_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 2"
                data={props.data.table2}
                columns={uv_table_2_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 3"
                data={props.data.table3}
                columns={uv_table_3_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 4"
                data={props.data.table4}
                columns={uv_table_4_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 5"
                data={props.data.table5}
                columns={uv_table_5_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
        </div>
    )
}

export default UncertainVariables