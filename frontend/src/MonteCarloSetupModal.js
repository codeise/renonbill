import React, {useEffect} from "react";
import {Col, Modal, Tab, Tabs} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ComboBox from "./ComboBox";
import {dispatchSetField, getPropsAreEqualFunction} from "./commonFunctions";
import {monte_carlo_desc_obj} from "./constants";
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import {editProjectParams} from "./Services/Project";
import _ from "lodash";
import TextInputControl from "./TextInputControl";
import {fetchNpvData, fetchRatingData, resetEA, resetMCNPV, resetRatingData, resetReportData} from "./CoreFunctions";

function getVarsFromState(state, prefix) {
    return {
        current: state[prefix + "current"],
        previous: state[prefix + "previous"],
        project_params: state["Project_params"],
        project_cases: state["Project_CasesTable_cases"]
    }
}

function getPrefix(prefix = null) {
    return "MonteCarlo_"
}

const MonteCarloSetupModal = React.memo(function (props) {
    const prefix = getPrefix()
    const {dispatch, project_id} = props
    const state = getVarsFromState(props.state, prefix)
    const {current, previous, project_params, project_cases} = state
    const handleMonteCarloClose = () => dispatch(keyValueUpdateAction("Header_showMonteCarloSetup", false))
    const handleMonteCarloCancel = () => {
        dispatch(prefixUpdateAction(prefix + "current", previous))
        handleMonteCarloClose()
    }
    const handleMonteCarloSave = () => {
        dispatch(prefixUpdateAction(prefix + "previous", current))
        dispatch(prefixUpdateAction("Project_params", {...project_params, ...current}))
        if (!_.isEqual(current, previous)) {
            editProjectParams(dispatch, project_id, {...project_params, ...current})
                .then(() => resetReportData(dispatch, project_id, true))
                .then(() => resetRatingData(dispatch, project_id))
                .then(() => resetEA(dispatch))
                .then(() => resetMCNPV(dispatch))
                .then(() => fetchNpvData(dispatch, project_id, project_cases.selected))
                .then(() => fetchRatingData(dispatch, project_id, project_cases.selected))
        }
        handleMonteCarloClose()
    }
    const uncertainty_advanced_flag = current["uncertainty_advanced_flag"]
    const set_uncertainty_advanced_flag = value => dispatchSetField(dispatch, prefix + "current",
        "uncertainty_advanced_flag", value)

    function getInput(alias, ml2 = false, label = null, label_width_60 = false) {
        return <div key={alias} className={!ml2 ? "extra-sm-input" : "extra-sm-input ml-2"}>
            <TextInputControl className="input-style" min={0} value={current[alias]} is_integer_input={false}
                              onValChange={(v, id) => dispatchSetField(dispatch, prefix + "current", alias, v)}/>
            {label ? <div className="bt-title mt-1" style={label_width_60 ? {width: "60px"} : {}}>{label}</div> : null}
        </div>
    }

    function getCheckbox(label, alias, value = null) {
        return <Form.Check label={label}
                           id={alias}
                           key={label + alias}
                           checked={!value ? current[alias] : current[alias] === value}
                           onChange={e => dispatchSetField(dispatch, prefix + "current", alias, value || e.target.checked)}
        />
    }

    function getSimplifiedCheckboxConfidencePair(checkbox_alias, checkbox_label, input_alias, mt3 = false) {
        return <div key={checkbox_alias} className={!mt3 ? "d-flex mb-1" : "d-flex mb-1 mt-3"}>
            <div className="flex-even">
                {getCheckbox(checkbox_label, checkbox_alias)}
            </div>
            <div className="flex-08">
                <div className="d-flex mb-1">
                    {getInput(input_alias)}
                    <Form.Label className="ml-2"> %</Form.Label>
                </div>
            </div>
        </div>
    }

    function getAdvancedCheckboxConfidencePair(checkbox_alias, checkbox_label, input_alias, flexb = false) {
        return <div key={checkbox_alias} className="d-flex">
            <div className={!flexb ? "flex-06" : "flex-b"}>
                {getCheckbox(checkbox_label, checkbox_alias)}
            </div>
            <div className="flex-03">
                <div className="d-flex mb-1">
                    {getInput(input_alias)}
                    <Form.Label className="ml-2"> %</Form.Label>
                </div>
            </div>
        </div>
    }

    function getAdvancedCheckboxConfidencePairDouble(checkbox_alias, checkbox_label, input_alias, input_alias_1) {
        return <div key={checkbox_alias} className="d-flex">
            <div className="flex-b">
                {getCheckbox(checkbox_label, checkbox_alias)}
            </div>
            <div className="d-flex mb-1">
                {getInput(input_alias)}
            </div>
            <div className="d-flex ml-2 mb-1">
                {getInput(input_alias_1)}
                <Form.Label className="ml-2"> %</Form.Label>
            </div>
        </div>
    }

    function getAdvancedCategory(desc_obj, title, flexb = false) {
        return <div key={title}>
            <div className="mb-1 mt-2 font-weight-bolder">{title}</div>
            <div className="group-border pl-4 pt-4">
                <div className="d-flex">
                    <div className="flex-even">
                        {desc_obj.part1.map(elem =>
                            !elem.input_alias_1 ?
                                getAdvancedCheckboxConfidencePair(elem.checkbox_alias, elem.checkbox_label, elem.input_alias, flexb) :
                                getAdvancedCheckboxConfidencePairDouble(elem.checkbox_alias, elem.checkbox_label, elem.input_alias, elem.input_alias_1)
                        )}
                    </div>
                    <div className="flex-even">
                        {desc_obj.part2.map(elem => getAdvancedCheckboxConfidencePair(elem.checkbox_alias, elem.checkbox_label, elem.input_alias, flexb))}
                    </div>
                </div>
            </div>
        </div>
    }

    return (
        <Modal show={true} animation={false} size="lg" dialogClassName="modal-80w">
            <Modal.Header className="rb-modal-header">
                <Modal.Title className="rb-modal-header-title">Uncertainty manager</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="profile"
                      id="uncontrolled-tab-example"
                      className="border-bottom mb-3 ml-0 mr-0"
                      activeKey={uncertainty_advanced_flag}
                      onSelect={v => set_uncertainty_advanced_flag(parseInt(v))}>
                    <Tab eventKey={0} title="simplified">
                        <div className="group-border pl-4 pt-4">
                            <div className="d-flex">
                            </div>
                            {getSimplifiedCheckboxConfidencePair("geometry_noise_check", "geometry", "geometry_confidence")}
                            {getSimplifiedCheckboxConfidencePair("thermal_prop_noise_check", "thermal properties",
                                "thermal_prop_confidence")}
                            {getSimplifiedCheckboxConfidencePair("efficiencies_noise_check", "efficiencies",
                                "efficiencies_confidence")}
                            {getSimplifiedCheckboxConfidencePair("simplified_DHW_load_noise_check", "hot water load",
                                "simplified_DHW_load_confidence")}
                            {getSimplifiedCheckboxConfidencePair("environment_noise_check", "environment variability",
                                "environment_confidence")}
                            {getSimplifiedCheckboxConfidencePair("investment_noise_check", "equipment costs",
                                "investment_confidence", true)}
                            <div className="d-flex mb-1">
                                <div className="flex-even">
                                    {getCheckbox("energy cost", "energy_cost_noise_check")}
                                </div>
                                <div className="flex-08">
                                    <div className="d-flex mb-1">
                                        {getInput("energy_cost_confidence_today", false, "Today")}
                                        {getInput("energy_cost_confidence_final", true, "Final Year", true)}
                                        <Form.Label className="ml-2"> %</Form.Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex mt-3">
                            <div className="flex-even pr-4">
                                <div className="mb-2 font-weight-bolder">noise shape</div>
                                <div className="group-border">
                                    {getCheckbox("gaussian", "noise_flag", 1)}
                                    {getCheckbox("triangular", "noise_flag", 2)}
                                    {getCheckbox("uniform", "noise_flag", 3)}
                                </div>
                            </div>
                            <div className="flex-even pl-4">
                                <div className="mb-2 font-weight-bolder">result confidence</div>
                                <div className="group-border" style={{height: "99.49px"}}>
                                    <div className="d-flex">
                                        <div className="small-combobox">
                                            <ComboBox
                                                onChange={e => dispatchSetField(dispatch, prefix + "current", "confidence_level",
                                                    parseInt(e.target.value))}
                                                value={current["confidence_level"]}
                                                options={["95", "99", "68", "50"]}/>
                                        </div>
                                        <div className="ml-2">%</div>
                                    </div>
                                    <div className="mt-2 small-text-13 important-text">input noise confidence is
                                        always
                                        95%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey={-1} title="advanced">
                        <Row>
                            <Col sm={6}>
                                {getAdvancedCategory(monte_carlo_desc_obj.thermal_prop, "Thermal prop.")}
                                {getAdvancedCategory(monte_carlo_desc_obj.ext_insulation, "Ext. Insulation")}
                                {getAdvancedCategory(monte_carlo_desc_obj.costs, "Costs", true)}
                                {getAdvancedCategory(monte_carlo_desc_obj.geometry, "Geometry")}
                            </Col>
                            <Col sm={6}>
                                {getAdvancedCategory(monte_carlo_desc_obj.external, "External")}
                                {getAdvancedCategory(monte_carlo_desc_obj.dhw, "DHW")}
                                {getAdvancedCategory(monte_carlo_desc_obj.heating, "Heating")}
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>


            </Modal.Body>
            <Modal.Footer>
                <div className="float-right mt-2">
                    <Button className="rb-button rb-red-button mr-2"
                            onClick={handleMonteCarloCancel}>Cancel</Button>
                    <Button className="rb-button rb-green-button"
                            onClick={handleMonteCarloSave}>Save</Button>
                </div>
            </Modal.Footer>
        </Modal>
    );

}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default MonteCarloSetupModal