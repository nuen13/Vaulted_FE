// components/Filters/ViewSwitcher/view-switcher.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectView, setView } from '../../../slices/settings-slice';

import '../filter-components.css';


const VIEW_OPTIONS = [
    { id: 'folder', icon: 'fa-folder-open', label: 'Folder' },
    { id: 'table', icon: 'fa-table-list', label: 'Table' },
    { id: 'grid', icon: 'fa-table-cells-large', label: 'Grid' },
];

// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
// View options as one three-part toggle under the status list
const ViewSwitcher = () => {
    const dispatch = useDispatch();
    const view = useSelector(selectView);

    return (
        <div className="view-switcher">
            <span className="filter-heading" id="view-switcher-label">View</span>
            <div className="view-switcher-toggle" role="radiogroup" aria-labelledby="view-switcher-label">
                {VIEW_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={view === option.id}
                        className={`view-switcher-option ${view === option.id ? 'is-active' : ''}`}
                        onClick={() => dispatch(setView(option.id))}
                    >
                        <i className={`fa-solid ${option.icon}`} aria-hidden="true"></i>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ViewSwitcher;
