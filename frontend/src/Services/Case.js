import {createObjectByYears, dispatchSetField, fetch} from "../commonFunctions";
import {keyValueUpdateAction, prefixUpdateAction} from "../actions";
import {
    NonEnergyBenefits_params_default,
    Project_EditCase_temporaryCase_default,
    Project_EquipmentSetup_dhw_default,
    Project_EquipmentSetup_envelope_default,
    Project_EquipmentSetup_envelope_default_default,
    Project_EquipmentSetup_heating_default
} from "../defaultState";
import _ from "lodash"
import {BASE_URL} from "../environment_vars";
import {addBpCases} from "./BusinessPlan";

function validateCase(caseObj) {
    let {common, current, planned} = caseObj
    let {building_type, wall_height, floor_count, floor_area} = common
    let common_params = _.pick(common,
        ['dwelling_count', 'floor_count', 'floor_area', 'wall_thermal_transmittance', 'total_surface_area_to_volume_ratio',
            'roof_thermal_transmittance', 'wall_height', 'floor_thermal_transmittance'])
    let current_params = _.pick(current, ['wall_thickness', 'roof_thickness', 'floor_thickness', 'wall_envelope_thermal_conductivity',
        'roof_envelope_thermal_conductivity', 'floor_envelope_thermal_conductivity', 'window_transmittance_value',
        'window_to_surface_area_ratio', 'solar_perc', 'DHW_solar_perc'
    ])
    let planned_params = _.pick(planned, ['wall_thickness', 'roof_thickness', 'floor_thickness', 'wall_envelope_thermal_conductivity',
        'roof_envelope_thermal_conductivity', 'floor_envelope_thermal_conductivity', 'window_transmittance_value',
        'window_to_surface_area_ratio', 'solar_perc', 'DHW_solar_perc'
    ])

    let params = {
        common: common_params,
        current: current_params,
        planned: planned_params
    }

    let errors = {};
    for (let [param_key, param_value] of Object.entries(params)) {
        for (let [key, value] of Object.entries(param_value)) {
            if (key === 'solar_perc' || key === 'DHW_solar_perc') {
                if (value < 0) {
                    errors[key] = "must be greater than or equal to zero"
                }
            } else {
                if (key === 'total_surface_area_to_volume_ratio' &&
                    (building_type === 'multistorey' || building_type === 'detached house')) {
                    const s_v_min = 2 * (0.5 / (wall_height * floor_count) + 1.7724 / Math.sqrt(floor_area))
                    if (value < s_v_min) {
                        errors[key] = "minimum value is " + s_v_min.toFixed(3)
                    }
                }
                if (value <= 0) {
                    errors[key] = "must be positive"
                    if (param_key !== "common") {
                        errors[key] += " (" + param_key + ")"
                    }
                }
            }
        }
    }

    return errors
}

function addCase(dispatch, project_id, common, current, planned, bp_year) {
    return fetch(BASE_URL + 'api/cases/', "POST", dispatch, {
        project_id: project_id,
        common_params: {
            ...common,
            ...NonEnergyBenefits_params_default
        },
        current_params: current,
        planned_params: planned
    }).then(r => addBpCases(dispatch, bp_year, [{
        case_id: r.data.id,
        nrValues: createObjectByYears(bp_year, () => 0),
        gsValues: createObjectByYears(bp_year, () => 0),
    }]).then(() => r))
}

function editCase(dispatch, id, project_id, common, current, planned) {
    return fetch(BASE_URL + 'api/cases/' + id, "PUT", dispatch, {
        project_id: project_id,
        common_params: common,
        current_params: current,
        planned_params: planned
    })
}

function editCasesErvParams(dispatch, project_id, erv_params) {
    return fetch(BASE_URL + 'api/edit_cases_erv_params/', "POST", dispatch, {
        project_id: project_id,
        erv_params: erv_params,
    })
}

function deleteCase(dispatch, id) {
    return fetch(BASE_URL + 'api/cases/' + id, "DELETE", dispatch)
}

function updateSelectedCases(dispatch, selectedCount, selectedRows, prefix) {
    dispatch(prefixUpdateAction(prefix, {
        selectedCount: selectedCount,
        selected: selectedRows
    }));
}

function updateCaseData(dispatch, data, selectedCase, prefix) {
    const newData = data.map(item => {
        if (item.id === selectedCase.id) {
            item.common_params = selectedCase.common_params
            return item
        }
        return item
    })
    dispatch(prefixUpdateAction(prefix, {
        data: newData
    }))
}

function deselectAllCases(dispatch, prefix) {
    updateSelectedCases(dispatch, 0, [], prefix)
}

