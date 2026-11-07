// -- file: src/components/Settings/status-settings.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-bootstrap';

import { addStatus, updateStatus, deleteStatus, selectAllStatuses } from '../../slices/status-slice.js';

// --- --- --- --- --- // --- --- --- --- --- //
// Same layout and classes as category-settings.jsx, without the color.

// One status row: editable name, item count, delete
const StatusRow = ({ status, statuses, onError }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState(status.name);
    const [confirming, setConfirming] = useState(false);
    const [moveTo, setMoveTo] = useState('');
    const [busy, setBusy] = useState(false);

    const others = statuses.filter(s => s.id !== status.id);

    // -- Rename: saves on Enter or when the field loses focus; Esc reverts -- //
    const saveName = async () => {
        const trimmed = name.trim();
        if (trimmed === status.name) { setName(status.name); return; }
        try {
            await dispatch(updateStatus({ id: status.id, name: trimmed })).unwrap();
            onError('');
        } catch (err) {
            setName(status.name);
            onError(err);
        }
    };

    // -- Delete (moving items first when the status is in use) -- //
    const handleDelete = async () => {
        setBusy(true);
        try {
            await dispatch(deleteStatus({ id: status.id, reassignTo: moveTo || null })).unwrap();
            onError('');
        } catch (err) {
            onError(err);
            setBusy(false);
        }
    };

    return (
        <li className="category-row">
            <div className="category-row-main">
                <i className="fa-solid fa-circle-half-stroke status-row-icon" aria-hidden="true"></i>
                <input
                    type="text"
                    className="form-control form-control-sm category-name-input"
                    value={name}
                    maxLength={50}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                        if (e.key === 'Escape') { setName(status.name); e.stopPropagation(); }
                    }}
                    aria-label="Status name"
                />
                <span className="category-count" title="Media items with this status">
                    {status.mediaCount} {status.mediaCount === 1 ? 'item' : 'items'}
                </span>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger border-0"
                    onClick={() => setConfirming(true)}
                    disabled={confirming || others.length === 0}
                    title={others.length === 0 ? 'Keep at least one status' : 'Delete status'}
                    aria-label={`Delete ${status.name}`}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>

            {confirming && (
                <div className="category-delete-confirm">
                    {status.mediaCount > 0 ? (
                        <>
                            <span>Move its {status.mediaCount} {status.mediaCount === 1 ? 'item' : 'items'} to</span>
                            <select
                                className="form-select form-select-sm w-auto"
                                value={moveTo}
                                onChange={(e) => setMoveTo(e.target.value)}
                                aria-label="Move items to"
                            >
                                <option value="">Choose a status…</option>
                                {others.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                            <span>then delete?</span>
                        </>
                    ) : (
                        <span>Delete “{status.name}”?</span>
                    )}
                    <div className="d-flex gap-1 ms-auto">
                        <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={handleDelete}
                            disabled={busy || (status.mediaCount > 0 && !moveTo)}
                        >
                            Delete
                        </button>
                        <button type="button" className="btn btn-sm btn-light" onClick={() => { setConfirming(false); setMoveTo(''); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};


const StatusSettings = () => {
    const dispatch = useDispatch();
    const statuses = useSelector(selectAllStatuses);
    const [error, setError] = useState('');
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        try {
            await dispatch(addStatus({ name: newName.trim() })).unwrap();
            setNewName('');
            setError('');
        } catch (err) {
            setError(err);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="category-settings">
            <p className="settings-hint">
                The statuses in the filter and the status dropdown. Renaming one renames it on every item.
            </p>

            {error && <Alert variant="danger" className="py-2" onClose={() => setError('')} dismissible>{error}</Alert>}

            <ul className="category-list">
                {statuses.map(status => (
                    // Name in the key: the row restarts from the saved name after a rename
                    <StatusRow key={`${status.id}:${status.name}`} status={status} statuses={statuses} onError={setError} />
                ))}
            </ul>

            {/* -- Add -- */}
            <form className="category-row-main category-add" onSubmit={handleAdd}>
                <i className="fa-solid fa-plus status-row-icon" aria-hidden="true"></i>
                <input
                    type="text"
                    className="form-control form-control-sm category-name-input"
                    placeholder="New status name"
                    value={newName}
                    maxLength={50}
                    onChange={(e) => setNewName(e.target.value)}
                    aria-label="New status name"
                />
                <button type="submit" className="btn btn-sm btn-dark text-nowrap" disabled={adding || !newName.trim()}>
                    <i className="fa-solid fa-plus"></i> Add
                </button>
            </form>
        </div>
    );
};

export default StatusSettings;
