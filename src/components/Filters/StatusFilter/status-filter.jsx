// components/Filters/StatusFilter/status-filter.jsx
import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setStatus, setShowArchived, selectShowArchived, fetchMediaByCategoryAndStatus } from '../../../slices/media-slice';
import { selectStatusCounts } from '../../../slices/filter-counts';

import { fetchAllStatuses, selectAllStatuses } from '../../../slices/status-slice';

import '../filter-components.css';


// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
// Status list: one row per status with how many items it holds (in the selected category)
const StatusFilter = () => {
    const dispatch = useDispatch();
    // Statuses come from the database (editable in Settings)
    const statuses = useSelector(selectAllStatuses);
    useEffect(() => {
        dispatch(fetchAllStatuses());
    }, [dispatch]);

    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);
    const showArchived = useSelector(selectShowArchived);
    const counts = useSelector(selectStatusCounts);

    const handleStatusClick = (status) => {
        dispatch(setStatus(status)); // also leaves the archive
        dispatch(fetchMediaByCategoryAndStatus({
            categoryId: selectedCategory,
            status: status,
            archived: false
        }));
    };

    // Archived: archived items in the selected category, across all statuses
    const handleArchivedClick = () => {
        dispatch(setShowArchived(true));
        dispatch(fetchMediaByCategoryAndStatus({
            categoryId: selectedCategory,
            status: null,
            archived: true
        }));
    };

    const isActive = (status) => !showArchived && selectedStatus === status;

    // ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
    return (
        <nav className="status-filter" aria-label="Status">
            <span className="filter-heading">Status</span>
            <button
                type="button"
                className={`filter-row ${isActive(null) ? 'is-active' : ''}`}
                aria-pressed={isActive(null)}
                onClick={() => handleStatusClick(null)}
            >
                <span className="filter-row-label">All</span>
                <span className="filter-row-count">{counts.total}</span>
            </button>
            {statuses.map(({ name: status }) => (
                <button
                    key={status}
                    type="button"
                    className={`filter-row ${isActive(status) ? 'is-active' : ''}`}
                    aria-pressed={isActive(status)}
                    onClick={() => handleStatusClick(status)}
                >
                    <span className="filter-row-label">{status}</span>
                    <span className="filter-row-count">{counts.byStatus.get(status) ?? 0}</span>
                </button>
            ))}

            <span className="filter-divider" aria-hidden="true" />

            <button
                type="button"
                className={`filter-row ${showArchived ? 'is-active' : ''}`}
                aria-pressed={showArchived}
                onClick={handleArchivedClick}
                title="Items you've archived"
            >
                <span className="filter-row-label"><i className="fa-solid fa-box-archive me-2" aria-hidden="true"></i>Archived</span>
                <span className="filter-row-count">{counts.archived}</span>
            </button>
        </nav>
    );
};

export default StatusFilter;
