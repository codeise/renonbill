import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {
    du_table_1_columns, du_table_2_columns, du_table_3_columns,
    du_table_4_columns, du_table_5_columns
} from "./constants_columns";

function DefaultUncertainty(props) {
    return (
        <div>
            <Table
                title="Table 1"
                data={props.data.table1}
                columns={du_table_1_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 2"
                data={props.data.table2}
                columns={du_table_2_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 3"
                data={props.data.table3}
                columns={du_table_3_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 4"
                data={props.data.table4}
                columns={du_table_4_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 5"
                data={props.data.table5}
                columns={du_table_5_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
        </div>
    )
}

export default DefaultUncertainty