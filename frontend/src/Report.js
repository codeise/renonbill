import React, {useEffect} from "react"
import Container from "react-bootstrap/Container";
import {Button, Col} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import {conditionalRowStyles, project_styles} from "./common_styles";
import Header from "./Header";
import DataTable from "react-data-table-component";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    Label,
} from 'recharts';
import {fetchReportData} from "./CoreFunctions";
import {
    dwelling_columns,
    energy_analysis_columns, energy_losses_columns,
    financial_analysis_columns,
    investment_columns, monte_carlo_columns, non_energy_benefits_columns, npv_table_columns,
    project_rating_columns
} from "./report_tables_columns";
import {extractReportData} from "./report_data";

function Report(props) {
    const {state, dispatch} = props
    const project_id = parseInt(props.match.params.id);
    const data = state["Report_data"]

    const {
        investment_data,
        financial_analysis_data,
        project_rating_data,
        energy_analysis_data,
        energy_losses_data,
        monte_carlo_data,
        non_energy_benefits_data,
        dwelling_data,
        npv_table_data,
        npv_graph_data,
        mc_npv_graph_data,
        vitamax,
    } = extractReportData(data)

    useEffect(() => {
        fetchReportData(dispatch, project_id)
    }, [dispatch, project_id])

    function getTablePart(title, columns, table_data) {
        return <React.Fragment>
            {title ? <div className="mt-3">{title}</div> : null}
            <Card className="mt-1">
                <DataTable
                    columns={columns}
                    data={table_data}
                    customStyles={project_styles}
                    noHeader={true}
                    conditionalRowStyles={conditionalRowStyles}
                />
            </Card></React.Fragment>
    }

    return (
        <Container className="pt-3">
            <Card>
                <Card.Body className="h-100 bgi"
                           style={{backgroundColor: 'rgb(243 243 243)', backgroundImage: "url(/renonbill_home1.jpg)"}}>
                </Card.Body>
                <Card.Body className="h-100 card-min-height" style={{backgroundColor: 'transparent', zIndex: 999}}>
                    <div className="ml-3"><Button className="rb-button rb-purple-button"
                                                  onClick={() => window.location.href = "/project/" + project_id}>Go
                        back to Project</Button></div>
                    <Header dispatch={dispatch} state={state} comboboxVisible={false} project_id={project_id}/>
                    {getTablePart("Investment", investment_columns, investment_data)}
                    {getTablePart("Financial Analysis", financial_analysis_columns, financial_analysis_data)}
                    {getTablePart("Project Rating", project_rating_columns, project_rating_data)}
                    {getTablePart("Energy Analysis", energy_analysis_columns, energy_analysis_data)}
                    {getTablePart(null, energy_losses_columns, energy_losses_data)}
                    {getTablePart("Monte Carlo & At Risk Analysis", monte_carlo_columns, monte_carlo_data)}
                    {getTablePart("Non Energy Benefits", non_energy_benefits_columns, non_energy_benefits_data)}
                    {getTablePart("Dwelling indices", dwelling_columns, dwelling_data)}
                    <Row className="mt-4">
                        <Col sm="6">
                            {getTablePart(null, npv_table_columns, npv_table_data)}
                        </Col>
                        <Col sm="6" >
                            <Card>
                                <Card.Body>
                                    <ScatterChart
                                        width={500}
                                        height={350}
                                        margin={{top: 35, right: 30, left: 20, bottom: 15,}}
                                    >
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis type="number" dataKey="x" name="yrs" tickCount={5} domain={[0, vitamax]}>
                                            <Label value="yrs" position="insideBottomRight" offset={-10}/>
                                        </XAxis>
                                        <YAxis type="number" dataKey="y" name="value"
                                               tickFormatter={tick => isFinite(tick) ? tick.toFixed(2) : tick}
                                               domain={[dataMin => (dataMin - Math.abs(dataMin * 10 / 100)),
                                                   dataMax => (dataMax + Math.abs(dataMax * 10 / 100))]}>
                                            <Label value="Net Present Value, €" position="insideTopLeft"
                                                   offset={-25} dx={20} dy={-10}/>
                                        </YAxis>
                                        <ZAxis type="number" range={[100]}/>
                                        <Tooltip/>
                                        <Scatter name="yrs" data={npv_graph_data} fill="#8884d8" line shape="dots"/>
                                        <Scatter name="yrs" data={mc_npv_graph_data} fill="#38761d" line shape="dots"/>
                                    </ScatterChart>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Report