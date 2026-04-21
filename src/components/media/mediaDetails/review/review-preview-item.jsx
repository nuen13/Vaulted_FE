import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setReviewContent, setEditingReviewId } from '../../../../slices/review-slice.js';

const handleEdit = () => {
    // 1. Fill the form with this review's data
    dispatch(setReviewContent(item.content));
    dispatch(setEditingReviewId(item.id)); // Tell Redux we are editing THIS ID
    
    // 2. Scroll the user up to the input form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

import ReviewDeleteModal from './review-delete-modal';
import './review.css';

const ReviewItem = ({ item, count }) => {
    const dispatch = useDispatch();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const dateData = new Date(item.dateCreated);
    const formattedDate = dateData.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const handleEdit = () => {

        dispatch(setReviewContent(item.content));
        dispatch(setEditingReviewId(item.id));
        window.scrollTo({ top: 0, behavior: 'smooth' });

        
    };

    return (
        <div className="review-item d-flex flex-column">
            {showDeleteModal && (
                <ReviewDeleteModal 
                    mediaId={item.mediaId}
                    reviewId={item.id}
                    onClose={() => setShowDeleteModal(false)}
                />
            )}
            <div className="review-header d-flex flex-column gap-1">
                <div className="d-flex flex-row justify-content-between align-items-center">
                    <span className="consume-no">Review - Consume #{count}</span>
                    <span className="consume-date">{formattedDate}</span>
                </div>
                <span className="review-score mt-0">Score: {item.rating}/10</span>
            </div>
            <span className="review-content">{item.content}</span>
            <div className="review-footer d-flex flex-row justify-content-end align-items-center gap-1 mt-2">
                <button className="review-tool-button" onClick={handleEdit} disabled>Edit</button> |
                <button className="review-tool-button" onClick={() => setShowDeleteModal(true)}>Delete</button>
            </div>
        </div>
    );
};

export default ReviewItem;