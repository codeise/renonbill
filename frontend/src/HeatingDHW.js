import React from "react"
import Table from "./Table";
import {tableStyles} from "./common_styles";
import {
    hdhw_table_1_columns, hdhw_table_2_columns,
    hdhw_table_3_columns, hdhw_table_4_columns, hdhw_table_5_columns
} from "./constants_columns";

function HeatingDHW(props) {
    return (
        <div>
            <Table
                title="Table 1"
                data={props.data.table1}
                columns={hdhw_table_1_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 2"
                data={props.data.table2}
                columns={hdhw_table_2_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 3"
                data={props.data.table3}
                columns={hdhw_table_3_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 4"
                data={props.data.table4}
                columns={hdhw_table_4_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
            <Table
                title="Table 5"
                data={props.data.table5}
                columns={hdhw_table_5_columns}
                highlightOnHover
                selectableRows={false}
                theme="solarized"
                customStyles={tableStyles}
            />
        </div>
    )
}

export default HeatingDHW