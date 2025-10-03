import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { SpookyModal, SpookyButton, VictoryImage } from '../styles/SpookyModalStyles';
import victoryImage from '../../images/haunted-house.jpg';

export default function GameCompletedModal({ show, onHide }) {
    return (
        <SpookyModal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Victory Achieved!</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <VictoryImage src={victoryImage} className="img-fluid mb-3" alt="Victory - You have escaped the manor" />
                <div>
                    Congratulations, brave soul! You have successfully navigated the twisted corridors
                    of Summers Manor and solved its dark mysteries. The spirits acknowledge your triumph,
                    but remember... some victories come with a price. You have succeeded, but will you
                    ever truly escape the manor's haunting embrace?
                </div>
            </Modal.Body>
            <Modal.Footer>
                <SpookyButton variant="secondary" onClick={onHide}>
                    Embrace Victory
                </SpookyButton>
            </Modal.Footer>
        </SpookyModal>
    );
}