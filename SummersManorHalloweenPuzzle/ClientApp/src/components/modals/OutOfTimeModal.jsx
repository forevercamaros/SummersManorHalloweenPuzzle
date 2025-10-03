import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { SpookyModal, SpookyButton } from '../styles/SpookyModalStyles';

export default function OutOfTimeModal({ show, onHide }) {
    return (
        <SpookyModal show={show} onHide={onHide} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Your Time Has Expired</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                The sands of time have run out, but your nightmare continues.
                Press close to continue the challenge beyond your allotted time,
                though beware - the spirits grow restless in the overtime hours...
            </Modal.Body>
            <Modal.Footer>
                <SpookyButton variant="secondary" onClick={onHide}>
                    Continue Into Darkness
                </SpookyButton>
            </Modal.Footer>
        </SpookyModal>
    );
}