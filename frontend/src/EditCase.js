import React, {useEffect} from "react"
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import {Col} from "react-bootstrap";
import ComboBox from "./ComboBox";
import {_parseInputFloat, _parseInputInt, dispatchSetField, fetch} from "./commonFunctions";
import {prefixUpdateAction} from "./actions";
import {
    loadDefaultInput,
    onBuildingTypeChange,
    onChangeCountry,
    setEnvelopeDefaults,
    setTTDefaults
} from "./Services/Case";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {BASE_URL} from "./environment_vars";
import {calculate_shape, calculate_volume} from "./CoreFunctions";

function EditCase(props) {
    const MySwal = withReactContent(Swal)
    const prefix = props.prefix + "EditCase_";
    const dispatch = props.dispatch
    const state = props.state

    const caseInfoConstants = state[prefix + "caseInfoConstants"];
    const temporaryCase = state[prefix + "temporaryCase"];
    const discountRateConstants = state[prefix + "discountRateConstants"]

    const {
        country,
        city,
        building_type,
        floor_count,
        dwelling_count,
        storey_position,
        building_year,
        floor_area,
        thermal_transmittance_check,
        wall_thermal_transmittance,
        roof_thermal_transmittance,
        floor_thermal_transmittance,
        total_surface_area_to_volume_ratio,
        wall_height,
    } = temporaryCase;
    const caseToEdit = props.caseToEdit;
    const all_cases = state["Project_CasesTable_cases"]
    let countryOptions
    if (all_cases.data.length > 0 && all_cases.data[0].common_params.country &&
        all_cases.data[0].common_params.country !== "") {
        countryOptions = [all_cases.data[0].common_params.country]
    } else if (caseInfoConstants.data.countries) {
        countryOptions = Object.keys(caseInfoConstants.data.countries)
    } else {
        countryOptions = []
    }

    useEffect(() => {
        if (dispatch) fetch(BASE_URL + 'api/case_info_constants/' + localStorage.getItem("user_id"),
            "GET", dispatch, {}, prefix + "caseInfoConstants")
    }, [dispatch, prefix])

    useEffect(() => {
        fetch(BASE_URL + 'api/default_discount_rates/' + localStorage.getItem("user_id"), 'GET',
            dispatch, null, prefix + "discountRateConstants")
    }, [dispatch])

    useEffect(() => {
        if (caseToEdit) {
            dispatch(prefixUpdateAction(prefix + "temporaryCase", caseToEdit.common_params))
        }
    }, [dispatch, prefix, caseToEdit])

    useEffect(() => {
        loadDefaultInput(floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch, all_cases)
    }, [caseInfoConstants, discountRateConstants, dispatch])

    return (
        caseInfoConstants.data && caseInfoConstants.data.countries ?
            <Card style={{width: '100%', backgroundColor: '#fffffff2'}} className="small-border-radius h-100">
                <Card.Header className="my-card-header bold-headers">
                    Case details
                </Card.Header>
                <Card.Body>
                    <Form className="font-size-95">
                        <Form.Group as={Row}>
                            <Form.Label column sm="4" className="pr-0 pt-0">
                                Country
                            </Form.Label>
                            <Col sm="8">
                                <ComboBox disabled={props.inputsDisabled}
                                          onChange={e => onChangeCountry(e.target.value, floor_count, floor_area,
                                              caseInfoConstants, discountRateConstants, dispatch,
                                              !thermal_transmittance_check)}
                                          value={country}
                                          options={countryOptions}/>

                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm="4" className="pr-0 pt-0">
                                City
                            </Form.Label>
                            <Col sm="8">
                                <ComboBox disabled={props.inputsDisabled}
                                          onChange={e => dispatchSetField(dispatch, prefix + "temporaryCase",
                                              "city", e.target.value)}
                                          value={city}
                                          options={caseInfoConstants.data.countries[country] ?
                                              caseInfoConstants.data.countries[country].cities : []}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm="4" className="pr-0 pt-0">
                                Building Type
                            </Form.Label>
                            <Col sm="5">
                                <ComboBox disabled={props.inputsDisabled}
                                          onChange={e => onBuildingTypeChange(country, e.target.value, floor_count,
                                              floor_area, caseInfoConstants, dispatch, !thermal_transmittance_check)}
                                          value={building_type}
                                          options={caseInfoConstants.data.countries[country] ?
                                              caseInfoConstants.data.countries[country].building_types : []}/>
                            </Col>

                            <Col sm="3">
                                <Form.Control disabled={props.inputsDisabled} value={dwelling_count}
                                              onChange={e => dispatchSetField(dispatch, prefix + "temporaryCase",
                                                  "dwelling_count", _parseInputInt(e.target.value))}
                                              size="sm" type="number" min={0} placeholder="Num"/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm="4" className="pr-0 pt-0">
                                Floor Position
                            </Form.Label>
                            <Col sm="8">
                                <ComboBox disabled={props.inputsDisabled || storey_position === '--'}
                                          onChange={e => {
                                              let val = e.target.value
                                              if (val === '--') {
                                                  val = "mid"
                                              }
                                              dispatchSetField(dispatch, prefix + "temporaryCase",
                                                  "storey_position", val)
                                          }}
                                          value={storey_position} options={["--", "mid", "top", "ground"]}/>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row}>
                            <Form.Label column sm="4" className="pr-0 pt-0">
                                Building Year
                            </Form.Label>
                            <Col sm="8">
                                <ComboBox disabled={props.inputsDisabled}
                                          onChange={e => {
                                              if (!thermal_transmittance_check) {
                                                  setTTDefaults(country, building_type, e.target.value, floor_count,
                                                      floor_area, caseInfoConstants, dispatch)
                                              }
                                              setEnvelopeDefaults(country, building_type, e.target.value,
                                                  caseInfoConstants, dispatch)
                                              dispatchSetField(dispatch, prefix + "temporaryCase",
                                                  "building_year", e.target.value)
                                          }}
                                          value={building_year}
                                          options={caseInfoConstants.data.td_defaults[country] &&
                                          caseInfoConstants.data.td_defaults[country][building_type]
                                              ? Object.keys(caseInfoConstants.data.td_defaults[country][building_type]) : []}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column sm="4" className="pr-0 pt-0">
                                Floor(plant) Area
                            </Form.Label>
                            <Col sm="8">
                                <Form.Control disabled={props.inputsDisabled} value={floor_area}
                                              onChange={e => dispatchSetField(dispatch, prefix + "temporaryCase",
                                                  "floor_area", _parseInputFloat(e.target.value))}
                                              size="sm" type="number" min={0} placeholder="Area"/>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row}>
                            <Col sm="6">
                                {building_type === "multistorey" ? <div className="d-flex flex-row-reverse">
                                    <div style={{width: "50px"}} className="ml-2 mr-3">
                                        <Form.Control disabled={props.inputsDisabled} value={floor_count}
                                                      onChange={e => dispatchSetField(dispatch,
                                                          prefix + "temporaryCase",
                                                          "floor_count", _parseInputInt(e.target.value))}
                                                      className="input-style"
                                                      size="sm" type="text" placeholder="0"/>
                                    </div>
                                    <Form.Label className="pr-0 pt-0">
                                        Num of Floors
                                    </Form.Label>
                                </div> : null}
                            </Col>
                            <Col sm="6">
                                <div className="d-flex flex-row-reverse mt-1">
                                    <div style={{width: "55px"}} className="ml-2">
                                        <Form.Control disabled={true} className="input-style" size="sm" type="text"
                                                      value={floor_area && floor_count && wall_height ?
                                                          calculate_volume(floor_area, floor_count, wall_height) : ""}/>
                                    </div>
                                    <Form.Label className="pr-0 pt-0">
                                        Vol
                                    </Form.Label>
                                    <div style={{width: "60px"}} className="ml-2 mr-3">
                                        <Form.Control disabled={true} className="input-style" size="sm" type="text"
                                                      value={total_surface_area_to_volume_ratio && wall_height &&
                                                      floor_count && floor_area && building_type !== 'apartment' ?
                                                          calculate_shape(total_surface_area_to_volume_ratio,
                                                              wall_height, floor_count, floor_area) : ""}/>
                                    </div>
                                    <Form.Label className="pr-0 pt-0">
                                        Shape
                                    </Form.Label>
                                </div>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col sm="7" className="mt-3">
                                <Form.Check checked={thermal_transmittance_check}
                                            id="thermalTransmittanceCheck"
                                            onChange={e => {
                                                if (!e.target.checked) {
                                                    const checked = e.target.checked
                                                    MySwal.fire({
                                                        title: 'Do you want to restore the default values?',
                                                        showDenyButton: true,
                                                        confirmButtonText: 'Yes',
                                                        denyButtonText: `No`,
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            dispatchSetField(dispatch, prefix + "temporaryCase",
                                                                "thermal_transmittance_check", checked)
                                                            setTTDefaults(country, building_type, building_year,
                                                                floor_count, floor_area, caseInfoConstants, dispatch)
                                                        }
                                                    })
                                                } else {
                                                    dispatchSetField(dispatch, prefix + "temporaryCase",
                                                        "thermal_transmittance_check", e.target.checked)
                                                }
                                            }}
                                            disabled={props.inputsDisabled}
                                            label="Thermal Transmittance"/>
                            </Col>
                        </Form.Group>
                        {thermal_transmittance_check ? <div>
                            <Form.Group as={Row}>
                                <Form.Label column sm="4" className="pr-0 pt-0">
                                    Bare Wall trans
                                </Form.Label>
                                <Col sm="2">
                                    <div style={{width: "50px"}}>
                                        <Form.Control disabled={props.inputsDisabled} value={wall_thermal_transmittance}
                                                      onChange={e => dispatchSetField(dispatch,
                                                          prefix + "temporaryCase",
                                                          "wall_thermal_transmittance",
                                                          _parseInputFloat(e.target.value))}
                                                      className="input-style" size="sm" type="number" step={0.01}
                                                      min={0}/>
                                    </div>
                                </Col>
                                <Col sm="6" className="d-flex flex-row-reverse">
                                    <div style={{width: "50px"}} className="ml-4">
                                        <Form.Control disabled={props.inputsDisabled}
                                                      value={total_surface_area_to_volume_ratio}
                                                      onChange={e => dispatchSetField(dispatch,
                                                          prefix + "temporaryCase",
                                                          "total_surface_area_to_volume_ratio",
                                                          _parseInputFloat(e.target.value))}
                                                      className="input-style" size="sm" type="number" step={0.01}
                                                      min={0}/>
                                    </div>
                                    <Form.Label className="pr-0 pt-0">
                                        S/V ratio
                                    </Form.Label>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm="4" className="pr-0 pt-0">
                                    Bare Roof trans
                                </Form.Label>
                                <Col sm="2">
                                    <div style={{width: "50px"}}>
                                        <Form.Control disabled={props.inputsDisabled} value={roof_thermal_transmittance}
                                                      onChange={e => dispatchSetField(dispatch,
                                                          prefix + "temporaryCase",
                                                          "roof_thermal_transmittance",
                                                          _parseInputFloat(e.target.value))}
                                                      className="input-style" size="sm" type="number" step={0.01}
                                                      min={0}/>
                                    </div>
                                </Col>
                                <Col sm="6" className="d-flex flex-row-reverse">
                                    <div style={{width: "50px"}} className="ml-4">
                                        <Form.Control disabled={props.inputsDisabled} value={wall_height}
                                                      onChange={e => dispatchSetField(dispatch,
                                                          prefix + "temporaryCase",
                                                          "wall_height",
                                                          _parseInputFloat(e.target.value))}
                                                      className="input-style" size="sm" type="number" step={0.01}
                                                      min={0}/>
                                    </div>
                                    <Form.Label className="pr-0 pt-0">
                                        h
                                    </Form.Label>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm="4" className="pr-0 pt-0">
                                    Bare Floor trans
                                </Form.Label>
                                <Col sm="8">
                                    <div style={{width: "50px"}}>
                                        <Form.Control disabled={props.inputsDisabled}
                                                      value={floor_thermal_transmittance}
                                                      onChange={e => dispatchSetField(dispatch,
                                                          prefix + "temporaryCase",
                                                          "floor_thermal_transmittance",
                                                          _parseInputFloat(e.target.value))}
                                                      className="input-style" size="sm" type="number"/>
                                    </div>
                                </Col>
                            </Form.Group>
                        </div> : null}
                    </Form>
                </Card.Body>
            </Card> : null
    )
}

export default EditCase