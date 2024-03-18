import Table from "./Table";
import {tableStyles} from "./common_styles";
import React, {useEffect, useState} from "react";
import {
    addCase, deleteCase,
    deselectAllCases,
    editCase,
    fetchCases,
    loadDefaultInput,
    updateSelectedCases,
    validateCase
} from "./Services/Case";
import _ from "lodash";
import Button from "react-bootstrap/Button";
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import {
    _parseInputFloat,
    getErrorsHTML,
    getPropsAreEqualFunction,
    isSuccessStatusCode
} from "./commonFunctions";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {fetchConsumptionData} from "./CoreFunctions";
import {
    default_case_common_params,
    default_case_current_params,
    default_case_fixed_costs,
    default_case_planned_params
} from "./defaultState";

function getVarsFromState(state, prefix) {
    return {
        temporaryCase: state["Project_EditCase_temporaryCase"],
        caseInfoConstants: state["Project_EditCase_caseInfoConstants"],
        discountRateConstants: state["Project_EditCase_discountRateConstants"],
        disabled: state[prefix + "disabled"],
        cases: state[prefix + "cases"],
        heating_current: state["Project_EquipmentSetup_heating_current"],
        heating_planned: state["Project_EquipmentSetup_heating_planned"],
        dhw_current: state["Project_EquipmentSetup_dhw_current"],
        dhw_planned: state["Project_EquipmentSetup_dhw_planned"],
        envelope_current: state["Project_EquipmentSetup_envelope_current"],
        envelope_planned: state["Project_EquipmentSetup_envelope_planned"],
        envelope_default: state["Project_EquipmentSetup_envelope_default"],
        project_params: state["Project_params"]
    }
}

function getPrefix(prefix) {
    return prefix + "CasesTable_"
}

