import React, {useEffect} from "react"
import Row from "react-bootstrap/Row";
import {Col} from "react-bootstrap";
import {isOverflown} from "./commonFunctions";

const CustomDataTable = ({columns, data, conditionalRowStyles = []}) => {
    function fixTableWidth() {
        let tableScrollPart = document.querySelector('.scroll-group')
        let overflown = isOverflown(tableScrollPart);
        let rows = document.getElementById('table').getElementsByClassName('row');
        Object.keys(rows).forEach((r) => {
            if (overflown) rows[r].classList.add("rowFloatLeft")
            else rows[r].classList.remove("rowFloatLeft")
        })
    }

    const observer = new MutationObserver((mutationList, observer) => {
        fixTableWidth()
    })

    useEffect(() => {
        observer.observe(document.querySelector('.scroll-group'), {childList: true, subtree: true})
        return () => observer.disconnect()
    }, [])

    return (
        <div className="mt-1 scroll-group container sliderTable" id="table" style={{display: "block"}}
             onScroll={() => fixTableWidth()}>
            <Row className="border rounded-top pt-1 pb-1 investmentValuesHeaderRow"
                 style={{backgroundColor: '#e6ebff', fontSize: "0.85em", fontWeight: "500"}}>
                {columns.map((item, index) => <Col key={index}>
                    <div style={item.style}>{item.name}</div>
                </Col>)}
            </Row>
            {data.map(item => {
                let applied_style = {backgroundColor: '#ffffff'}
                conditionalRowStyles.forEach(r => {
                    if(r.when(item)) applied_style = r.style;
                })
                return <Row className="border pt-2 pb-2 investmentValuesRow" key={item.id}
                     id={"inv" + item.id}
                     style={applied_style}>
                    {columns.map((column, index) => <Col key={index}>{item[column.selector]}</Col>)}
                </Row>
            })}
        </div>
    )
}


export default CustomDataTable