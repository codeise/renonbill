const cc_columns = [
    {
        name: 'Country',
        selector: 'country',
    },
    {
        name: 'City',
        selector: 'city',
    },
    {
        name: 'HDD',
        selector: 'hdd',
    },
    {
        name: 'Zone',
        selector: 'zone',
    },
    {
        name: 'Heating on/off',
        selector: 'heatingonoff',
    },
    {
        name: 'Average Daily Solar Rad',
        selector: 'average_daily',
    },
    {
        name: 'January',
        selector: 'january',
    },
    {
        name: 'February',
        selector: 'february',
    },
    {
        name: 'March',
        selector: 'march',
    },
    {
        name: 'April',
        selector: 'April',
    },
    {
        name: 'May',
        selector: 'may',
    },
    {
        name: 'June',
        selector: 'june',
    },
    {
        name: 'July',
        selector: 'july',
    },
    {
        name: 'August',
        selector: 'august',
    },
    {
        name: 'September',
        selector: 'september',
    },
    {
        name: 'October',
        selector: 'october',
    },
    {
        name: 'November',
        selector: 'november',
    },
    {
        name: 'December',
        selector: 'december',
    },
]
const td_columns = [
    {
        name: 'Country',
        selector: 'country',
    },
    {
        name: 'Building Type',
        selector: 'building_type',
    },
    {
        name: 'Age',
        selector: 'building_year',
    },
    {
        name: 'Wall thermal transmittance [W/(m2K)',
        selector: 'wall_trans',
    },
    {
        name: 'Roof thermal transmittance [W/(m2K)',
        selector: 'roof_trans',
    },
    {
        name: 'Floor thermal transmittance [W/(m2K)',
        selector: 'floor_trans',
    },
    {
        name: 'S disp/V',
        selector: 'disp_v_ratio',
    },
    {
        name: 'Windows thermal transmittance [W/(m2K)',
        selector: 'windows_trans',
    },
    {
        name: 'Swin/Sfloor',
        selector: 'win_floor_ratio',
    },
    {
        name: 'height',
        selector: 'height',
    },
]
const ew_table_1_columns = [
    {
        name: 'External Insulation',
        selector: 'external_insulation',
    },
    {
        name: 'Thermal Conductivity',
        selector: 'thermal_conductivity',
    },
    {
        name: 'Thickness',
        selector: 'thickness',
    },
    {
        name: 'Material Cost €/m2',
        selector: 'material_cost',
    },
    {
        name: 'Installation Cost € /m2',
        selector: 'installation_cost',
    },
]
const ew_table_2_columns = [
    {
        name: 'Cost',
        selector: "cost",
    },
    {
        name: 'Value',
        selector: "value",
    },
]
const hdhw_table_1_columns = [
    {
        name: 'HEATING (plant type)',
        selector: "heating",
    },
    {
        name: 'Efficiency',
        selector: "efficiency",
    },
    {
        name: 'Cost €/kW',
        selector: "cost",
    },
    {
        name: 'Installation Cost €/kW',
        selector: "installation_cost",
    },
]
const hdhw_table_2_columns = [
    {
        name: 'plant type (hot water)',
        selector: "plant_type",
    },
    {
        name: 'Efficiency',
        selector: "efficiency",
    },
    {
        name: 'Cost €/kW',
        selector: "cost",
    },
    {
        name: 'Installation Cost €/kW',
        selector: "installation_cost",
    },
]
const hdhw_table_3_columns = [
    {
        name: 'HEATING (emitter type)',
        selector: "heatingemittertype",
    },
    {
        name: 'Efficiency',
        selector: "efficiency",
    },
    {
        name: 'Cost €/kW',
        selector: "cost",
    },
    {
        name: 'Installation Cost €/kW',
        selector: "installation_cost",
    },
]
const hdhw_table_4_columns = [
    {
        name: 'Regulation Mean Efficiency',
        selector: "regulation_mean_efficiency",
    },
    {
        name: 'Distribution Mean Efficiency',
        selector: "distribution_mean_efficiency",
    },
]
const hdhw_table_5_columns = [
    {
        name: 'HEATING (plant type)',
        selector: "heating",
    },
    {
        name: 'Efficiency',
        selector: "efficiency",
    },
    {
        name: 'Cost €/kW',
        selector: "cost",
    },
    {
        name: 'Installation Cost €/kW',
        selector: "installation_cost",
    },
]
const otd_columns = [
    {
        name: 'Description',
        selector: 'description',
    },
    {
        name: 'Value',
        selector: 'value',
    },
    {
        name: 'Note',
        selector: 'note',
    },
]
const vc_columns = [
    {
        name: 'Country',
        selector: 'country',
    },
    {
        name: 'Source',
        selector: 'source',
    },
    {
        name: 'Variation Rate \\ Year',
        selector: 'variation_rate_per_year',
    },
    {
        name: '0',
        selector: 'p0',
    },
    {
        name: '1',
        selector: 'p1',
    },
    {
        name: '2',
        selector: 'p2',
    },
    {
        name: '3',
        selector: 'p3',
    },
    {
        name: '4',
        selector: 'p4',
    },
    {
        name: '5',
        selector: 'p5',
    },
    {
        name: '6',
        selector: 'p6',
    },
    {
        name: '7',
        selector: 'p7',
    },
    {
        name: '8',
        selector: 'p8',
    },
    {
        name: '9',
        selector: 'p9',
    },
    {
        name: '10',
        selector: 'p10',
    },
    {
        name: '11',
        selector: 'p11',
    },
    {
        name: '12',
        selector: 'p12',
    },
    {
        name: '13',
        selector: 'p13',
    },
    {
        name: '14',
        selector: 'p14',
    },
    {
        name: '15',
        selector: 'p15',
    },
    {
        name: '16',
        selector: 'p16',
    },
    {
        name: '17',
        selector: 'p17',
    },
    {
        name: '18',
        selector: 'p18',
    },
    {
        name: '19',
        selector: 'p19',
    },
    {
        name: '20',
        selector: 'p20',
    },
    {
        name: '21',
        selector: 'p21',
    },
    {
        name: '22',
        selector: 'p22',
    },
    {
        name: '23',
        selector: 'p23',
    },
    {
        name: '24',
        selector: 'p24',
    },
    {
        name: '25',
        selector: 'p25',
    },
    {
        name: '26',
        selector: 'p26',
    },
    {
        name: '27',
        selector: 'p27',
    },
    {
        name: '28',
        selector: 'p28',
    },
    {
        name: '29',
        selector: 'p29',
    },
    {
        name: '30',
        selector: 'p30',
    },
]

