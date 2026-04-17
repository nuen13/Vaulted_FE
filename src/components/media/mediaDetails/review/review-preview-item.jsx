// src/components/media/mediaDetails/review/review-preview-item.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchLatestReview, selectReviewById, deleteReviewById } from '../../../../slices/review-slice';

import './review.css';
import '../media-details.css';

// --- --- --- --- --- // --- --- --- --- --- //

const ReviewItem = ({ item, count }) => {

    const dateData = new Date(item.dateCreated);
    const formattedDate = dateData.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });


    const dispatch = useDispatch();
    

    // delete review
    const handleDelete = () => {
        dispatch(deleteReviewById(item.id));
    };

     // edit review
     const handleEdit = () => {
        // Implement edit functionality (e.g., open a modal with a form)
    };
    

    return (
        <div className="review-item d-flex flex-column">
            {item ? (
                <>
                    {/* no space under review header */}
                    {/* by using? -> gap-1 */}
                    <div className="review-header d-flex flex-column gap-1">
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            <span className="consume-no">Review - Consume #{count}</span>
                            <span className="consume-date">{formattedDate}</span>
                        </div>
                        <span className="review-score mt-0">Score: {item.rating}/10</span>
                    </div>
                    <span className="review-content">{item.content}</span>
                    <div className="review-footer d-flex flex-row justify-content-end align-items-center gap-1 mt-2">
                        <button className="review-tool-button" onClick={handleEdit}>Edit</button> |
                        <button className="review-tool-button" onClick={handleDelete}>Delete</button>
                    </div>
                </>
            ) : (
                <p>No reviews yet.</p>
            )}
        </div>
    );
};

export default ReviewItem;