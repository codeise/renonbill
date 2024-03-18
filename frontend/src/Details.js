import {Col} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import DataTable from "react-data-table-component";
import Row from "react-bootstrap/Row";
import React, {useCallback, useEffect} from "react";
import {detailsColumns, energyBalanceColumns} from "./tables_columns";
import {conditionalDetailsCellStyles, conditionalRowStyles, detailsStyles} from "./common_styles";
import CasesTable from "./CasesTable";
import {fetchConsumptionData} from "./CoreFunctions";
import {fetch, getPropsAreEqualFunction} from "./commonFunctions";
import {BASE_URL} from "./environment_vars";

function getVarsFromState(state, prefix) {
    return {
        consumptionData: state[prefix + "consumptionData"],
        unit_option: state["Project_params"].unit_option,
        unit_options: state["Header_unitOptions"],
        unit_currencies: state[prefix + "unitCurrencies"],
        cases: state["Project_CasesTable_cases"],
        cases_table_disabled: state["Project_CasesTable_disabled"]
    }
}

function getPrefix(prefix) {
    return prefix + "Details_"
}

const Details = React.memo(function (props) {
    const prefix = getPrefix(props.prefix)
    const {dispatch, project_id} = props
    const state = getVarsFromState(props.state, prefix)
    const consumptionData = state["consumptionData"]
    const unit_option = state["unit_option"]
    const unit_options = state["unit_options"] ? state["unit_options"].data : []
    const unit_currencies = state["unit_currencies"] ? state["unit_currencies"].data : []
    const unit_name = unit_options ? unit_options[unit_option] : "";
    const currency_name = unit_currencies ? unit_currencies[unit_option] : "";

    const {
        current_heating_en_losses,
        current_dhw_en_losses,
        planned_heating_en_losses,
        planned_dhw_en_losses,
        saved_heating_en_losses,
        saved_dhw_en_losses,
        current_heating_fuel_en_consumption,
        current_dhw_fuel_en_consumption,
        planned_heating_fuel_en_consumption,
        planned_dhw_fuel_en_consumption,
        saved_heating_fuel_en_consumption,
        saved_dhw_fuel_en_consumption,
        current_heating_electric_en_consumption,
        current_dhw_electric_en_consumption,
        planned_heating_electric_en_consumption,
        planned_dhw_electric_en_consumption,
        saved_heating_electric_en_consumption,
        saved_dhw_electric_en_consumption,
        current_heating_solar_en_exploitation,
        current_dhw_solar_en_exploitation,
        planned_heating_solar_en_exploitation,
        planned_dhw_solar_en_exploitation,
        saved_heating_solar_en_exploitation,
        saved_dhw_solar_en_exploitation,
        // current_heating_primary_en_consumption,
        // current_dhw_primary_en_consumption,
        // planned_heating_primary_en_consumption,
        // planned_dhw_primary_en_consumption,
        // saved_heating_primary_en_consumption,
        // saved_dhw_primary_en_consumption,
        current_heating_fuel_en_bill,
        current_dhw_fuel_en_bill,
        planned_heating_fuel_en_bill,
        planned_dhw_fuel_en_bill,
        saved_heating_fuel_en_bill,
        saved_dhw_fuel_en_bill,
        current_heating_electric_en_bill,
        current_dhw_electric_en_bill,
        planned_heating_electric_en_bill,
        planned_dhw_electric_en_bill,
        saved_heating_electric_en_bill,
        saved_dhw_electric_en_bill,
        current_heating_en_bill,
        current_dhw_en_bill,
        planned_heating_en_bill,
        planned_dhw_en_bill,
        saved_heating_en_bill,
        saved_dhw_en_bill,
        details_heating_current_ewall,
        details_heating_current_ewin,
        details_heating_current_efloor,
        details_heating_current_eroof,
        details_heating_current_ev,
        details_heating_current_eis,
        details_heating_current_eswin,
        details_heating_planned_ewall,
        details_heating_planned_ewin,
        details_heating_planned_efloor,
        details_heating_planned_eroof,
        details_heating_planned_ev,
        details_heating_planned_eis,
        details_heating_planned_eswin,
        intervention_cost,
        details_heating_difference_ewall,
        details_heating_difference_ewin,
        details_heating_difference_efloor,
        details_heating_difference_eroof,
        details_heating_difference_ev,
        details_heating_difference_eis,
        details_heating_difference_eswin,
    } = consumptionData;

    const detailsData = [
        {
            vertical_column: "energy losses",
            current_heating: current_heating_en_losses,
            current_dhw: current_dhw_en_losses,
            planned_heating: planned_heating_en_losses,
            planned_dhw: planned_dhw_en_losses,
            savings_heating: saved_heating_en_losses,
            savings_dhw: saved_dhw_en_losses,
            unit: unit_name
        },
        {
            vertical_column: "fuel consumption",
            current_heating: current_heating_fuel_en_consumption,
            current_dhw: current_dhw_fuel_en_consumption,
            planned_heating: planned_heating_fuel_en_consumption,
            planned_dhw: planned_dhw_fuel_en_consumption,
            savings_heating: saved_heating_fuel_en_consumption,
            savings_dhw: saved_dhw_fuel_en_consumption,
            unit: unit_name
        },
        {
            vertical_column: "electric consumption",
            current_heating: current_heating_electric_en_consumption,
            current_dhw: current_dhw_electric_en_consumption,
            planned_heating: planned_heating_electric_en_consumption,
            planned_dhw: planned_dhw_electric_en_consumption,
            savings_heating: saved_heating_electric_en_consumption,
            savings_dhw: saved_dhw_electric_en_consumption,
            unit: unit_name
        },
        {
            vertical_column: "solar consumption",
            current_heating: current_heating_solar_en_exploitation,
            current_dhw: current_dhw_solar_en_exploitation,
            planned_heating: planned_heating_solar_en_exploitation,
            planned_dhw: planned_dhw_solar_en_exploitation,
            savings_heating: saved_heating_solar_en_exploitation,
            savings_dhw: saved_dhw_solar_en_exploitation,
            unit: unit_name
        },
        // {
        //     vertical_column: "primary consumption",
        //     current_heating: current_heating_primary_en_consumption,
        //     current_dhw: current_dhw_primary_en_consumption,
        //     planned_heating: planned_heating_primary_en_consumption,
        //     planned_dhw: planned_dhw_primary_en_consumption,
        //     savings_heating: saved_heating_primary_en_consumption,
        //     savings_dhw: saved_dhw_primary_en_consumption,
        //     unit: ""
        // },
        {
            vertical_column: "",
            current_heating: "",
            current_dhw: "",
            planned_heating: "",
            planned_dhw: "",
            savings_heating: "",
            savings_dhw: "",
            unit: ""
        },
        {
            vertical_column: "fuel energy bill",
            current_heating: current_heating_fuel_en_bill,
            current_dhw: current_dhw_fuel_en_bill,
            planned_heating: planned_heating_fuel_en_bill,
            planned_dhw: planned_dhw_fuel_en_bill,
            savings_heating: saved_heating_fuel_en_bill,
            savings_dhw: saved_dhw_fuel_en_bill,
            unit: currency_name
        },
        {
            vertical_column: "electric energy bill",
            current_heating: current_heating_electric_en_bill,
            current_dhw: current_dhw_electric_en_bill,
            planned_heating: planned_heating_electric_en_bill,
            planned_dhw: planned_dhw_electric_en_bill,
            savings_heating: saved_heating_electric_en_bill,
            savings_dhw: saved_dhw_electric_en_bill,
            unit: currency_name
        },
        {
            vertical_column: "energy bill",
            current_heating: current_heating_en_bill,
            current_dhw: current_dhw_en_bill,
            planned_heating: planned_heating_en_bill,
            planned_dhw: planned_dhw_en_bill,
            savings_heating: saved_heating_en_bill,
            savings_dhw: saved_dhw_en_bill,
            unit: currency_name
        },
        {
            vertical_column: "intervention cost",
            current_heating: "",
            current_dhw: "",
            planned_heating: "",
            planned_dhw: "",
            savings_heating: "",
            savings_dhw: intervention_cost,
            unit: currency_name
        },
        {
            vertical_column: "",
            current_heating: "current",
            current_dhw: "current",
            planned_heating: "planned",
            planned_dhw: "planned",
            savings_heating: "savings",
            savings_dhw: "savings",
            unit: ""
        },
    ]

    const energyBalanceData = [
        {
            row_name: "Ewall = outward heat transfer (external walls)",
            current: details_heating_current_ewall,
            planned: details_heating_planned_ewall,
            difference: details_heating_difference_ewall,
            unit: unit_name
        },
        {
            row_name: "Ewin = heat transfer across windows (conduction/convection)",
            current: details_heating_current_ewin,
            planned: details_heating_planned_ewin,
            difference: details_heating_difference_ewin,
            unit: unit_name
        },
        {
            row_name: "Efloor = heat transfer through the floor",
            current: details_heating_current_efloor,
            planned: details_heating_planned_efloor,
            difference: details_heating_difference_efloor,
            unit: unit_name
        },
        {
            row_name: "Eroof = heat transfer through the roof",
            current: details_heating_current_eroof,
            planned: details_heating_planned_eroof,
            difference: details_heating_difference_eroof,
            unit: unit_name
        },
        {
            row_name: "Ev = heat transfer due to ventilation (air exchange)",
            current: details_heating_current_ev,
            planned: details_heating_planned_ev,
            difference: details_heating_difference_ev,
            unit: unit_name
        },
        {
            row_name: "Eis = internal heat source due to persons and equipment",
            current: details_heating_current_eis,
            planned: details_heating_planned_eis,
            difference: details_heating_difference_eis,
            unit: unit_name
        },
        {
            row_name: "Eswin = solar radiation across the windows",
            current: details_heating_current_eswin,
            planned: details_heating_planned_eswin,
            difference: details_heating_difference_eswin,
            unit: unit_name
        },
        {
            row_name: "Heating",
            current: "",
            planned: "",
            difference: "",
            unit: ""
        },
        {
            row_name: "Ed = needed thermal energy",
            current: current_heating_en_losses,
            planned: planned_heating_en_losses,
            difference: saved_heating_en_losses,
            unit: unit_name
        },
        {
            row_name: "Ef = consumed fuel energy",
            current: current_heating_fuel_en_consumption,
            planned: planned_heating_fuel_en_consumption,
            difference: saved_heating_fuel_en_consumption,
            unit: unit_name
        },
        {
            row_name: "Eel = consumed electric energy",
            current: current_heating_electric_en_consumption,
            planned: planned_heating_electric_en_consumption,
            difference: saved_heating_electric_en_consumption,
            unit: unit_name
        },
        {
            row_name: "Hot water",
            current: "",
            planned: "",
            difference: "",
            unit: ""
        },
        {
            row_name: "DHW Ed = needed thermal energy",
            current: current_dhw_en_losses,
            planned: planned_dhw_en_losses,
            difference: saved_dhw_en_losses,
            unit: unit_name
        },
        {
            row_name: "DHW Ef = consumed fuel energy",
            current: current_dhw_fuel_en_consumption,
            planned: planned_dhw_fuel_en_consumption,
            difference: saved_dhw_fuel_en_consumption,
            unit: unit_name
        },
        {
            row_name: "DHW Eel = consumed electric energy",
            current: current_dhw_electric_en_consumption,
            planned: planned_dhw_electric_en_consumption,
            difference: saved_dhw_electric_en_consumption,
            unit: unit_name
        },
    ]

    useEffect(() => {
        fetch(BASE_URL + "api/unit_currencies/", "GET", dispatch, null, prefix + "unitCurrencies")
    }, [dispatch, prefix])

    useEffect(() => {
        fetchConsumptionData(dispatch, project_id)
    }, [dispatch, project_id])

    return <Row>
        <Col sm="12">
            <Card>
                <CasesTable state={props.state} dispatch={dispatch} project_id={project_id} prefix={"Project_"}
                            disableUI={true}
                            onSelectedRowsChange={useCallback(o => {
                                let case_ids
                                if (o.selectedCount > 0) {
                                    case_ids = o.selectedRows.map(row => row.id)
                                } else {
                                    case_ids = null
                                }

                                fetchConsumptionData(dispatch, project_id, case_ids)
                            }, [dispatch, project_id])}/>
            </Card>
            <Card className="mt-3">
                <DataTable
                    data={detailsData}
                    columns={detailsColumns}
                    customStyles={detailsStyles}
                    conditionalRowStyles={conditionalDetailsCellStyles}
                    noHeader={true}
                />
            </Card>
            <Card className="mt-4">
                <DataTable
                    data={energyBalanceData}
                    columns={energyBalanceColumns}
                    customStyles={detailsStyles}
                    conditionalRowStyles={conditionalRowStyles}
                    noHeader={true}
                />
            </Card>
        </Col>
    </Row>
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default Details