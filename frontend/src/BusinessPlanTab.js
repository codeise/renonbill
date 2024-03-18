import React, {useEffect, useState} from "react"
import {Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Swal from 'sweetalert2'
import {
    createObjectByYears,
    dispatchSetField,
    getPropsAreEqualFunction, hasDuplicates, setCaretPosition, getCaretPosition, fetch
} from "./commonFunctions";
import CasesTable from "./CasesTable";
import {
    arrayItemUpdateAction,
    arrayUpdateAction,
    keyValueUpdateAction, prefixUpdateAction,
} from "./actions";
import Button from "react-bootstrap/Button";
import TextInputControl from "./TextInputControl";
import BusinessPlanOutputModal from "./BusinessPlanOutputModal";
import {
    BPCustomDataTable,
    BPDataTable,
    BPLabelTextbox,
    BPTextField, deleteInvestment, deleteOperationalCost,
    getBusinessPlanColumns,
    getConsiderationsOBRColumns,
    getCustomColumns,
    getInvestmentsByName,
    getOperationalCostsColumns,
    getOutputData,
    updateNrGsValues
} from "./Services/BusinessPlan";
import {editProjectParams} from "./Services/Project";
import {editCase, fetchBpCaseData, updateCaseData, updateSelectedCases} from "./Services/Case";
import withReactContent from "sweetalert2-react-content";
import CustomDataTable from "./CustomDataTable";
import {AutoComplete} from "antd";
import {BASE_URL} from "./environment_vars";
import {XCircle} from "react-bootstrap-icons";

function getVarsFromState(state, prefix) {
    return {
        project_cases: state["Project_CasesTable_cases"],
        cases: state[prefix + "CasesTable_cases"],
        cases_table_disabled: state[prefix + "CasesTable_disabled"],
        nrGsValues: state[prefix + "nrGsValues"],
        investmentsValues: state[prefix + "investmentsValues"],
        operationalCostsRows: state[prefix + "operationalCostsRows"],
        operationalCostsValues: state[prefix + "operationalCostsValues"],
        percentageFinanced: state[prefix + "percentageFinanced"],
        financingRate: state[prefix + "financingRate"],
        financingDuration: state[prefix + "financingDuration"],
        projectParams: state["Project_params"],
        projectParamsBpYear: state["Project_params"].bp_year,
        bpYear: state[prefix + "bp_year"],
        investmentsID: state[prefix + "investmentsID"],
        ocID: state[prefix + "ocID"],
        outputData: state[prefix + "outputData"],
        searchedInvestmentsResult: state[prefix + "searchedInvestmentsResult"],
        calculationInProgress: state[prefix + "calculationInProgress"]
    }
}

function getPrefix(prefix = null) {
    return "BusinessPlan_"
}

const BusinessPlanTab = React.memo(function (props) {
        const MySwal = withReactContent(Swal)
        const prefix = getPrefix()
        const state = getVarsFromState(props.state, prefix)
        const {
            projectParams,
            nrGsValues,
            investmentsValues,
            operationalCostsRows,
            operationalCostsValues,
            percentageFinanced,
            financingRate,
            financingDuration,
            projectParamsBpYear,
            bpYear,
            calculationInProgress,
            searchedInvestmentsResult
        } = state
        const {dispatch, project_id} = props
        const {project_cases, cases, investmentsID, ocID} = state
        const [show, setShow] = useState(false);
        const selected_case = cases.selected[0]
        const caseNrGsValues = selected_case ? (nrGsValues.find(elem => elem.case_id === selected_case.id) ?? []) : [];
        const inputsDisabled = cases.selected.length !== 1;
        const setYears = v => dispatch(keyValueUpdateAction(prefix + "bp_year", v))
        const handleShow = () => setShow(true)
        const handleClose = () => setShow(false)
        const setInvestmentsID = v => dispatch(keyValueUpdateAction(prefix + "investmentsID", v))
        const setOcID = v => dispatch(keyValueUpdateAction(prefix + "ocID", v))
        const setCalculationInProgress = v => dispatch(keyValueUpdateAction(prefix + "calculationInProgress", v))
        const [currentFocus, setCurrentFocus] = useState(null)


        const ConsiderationOBRTextInput = ({id, value, min, max, label}) => {
            return <div className="d-flex"><TextInputControl min={min} max={max} value={value}
                                                             is_integer_input={false}
                                                             id={id}
                                                             onValChange={(v, elem_id) => {
                                                                 dispatch(keyValueUpdateAction(prefix + id, v))
                                                                 setCurrentFocus({
                                                                     id: elem_id,
                                                                     pos: getCaretPosition(document.getElementById(elem_id))
                                                                 })
                                                             }}/>
                <div className="mt-2 ml-2"> {label}</div>
            </div>
        }

        const considerationsOBRData = [
            {
                consideration: '% of investment financed by FI',
                value: <ConsiderationOBRTextInput id={"percentageFinanced"} value={percentageFinanced} min={0} max={100}
                                                  label={"%"}/>
            },
            {
                consideration: 'FI Financing rate',
                value: <ConsiderationOBRTextInput id={"financingRate"} value={financingRate} min={0} max={100} label={"%"}/>
            },
            {
                consideration: 'FI Financing duration',
                value: <ConsiderationOBRTextInput id={"financingDuration"} value={financingDuration} min={1}
                                                  label={"years"}/>
            }
        ]

        useEffect(() => {
            if (currentFocus) {
                setCaretPosition(currentFocus.id, currentFocus.pos)
            }
        })

        useEffect(() => {
            const newCases = {...cases, data: project_cases.data}
            dispatch(keyValueUpdateAction(prefix + "CasesTable_cases", newCases))
            fetchBpCaseData(dispatch).then(bp_data => updateNrGsValues(dispatch, nrGsValues, newCases.data, bp_data.data, projectParamsBpYear))
        }, [project_cases])

        useEffect(() => {
            dispatch(keyValueUpdateAction(prefix + "operationalCostsRows", operationalCostsValues.map((item, i) => {
                    const id = i + 1;
                    return {
                        id: id,
                        name: <BPTextField dispatch={dispatch} prefix={prefix} id={id} key={"name"} _key={"name"}
                                           item={item} toUpdate={"operationalCostsValues"} elemID={"eName" + id}
                                           setFocus={setCurrentFocus}/>,
                        value: <TextInputControl key={i} value={item["value"]} id={"value" + id} min={0}
                                                 onValChange={(v, elem_id) => {
                                                     dispatch(arrayItemUpdateAction(prefix + "operationalCostsValues", id,
                                                         "value", v))
                                                     setCurrentFocus({
                                                         id: elem_id,
                                                         pos: getCaretPosition(document.getElementById(elem_id))
                                                     })
                                                 }}/>,
                        delete: <Button variant="danger" size="sm" className="rb-icon" style={{minWidth: "70px"}}
                                        onClick={() => {
                                            MySwal.fire({
                                                title: 'Are you sure, operational cost will be deleted?',
                                                showDenyButton: true,
                                                confirmButtonText: 'Yes',
                                                denyButtonText: `No`,
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    setCurrentFocus(null)
                                                    let newOCID = 1;
                                                    dispatch(keyValueUpdateAction(prefix + "operationalCostsValues", operationalCostsValues.filter(oc => {
                                                        return oc.id !== item.id;
                                                    }).map(oc => {
                                                            return {
                                                                ...oc,
                                                                id: newOCID++,
                                                            }
                                                        }
                                                    )))
                                                    dispatch(keyValueUpdateAction("BusinessPlan_ocID", newOCID))
                                                    deleteOperationalCost(dispatch, project_id, item.name)
                                                }
                                            })
                                        }}><XCircle/></Button>
                    }
                }
            )))
        }, [operationalCostsValues])

        function updateTableColumns() {
            return editProjectParams(dispatch, project_id, {
                ...projectParams,
                bp_year: bpYear
            }).then(() => {
                dispatchSetField(dispatch, "Project_params", "bp_year", bpYear)
                dispatch(keyValueUpdateAction(prefix + "investmentsValues", investmentsValues.map(item => {
                    return {
                        id: item.id,
                        name: item.name,
                        ...createObjectByYears(bpYear, i => item["year" + i] ?? 0)
                    }
                })))
                nrGsValues.map(item => {
                    addNrGsYears("nrValues", item)
                    addNrGsYears("gsValues", item)
                })
            })
        }

        function addNrGsYears(state_name, item) {
            dispatch(arrayItemUpdateAction(prefix + "nrGsValues", item.case_id, state_name, {
                ...createObjectByYears(bpYear, i => item[state_name]["year" + i] ?? 0)
            }, "case_id"))
        }

        function getBPDataElem(id, name, state_name, min, max, is_float) {
            return {
                id: id,
                name: name,
                ...createObjectByYears(projectParamsBpYear, i => <TextInputControl
                    value={caseNrGsValues[state_name] ? caseNrGsValues[state_name]["year" + i] : ""}
                    key={i}
                    id={name + i}
                    min={min}
                    max={max}
                    is_integer_input={is_float}
                    disabled={inputsDisabled}
                    onValChange={(v, id) => {
                        setCurrentFocus({
                            id: id,
                            pos: getCaretPosition(document.getElementById(id))
                        })
                        dispatch(arrayItemUpdateAction(prefix + "nrGsValues", caseNrGsValues["case_id"], state_name, {
                            ...caseNrGsValues[state_name],
                            ["year" + i]: v
                        }, "case_id"))
                    }
                    }/>),

            }
        }

        function updateRenovationDataParam(param_name, value) {
            const newSelectedCase = {
                ...selected_case,
                common_params: {...selected_case.common_params, [param_name]: value}
            }
            updateSelectedCases(dispatch, 1, [newSelectedCase],
                prefix + "CasesTable_cases")
            updateCaseData(dispatch, cases.data, newSelectedCase, prefix + "CasesTable_cases")
        }

        //Temporary front-end validation until all calculate isn't moved to a single route where the validation can be moved to backend
        function validateInput() {
            for (let i = 0; i < investmentsValues.length; i++) {
                if (!investmentsValues[i].name) return "Investments' names cannot be empty!"
            }

            for (let i = 0; i < operationalCostsValues.length; i++) {
                if (!operationalCostsValues[i].name) return "Operational Costs' names cannot be empty!"
            }

            if (hasDuplicates(investmentsValues.map(e => e.name))) {
                return "Investments' names should be unique"
            }

            if (hasDuplicates(operationalCostsValues.map(e => e.name))) {
                return "Operational costs' names should be unique"
            }

            return ""
        }

        function save_bp_data(project_id, dispatch, investmentsValues, bp_year, nrGsValues, cases,
                              projectParamsBpYear, operationalCostsValues, considerationsOBRData, percentageFinanced, financingRate, financingDuration) {
            let obrData = [];
            let obrNames = considerationsOBRData.map(obr => {
                return obr.consideration
            })
            let obrValues = [percentageFinanced, financingRate, financingDuration]
            for (let i = 0; i < 3; i++) {
                obrData.push({
                    'name': obrNames[i],
                    'value': obrValues[i]
                })
            }
            return fetch(BASE_URL + 'api/save_bp_data/', 'POST', dispatch, {
                project_id: project_id,
                investmentsValues: investmentsValues,
                bp_year: bp_year,
                nrGsValues: nrGsValues,
                cases: cases,
                projectParamsBpYear: projectParamsBpYear,
                operationalCostsValues: operationalCostsValues,
                obrData: obrData
            })
        }

        function calculate() {
            const validation_error = validateInput()
            if (validation_error) {
                MySwal.fire({
                    title: "Input Validation Failed!",
                    text: validation_error
                })
            } else {
                setCalculationInProgress(true)
                save_bp_data(project_id, dispatch, investmentsValues, bpYear, nrGsValues, cases, projectParamsBpYear,
                    operationalCostsValues, considerationsOBRData, percentageFinanced, financingRate, financingDuration)
                    .then(() => cases.data.reduce((p, case_data) => {
                        return p.then(() => editCase(dispatch, case_data.id, project_id, {
                            ...case_data.common_params,
                            on_bill_component: case_data.common_params.on_bill_component,
                            on_bill_scheme: case_data.common_params.on_bill_scheme,
                            energy_savings: case_data.common_params.energy_savings
                        }, case_data.current_params, case_data.planned_params))
                    }, Promise.resolve()))
                    .then(() => getOutputData(dispatch, prefix + "outputData", project_id, project_cases.data.map(c => c.id)).then(r => {
                            if (r.status === 400 && r.data["error"]) {
                                MySwal.fire({
                                    title: "Calculation Failed!",
                                    text: r.data["error"]
                                })
                            } else if (r.data) {
                                handleShow()
                            }
                            setCalculationInProgress(false)
                        })
                    )
            }
        }

        const loadData = inputValue => {
            if (!inputValue.trim()) dispatch(prefixUpdateAction(prefix + "searchedInvestmentsResult", {data: []}))
            else getInvestmentsByName(inputValue, dispatch, prefix + "searchedInvestmentsResult")
        }
        const updateInvestmentsValues = (id, key, value) =>
            dispatch(arrayItemUpdateAction(prefix + "investmentsValues", id, key, value))

        return (
            <div>
                <Row>
                    <Col sm="2">
                        <Button className="bp-button-w rb-button rb-purple-button" onClick={updateTableColumns}
                                disabled={calculationInProgress}>
                            Set number of years
                        </Button>
                    </Col>
                    <Col sm="2">
                        <TextInputControl min={1} value={bpYear} is_integer_input={true} id="numOfYears"
                                          onValChange={(v, id) => {
                                              setYears(v)
                                              setCurrentFocus(null)
                                          }}
                                          placeholder="number of years"/>
                    </Col>
                </Row>
                <Row>
                    <Col sm="12">
                        <Card className="mt-4">
                            <CasesTable state={props.state} dispatch={dispatch} singular_selection={true}
                                        prefix={prefix} project_id={project_id} disableUI={true}/>
                        </Card>
                    </Col>

                    <Col sm="12">
                        <BPDataTable cardClassName='mt-4' columns={getBusinessPlanColumns(projectParamsBpYear)} data={[
                            getBPDataElem(1, "Number of Renovations", "nrValues", 0, undefined, false),
                            getBPDataElem(2, "Government Subsidy (%)", "gsValues", 0, 100, true)
                        ]}/>
                    </Col>


                    <Col sm="12" className="mb-4">
                        <Card className="mt-4 pl-3 pt-2 pb-2">
                            <Row>
                                <Col sm="4">
                                    <BPLabelTextbox id={prefix + "oc"}
                                                    value={selected_case ? selected_case.common_params["on_bill_component"] : ""}
                                                    inputsDisabled={inputsDisabled}
                                                    onValChange={v => {
                                                        updateRenovationDataParam("on_bill_component", v)
                                                        setCurrentFocus(null)
                                                    }}
                                                    minVal={0}
                                                    label={"Onbill Component of Selected Case (€/year):"}/>
                                </Col>
                                <Col sm="4">
                                    <BPLabelTextbox id={prefix + "os"}
                                                    value={selected_case ? selected_case.common_params["on_bill_scheme"] : ""}
                                                    inputsDisabled={inputsDisabled}
                                                    onValChange={v => {
                                                        updateRenovationDataParam("on_bill_scheme", v)
                                                        setCurrentFocus(null)
                                                    }}
                                                    minVal={1}
                                                    label={"Duration of On-bill Scheme (yrs): "}/>
                                </Col>
                                <Col sm="4">
                                    <BPLabelTextbox id={prefix + "es"}
                                                    value={selected_case ? selected_case.common_params["energy_savings"] : ""}
                                                    inputsDisabled={inputsDisabled}
                                                    onValChange={v => {
                                                        updateRenovationDataParam("energy_savings", v)
                                                        setCurrentFocus(null)
                                                    }}
                                                    minVal={0}
                                                    label={"Duration of Energy Savings (yrs): "}/>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <div className="pt-2"> Other investments to consider for the set-up of OBS (€)</div>
                    </Col>
                    <Col sm="6">
                        <Button className="bp-button-w rb-button rb-purple-button float-right mb-2"
                                disabled={calculationInProgress}
                                onClick={() => {
                                    dispatch(arrayUpdateAction(prefix + "investmentsValues", {
                                        id: investmentsID,
                                        name: "",
                                        ...createObjectByYears(projectParamsBpYear, i => 0)
                                    }))
                                    setInvestmentsID(investmentsID + 1);
                                }}>Add investment
                        </Button>
                    </Col>
                    <Col sm="12" className="mb-4">
                        <CustomDataTable columns={getCustomColumns(projectParamsBpYear)}
                                         data={investmentsValues.map(item => {
                                             return {
                                                 ...item,
                                                 name: <div style={{minWidth: "110px", maxWidth: "110px"}} key={item.id}>
                                                     <AutoComplete
                                                         style={{width: 110}}
                                                         options={!searchedInvestmentsResult.isLoading && !searchedInvestmentsResult.isError ? searchedInvestmentsResult.data.map(e => {
                                                             return {
                                                                 id: e.id,
                                                                 value: e.name,
                                                             }
                                                         }) : []}
                                                         value={item.name}
                                                         onChange={value => {
                                                             loadData(value)
                                                             updateInvestmentsValues(item.id, "name", value)
                                                             setCurrentFocus(null)
                                                         }}
                                                         placeholder="input here"
                                                     />
                                                 </div>,
                                                 ...createObjectByYears(projectParamsBpYear, i => <div
                                                     style={{minWidth: "70px"}} key={i}>
                                                     <TextInputControl
                                                         value={item["year" + i]} min={0}
                                                         is_integer_input={false}
                                                         onValChange={(v, elem_id) => {
                                                             updateInvestmentsValues(item.id, "year" + i, v)
                                                             setCurrentFocus(null)
                                                         }}/>
                                                 </div>),
                                                 delete: <Button variant="danger" size="sm" className="rb-icon"
                                                                 style={{minWidth: "70px"}}
                                                                 onClick={() => {
                                                                     MySwal.fire({
                                                                         title: 'Are you sure, investment will be deleted?',
                                                                         showDenyButton: true,
                                                                         confirmButtonText: 'Yes',
                                                                         denyButtonText: `No`,
                                                                     }).then((result) => {
                                                                         if (result.isConfirmed) {
                                                                             if (item.id === investmentsID - 1) {
                                                                                 dispatch(keyValueUpdateAction("BusinessPlan_investmentsID", investmentsID - 1))
                                                                             }
                                                                             deleteInvestment(dispatch, project_id, item.name).then(r => {
                                                                                 dispatch(keyValueUpdateAction(prefix + "investmentsValues", investmentsValues.filter(inv => { /* filter used for skipping deleted investments*/
                                                                                     return item.id !== inv.id;
                                                                                 }).map(inv => {
                                                                                     return {
                                                                                         id: inv.id,
                                                                                         name: inv.name,
                                                                                         ...createObjectByYears(bpYear, i => inv["year" + i] ?? 0)
                                                                                     }

                                                                                 })))

                                                                             })
                                                                         }
                                                                     })
                                                                 }}><XCircle/></Button>
                                             }
                                         })}/>
                    </Col>

                    <Col sm="6">
                        <div className="pt-2"> Operational Costs (€)</div>
                    </Col>
                    <Col sm="6">
                        <Button className="bp-button-w rb-button rb-purple-button float-right mb-2"
                                disabled={calculationInProgress}
                                onClick={() => {
                                    dispatch(arrayUpdateAction(prefix + "operationalCostsValues", {
                                        id: ocID,
                                        name: "",
                                        value: 0
                                    }))
                                    setOcID(ocID + 1);
                                }}>Add operational cost
                        </Button>
                    </Col>
                    <Col sm="12" className="mt-1 mb-4">
                        <BPCustomDataTable columns={getOperationalCostsColumns()} data={operationalCostsRows}/>
                    </Col>
                    <Col sm="12">
                        <BPDataTable columns={getConsiderationsOBRColumns()} data={considerationsOBRData}/>
                    </Col>
                    <Col sm="12" className="mt-2 mb-1">
                        <Button className="equipment-modal-button rb-button rb-purple-button float-right"
                                onClick={calculate}
                                disabled={calculationInProgress}>{calculationInProgress ? "Calculating..." : "Calculate"}</Button>
                    </Col>
                    <Col sm="12">
                        {show ? <BusinessPlanOutputModal state={props.state} handleClose={handleClose}
                                                         dispatch={dispatch}/> : ""}
                    </Col>

                </Row>
            </div>
        )
    },
    getPropsAreEqualFunction(getVarsFromState, getPrefix)
)

export default BusinessPlanTab
