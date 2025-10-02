import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ResultsTable from '../ResultsTable';
import { StyledModal } from '../styles/HomeStyles';

export default function ResultsModal({ show, onHide, groupResults, groupName }) {
    const resultsColumns = [{
        dataField: 'position',
        text: 'Position'
    }, {
        dataField: 'groupName',
        text: 'Group Name'
    }, {
        dataField: 'formattedRemainingTime',
        text: 'Time Remaining'
    }];

    return (
        <StyledModal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ResultsTable
                    data={groupResults}
                    columns={resultsColumns}
                    groupName={groupName}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </StyledModal>
    );
}