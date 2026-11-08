// -- file: src/components/MediaComponents/archive-bulk-edit.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MediaTable from './media-table.jsx';
import { bulkUpdateMedia } from '../../slices/media-slice.js';
import { selectAllCategories } from '../../slices/category-slice.js';
import { selectAllStatuses } from '../../slices/status-slice.js';

import './archive-bulk-edit.css';

// --- --- --- --- --- // --- --- --- --- --- //

// The archive, as a table with checkboxes. Tick items, then change them all at once:
// unarchive, set a status, move to a category, or delete.
// After a change the list reloads and the ticks are cleared.
const ArchiveBulkEdit = ({ items }) => {
    const dispatch = useDispatch();
    const statuses = useSelector(selectAllStatuses);
    const categories = useSelector(selectAllCategories);

    const [selected, setSelected] = useState(() => new Set());
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const selection = {
        ids: selected,
        toggle: (id) => setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        }),
        setAll: (ids) => setSelected(new Set(ids)),
    };

    const count = selected.size;

    const apply = async (changes) => {
        if (count === 0) return;
        setBusy(true);
        setError('');
        try {
            const result = await dispatch(bulkUpdateMedia({ ids: [...selected], changes })).unwrap();
            setSelected(new Set());
            setConfirmingDelete(false);
            // Archive/unarchive and delete only touch items you added
            if (result?.skippedCount > 0) {
                setError(`${result.skippedCount} ${result.skippedCount === 1 ? 'item was' : 'items were'} skipped: only the person who added an item can archive or delete it.`);
            }
        } catch (err) {
            setError(err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div className={`archive-bulk-toolbar ${count > 0 ? 'has-selection' : ''}`} role="toolbar" aria-label="Bulk edit">
                <span className="archive-bulk-count">
                    {count > 0 ? `${count} selected` : 'Tick items to edit them together'}
                </span>

                {count > 0 && !confirmingDelete && (
                    <div className="archive-bulk-actions">
                        <button type="button" className="btn btn-sm btn-light" disabled={busy} onClick={() => apply({ archived: false })}>
                            <i className="fa-solid fa-box-open me-1"></i>Unarchive
                        </button>

                        {/* Picking an option applies it straight away; the select then shows its label again */}
                        <select
                            className="form-select form-select-sm"
                            value=""
                            disabled={busy}
                            onChange={(e) => e.target.value && apply({ status: e.target.value })}
                            aria-label="Set status"
                        >
                            <option value="">Set status…</option>
                            {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>

                        <select
                            className="form-select form-select-sm"
                            value=""
                            disabled={busy}
                            onChange={(e) => e.target.value && apply({ categoryId: Number(e.target.value) })}
                            aria-label="Move to category"
                        >
                            <option value="">Move to category…</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => setConfirmingDelete(true)}>
                            <i className="fa-solid fa-trash me-1"></i>Delete
                        </button>

                        <button type="button" className="btn btn-sm btn-link text-reset" disabled={busy} onClick={() => selection.setAll([])}>
                            Clear
                        </button>
                    </div>
                )}

                {count > 0 && confirmingDelete && (
                    <div className="archive-bulk-actions">
                        <span>Delete {count} {count === 1 ? 'item' : 'items'}? They'll be removed from the vault.</span>
                        <button type="button" className="btn btn-sm btn-danger" disabled={busy} onClick={() => apply({ deleted: true })}>
                            Delete
                        </button>
                        <button type="button" className="btn btn-sm btn-light" disabled={busy} onClick={() => setConfirmingDelete(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {error && <p className="archive-bulk-error" role="alert">{error}</p>}

            <MediaTable items={items} selection={selection} />
        </>
    );
};

export default ArchiveBulkEdit;
