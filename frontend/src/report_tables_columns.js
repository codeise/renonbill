const investment_columns = [
    {
        name: '',
        selector: 'columnName',
    },
    {
        name: 'amount',
        selector: 'amount',
    },
    {
        name: 'amount %',
        selector: 'amountPerc',
    },
    {
        name: 'refund time, yrs.',
        selector: 'refundTime',
    },
    {
        name: 'rate %',
        selector: 'rate',
    },
];
const financial_analysis_columns = [
    {
        name: 'Time horizon',
        selector: 'timeHorizon',
    },
    {
        name: 'Initial Investment',
        selector: 'InitInvestment',
    },
    {
        name: 'NPV, €',
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
        name: 'DPB, yrs.',
        selector: 'dpb',
    },

];
const project_rating_columns = [
    {
        name: '',
        selector: 'columnName',
    },
    {
        name: 'Weights',
        selector: 'weights',
    },
    {
        name: 'min | max',
        selector: 'minMax',
    },
    {
        name: 'Values',
        selector: 'values',
    },
    {
        name: 'Confidence',
        selector: 'confidence',
    },
    {
        name: 'Ratings',
        selector: 'ratings',
    },

];
const energy_analysis_columns = [
    {
        name: '',
        selector: 'columnName',
    },
    {
        name: 'Fuel Energy consumption, k Wh',
        selector: 'fuelCons',
    },
    {
        name: 'Electric Energy consumption, k Wh',
        selector: 'electricCons',
    },
    {
        name: 'Fuel Energy Bill, €',
        selector: 'fuelBill',
    },
    {
        name: 'Electric Energy Bill',
        selector: 'electricBill',
    },
    {
        name: 'Energy Consumption, k Wh',
        selector: 'consumption',
    },
    {
        name: 'Energy Bill, €',
        selector: 'bill',
    },

];
const energy_losses_columns = [
    {
        name: '',
        selector: 'columnName',
    },
    {
        name: 'Heating Energy losses, k Wh',
        selector: 'heatingLosses',
    },
    {
        name: 'DHW Energy losses, k Wh',
        selector: 'dhwLosses',
    },
    {
        name: 'Energy losses',
        selector: 'energyLosses',
    },

];
const monte_carlo_columns = [
    {
        name: '',
        selector: 'columnName',
        minWidth: '270px',
        maxWidth: '270px'
    },
    {
        name: 'Energy Savings',
        selector: 'energySavings',
    },
    {
        name: 'Bill Savings',
        selector: 'billSavings',
    },
    {
        name: 'Intervention Costs',
        selector: 'interventionCosts',
        minWidth: '170px',
        maxWidth: '170px'
    },
    {
        name: 'NPV',
        selector: 'npv',
    },
    {
        name: 'IRR',
        selector: 'irr',
    },
    {
        name: 'DPBP',
        selector: 'dpbp',
    },

];
const non_energy_benefits_columns = [
    {
        name: 'score',
        selector: 'score',
    },
    {
        name: 'benefits',
        selector: 'benefits',
    },

];
const dwelling_columns = [
    {
        name: 'dwelling indices',
        selector: 'indices',
    },
    {
        name: 'num of dwelling',
        selector: 'numOfDwellings',
    },
    {
        name: 'n floors',
        selector: 'nFloors',
    },
    {
        name: 'Country',
        selector: 'country',
    },
    {
        name: 'City',
        selector: 'city',
    },
    {
        name: 'Building',
        selector: 'building',
        minWidth: '130px',
        maxWidth: '130px'
    },
    {
        name: 'Age',
        selector: 'age',
    },
    {
        name: 'Plant Area',
        selector: 'plantArea',
    },
    {
        name: 'Costs',
        selector: 'costs',
    },
    {
        name: 'Investment',
        selector: 'investment',
    },
    {
        name: 'NPV',
        selector: 'npv',
    },
    {
        name: 'NPV/m2',
        selector: 'npvm2',
    },
    {
        name: 'IRR',
        selector: 'irr',
    },
    {
        name: 'IRR-Drate',
        selector: 'irrDrate',
    },
    {
        name: 'Drate',
        selector: 'drate',
    },
    {
        name: 'PI',
        selector: 'pi',
    },
    {
        name: 'DPBP',
        selector: 'dpbp',
    },

];
const npv_table_columns = [
    {
        name: 'year',
        selector: 'year',
    },
    {
        name: 'NPV',
        selector: 'npv',
    },
    {
        name: 'MC_NPV',
        selector: 'mc_npv',
    },
    {
        name: 'CB+',
        selector: 'cbPlus',
    },
    {
        name: 'CB-',
        selector: 'cbMinus',
    },

];

export {
    investment_columns,
    financial_analysis_columns,
    project_rating_columns,
    energy_analysis_columns,
    energy_losses_columns,
    monte_carlo_columns,
    non_energy_benefits_columns,
    dwelling_columns,
    npv_table_columns
}