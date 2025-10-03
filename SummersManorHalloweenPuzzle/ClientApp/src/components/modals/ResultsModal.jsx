import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { SpookyModal, SpookyButton } from '../styles/SpookyModalStyles';
import ResultsTable from '../ResultsTable';

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
        <SpookyModal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Leaderboard of Souls</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: '#ff6b1a' }}>
                    Behold the brave souls who have dared to challenge the manor's mysteries. 
                    See where you stand among the living... and the lost.
                </p>
                <ResultsTable
                    data={groupResults}
                    columns={resultsColumns}
                    groupName={groupName}
                />
            </Modal.Body>
            <Modal.Footer>
                <SpookyButton variant="secondary" onClick={onHide}>
                    Return to Shadows
                </SpookyButton>
            </Modal.Footer>
        </SpookyModal>
    );
}