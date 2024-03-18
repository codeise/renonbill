import React, {useEffect, useState} from "react"
import {Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import DataTable from "react-data-table-component";
import Card from "react-bootstrap/Card";
import {getPropsAreEqualFunction, setCaretPosition} from "./commonFunctions";
import {conditionalRowStyles, project_styles} from "./common_styles";
import Slider from "@material-ui/core/Slider";
import Form from "react-bootstrap/Form";
import CasesTable from "./CasesTable";
import {createTheme, ThemeProvider} from '@material-ui/core/styles'
import {keyValueUpdateAction, prefixUpdateAction} from "./actions";
import {Field} from "./commonComponents";
import Button from "react-bootstrap/Button";
import {fetchNonEnergyData} from "./CoreFunctions";
import {
    NonEnergyBenefits_params_default,
    NonEnergyBenefits_updateLabel_default
} from "./defaultState";
import _ from 'lodash'
import {editCase, fetchCases, updateSelectedCases} from "./Services/Case";

function getVarsFromState(state, prefix) {
    return {
        project_cases: state["Project_CasesTable_cases"],
        cases: state[prefix + "CasesTable_cases"],
        cases_table_disabled: state[prefix + "CasesTable_disabled"],
        params: state[prefix + "params"],
        outputData: state[prefix + "outputData"],
        updateLabel: state[prefix + "updateLabel"]
    }
}

function getPrefix(prefix = null) {
    return "NonEnergyBenefits_"
}

const theme = createTheme({direction: 'rtl'});

const OutputTextField = ({value, sign = null}) => {
    return (
        (value !== null) ? <div className="mt-1 mb-1 d-flex">
            <Form.Control className="input-style" size="sm" type="text"
                          value={value}
                          disabled/>
            {sign ? <div className="mt-2 ml-3">{sign}</div> : null}
        </div> : null
    )
};

const NonEnergyBenefitsTab = React.memo(function (props) {
    const prefix = getPrefix()
    const state = getVarsFromState(props.state, prefix)
    const {params} = state
    const {dispatch, project_id} = props
    const [currentFocus, setCurrentFocus] = useState(null)
    const {project_cases, cases, outputData, updateLabel} = state
    let selectedOutputData = {}
    let selectedCase = null
    if (cases.selected.length === 1) {
        selectedCase = cases.selected[0]
        selectedOutputData = outputData[selectedCase.id] ?? {}
    }
    const {
        lab_score, lab_value_1, lab_value_2, lab_value_3, lab_value_4, lab_value_5, lab_value_6,
        lab_value_7, lab_investment, lab_benefit
    } = selectedOutputData
    const {project_score, lab_total_investment, lab_total_benefit} = outputData

    const setUpdateLabel = l => dispatch(keyValueUpdateAction(prefix + "updateLabel", l))
    const inputsDisabled = !selectedCase

    useEffect(() => {
        if (currentFocus) {
            setCaretPosition(currentFocus.id, currentFocus.pos)
        }
    })

    useEffect(() => {
        dispatch(prefixUpdateAction(prefix + "CasesTable_cases", {...cases, data: project_cases.data}))
    }, [project_cases])

    useEffect(() => {
        if (selectedCase) {
            dispatch(prefixUpdateAction(prefix + "params", _.pick(selectedCase.common_params,
                Object.keys(NonEnergyBenefits_params_default))))
        } else if (cases.selectedCount === 0) {
            dispatch(prefixUpdateAction(prefix + "params", NonEnergyBenefits_params_default))
        }
    }, [dispatch, prefix, cases])

    let energyBenefitsColumn = [
        {
            name: 'Weight',
            selector: 'weight',
            cell: row => <Field type="weight" row={row} prefix={prefix} prefix2={"non_energy_benefit_weight"}
                                dispatch={dispatch} setFocus={setCurrentFocus} min={null} max={null}
                                disabled={inputsDisabled}/>,
            minWidth: "100px",
            maxWidth: "100px"
        },
        {
            name: 'Dimension to Evaluate',
            selector: 'dimToEval',
            minWidth: "350px",
            maxWidth: "350px",
            wrap: 'yes'
        },
        {
            name: '',
            selector: 'slide',
            cell: row => (row.slide !== '' ?
                (
                    <ThemeProvider theme={theme}>
                        <Slider
                            className="ml-3 mr-4"
                            aria-labelledby="discrete-slider-restrict"
                            step={1}
                            min={0}
                            max={100}
                            defaultValue={row.slide * 100}
                            valueLabelDisplay="auto"
                            marks={marks}
                            disabled={inputsDisabled}
                            id={'non_energy_benefit_rating_' + row.id}
                            key={'non_energy_benefit_rating_' + row.id}
                            onChangeCommitted={(e, v) => dispatch(prefixUpdateAction(
                                prefix + "params", {['non_energy_benefit_rating_' + row.id]: v / 100}))
                            }
                        />
                    </ThemeProvider>
                ) : "")
            ,
            style: {marginBottom: '7px', marginTop: '12px'}
        },
        {
            name: '',
            selector: 'lab_value',
            cell: row => <OutputTextField value={row.lab_value}/>,
            minWidth: "100px",
            maxWidth: "100px"
        },
    ];
    const energyBenefitsData = [
        {
            id: 1,
            weight: params['non_energy_benefit_weight_1'],
            dimToEval: 'Energy expenses represent an important part of household income',
            slide: params['non_energy_benefit_rating_1'],
            lab_value: lab_value_1,
        },
        {
            id: 2,
            weight: params['non_energy_benefit_weight_2'],
            dimToEval: 'Market reflects higher prices for energy efficient buildings',
            slide: params['non_energy_benefit_rating_2'],
            lab_value: lab_value_2,
        },
        {
            id: 3,
            weight: params['non_energy_benefit_weight_3'],
            dimToEval: 'Energy efficiency is promoted by mass media and in legislation',
            slide: params['non_energy_benefit_rating_3'],
            lab_value: lab_value_3,
        },
        {
            id: 4,
            weight: params['non_energy_benefit_weight_4'],
            dimToEval: 'Energy price increases fast',
            slide: params['non_energy_benefit_rating_4'],
            lab_value: lab_value_4,
        },
        {
            id: 5,
            weight: params['non_energy_benefit_weight_5'],
            dimToEval: 'Penalties/restrictions (e.g higher tax rate) are applied for non-energy efficient properties',
            slide: params['non_energy_benefit_rating_5'],
            lab_value: lab_value_5,
        },
        {
            id: 6,
            weight: params['non_energy_benefit_weight_6'],
            dimToEval: 'The considered property achieves passive house standard',
            slide: params['non_energy_benefit_rating_6'],
            lab_value: lab_value_6,
        },
        {
            id: 7,
            weight: params['non_energy_benefit_weight_7'],
            dimToEval: 'The increase in comfort of the energy efficient property is relevant',
            slide: params['non_energy_benefit_rating_7'],
            lab_value: lab_value_7,
        }
    ]
    let resultsColumn = [
        {
            name: '',
            selector: 'type',
        },
        {
            name: 'selected',
            selector: 'selected',
            cell: row => <OutputTextField value={row.selected} sign={"€"}/>
        },
        {
            name: 'all',
            selector: 'all',
            cell: row => <OutputTextField value={row.all} sign={"€"}/>
        },
        {
            name: 'Score (0...100)',
            selector: 'score',
            cell: row => <OutputTextField value={row.score}/>

        },
        {
            name: 'Total Score (0...100)',
            selector: 'totalScore',
            cell: row => <OutputTextField value={row.total_score}/>
        },
    ]
    const resultData = [
        {
            type: 'investment cost',
            selected: lab_investment,
            all: lab_total_investment,
            score: lab_score,
            total_score: project_score
        },
        {
            type: 'non energy benefits',
            selected: lab_benefit,
            all: lab_total_benefit,
            score: null,
            total_score: null
        },
    ]
    const marks = [
        {
            value: 100,
            label: '100',

        },
        {
            value: 75,
            label: '75 High',
        },
        {
            value: 50,
            label: '50 Medium',
        },
        {
            value: 25,
            label: '25 Low',
        },
        {
            value: 0,
            label: '0',
        },
    ];

    function update() {
        setUpdateLabel("Updating...")
        const newSelectedCase = {...selectedCase, common_params: {...selectedCase.common_params, ...params}}
        return editCase(dispatch, selectedCase.id, project_id, newSelectedCase.common_params, newSelectedCase.current_params,
            newSelectedCase.planned_params)
            .then(() => updateSelectedCases(dispatch, 1, [newSelectedCase],
                prefix + "CasesTable_cases"))
            .then(() => fetchNonEnergyData(dispatch, project_id))
            .then(() => fetchCases(project_id, dispatch, prefix + "CasesTable_cases"))
            .then(() => fetchCases(project_id, dispatch, "Project_CasesTable_cases"))
            .then(() => setUpdateLabel(NonEnergyBenefits_updateLabel_default))
    }

    return (
        <div>
            <Row>
                <Col sm="12">
                    <Card className="mt-4 mb-1">
                        <CasesTable state={props.state} dispatch={dispatch} singular_selection={true}
                                    prefix={prefix} project_id={project_id} disableUI={true}/>
                    </Card>
                </Col>
                <Col sm="12">
                    <Button className="mt-3 rb-button rb-purple-button float-right mb-2" disabled={inputsDisabled}
                            onClick={update}>{updateLabel}</Button>
                </Col>
                <Col sm="12">
                    <Card>
                        <DataTable
                            data={energyBenefitsData}
                            columns={energyBenefitsColumn}
                            customStyles={project_styles}
                            noHeader={true}
                            conditionalRowStyles={conditionalRowStyles}
                            className="sliderTable"
                        />
                    </Card>
                </Col>

                <Col sm="12">
                    <Card className="mt-4">
                        <DataTable
                            data={resultData}
                            columns={resultsColumn}
                            customStyles={project_styles}
                            noHeader={true}
                            conditionalRowStyles={conditionalRowStyles}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}, getPropsAreEqualFunction(getVarsFromState, getPrefix))

export default NonEnergyBenefitsTab