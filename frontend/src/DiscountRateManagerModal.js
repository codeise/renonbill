import React from "react";
import {Col, Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import DataTable from "react-data-table-component";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function DiscountRateManagerModal(props) {

    let commercialRatingColumns = [
        {
            name: 'n',
            selector: 'n',
            minWidth: "80px",
            maxWidth: "80px"
        },
        {
            name: 'n dw',
            selector: 'ndw',
        },
        {
            name: 'n flo',
            selector: 'nflo',
        },
        {
            name: 'country',
            selector: 'country',
        },
        {
            name: 'city',
            selector: 'city',
        },
        {
            name: 'Build. Type',
            selector: 'buildType',
            minWidth: "130px",
            maxWidth: "130px"
        },
        {
            name: 'Year',
            selector: 'year',
        },
        {
            name: 'Floor Area',
            selector: 'floorArea',
        },
        {
            name: 'Discount Rate',
            selector: 'discountRate',
            minWidth: "130px",
            maxWidth: "130px"
        },
    ];
    const commercialRatingData = [
        {
            n: 1,
            ndw: '2.',
            nflo: '1.',
            country: 'Italy',
            city: 'Roma',
            buildType: 'apartment',
            year: '1976-1990',
            floorArea: '100.',
            discountRate: '0.09'

        },
        {
            n: 2,
            ndw: '5.',
            nflo: '8.',
            country: 'Italy',
            city: 'Torino',
            buildType: 'multistorey',
            year: '1991-2005',
            floorArea: '100.',
            discountRate: '0.07'

        },
    ]
    return (
        <Modal show={true} animation={false} size="lg" onHide={props.handleClose} dialogClassName="modal-80w">
            <Modal.Header closeButton className="rb-modal-header">
                <Modal.Title className="rb-modal-header-title">Discount Rate</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card style={{height: "max-content"}} className="mt-2">
                    <DataTable
                        data={commercialRatingData}
                        columns={commercialRatingColumns}
                        customStyles={props.styles}
                        noHeader={true}
                        conditionalRowStyles={props.conditionalRowStyles}
                        selectableRows
                        selectableRowsNoSelectAll
                        selectableRowsHighlight
                        selectableRowsSingle
                        onSelectedRowsChange={() => {
                        }}
                    />
                </Card>
                <Row className="mt-3">
                    <Col sm="12">
                        <div className="form-group d-flex mt-2">
                            <Form.Label className="mr-2">Discount Rate</Form.Label>
                            <div className="medium-input">
                                <Form.Control type="number" size="sm" min={0} value="0.08"/>
                            </div>

                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <div className="float-right mt-2">
                    <Button className="rb-button rb-purple-button mr-2"
                    >Save</Button>
                    <Button className="rb-button rb-red-button"
                    >Exit</Button>
                </div>
            </Modal.Footer>
        </Modal>
    );

}

export default DiscountRateManagerModal