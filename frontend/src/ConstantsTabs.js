import React from "react"
import {Tab, Tabs} from "react-bootstrap";
import CityClimate from "./CityClimate";
import ThermalData from "./ThermalData";
import EnvelopeWindows from "./EnvelopeWindows";
import HeatingDHW from "./HeatingDHW";
import OtherThermalData from "./OtherThermalData";
import VariableCosts from "./VariableCosts";
import DefaultUncertainty from "./DefaultUncertainty";
import UncertainVariables from "./UncertainVariables";


function ConstantsTabs(props) {
    return (
        <Tabs defaultActiveKey="city_climate" id="uncontrolled-tab-example" className="border-bottom mb-3 ml-0">
            <Tab eventKey="city_climate" title="City Climate">
                <CityClimate
                    data={props.constants && props.constants.data ?
                        props.constants.data.city_climate : []}/>
            </Tab>
            <Tab eventKey="thermal_data" title="Thermal Data">
                <ThermalData
                    data={props.constants && props.constants.data ?
                        props.constants.data.thermal_data : []}/>
            </Tab>
            <Tab eventKey="envelope_windows" title="Envelope Windows">
                <EnvelopeWindows
                    data={props.constants && props.constants.data ?
                        props.constants.data.envelope_windows : []}/>
            </Tab>
            <Tab eventKey="heating_dhw" title="Heating & DHW">
                <HeatingDHW
                    data={props.constants && props.constants.data ?
                        props.constants.data.heating_dhw : []}/>
            </Tab>
            <Tab eventKey="other_thermal_data" title="Other Thermal Data">
                <OtherThermalData
                    data={props.constants && props.constants.data ?
                        props.constants.data.other_thermal_data : []}/>
            </Tab>
            <Tab eventKey="variable_costs" title="Variable Costs">
                <VariableCosts
                    data={props.constants && props.constants.data ?
                        props.constants.data.variable_costs : []}/>
            </Tab>
            <Tab eventKey="default_uncertainty" title="Default Uncertainty">
                <DefaultUncertainty
                    data={props.constants && props.constants.data ?
                        props.constants.data.default_uncertainty : []}/>
            </Tab>
            <Tab eventKey="uncertain_variables" title="Uncertain Variables">
                <UncertainVariables
                    data={props.constants && props.constants.data ?
                        props.constants.data.uncertain_variables : []}/>
            </Tab>
        </Tabs>
    )
}

export default ConstantsTabs