function fetchCases(project_id, dispatch, prefix) {
    return fetch(BASE_URL + 'api/project_cases/' + project_id, "GET", dispatch,
        {user_id: localStorage.getItem('user_id')}, prefix)
}

function setTTDefaults(country, building_type, building_year, floor_count, floor_area, caseInfoConstants, dispatch) {
    const td_defaults = caseInfoConstants.data.td_defaults[country][building_type][building_year]
    let s_v_norm = null;
    let s_v_ratio = parseFloat(td_defaults["disp_v_ratio"])
    let height = parseFloat(td_defaults["height"])
    let floor_area_sqrt = Math.sqrt(floor_area);
    if (building_type === "multistorey") {
        s_v_norm = 2 * (1 / (height * floor_count) + 2.31 / floor_area_sqrt)
    } else if (building_type === "detached house") {
        s_v_norm = 2 * (1 / height + 2.31 / floor_area_sqrt)
    }
    if (s_v_norm) s_v_ratio = Math.floor(s_v_norm * 100 + 0.5) / 100

    dispatch(prefixUpdateAction("Project_EditCase_temporaryCase", {
        wall_height: height,
        roof_thermal_transmittance: parseFloat(td_defaults["roof_trans"]),
        wall_thermal_transmittance: parseFloat(td_defaults["wall_trans"]),
        floor_thermal_transmittance: parseFloat(td_defaults["floor_trans"]),
        total_surface_area_to_volume_ratio: s_v_ratio,
    }))
}

function setEnvelopeDefaults(country, building_type, building_year, caseInfoConstants, dispatch) {
    const td_defaults = caseInfoConstants.data.td_defaults[country][building_type][building_year]
    const envelope_td_default = {
        window_transmittance_value: parseFloat(td_defaults["windows_trans"]),
        window_to_surface_area_ratio: parseFloat(td_defaults["win_floor_ratio"]),
    }
    dispatch(prefixUpdateAction("Project_EquipmentSetup_envelope_current", envelope_td_default))
    dispatch(prefixUpdateAction("Project_EquipmentSetup_envelope_planned", envelope_td_default))
}

function updateDiscountRate(dispatch, country, discountRateConstants) {
    if (discountRateConstants && discountRateConstants.data && discountRateConstants.data[country]) {
        const discount_rate = discountRateConstants.data[country]["discount_rate"]["variation_rate_per_year"]
        dispatch(prefixUpdateAction("Project_EditCase_temporaryCase", {discount_rate: discount_rate}))
    }
}

function onChangeCountry(country, floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch, tt_update = true) {
    if (caseInfoConstants.data.countries && caseInfoConstants.data.td_defaults) {
        const city = caseInfoConstants.data.countries[country]['cities'][0]
        const building_type = caseInfoConstants.data.countries[country]['building_types'][0]
        const building_year = Object.keys(caseInfoConstants.data.td_defaults[country][building_type])[0]
        dispatch(keyValueUpdateAction("Project_country", country))
        dispatch(prefixUpdateAction("Project_EditCase_temporaryCase", {
            country: country,
            city: city,
        }))
        onBuildingTypeChange(country, building_type, floor_count, floor_area, caseInfoConstants, dispatch, tt_update)

        if (tt_update) {
            setTTDefaults(country, building_type, building_year, floor_count, floor_area, caseInfoConstants, dispatch)
        }

        setEnvelopeDefaults(country, building_type, building_year, caseInfoConstants, dispatch)
    }

    updateDiscountRate(dispatch, country, discountRateConstants)
}

function onBuildingTypeChange(country, building_type, floor_count, floor_area, caseInfoConstants, dispatch, tt_update) {
    const _building_year = Object.keys(caseInfoConstants.data.td_defaults[country][building_type])[0]
    dispatch(prefixUpdateAction("Project_EditCase_temporaryCase", {
        building_type: building_type,
        building_year: _building_year,
    }))
    if (building_type === "multistorey" || building_type === "detached house") {
        dispatchSetField(dispatch, "Project_EditCase_temporaryCase",
            "storey_position", "--")
    } else {
        dispatchSetField(dispatch, "Project_EditCase_temporaryCase",
            "storey_position", "mid")
    }
    if (building_type !== "multistorey") {
        dispatchSetField(dispatch, "Project_EditCase_temporaryCase",
            "floor_count", 1)
    }
    if (tt_update) {
        setTTDefaults(country, building_type, _building_year, floor_count, floor_area, caseInfoConstants, dispatch)
    }
    setEnvelopeDefaults(country, building_type, _building_year, caseInfoConstants, dispatch)
}

