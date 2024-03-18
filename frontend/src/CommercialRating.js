import Card from "react-bootstrap/Card";
import DataTable from "react-data-table-component";
import {conditionalRowStyles, project_styles} from "./common_styles";
import React, {useEffect, useState} from "react";
import {
    dispatchSetField,
    getCaretPosition,
    getPropsAreEqualFunction,
    setCaretPosition
} from "./commonFunctions";
import TextInputControl from "./TextInputControl";
import _ from 'lodash'

function getVarsFromState(state, prefix) {
    return {
        temporaryCase: _.pick(state["Project_EditCase_temporaryCase"],
            ['churn_rate', 'default_churn_rate', 'churn_rate_95', 'default_churn_rate_95']),
        project_params: state["Project_params"],
    }
}

const CommercialRating = React.memo(function (props) {
    const state = getVarsFromState(props.state)
    const [currentFocus, setCurrentFocus] = useState(null)
    const {dispatch} = props
    const {temporaryCase} = state

    useEffect(() => {
        if (currentFocus) {
            setCaretPosition(currentFocus.id, currentFocus.pos)
        }
    })

    const getChurnRateInputControl = (columnName, alias) => {
        return <div className="mt-1 mb-1">
            <TextInputControl id={columnName + alias} min={0} value={temporaryCase[alias]}
                              is_integer_input={false}
                              onValChange={(v, i) => {
                                  dispatchSetField(dispatch, "Project_EditCase_temporaryCase", alias, v)
                                  setCurrentFocus({id: i, pos: getCaretPosition(document.getElementById(i))})
                              }}
                              disabled={props.inputsDisabled}
            />
        </div>
    }

    const columns = [
        {
            name: '',
            selector: 'columnName',
        },
        {
            name: 'Churn Rate',
            selector: 'churnRate',
            cell: row => getChurnRateInputControl(row.columnName, row.churn_rate_alias)
        },
        {
            name: 'Default Rate',
            selector: 'defaultRate',
            cell: row => getChurnRateInputControl(row.columnName, row.default_rate_alias)
        }
    ];

    const data = [
        {
            columnName: 'exp. val',
            churn_rate_alias: 'churn_rate',
            default_rate_alias: 'default_churn_rate',
        },
        {
            columnName: `95% c.b.`,
            churn_rate_alias: 'churn_rate_95',
            default_rate_alias: 'default_churn_rate_95',
        },
    ]

    return <Card className="small-border-radius">
        <Card.Header className="my-card-header bold-headers">
            Commercial Rating
        </Card.Header>
        <Card.Body>
            <Card>
                <DataTable
                    data={data}
                    columns={columns}
                    customStyles={project_styles}
                    noHeader={true}
                    conditionalRowStyles={conditionalRowStyles}
                />
            </Card>
        </Card.Body>
    </Card>
}, getPropsAreEqualFunction(getVarsFromState, () => null))

export default CommercialRating