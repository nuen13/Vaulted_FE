// components/Filters/StatusFilter/status-filter.jsx
import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setStatus, setShowArchived, selectShowArchived, fetchMediaByCategoryAndStatus } from '../../../slices/media-slice';

import { fetchAllStatuses, selectAllStatuses } from '../../../slices/status-slice';

import '../filter-components.css';


// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
const StatusFilter = () => {
    const dispatch = useDispatch();
    // Statuses come from the database (editable in Settings)
    const statuses = useSelector(selectAllStatuses);
    useEffect(() => {
        dispatch(fetchAllStatuses());
    }, [dispatch]);

    // Get BOTH current values from Redux
    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);
    const showArchived = useSelector(selectShowArchived);

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
        <div className="status-filter d-flex flex-column align-items-end p-2">
            <button
                className={`btn m-1 ${isActive(null) ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start`}
                onClick={() => handleStatusClick(null)}
            >
                All
            </button>
            {statuses.map(({ name: status }) => (
                <button
                    key={status}
                    className={`btn m-1 ${isActive(status) ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start`}
                    onClick={() => handleStatusClick(status)}
                >
                    {status}
                </button>
            ))}

            <span className="filter-divider" aria-hidden="true" />

            <button
                className={`btn m-1 ${showArchived ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start text-nowrap`}
                onClick={handleArchivedClick}
                title="Items you've archived"
            >
                <i className="fa-solid fa-box-archive me-2"></i>Archived
            </button>
        </div>
    );
};

export default StatusFilter;
