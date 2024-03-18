import React, {useEffect} from 'react'
import Row from "react-bootstrap/Row";
import {Col, Image, Button} from "react-bootstrap";
import ComboBox from "./ComboBox";
import {dispatchSetField, fetch, getKeyByValue, getPropsAreEqualFunction, getValues} from "./commonFunctions";
import {editProjectParams} from "./Services/Project";
import {fetchConsumptionData} from "./CoreFunctions";
import {BASE_URL} from "./environment_vars";
import {keyValueUpdateAction} from "./actions";
import Card from "react-bootstrap/Card";

function getVarsFromState(state, prefix) {
    return {
        project_params: state["Project_params"],
        project_cases: state["Project_CasesTable_cases"],
        case_edited: state["Project_CasesTable_disabled"],
        unitOptions: state[prefix + "unitOptions"],
        showMonteCarloSetup: state[prefix + "showMonteCarloSetup"],
        consumptionData: state["Project_Details_consumptionData"],
        calculationInProgress: state["BusinessPlan_calculationInProgress"]
    }
}

function getPrefix(prefix = null) {
    return "Header_"
}

const Header = React.memo(function (props) {
    const prefix = getPrefix()
    const dispatch = props.dispatch
    const state = getVarsFromState(props.state, prefix)
    const project_params = state["project_params"]
    const cases = state["project_cases"]
    const unit_options = state["unitOptions"] ? state["unitOptions"].data : []
    const unit_option = project_params.unit_option
    const selected_cases_ids = cases.selected.map(c => c.id)
    const case_edited = state["case_edited"]
    const consumptionData = state["consumptionData"]
    const {t_min, t_med, hdd, rad, tday} = consumptionData;
    const singular_case_id = selected_cases_ids.length !== 1 ? null : selected_cases_ids[0]
    const t_min_val = t_min ? (t_min[singular_case_id] ?? "") : ""
    const t_med_val = t_med ? (t_med[singular_case_id] ?? "") : ""
    const hdd_val = hdd ? (hdd[singular_case_id] ?? "") : ""
    const rad_val = rad ? (rad[singular_case_id] ?? "") : ""
    const tday_val = tday ? (tday[singular_case_id] ?? "") : ""
    const {calculationInProgress} = state;
    
    const handleMonteCarloShow = () => {
        dispatch(keyValueUpdateAction(prefix + "showMonteCarloSetup", true))
    }
    useEffect(() => {
        fetch(BASE_URL + "api/unit_options/", "GET", dispatch, null, prefix + "unitOptions")
    }, [dispatch, prefix])

    function onChangeUnit(e) {
        const new_unit_option = getKeyByValue(unit_options, e.target.value)
        editProjectParams(dispatch, props.project_id, {...project_params, unit_option: new_unit_option})
            .then(r => {
                fetchConsumptionData(dispatch, props.project_id, selected_cases_ids.length ?
                    selected_cases_ids : null)
            })
        dispatchSetField(dispatch, "Project_params", "unit_option", new_unit_option)
    }

    return (
        <Row className="mb-1">
            <Button variant="link" className="logOut-label" onClick={() => window.location.href = "/logout"}>Log
                out</Button>

            <Col>
                <div className="d-flex">
                    <div className="small-combobox">
                        {props.comboboxVisible && unit_options ?
                            <ComboBox disabled={calculationInProgress}
                                      value={unit_options[unit_option]} options={getValues(unit_options)}
                                      onChange={onChangeUnit}/>
                            : ""}
                    </div>
                    {props.show_back_to_home ? <div className="ml-3"><Button className="rb-button rb-purple-button"
                                                                             disabled={calculationInProgress}
                                                                             onClick={() => window.location.href = "/"}>Go
                            back to Home</Button></div>
                        : null}
                    {(props.show_back_to_home && singular_case_id) ?
                        <div className="ml-5">
                            <Card className="small-border-radius">
                                <Card.Body className="pt-2 pb-1 pl-1 pr-1">
                                    <div className="d-flex">
                                        <div className="flex-grow-1">
                                            <div className="item-block border-right">
                                                <h5 className="climate-box-item">HDD</h5>
                                                <div className="climate-box-it-value">{hdd_val}</div>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="item-block border-right">
                                                <h5 className="climate-box-item">RAD</h5>
                                                <div className="climate-box-it-value">{rad_val}</div>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="item-block border-right">
                                                <h5 className="climate-box-item">Hdays</h5>
                                                <div className="climate-box-it-value">{tday_val}</div>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="item-block border-right">
                                                <h5 className="climate-box-item">Tmed</h5>
                                                <div className="climate-box-it-value">{t_med_val}</div>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="item-block">
                                                <h5 className="climate-box-item">Tmin</h5>
                                                <div className="climate-box-it-value">{t_min_val}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                        : null}
                </div>
            </Col>
            <Col sm={5}>
                <Row>
                    <Col sm="2"> </Col>
                    <Col sm="5" className="pr-0">
                        {props.project_id && props.monteCarloVisible && !case_edited ?
                            <Button className="rb-button rb-purple-button float-right"
                                    onClick={handleMonteCarloShow}
                                    disabled={calculationInProgress}>Monte Carlo
                                Setup</Button> : null}
                    </Col>
                    <Col sm="5" className="center">

                        <Image src="/renonbill_logo.png" className="rb-logo"/>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default Header