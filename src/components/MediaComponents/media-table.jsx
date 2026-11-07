// -- file: src/components/MediaComponents/media-table.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MediaFocusCard from './media-focus-card.jsx';
import { selectMediaFocus } from '../../slices/media-slice.js';
import { selectAllCategories, DEFAULT_CATEGORY_COLOR } from '../../slices/category-slice.js';

import './media-table.css';

// --- --- --- --- --- // --- --- --- --- --- //

const COLUMNS = [
    { key: 'mediaTitle', label: 'Title' },
    { key: 'categoryName', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'averageRating', label: 'Rating', numeric: true },
    { key: 'dateUpdated', label: 'Updated', date: true },
];

const compare = (a, b, column) => {
    const x = a[column.key], y = b[column.key];
    if (x == null && y == null) return 0;
    if (x == null) return 1; // empty values last
    if (y == null) return -1;
    if (column.numeric) return Number(x) - Number(y);
    if (column.date) return new Date(x) - new Date(y);
    return String(x).localeCompare(String(y), undefined, { sensitivity: 'base' });
};

const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

// Small cover thumbnail with a fallback when the link doesn't load
const Thumb = ({ url, color }) => {
    const [broken, setBroken] = useState(false);
    if (!url || broken) return <span className="media-table-thumb is-empty" style={{ backgroundColor: color }} />;
    return <img className="media-table-thumb" src={url} alt="" loading="lazy" onError={() => setBroken(true)} />;
};

// Table view: one row per item, click a header to sort, click a row to open its details.
// selection (optional, used by the archive's bulk edit): { ids: Set, toggle(id), setAll(ids) }
// adds a checkbox column.
const MediaTable = ({ items, selection = null }) => {
    const dispatch = useDispatch();
    const categories = useSelector(selectAllCategories);
    const [sort, setSort] = useState({ key: null, direction: 'asc' }); // null = server order (recently updated)

    const colorOf = (categoryId) => categories.find(c => c.id === categoryId)?.color || DEFAULT_CATEGORY_COLOR;

    const column = COLUMNS.find(c => c.key === sort.key);
    const rows = column
        ? [...items].sort((a, b) => (sort.direction === 'asc' ? 1 : -1) * compare(a, b, column))
        : items;

    // Click: ascending → descending → back to default order
    const toggleSort = (key) => setSort(prev =>
        prev.key !== key ? { key, direction: 'asc' }
            : prev.direction === 'asc' ? { key, direction: 'desc' }
                : { key: null, direction: 'asc' });

    return (
        <>
            <div className="media-table-wrapper">
                <table className="table table-hover align-middle media-table mb-0">
                    <thead>
                        <tr>
                            {selection && (
                                <th scope="col" className="media-table-check-col">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={rows.length > 0 && rows.every(r => selection.ids.has(r.id))}
                                        ref={(el) => { if (el) el.indeterminate = selection.ids.size > 0 && selection.ids.size < rows.length; }}
                                        onChange={(e) => selection.setAll(e.target.checked ? rows.map(r => r.id) : [])}
                                        aria-label="Select all"
                                    />
                                </th>
                            )}
                            <th scope="col" className="media-table-thumb-col"><span className="visually-hidden">Cover</span></th>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={`col-${col.key} ${col.numeric ? 'text-end' : ''}`}
                                    aria-sort={sort.key === col.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    <button type="button" className="media-table-sort" onClick={() => toggleSort(col.key)}>
                                        {col.label}
                                        <i className={`fa-solid ${sort.key !== col.key ? 'fa-sort' : sort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(item => (
                            <tr
                                key={item.id}
                                className={selection?.ids.has(item.id) ? 'is-selected' : ''}
                                tabIndex={0}
                                onClick={() => dispatch(selectMediaFocus(item.id))}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dispatch(selectMediaFocus(item.id)); } }}
                            >
                                {selection && (
                                    // The checkbox selects; the rest of the row still opens the item
                                    <td className="media-table-check-col" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selection.ids.has(item.id)}
                                            onChange={() => selection.toggle(item.id)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            aria-label={`Select ${item.mediaTitle}`}
                                        />
                                    </td>
                                )}
                                <td><Thumb url={item.coverPhotoUrl} color={colorOf(item.categoryId)} /></td>
                                <td className="media-table-title">{item.mediaTitle}</td>
                                <td>
                                    <span className="media-table-category">
                                        <span className="media-table-dot" style={{ backgroundColor: colorOf(item.categoryId) }} />
                                        {item.categoryName}
                                    </span>
                                </td>
                                <td className="col-status">{item.status}</td>
                                <td className="col-averageRating text-end">{item.averageRating != null ? Number(item.averageRating).toFixed(1) : '—'}</td>
                                <td className="col-dateUpdated text-nowrap">{formatDate(item.dateUpdated)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Open item: same details as the folder view, shown over the table */}
            <MediaFocusCard items={items} />
        </>
    );
};

export default MediaTable;
