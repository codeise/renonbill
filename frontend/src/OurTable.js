import React, {useEffect} from "react"
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import AsyncSelect from "react-select/async";
import {arrayItemUpdateAction} from "./actions";
import TextInputControl from "./TextInputControl";
import {setCaretPosition} from "./commonFunctions";

const OurTable = ({columns, data, loadOptions, onSelectInputChange, onTextboxInputChange}) => {
    useEffect(() => {
        let investmentValuesRow = document.querySelector('.investmentValuesRow')
        let rowWidth = 0
        if (investmentValuesRow) {
            rowWidth = investmentValuesRow.offsetWidth;
        }
        if (rowWidth !== 0) {
            document.querySelector('.investmentValuesHeaderRow').style.minWidth = rowWidth + "px";
        }
    })
    return (
        <div className="mb-5 mt-5 scroll-group container">
            <Row className="border rounded-top pt-1 pb-1 investmentValuesHeaderRow"
                 style={{backgroundColor: '#e6ebff', fontSize: "0.85em", fontWeight: "500"}}>
                {columns.map((item, id) => {
                        if (id === 0) {
                            return <Col>
                                <div style={{minWidth: "110px", maxWidth: "110px"}}>{item.name}</div>
                            </Col>
                        }
                        return <Col>
                            <div style={{minWidth: "70px"}}>{item.name}</div>
                        </Col>
                    }
                )}
            </Row>
            {data.map(item => {
                return <Row className="border pt-2 pb-2 investmentValuesRow"
                            style={{backgroundColor: '#ffffff'}}>
                    {columns.map((column, index) => {
                        if (index === 0) {
                            return <Col>
                                <div style={{minWidth: "110px", maxWidth: "110px"}}>
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={loadOptions}
                                        components={{LoadingIndicator: null}}
                                        key={index}
                                        value={item[column.selector]}
                                        onInputChange={(value, action) => onSelectInputChange(item.id, column.selector, value)}
                                        menuPlacement={"top"}
                                    />
                                </div>

                            </Col>
                        }
                        return <Col>
                            <div style={{minWidth: "70px"}}>
                                <TextInputControl value={item[column.selector]} min={0} is_integer_input={false}
                                                  onValChange={(v, elem_id) => onTextboxInputChange(item.id, column.selector, v)}
                                />
                            </div>
                        </Col>
                    })}

                </Row>
            })}

        </div>
    )
}

export default OurTable