const CasesTable = React.memo(function (props) {
    const MySwal = withReactContent(Swal)

    const prefix = getPrefix(props.prefix)
    const dispatch = props.dispatch
    const state = getVarsFromState(props.state, prefix)
    const {temporaryCase, caseInfoConstants, discountRateConstants, disabled, project_params} = state;
    const {floor_count, floor_area} = temporaryCase
    const indexless_cases = state["cases"]
    const cases = {
        ...indexless_cases, data: indexless_cases.data.map((c, i) => {
            return {...c, table_index: i + 1}
        })
    }
    const inputsDisabled = cases.selected.length !== 1;
    const disableUI = props.disableUI
    const [forceRenderFlag, setForceRenderFlag] = useState(false)
    const forceRender = () => setForceRenderFlag(!forceRenderFlag)

    let cases_table_columns = [
        {
            name: 'n',
            selector: 'table_index',
            sortable: true,
        },
        {
            name: 'n dw',
            selector: 'common_params.dwelling_count',
            sortable: true,
        },
        {
            name: 'n flo',
            selector: 'common_params.floor_count',
            sortable: true,
        },
        {
            name: 'Country',
            selector: 'common_params.country',
            sortable: true,
        },
        {
            name: 'City',
            selector: 'common_params.city',
            sortable: true,
        },
        {
            name: 'Build. Type',
            selector: 'common_params.building_type',
            sortable: true,
        },
        {
            name: 'Year',
            selector: 'common_params.building_year',
            sortable: true,
        },
        {
            name: 'Floor Area (m2)',
            selector: 'common_params.floor_area',
            sortable: true,
        },
        {
            name: 'Invest. (€)',
            selector: 'fixed_costs.total_case_cost',
            sortable: true,
        },
        {
            name: 'Net Inv. (€)',
            selector: 'fixed_costs.cost_loan_bonus',
            sortable: true,
        },
        {
            name: 'NPV (€)',
            selector: 'fixed_costs.qvan',
            sortable: true,
        },
        {
            name: 'NPV/m2 (€/m2)',
            selector: 'fixed_costs.qvan_m2',
            sortable: true,
        },
        {
            name: 'IRR (%)',
            selector: 'fixed_costs.qirr',
            sortable: true,
        },
        {
            name: 'IRR-DRate (%)',
            selector: 'fixed_costs.qirr_discount',
            sortable: true,
            cell: row => _parseInputFloat(parseFloat(row.fixed_costs.qirr_discount).toFixed(2))
        },
        {
            name: 'DRate (%)',
            selector: 'fixed_costs.discount_rate',
            sortable: true,
            cell: row => _parseInputFloat(parseFloat(row.fixed_costs.discount_rate).toFixed(2))
        },
        {
            name: 'PI',
            selector: 'fixed_costs.quick_pi',
            sortable: true,
        },
        {
            name: 'DPBack.',
            selector: 'fixed_costs.qpb',
            sortable: true,
        },
    ];

    useEffect(() => {
        if (disableUI) return;
        dispatch(keyValueUpdateAction(prefix + "disabled",
            cases.selected.length === 1 && !_.isEqual(cases.selected[0].common_params, temporaryCase)))
    }, [cases.selected, dispatch, prefix, temporaryCase])

    function onSelectedRowsChange(o) {
        if (o.selectedCount === 0) {
            loadDefaultInput(floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch, cases)
        } else if (props.singular_selection && o.selectedCount > 1) {
            forceRender()
            return
        }
        updateSelectedCases(dispatch, o.selectedCount, o.selectedRows, prefix + "cases")
        if (props.onSelectedRowsChange) props.onSelectedRowsChange(o)
    }

    function addEmptyCase() {
        const new_case = {
            project_id: props.project_id,
            common_params: default_case_common_params,
            current_params: default_case_current_params,
            planned_params: default_case_planned_params,
            fixed_costs: default_case_fixed_costs,
        }
        dispatch(prefixUpdateAction(prefix + "cases", {
            selectedCount: cases.selectedCount + 1,
            selected: cases.selected.concat(new_case),
            data: cases.data.concat(new_case)
        }))
    }

    function onClickDelete() {
        const deleteCases = () => cases.selected.reduce((a, c) =>
            a.then(() => deleteCase(dispatch, c.id)), Promise.resolve())
            .then(() => fetchCases(props.project_id, dispatch, prefix + "cases"))
        if (cases.selected.length > 1) {
            MySwal.fire({
                title: 'Are you sure you want to delete these cases?',
                showDenyButton: true,
                confirmButtonText: 'Yes',
                denyButtonText: `No`,
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteCases()
                }
            })
        } else {
            deleteCases()
        }
    }

    function onClickSave() {
        const {
            heating_current, heating_planned, dhw_current, dhw_planned,
            envelope_current, envelope_planned, envelope_default_flag
        } = state;

        const current = {
            ...heating_current, ...dhw_current, ...envelope_current,
            window_flag: envelope_default_flag,
        }
        const planned = {
            ...heating_planned, ...dhw_planned, ...envelope_planned,
            window_flag: envelope_default_flag,
        }

        const errors = validateCase({common: temporaryCase, current: current, planned: planned})
        const caseToEdit = cases.selected[0];
        let new_cases = cases;
        new_cases.data.forEach(c => {
            if (c.id === caseToEdit.id) {
                c["common_params"] = temporaryCase;
                c["current_params"] = current;
                c["planned_params"] = planned;
            }
        })

        if (Object.keys(errors).length === 0) {
            dispatch(keyValueUpdateAction("Project_EditCase_validationErrors", {}))

            const continuation = r => {
                if (!isSuccessStatusCode(r.status)) {
                    MySwal.fire({
                        title: "Errors occurred!",
                        html: getErrorsHTML(r.data)
                    })
                } else {
                    fetchCases(caseToEdit.project_id, dispatch, prefix + "cases")
                        .then(() => {
                            deselectAllCases(dispatch, prefix + "cases")
                            loadDefaultInput(floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch, new_cases)
                        }).then(() => fetchConsumptionData(dispatch, props.project_id))
                }
            }

            if (caseToEdit.id) {
                editCase(dispatch, caseToEdit.id, caseToEdit.project_id, temporaryCase, current, planned).then(continuation)
            } else {
                addCase(dispatch, caseToEdit.project_id, temporaryCase, current, planned, project_params["bp_year"]).then(continuation)
            }
        } else {
            MySwal.fire({
                title: "Validation errors!",
                html: <div>
                    {
                        Object.keys(errors).map((key, index) => <p
                            key={index}>{key}: {errors[key]}</p>)
                    }
                </div>
            })
            dispatch(keyValueUpdateAction("Project_EditCase_validationErrors", errors))
        }
    }

    function onClickCancel() {
        const other_data = [...cases.data]
        const last_case = other_data.pop()

        dispatch(prefixUpdateAction(prefix + "cases", {
            selected: [],
            selectedCount: 0,
            data: last_case.id ? cases.data : other_data
        }))
        // loadDefaultInput(floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch, cases), probably redundant, remove after testing
        dispatch(keyValueUpdateAction("Project_EditCase_validationErrors", {}))
    }

    const actions = (
        disableUI ? null : <div style={{zIndex: 1000}}>
            {!inputsDisabled ?
                <Button onClick={onClickSave} style={{zIndex: 1000}}
                        className="rb-button rb-green-button mr-4">&nbsp;&nbsp;Save&nbsp;&nbsp;</Button> : null}
            {cases.selected.length > 0 && !disableUI &&
            (cases.selected.length === 1 ? cases.selected[0].id : true) ?
                <Button onClick={onClickDelete} style={{zIndex: 1000}}
                        className="rb-button rb-red-button mr-1">Delete</Button> : null}
            {!inputsDisabled ?
                <Button onClick={onClickCancel} style={{zIndex: 1000}}
                        className="rb-button rb-yellow-button">Cancel</Button> : null}
            {cases.selected.length === 0 ?
                <Button variant="primary" size="sm" className="rb-button rb-green-button"
                        onClick={addEmptyCase}
                        style={{zIndex: 1000}}>Add
                    Case</Button> : null}
        </div>
    );

    return <Table
        disabled={disabled}
        onSelectedRowsChange={onSelectedRowsChange}
        data={cases.data}
        columns={cases_table_columns}
        actions={actions}
        title={""}
        customStyles={tableStyles}
        selectableRowSelected={r => cases.selected.filter(c => c.id === r.id).length > 0}
        selectableRows={true}
        selectableRowsOnClick={true}
        theme="solarized"
        fixedHeader={true}
        fixedHeaderScrollHeight={"30vh"}
        contextMessage={{singular: 'Group of renovations', plural: 'Groups of renovations', message: 'selected'}}
    />
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default CasesTable