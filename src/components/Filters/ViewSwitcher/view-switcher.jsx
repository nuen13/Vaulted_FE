// components/Filters/ViewSwitcher/view-switcher.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectView, setView } from '../../../slices/settings-slice';

import '../filter-components.css';


const VIEW_OPTIONS = [
    { id: 'folder', icon: 'fa-folder-open', label: 'Folder' },
    { id: 'table', icon: 'fa-table-list', label: 'Table' },
    { id: 'grid', icon: 'fa-table-cells-large', label: 'Grid' },
    //{ id: 'drawer', icon: 'fa-box-archive', label: 'Drawer' },
];

// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
// View options, styled like the status filter above it
const ViewSwitcher = () => {
    const dispatch = useDispatch();
    const view = useSelector(selectView);

    return (
        <div className="view-switcher d-flex flex-column p-2" role="radiogroup" aria-label="Media view">
            <span className="view-switcher-label">View</span>
            {VIEW_OPTIONS.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={view === option.id}
                    className={`btn m-1 ${view === option.id ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start text-nowrap`}
                    onClick={() => dispatch(setView(option.id))}
                >
                    <i className={`fa-solid ${option.icon} me-2`}></i>{option.label}
                </button>
            ))}
        </div>
    );
};

export default ViewSwitcher;
