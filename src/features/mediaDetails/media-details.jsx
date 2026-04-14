import React, { useState, useEffect } from 'react';
import './media-details.css';
import ReviewItem from './review-item';
import { useSelector, useDispatch } from "react-redux";
import { updateMediaStatusById } from '../media/media-slice.js';
import { selectMediaItems } from '../media/media-slice.js';



const MediaDetails = ({ item, onUpdateStatus }) => {
    useEffect(() => {
        if (item?.status) {
            setSelectedStatus(item.status);
        }
    }, [item?.status]); // Runs whenever the status in Redux changes
    const dispatch = useDispatch();



    // // Drop box for Status
    // // with 



    // // -- Status Change Logic -- // 
    // // Planning, Complete, Watching, Paused, Dropped
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

        // 1. Update UI immediately (Optimistic UI)
        setSelectedStatus(newStatus);
        console.log('Selected Status:', newStatus); // Debugging log

        // 2. Tell Redux to update the Database
        dispatch(updateMediaStatusById({ mediaId: item.id, newStatus }));
    };


    const percentage = (item?.averageScore / 10) * 100;
    const lineStyle = {
        background: `linear-gradient(to right, #000 ${percentage}%, #fff ${percentage}%)`
    };

    const dotStyle = {
        left: `${percentage}%`
    };




    return (
        <div className="media-details-container d-flex flex-row justify-content-between align-items-start gap-4 p-4">

            {/* start top */}
            <div className="media-details d-flex flex-column justify-content-start 
                align-items-start gap-3">

                {/* Media Title */}
                <div className="file-title">
                    {item?.mediaTitle}
                </div>


                {/* Score */}
                <div className="score-container">
                    Score: {item?.averageScore}
                    <div className="progress-line-wrapper">
                        <div className="progress-line" style={lineStyle}></div>
                        <div className="progress-dot" style={dotStyle}></div>
                    </div>
                </div>


                <div className="category-container">
                    <div className="category">
                        Category: {item?.categoryName}
                    </div>

                </div>

                <div className="quotes-container">
                    <div className="quote-title">Notable Quotes:</div>
                    <div className="quote-content">
                        <p>quote are here</p>
                    </div>
                </div>

                <div className="review-container d-flex flex-column">
                    <div className="review-title">Latest Review:</div>

                    <div className="review-content">
                        <ReviewItem item={item} />
                    </div>

                    <button className="btn btn-outline-dark border-0 align-self-start self-align-center mx-auto mt-3">View All Reviews</button>

                </div>

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
            </div>
        </div>
    );

};

export default MediaDetails;