// -- file: src/components/Settings/settings-modal.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal } from 'react-bootstrap';

import CategorySettings from './category-settings.jsx';
import StatusSettings from './status-settings.jsx';
import { fetchAllCategories } from '../../slices/category-slice.js';
import { fetchAllStatuses } from '../../slices/status-slice.js';

import './settings.css';

// --- --- --- --- --- // --- --- --- --- --- //

// The tabs at the top of Settings
const TABS = [
    { key: 'categories', label: 'Categories', icon: 'fa-folder' },
    { key: 'statuses', label: 'Statuses', icon: 'fa-circle-half-stroke' },
];

// Settings: manage categories and statuses, one tab each. (The view is picked below the status filter.)
const SettingsModal = ({ show, handleClose }) => {
    const dispatch = useDispatch();
    const [tab, setTab] = useState('categories'); // stays on the last tab between opens

    // Refresh item counts each time settings opens
    useEffect(() => {
        if (!show) return;
        dispatch(fetchAllCategories());
        dispatch(fetchAllStatuses());
    }, [dispatch, show]);

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered scrollable dialogClassName="settings-modal">
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>

            <div className="settings-tabs" role="tablist" aria-label="Settings sections">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        id={`settings-tab-${t.key}`}
                        aria-selected={tab === t.key}
                        aria-controls="settings-tab-panel"
                        className={`settings-tab ${tab === t.key ? 'is-active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        <i className={`fa-solid ${t.icon} me-2`}></i>{t.label}
                    </button>
                ))}
            </div>

            <Modal.Body id="settings-tab-panel" role="tabpanel" aria-labelledby={`settings-tab-${tab}`}>
                {tab === 'categories' ? <CategorySettings /> : <StatusSettings />}
            </Modal.Body>
        </Modal>
    );
};

export default SettingsModal;
