import React from "react";

function getEnergyColumns(confidence_level) {
    return [
        {
            name: 'Energy khw',
            selector: 'energy',
        },
        {
            name: 'exp.values',
            selector: 'exp',
        },
        {
            name: `${confidence_level}% confidence`,
            selector: 'confidence',
        },
    ]
}

function getBillColumns(confidence_level) {
    return [
        {
            name: 'Bill €',
            selector: 'bill',
            format: (row, index) => row.bill === "Bill At Risk" ?
                <div style={{fontWeight: 500}}>{row.bill}</div> : row.bill
        },
        {
            name: 'exp.values',
            selector: 'exp',
        },
        {
            name: `${confidence_level}% confidence`,
            selector: 'confidence',
        },
    ]
}

function getInvestColumns(confidence_level) {
    return [
        {
            name: 'Invest. €',
            selector: 'invest'
        },
        {
            name: 'exp.values',
            selector: 'exp',
        },
        {
            name: `${confidence_level}% confidence`,
            selector: 'confidence',
        },
    ]
}

let detailsColumns = [
    {
        name: '',
        selector: 'vertical_column',
        format: (row, index) => row.vertical_column ?
            <div style={{fontWeight: 500}}>{row.vertical_column}</div> : row.vertical_column,
        minWidth: "150px",
        style: {
            backgroundColor: "rgb(150 145 132 / 8%)"
        }
    },
    {
        name: 'heating',
        selector: 'current_heating',
        format: (row, index) => row.current_heating === 'current' ?
            <div style={{fontWeight: 500}}>{row.current_heating}</div> : row.current_heating,
        center: true

    },
    {
        name: 'DHW',
        selector: 'current_dhw',
        format: (row, index) => row.current_dhw === 'current' ?
            <div style={{fontWeight: 500}}>{row.current_dhw}</div> : row.current_dhw,
        center: true
    },
    {
        name: 'heating',
        selector: 'planned_heating',
        format: (row, index) => row.planned_heating === 'planned' ?
            <div style={{fontWeight: 500}}>{row.planned_heating}</div> : row.planned_heating,
        style: {
            backgroundColor: "rgb(150 145 132 / 8%)"
        },
        center: true
    },
    {
        name: 'DHW',
        selector: 'planned_dhw',
        format: (row, index) => row.planned_dhw === 'planned' ?
            <div style={{fontWeight: 500}}>{row.planned_dhw}</div> : row.planned_dhw,
        style: {
            backgroundColor: "rgb(150 145 132 / 8%)"
        },
        center: true
    },
    {
        name: 'heating',
        selector: 'savings_heating',
        format: (row, index) => row.savings_heating === 'savings' ?
            <div style={{fontWeight: 500}}>{row.savings_heating}</div> : row.savings_heating,
        center: true
    },
    {
        name: 'DHW',
        selector: 'savings_dhw',
        format: (row, index) => row.savings_dhw === 'savings' ?
            <div style={{fontWeight: 500}}>{row.savings_dhw}</div> : row.savings_dhw,
        center: true
    },
    {
        name: '',
        selector: 'unit',
        center: true,
        style: {
            backgroundColor: "rgb(150 145 132 / 8%)"
        }
    },
]
let energyBalanceColumns = [
    {
        name: "", selector: "row_name",
        format: (row, index) => row.row_name === 'Heating' || row.row_name === 'Hot water' ?
            <div style={{fontSize: "14px", fontWeight: 500}}>{row.row_name}</div> :
            <div style={{fontWeight: 500}}>{row.row_name}</div>,
        minWidth: "380px"

    },
    {name: "current", selector: "current", center: true},
    {name: "planned", selector: "planned", center: true},
    {name: "difference", selector: "difference", center: true},
    {unit: "", selector: "unit", center: true},
]

let npvColumns = [
    {
        name: 'NPV',
        selector: 'npv',
    },
    {
        name: 'IRR',
        selector: 'irr',
    },
    {
        name: 'PI',
        selector: 'pi',
    },
    {
        name: 'PBP',
        selector: 'pbp',
    },
    {
        name: 'DPBP',
        selector: 'dpbp',
    },
];

function getMCNPVColumns(confidence_level) {
    return [
        {
            name: '',
            selector: 'type',
            maxWidth: "73px",
            minWidth: "73px"
        },
        {
            name: 'exp.values',
            selector: 'exp_val',
            minWidth: "135px"
        },
        {
            name: `${confidence_level}% confidence`,
            selector: 'confidence',
            minWidth: "135px"
        },
        {
            name: '',
            selector: 'symbol',
            maxWidth: "57px",
            minWidth: "57px"
        },
    ]
}

let mcNpvRiskColumns = [
    {
        name: '',
        selector: 'type',
        maxWidth: "73px",
        minWidth: "73px"
    },
    {
        name: 'VaR',
        selector: 'var',
    },
    {
        name: 'CVaR',
        selector: 'cvar',
    },
    {
        name: '',
        selector: 'symbol',
        maxWidth: "57px",
        minWidth: "57px"
    },

];

export {
    getEnergyColumns, getBillColumns, getInvestColumns, detailsColumns, energyBalanceColumns, npvColumns, getMCNPVColumns,
    mcNpvRiskColumns
}