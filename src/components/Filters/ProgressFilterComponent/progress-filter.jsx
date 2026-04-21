// components/Filters/ProgressFilterComponent/progress-filter.jsx
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setStatus, fetchMediaByCategoryAndStatus } from '../../../slices/media-slice';

import '../filter-components.css';


// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----// 
const ProgressFilter = () => {
    const dispatch = useDispatch();
    const statusOptions = ['Paused', 'Dropped', 'Planning', 'Completed', 'Consuming',];

    // Get BOTH current values from Redux
    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);

    const handleStatusClick = (status) => {
        dispatch(setStatus(status));
        dispatch(fetchMediaByCategoryAndStatus({
            categoryId: selectedCategory,
            status: status
        }));
    };

    // ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----// 
    return (
        <div className="d-flex flex-column align-items-end p-2">
            <button
                className={`btn m-1 ${selectedStatus === null ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start`}
                onClick={() => handleStatusClick(null)}
            >
                All
            </button>
            {statusOptions.map((status) => (
                <button
                    key={status}
                    className={`btn m-1 ${selectedStatus === status ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start`}
                    onClick={() => handleStatusClick(status)}
                >
                    {status}
                </button>
            ))}
        </div>
    );
};

export default ProgressFilter;