import React from "react"
import Card from "react-bootstrap/Card";
import DataTable, {createTheme} from 'react-data-table-component';

function Table(props) {
    createTheme('solarized', {
        striped: {
            default:  '#e5eaf945'
        },
    })

    return (
        <Card style={{height: '100%'}} className={"MuiPaper-elevation1" + props.className || ""}>
            <DataTable
                {...props}
                striped={props.striped !== undefined ? props.striped : true}
                highlightOnHover={props.highlightOnHover !== undefined ? props.highlightOnHover : true}
                theme="solarized"
                selectableRows={props.selectableRows !== undefined ? props.selectableRows : true}
                selectableRowsHighlight={props.selectableRowsHighlight !== undefined ? props.selectableRowsHighlight : true}
            />
        </Card>
    )

}

export default Table