const du_table_1_columns = [
    {
        name: 'Simplified Manager',
        selector: 'simplified_manager',
    },
    {
        name: 'Check',
        selector: 'check',
    },
    {
        name: 'Confidence Today',
        selector: 'conf_today',
    },
    {
        name: 'Confidence Year',
        selector: 'conf_year',
    },
]
const du_table_2_columns = [
    {
        name: 'Advanced Manager',
        selector: 'advanced_manager',
    },
    {
        name: 'Description',
        selector: 'desc',
    },
    {
        name: 'Check',
        selector: 'check',
    },
    {
        name: 'Confidence Today',
        selector: 'conf_today',
    },
]
const du_table_3_columns = [
    {
        name: 'Advanced Manager',
        selector: 'advanced_manager1',
    },
    {
        name: 'Description',
        selector: 'desc',
    },
    {
        name: 'Check',
        selector: 'check',
    },
    {
        name: 'Confidence Today',
        selector: 'conf_today',
    },
    {
        name: 'Confidence Year',
        selector: 'conf_year',
    },
]
const du_table_4_columns = [
    {
        name: 'Noise Shape',
        selector: 'noiseshape',
    },
]
const du_table_5_columns = [
    {
        name: 'Res. Confidence',
        selector: 'resconfidence',
        format: (row, index) => row.resconfidence + "%"
    }
]
const uv_table_1_columns = [
    {
        name: 'Geometric',
        selector: 'geometric',
    },
    {
        name: '',
        selector: 'value',
    }
]
const uv_table_2_columns = [
    {
        name: 'Thermophysical',
        selector: 'thermophysical',
    },
    {
        name: '',
        selector: 'value',
    }
]
const uv_table_3_columns = [
    {
        name: 'Heating Equipment',
        selector: 'heating_equipment',
    },
    {
        name: '',
        selector: 'value',
    }
]
const uv_table_4_columns = [
    {
        name: 'External Environment',
        selector: 'external_environment',
    },
    {
        name: '',
        selector: 'value',
    }
]
const uv_table_5_columns = [
    {
        name: 'Economic',
        selector: 'economic',
    },
    {
        name: '',
        selector: 'value',
    }
]
export {
    cc_columns, td_columns, ew_table_1_columns, ew_table_2_columns, hdhw_table_1_columns, hdhw_table_2_columns,
    hdhw_table_3_columns, hdhw_table_4_columns, hdhw_table_5_columns, otd_columns, vc_columns, du_table_1_columns,
    du_table_2_columns, du_table_3_columns, du_table_4_columns, du_table_5_columns, uv_table_1_columns,
    uv_table_2_columns, uv_table_3_columns, uv_table_4_columns, uv_table_5_columns
}