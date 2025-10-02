import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import victoryImage from '../../images/haunted-house.jpg';

export default function GameCompletedModal({ show, onHide }) {
    return (
        <Modal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <img src={victoryImage} className="img-fluid" />
            </Modal.Header>
            <Modal.Body>You Have Succeeded.</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}