function loadDefaultInput(floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch, cases) {
    let country
    if (caseInfoConstants.data && caseInfoConstants.data.countries) {
        const default_country = Object.keys(caseInfoConstants.data.countries)[0]
        if (cases.data.length === 0) {
            country = default_country
        } else if (cases.data[0].common_params.country) {
            country = cases.data[0].common_params.country
        } else {
            country = default_country
        }

        onChangeCountry(country, floor_count, floor_area, caseInfoConstants, discountRateConstants, dispatch)
    }

    for (const [key, value] of Object.entries(Project_EditCase_temporaryCase_default)) {
        if (!["country", "city", "building_type", "building_year"].includes(key)) {
            dispatchSetField(dispatch, "Project_EditCase_temporaryCase", key, value)
        }
    }

    const defaultHeatingState = {
        ...Project_EquipmentSetup_heating_default,
        ...Project_EquipmentSetup_dhw_default,
        ...Project_EquipmentSetup_envelope_default,
        ...Project_EquipmentSetup_envelope_default_default
    }

    updateDiscountRate(dispatch, country, discountRateConstants)
    setHeating(dispatch, defaultHeatingState, defaultHeatingState)
}

function setHeating(dispatch, current, planned, set_envelope = true) {
    function getHeating(obj) {
        return {
            heating_type: obj.heating_type ?? 1,
            burner_type: obj.burner_type ?? 1,
            emitter_type: obj.emitter_type ?? 0,
            solar_check: obj.solar_check ?? false,
            solar_perc: obj.solar_perc ?? 0,
        }
    }

    function getDHW(obj) {
        return {
            DHW_type: obj.DHW_type ?? 1,
            DHW_burner_type: obj.DHW_burner_type ?? 1,
            DHW_solar_check: obj.DHW_solar_check ?? false,
            DHW_solar_perc: obj.DHW_solar_perc ?? 0,
        }
    }

    function getEnvelope(obj) {
        const validated_obj = {
            wall_insulation_check: obj.wall_insulation_check ?? false,
            roof_insulation_check: obj.roof_insulation_check ?? false,
            floor_insulation_check: obj.floor_insulation_check ?? false,
            wall_thickness: obj.wall_thickness ?? 0,
            roof_thickness: obj.roof_thickness ?? 0,
            floor_thickness: obj.floor_thickness ?? 0,
            wall_envelope_thermal_conductivity: obj.wall_envelope_thermal_conductivity ?? 0,
            roof_envelope_thermal_conductivity: obj.roof_envelope_thermal_conductivity ?? 0,
            floor_envelope_thermal_conductivity: obj.floor_envelope_thermal_conductivity ?? 0,
            window_transmittance_value: obj.window_transmittance_value ?? 0,
            window_to_surface_area_ratio: obj.window_to_surface_area_ratio ?? 0,
        }

        const inputs_keys = ['wall_thickness', 'roof_thickness', 'floor_thickness', 'wall_envelope_thermal_conductivity',
            'roof_envelope_thermal_conductivity', 'floor_envelope_thermal_conductivity']

        inputs_keys.forEach(key => {
            if (validated_obj[key] === 0.000001 || validated_obj[key] === 1000000) {
                validated_obj[key] = Project_EquipmentSetup_envelope_default[key]
            }
        })

        return validated_obj
    }

    dispatch(prefixUpdateAction("Project_EquipmentSetup_heating_current", getHeating(current)))
    dispatch(prefixUpdateAction("Project_EquipmentSetup_heating_planned", getHeating(planned)))
    dispatch(prefixUpdateAction("Project_EquipmentSetup_dhw_current", getDHW(current)))
    dispatch(prefixUpdateAction("Project_EquipmentSetup_dhw_planned", getDHW(planned)))
    dispatch(prefixUpdateAction("Project_EquipmentSetup_envelope_default", current.window_flag))
    if (set_envelope) {
        dispatch(prefixUpdateAction("Project_EquipmentSetup_envelope_current", getEnvelope(current)))
        dispatch(prefixUpdateAction("Project_EquipmentSetup_envelope_planned", getEnvelope(planned)))
    }
}

function fetchBpCaseData(dispatch) {
    return fetch(BASE_URL + 'api/bp_case_data/', "GET", dispatch,
        {user_id: localStorage.getItem('user_id')})
}

export {
    validateCase,
    addCase,
    editCase,
    deleteCase,
    deselectAllCases,
    fetchCases,
    updateSelectedCases,
    onChangeCountry,
    loadDefaultInput,
    setHeating,
    setTTDefaults,
    setEnvelopeDefaults,
    onBuildingTypeChange,
    fetchBpCaseData,
    updateCaseData,
    editCasesErvParams
}