import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { SpookyModal, SpookyButton, VictoryImage } from '../styles/SpookyModalStyles';
import victoryImage from '../../images/haunted-house.jpg';

export default function GameCompletedModal({ show, onHide }) {
    return (
        <SpookyModal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <VictoryImage src={victoryImage} className="img-fluid" alt="Victory - You have escaped the manor" />
            </Modal.Header>
            <Modal.Body>
                Congratulations, brave soul! You have successfully navigated the twisted corridors
                of Summers Manor and solved its dark mysteries. The spirits acknowledge your triumph,
                but remember... some victories come with a price. You have succeeded, but will you
                ever truly escape the manor's haunting embrace?
            </Modal.Body>
            <Modal.Footer>
                <SpookyButton variant="secondary" onClick={onHide}>
                    Embrace Victory
                </SpookyButton>
            </Modal.Footer>
        </SpookyModal>
    );
}