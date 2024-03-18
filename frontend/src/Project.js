import React, {useEffect, useState} from "react"
import Container from "react-bootstrap/Container";
import EditCase from "./EditCase";
import EquipmentSetup from "./EquipmentSetup";
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import {Tab, Tabs} from "react-bootstrap";
import Header from "./Header";
import EditCaseFinancialAnalysis from "./EditCaseFinancialAnalysis";
import Details from "./Details";
import CasesTable from "./CasesTable";
import FinancialAnalysisTab from "./FinancialAnalysisTab";
import ProjectRatingTab from "./ProjectRatingTab";
import {fetchCases} from "./Services/Case";
import EngineeringAnalysis from "./EngineeringAnalysis";
import NonEnergyBenefitsTab from "./NonEnergyBenefitsTab";
import ReportTab from "./ReportTab";
import {
    addAdditionYears,
    addYearToInvestments,
    fetch, prepareInvestments,
} from "./commonFunctions";
import {BASE_URL} from "./environment_vars";
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import MonteCarloSetupModal from "./MonteCarloSetupModal";
import CommercialRating from "./CommercialRating";
import ErvTab from "./ErvTab";
import {BusinessPlan_years_default, MonteCarlo_default} from "./defaultState";
import _ from 'lodash'
import {updateProjectRating} from "./CoreFunctions";
import BusinessPlanTab from "./BusinessPlanTab";
import {fetchDbInvestmentValues, fetchOcValues, fetchDefaultOcValues} from "./Services/Project";
import {project_not_found_route} from "./constants";
import {Redirect} from "react-router-dom";

