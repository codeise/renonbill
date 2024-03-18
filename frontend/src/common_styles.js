const tableStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    rows: {
        style: {
            backgroundColor: "transparent",
            minHeight: '40px',
        }
    },
    headCells: {
        style: {
            fontSize: '14px',
            fontWeight: 600,
        },
    },
    headRow: {
        style: {
            backgroundColor: '#e6ebff',
            minHeight: '45px',
        },
    },
    header: {
        style: {
            fontSize: '16px',
            minHeight: '48px',
        },
    },
    cells: {
        style: {
            backgroundColor: "transparent",
            fontSize: '12px',
            /* paddingLeft: '8px', // override the cell padding for data cells
             paddingRight: '8px',*/
        },
    }
};
const energyStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    rows: {
        style: {
            backgroundColor: "transparent",
            minHeight: '26px',
        }
    },
    headCells: {
        style: {
            fontSize: '13px',
            fontWeight: 500,
        },
    },
    headRow: {
        style: {
            backgroundColor: '#e6ebff',
            minHeight: '32px',
        },
    },
    cells: {
        style: {
            backgroundColor: "transparent",
            fontSize: '12px',
            /*   paddingLeft: '8px', // override the cell padding for data cells
               paddingRight: '8px',*/
        },
    }
};
const detailsStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    rows: {
        style: {
            backgroundColor: "transparent",
            minHeight: '33px',
        }
    },
    headCells: {
        style: {
            fontSize: '14px',
            fontWeight: 500,
        },
    },
    headRow: {
        style: {
            backgroundColor: '#e6ebff',
            minHeight: '35px',
        },
    },
    header: {
        style: {
            fontSize: '16px',
            minHeight: '40px',
        },
    },
    cells: {
        style: {
            backgroundColor: "transparent",
            fontSize: '12px',
            textAlign: 'center'
        },
    }
};
const conditionalRowStyles = [
    {
        when: row => row.bill === "Total",
        style: {
            color: "#f15252",
        },

    },
    {
        when: row => row.energy === "Total",
        style: {
            color: "#f15252",
        },

    },
    {
        when: row => row.bill === "Bill At Risk",
        style: {
            backgroundColor: '#f0f3fd',
        },

    },
    {
        when: row => row.energy === "Energy At Risk",
        style: {
            backgroundColor: '#f0f3fd',
        },

    },
    {
        when: row => row.vertical_column,
        style: {
            minWidth: "350px"
        },

    },
    {
        when: row => row.row_name === "Heating" || row.row_name === "Hot water",
        style: {
            backgroundColor: '#f0f3fd',
        },

    },
]
const bpConditionalRowStyles = [
    {
        when: row => row.case_order === "Total Energy Savings" || row.case_order === "Total Renovation Counts" ||
            row.case_order === "TOTAL INVESTMENTS PER YEAR" || row.case_order === "Total Operational Costs" ||
            row.case_order === "Total Revenues (€)" || row.case_order === "Total Net Profits (€)",
        style: {
            backgroundColor: "#dfdfdf",
        },
    },
    {
        when: row => row.case_order === "CUMULATED INVESTMENTS" || row.case_order === "CUMULATED INVESTMENTS"
            || row.case_order === "Cumulated Net Profits (€)",
        style: {
            backgroundColor: "#dfdfdf",
        },
    },
    {
        when: row => row.name ==="Cumulated Investments and Costs"
            || row.name ==="Cumulated Revenues",
        style: {
            backgroundColor: "#dfdfdf",
        },
    }
]
const conditionalDetailsCellStyles = [
    {
        when: row => row.planned_heating,
        style: {
            /* backgroundColor: 'rgba(63, 195, 128, 0.9)',*/
        },

    }
]

const project_styles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    rows: {
        style: {
            backgroundColor: "transparent",
            minHeight: '26px',
        }
    },
    headCells: {
        style: {
            fontSize: '13px',
            fontWeight: 500,
        },
    },
    headRow: {
        style: {
            backgroundColor: '#e6ebff',
            minHeight: '32px',
        },
    },
    cells: {
        style: {
            backgroundColor: "transparent",
            fontSize: '12px',
        },
    }
};

const projectsStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    rows: {
        style: {
            backgroundColor: "transparent",
            minHeight: '40px',
        }
    },
    headCells: {
        style: {
            fontSize: '14px',
            fontWeight: 600,
        },
    },
    headRow: {
        style: {
            backgroundColor: '#e6ebff',
            minHeight: '45px',
        },
    },
    header: {
        style: {
            fontSize: '16px',
            minHeight: '48px',
        },
    },
    cells: {
        style: {
            backgroundColor: "transparent",
            fontSize: '12px',
        },
    }
};

export {
    tableStyles,
    energyStyles,
    detailsStyles,
    conditionalRowStyles,
    conditionalDetailsCellStyles,
    project_styles,
    projectsStyles,
    bpConditionalRowStyles
}