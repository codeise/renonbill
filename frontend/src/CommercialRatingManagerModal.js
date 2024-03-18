import React from "react";
import {Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import DataTable from "react-data-table-component";
import Card from "react-bootstrap/Card";

function CommercialRatingManagerModal(props) {
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
            name: '',
            selector: 'none',
            minWidth: "80px",
            maxWidth: "80px"
        },
        {
            name: 'Churn',
            selector: 'churn',
        },
        {
            name: 'Default',
            selector: 'default',
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
            year: '1991-2005',
            none: '115.',
            churn: '0.',
            default: '0.'
        },
        {
            n: 2,
            ndw: '5.',
            nflo: '8.',
            country: 'Italy',
            city: 'Torino',
            buildType: 'multistorey',
            year: '>2005',
            none: '90.',
            churn: '11.',
            default: '8.'
        },
        {
            n: 3,
            ndw: '6.',
            nflo: '1.',
            country: 'Italy',
            city: 'Milano',
            buildType: 'detached house',
            year: '1946-1960',
            none: '125.',
            churn: '0.',
            default: '0.'
        }
    ]
    return (
        <Modal show={true} animation={false} size="lg" onHide={props.handleClose} dialogClassName="modal-80w">
            <Modal.Header closeButton className="rb-modal-header">
                <Modal.Title className="rb-modal-header-title">Commercial Rating</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card style={{height: "max-content"}} className="mt-2">
                    <DataTable
                        data={commercialRatingData}
                        columns={commercialRatingColumns}
                        customStyles={props.styles}
                        noHeader={true}
                        conditionalRowStyles={props.conditionalRowStyles}

                    />
                </Card>
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

export default CommercialRatingManagerModal