function Project(props) {
    const dispatch = props.dispatch
    const state = props.state
    const prefix = "Project_"
    const project_id = parseInt(props.match.params.id);
    const cases = state[prefix + "CasesTable_cases"]
    const inputsDisabled = cases.selected.length !== 1;
    const [casesFetched, setCasesFetched] = useState(false)
    const case_edited = state["Project_CasesTable_disabled"]
    const showMonteCarlo = state["Header_showMonteCarloSetup"]
    const all_tabs_disabled = state["BusinessPlan_calculationInProgress"]
    const non_cd_tabs_disabled = (!cases.isError && !cases.isLoading && !cases.data.length) || case_edited || all_tabs_disabled
    const fa_params = state["FinancialAnalysis_params"]
    const project_rating_params = state["ProjectRating_params"]
    const project_params = state["Project_params"]
    const selected_cases_ids = state["Project_CasesTable_cases"].selected.map(c => c.id)
    const [prevTabKey, setPrevTabKey] = useState("caseDefinition");
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        fetchCases(project_id, dispatch, prefix + "CasesTable_cases").then(cases_data => setCasesFetched(true))
        fetch(BASE_URL + 'api/projects/' + project_id, "GET", dispatch, {})
            .then(r => {
                if (r.status == 404) {
                    setNotFound(true)
                } else {
                    if (Object.keys(r.data.params).length > 0) {
                        dispatch(prefixUpdateAction("Project_params", r.data.params))
                        dispatch(keyValueUpdateAction("BusinessPlan_bp_year", r.data.params.bp_year ?? BusinessPlan_years_default))
                        fetchDbInvestmentValues(dispatch, project_id).then(data => {
                            prepareInvestments(data, r.data.params.bp_year, state["BusinessPlan_investmentsID"], dispatch);
                        })
                        fetchOcValues(dispatch, project_id).then(data => {
                            let id = state["BusinessPlan_ocID"]
                            let oc_values = []
                            data.data.forEach(item => {
                                oc_values.push({
                                    'id': id,
                                    'name': item["name"],
                                    'value': item["value"],
                                })
                                id++;
                            })
                            dispatch(keyValueUpdateAction("BusinessPlan_ocID", id))
                            dispatch(keyValueUpdateAction("BusinessPlan_operationalCostsValues", oc_values))
                        })
                        fetchDefaultOcValues(dispatch, project_id).then(data => {
                            data.data.map(item => {
                                if (item.name === "% of investment financed by FI")
                                    dispatch(keyValueUpdateAction("BusinessPlan_percentageFinanced", item.value))
                                else if (item.name === "FI Financing rate")
                                    dispatch(keyValueUpdateAction("BusinessPlan_financingRate", item.value))
                                else
                                    dispatch(keyValueUpdateAction("BusinessPlan_financingDuration", item.value))
                            })
                        })
                        dispatch(prefixUpdateAction("FinancialAnalysis_params", r.data.params))
                        dispatch(prefixUpdateAction("ProjectRating_params", r.data.params))
                        dispatch(prefixUpdateAction("MonteCarlo_previous", _.pick(r.data.params, Object.keys(MonteCarlo_default))))
                        dispatch(prefixUpdateAction("MonteCarlo_current", _.pick(r.data.params, Object.keys(MonteCarlo_default))))
                    }
                }

            })
    }, [project_id, dispatch, prefix])

    function onTabChange(key) {
        let new_project_params = project_params;
        if (prevTabKey === "financialAnalysis") {
            dispatch(prefixUpdateAction("Project_params", fa_params))
            new_project_params = fa_params
        } else if (prevTabKey === "projectRating") {
            dispatch(prefixUpdateAction("Project_params", project_rating_params))
            new_project_params = project_rating_params
        }

        if (key === "projectRating") {
            updateProjectRating(dispatch, project_id, new_project_params, selected_cases_ids)
        }

        setPrevTabKey(key)
    }

    return (
        !notFound ?
            <Container className="pt-3">
                <Card>
                    <Card.Body className="h-100 bgi"
                               style={{
                                   backgroundColor: 'rgb(243 243 243)',
                                   backgroundImage: "url(/renonbill_home1.jpg)"
                               }}>
                    </Card.Body>

                    <Card.Body className="h-100 card-min-height"
                               style={{backgroundColor: 'transparent', zIndex: 999}}>
                        <Header show_back_to_home={true} dispatch={dispatch} state={state} project_id={project_id}
                                comboboxVisible={true} monteCarloVisible={true}/>
                        <Tabs onSelect={onTabChange} defaultActiveKey="caseDefinition" id="tabs1"
                              className="border-bottom mb-3 ml-0">
                            <Tab eventKey="caseDefinition" title="Case Definition" tabClassName="tab-text-color"
                                 disabled={all_tabs_disabled}>
                                <CasesTable state={props.state} dispatch={dispatch} prefix={prefix}
                                            project_id={project_id}/>
                                <Row className="mt-3">
                                    <Col sm="5">
                                        {casesFetched ?
                                            <EditCase
                                                caseToEdit={cases.selected.length === 1 ? cases.selected[0] : null}
                                                dispatch={dispatch} state={state}
                                                inputsDisabled={inputsDisabled}
                                                prefix={prefix}/> : null}
                                    </Col>
                                    <Col sm="7">
                                        <EquipmentSetup
                                            caseToEdit={cases.selected.length === 1 ? cases.selected[0] : null}
                                            dispatch={dispatch} state={state} prefix={prefix}
                                            inputsDisabled={inputsDisabled}/>
                                    </Col>
                                </Row>
                                <Row className="mt-3 ">
                                    <Col sm="5">
                                        <CommercialRating state={state} dispatch={dispatch}
                                                          inputsDisabled={inputsDisabled}/>
                                    </Col>
                                    <Col sm="7">
                                        <EditCaseFinancialAnalysis inputsDisabled={inputsDisabled} dispatch={dispatch}
                                                                   state={state} prefix={prefix}/>
                                    </Col>
                                </Row>
                            </Tab>
                            <Tab eventKey="details" title="Details" disabled={non_cd_tabs_disabled}>
                                <Details dispatch={dispatch} state={state} project_id={project_id} prefix={prefix}/>
                            </Tab>
                            <Tab eventKey="engineeringAnalysis" title="Engineering" disabled={non_cd_tabs_disabled}>
                                <EngineeringAnalysis prefix={prefix} state={state} dispatch={dispatch}
                                                     project_id={project_id}/>
                            </Tab>
                            <Tab eventKey="financialAnalysis" title="Financial" disabled={non_cd_tabs_disabled}>
                                <FinancialAnalysisTab state={state} dispatch={dispatch} project_id={project_id}/>
                            </Tab>
                            <Tab eventKey="projectRating" title="Project Rating" disabled={non_cd_tabs_disabled}>
                                <ProjectRatingTab state={state} dispatch={dispatch} project_id={project_id}
                                                  key="projectRatingTab1"/>
                            </Tab>
                            <Tab eventKey="nonEnergyBenefits" title="Non Energy Benefits"
                                 disabled={non_cd_tabs_disabled}>
                                <NonEnergyBenefitsTab state={state} dispatch={dispatch} project_id={project_id}
                                                      key="nonEnergyBenefitsTab1"/>
                            </Tab>
                            <Tab eventKey="ervTab" title="Onbill" disabled={non_cd_tabs_disabled}>
                                <ErvTab state={state} dispatch={dispatch} project_id={project_id}/>
                            </Tab>
                            <Tab eventKey="reportTab" title="Report" disabled={non_cd_tabs_disabled}>
                                <ReportTab state={state} dispatch={dispatch} project_id={project_id}/>
                            </Tab>
                            <Tab eventKey="businessPlanTab" title="Business Plan" disabled={non_cd_tabs_disabled}>
                                <BusinessPlanTab state={state} dispatch={dispatch} project_id={project_id}/>
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
                {
                    showMonteCarlo ? <MonteCarloSetupModal dispatch={props.dispatch} state={props.state}
                                                           project_id={project_id}/> : null
                }
            </Container> : <Redirect to={project_not_found_route}/>
    )
}

export default Project