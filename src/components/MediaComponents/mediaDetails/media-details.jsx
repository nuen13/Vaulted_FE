// -- file: src/components/MediaComponents/mediaDetails/media-details.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";

import { updateMediaStatusById, setMediaArchived } from '../../../slices/media-slice.js';
import { canManage } from '../../../auth/auth.js';
import { fetchPhotosByMediaId, openGallery, selectPhotosByMediaId } from '../../../slices/photo-slice.js';
import { openShare } from '../../../slices/share-slice.js';
import { selectAllStatuses } from '../../../slices/status-slice.js';

import DetailsOverview from './details-overview.jsx';


import './media-details.css';

// --- --- --- --- --- // --- --- --- --- --- //

const MediaDetails = ({ item, onUpdateStatus }) => {
    const dispatch = useDispatch();

    // -- Photos: cover first, then extra photos in their saved order -- //
    const photos = useSelector((state) => selectPhotosByMediaId(state, item?.id));
    const slides = [item?.coverPhotoUrl, ...photos.map(p => p.photoUrl)].filter(Boolean);
    const [photoIndex, setPhotoIndex] = useState(0);
    const currentSlide = slides.length ? photoIndex % slides.length : 0; // stays valid if photos are removed

    useEffect(() => {
        if (item?.id) dispatch(fetchPhotosByMediaId(item.id));
    }, [dispatch, item?.id]);

    // Click the photo to rotate to the next one, wrapping back to the cover
    const handleNextPhoto = () => {
        if (slides.length > 1) setPhotoIndex((currentSlide + 1) % slides.length);
    };


    // Statuses from the database (editable in Settings); keep the item's own one listed even if it's missing
    const statuses = useSelector(selectAllStatuses);

    // const items = useSelector(selectMediaItems);

    // const handleStatusChange = (e) => {
    //     const newStatus = e.target.value;
    //     dispatch(updateMediaStatusById({ mediaId: item.id, newStatus }));
    // };

    // const currentStatus = item?.status || 'Planning';
    // const [selectedStatus, setSelectedStatus] = useState(currentStatus);


    // Read straight from Redux: updateMediaStatusById updates item.status immediately (pending)
    const selectedStatus = item?.status || 'Planning';
    const statusOptions = statuses.map(s => s.name);
    if (!statusOptions.includes(selectedStatus)) statusOptions.unshift(selectedStatus);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
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

                <DetailsOverview item={item} />

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
                        handleStatusChange(e);
                        onUpdateStatus(e.target.value);
                    }}>

                        {statusOptions.map((status) => (
                            <option key={status} value={status} >
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div
                    className={`cover-photo-container ${slides.length > 1 ? 'is-rotatable' : ''}`}
                    onClick={handleNextPhoto}
                    title={slides.length > 1 ? 'Click for the next photo' : undefined}
                >
                    {slides.length > 0 ? (
                        // key re-mounts the image so the rotate-in animation plays on every change
                        <img
                            key={currentSlide}
                            src={slides[currentSlide]}
                            alt={`${item?.mediaTitle} photo ${currentSlide + 1}`}
                            className="cover-image photo-rotate-in"
                        />
                    ) : (
                        <div className="cover-placeholder">No photos yet</div>
                    )}

                    {slides.length > 1 && (
                        <>
                            <span className="photo-counter">{currentSlide + 1} / {slides.length}</span>
                            <div className="photo-dots">
                                {slides.map((_, i) => (
                                    <span key={i} className={`photo-dot ${i === currentSlide ? 'active' : ''}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="add-more-photo-btn d-flex justify-content-center flex-wrap gap-1 mt-3">
                    <button
                        className="btn btn-outline-dark border-0 text-white"
                        onClick={() => dispatch(openGallery({ mediaId: item.id, mode: 'view' }))}
                        title="Add, rearrange, remove photos or change the cover"
                    >
                        <i className="fa-solid fa-images"></i> Photos ({slides.length})
                    </button>
                    <button
                        className="btn btn-outline-dark border-0 text-white"
                        onClick={() => dispatch(openShare(item.id))}
                    >
                        <i className="fa-solid fa-share-nodes"></i> Share Card
                    </button>
                    <button
                        className="btn btn-outline-dark border-0 text-white"
                        onClick={() => dispatch(setMediaArchived({ mediaId: item.id, archived: !item.archived }))}
                        disabled={!canManage(item.createdByUserId)}
                        title={!canManage(item.createdByUserId)
                            ? 'Only the person who added this can archive it'
                            : item.archived ? 'Move back to your main lists' : 'Hide from your main lists (you can restore it from Archived)'}
                    >
                        <i className={`fa-solid ${item.archived ? 'fa-box-open' : 'fa-box-archive'}`}></i>
                        {item.archived ? ' Unarchive' : ' Archive'}
                    </button>
                </div>
            </div>
        </div>
    );

};

export default MediaDetails;