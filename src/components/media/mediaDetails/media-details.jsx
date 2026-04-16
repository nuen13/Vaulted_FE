// src/components/media/mediaDetails/media-details.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import { updateMediaStatusById } from '../../../slices/media-slice.js';
import ReviewItem from './review/review-preview-item.jsx';

import MediaDetailsWindow from './media-details-window.jsx';


import './media-details.css';

// --- --- --- --- --- // --- --- --- --- --- //

const MediaDetails = ({ item, onUpdateStatus }) => {
    useEffect(() => {
        if (item?.status) {
            setSelectedStatus(item.status);
        }
    }, [item?.status]);
    const dispatch = useDispatch();


    const statusOptions = ['Planning', 'Completed', 'Consuming', 'Paused', 'Dropped'];

    // const items = useSelector(selectMediaItems);

    // const handleStatusChange = (e) => {
    //     const newStatus = e.target.value;
    //     dispatch(updateMediaStatusById({ mediaId: item.id, newStatus }));
    // };

    // const currentStatus = item?.status || 'Planning';
    // const [selectedStatus, setSelectedStatus] = useState(currentStatus);


    const [selectedStatus, setSelectedStatus] = useState(item?.status || 'Planning');

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        console.log('Selected Status:', newStatus);
        dispatch(updateMediaStatusById({ mediaId: item.id, newStatus }));
    };



    return (
        <div 
            className="media-details-container d-flex flex-row justify-content-between align-items-start gap-4 p-4"
            onClick={(e) => e.stopPropagation()}    
        >

            {/* start top */}
            <div className="media-details d-flex flex-column justify-content-start 
                align-items-start gap-3">
            
                <MediaDetailsWindow item={item} /> 

            </div>
            <div className="right-container gap-3">

                {/* <div className="status-container">
                    Status:
                    <select className="status-dropdown" value={selectedStatus} onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedStatus(newStatus);
                        handleStatusChange(e);
                    }}>
                        
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div> */}

                <div className="status-container">
                    <b>Status:</b>

                    <select className="status-dropdown" value={selectedStatus} onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedStatus(newStatus);
                        handleStatusChange(e);
                        onUpdateStatus(newStatus);
                    }}>

                        {statusOptions.map((status) => (
                            <option key={status} value={status} >
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="cover-photo-container">
                    <img src={item?.coverPhotoUrl} alt={`${item?.mediaTitle} cover`} className="cover-image " />
                </div>

                <div className = "add-more-photo-btn d-flex justify-content-center">
                    <button className="btn btn-outline-dark border-0 align-self-start self-align-center mx-auto mt-3 text-white">
                        <i className="fa-solid fa-plus"></i> Add More Photos
                    </button>
                </div>
            </div>
        </div>
    );

};

export default MediaDetails;