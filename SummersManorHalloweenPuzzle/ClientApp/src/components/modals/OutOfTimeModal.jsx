import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export default function OutOfTimeModal({ show, onHide }) {
    return (
        <Modal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Your Time Has Expired</Modal.Title>
            </Modal.Header>
            <Modal.Body>Press close to continue the challenge beyond your allotted time.</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}