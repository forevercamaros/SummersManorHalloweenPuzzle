import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { SpookyModal, SpookyButton, DangerButton, WarningButton, SuccessButton } from '../styles/SpookyModalStyles';
import { SettingsItem, StoredDataText } from '../common/StyledComponents';

export default function DataManagementSection({ onAlert }) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showClearGroupsModal, setShowClearGroupsModal] = useState(false);
    const [groupCount, setGroupCount] = useState(0);
    const [isLoadingGroupCount, setIsLoadingGroupCount] = useState(true);

    const fetchGroupCount = async () => {
        try {
            setIsLoadingGroupCount(true);
            const response = await fetch('/GetGroupCount');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setGroupCount(data.count);
            } else {
                console.error('Failed to get group count:', data.error);
                setGroupCount(0);
            }
        } catch (error) {
            console.error('Error fetching group count:', error);
            setGroupCount(0);
        } finally {
            setIsLoadingGroupCount(false);
        }
    };

    const getLocalStorageInfo = () => {
        const keys = Object.keys(localStorage);
        return {
            count: keys.length,
            keys: keys,
            size: JSON.stringify(localStorage).length
        };
    };

    const confirmResetLocalStorage = async () => {
        try {
            const currentGroupName = localStorage.getItem('groupName');
            
            localStorage.clear();
            sessionStorage.clear();
            
            if (currentGroupName) {
                try {
                    const response = await fetch(`/DeleteGroup?groupName=${encodeURIComponent(currentGroupName)}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            console.log('Group deleted from database:', result.message);
                            await fetchGroupCount();
                        } else {
                            console.warn('Failed to delete group from database:', result.error);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting group from database:', error);
                }
            }
            
            setShowConfirmModal(false);
            onAlert('success', 'All local storage data has been cleared successfully!');
            
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error('Error clearing local storage:', error);
            onAlert('danger', 'Failed to clear local storage data.');
            setShowConfirmModal(false);
        }
    };

    const confirmClearAllGroups = async () => {
        try {
            const response = await fetch('/ClearAllGroups', {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                onAlert('success', result.message);
                await fetchGroupCount();
            } else {
                onAlert('danger', `Failed to clear groups: ${result.error}`);
            }
        } catch (error) {
            console.error('Error clearing all groups:', error);
            onAlert('danger', 'Failed to clear groups from database.');
        } finally {
            setShowClearGroupsModal(false);
        }
    };

    useEffect(() => {
        fetchGroupCount();
    }, []);

    const storageInfo = getLocalStorageInfo();

    return (
        <>
            <SettingsItem>
                <h5>Edit Riddle Data</h5>
                <p>Manage and modify the riddles used in the Halloween puzzle game.</p>
                <Link to="/editriddledata" style={{ textDecoration: 'none' }}>
                    <WarningButton size="lg">
                        Edit Riddle Data
                    </WarningButton>
                </Link>
            </SettingsItem>

            <SettingsItem>
                <h5>Reset Group Data</h5>
                <p>
                    Clear all game progress, settings, and cached data from your browser. 
                    This will also remove your group from the database.
                </p>
                <p className="text-warning">
                    <strong>Current Storage:</strong> {storageInfo.count} items 
                    ({Math.round(storageInfo.size / 1024)} KB)
                </p>
                {storageInfo.count > 0 && (
                    <div className="mb-3">
                        <StoredDataText>
                            Stored data: {storageInfo.keys.join(', ')}
                        </StoredDataText>
                    </div>
                )}
                <DangerButton 
                    size="lg" 
                    onClick={() => setShowConfirmModal(true)}
                    disabled={storageInfo.count === 0}
                >
                    Reset All Data
                </DangerButton>
            </SettingsItem>

            <SettingsItem>
                <h5>Clear All Groups from Database</h5>
                <p>
                    Remove all group records from the MongoDB database. This will clear all 
                    game results and group data permanently.
                </p>
                <p className="text-info">
                    <strong>Groups in Database:</strong> {isLoadingGroupCount ? 'Loading...' : `${groupCount} groups`}
                </p>
                <div className="mb-3">
                    <SpookyButton 
                        variant="info" 
                        size="sm" 
                        onClick={fetchGroupCount}
                        disabled={isLoadingGroupCount}
                    >
                        {isLoadingGroupCount ? 'Refreshing...' : 'Refresh Count'}
                    </SpookyButton>
                </div>
                <DangerButton 
                    size="lg" 
                    onClick={() => setShowClearGroupsModal(true)}
                    disabled={groupCount === 0 || isLoadingGroupCount}
                >
                    Clear All Groups
                </DangerButton>
            </SettingsItem>

            {/* Confirmation Modals */}
            <SpookyModal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>WARNING: Confirm Data Reset</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to reset all game data?</p>
                    <p style={{ color: '#ffc107', fontWeight: 'bold' }}>
                        <strong>This dark ritual will:</strong>
                    </p>
                    <ul style={{ color: '#ffc107' }}>
                        <li>Clear your current game progress</li>
                        <li>Reset your group name and timer</li>
                        <li>Remove all saved riddle states</li>
                        <li>Clear all cached game data</li>
                        <li><strong>Delete your group from the database</strong></li>
                    </ul>
                    <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
                        <strong>This action cannot be undone! The spirits will not forgive!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </SpookyButton>
                    <DangerButton onClick={confirmResetLocalStorage}>
                        Yes, Reset All Data
                    </DangerButton>
                </Modal.Footer>
            </SpookyModal>

            <SpookyModal show={showClearGroupsModal} onHide={() => setShowClearGroupsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>DANGER: Clear All Groups</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to clear ALL groups from the database?</p>
                    <p style={{ color: '#ffc107', fontWeight: 'bold' }}>
                        <strong>This apocalyptic action will:</strong>
                    </p>
                    <ul style={{ color: '#ffc107' }}>
                        <li>Delete all {groupCount} groups from the database</li>
                        <li>Remove all game results and leaderboards</li>
                        <li>Clear all group progress permanently</li>
                        <li>Reset the entire competition data</li>
                    </ul>
                    <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
                        <strong>This action cannot be undone and affects all users! The manor will forget all who entered!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setShowClearGroupsModal(false)}>
                        Cancel
                    </SpookyButton>
                    <DangerButton onClick={confirmClearAllGroups}>
                        Yes, Clear All Groups
                    </DangerButton>
                </Modal.Footer>
            </SpookyModal>
        </>
    );
}