import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { deleteReviewById } from '../../../../slices/review-slice';
import { updateMediaAverageRatingById } from '../../../../slices/media-slice.js';

function ReviewDeleteModal({ reviewId, mediaId, onClose }) {
    const dispatch = useDispatch();

    // 1. Select the data at the top level
    const reviews = useSelector((state) => state.review.reviewsByMediaId[mediaId]?.data || []);

    const handleDelete = async () => {
    try {
        // 1. Calculate new average BEFORE deleting
        const remainingReviews = reviews.filter(rev => rev.id !== reviewId);
        let newAverage = 0;
        if (remainingReviews.length > 0) {
            const total = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
            newAverage = (total / remainingReviews.length).toFixed(1);
        }

        // 2. Dispatch Media Update
        dispatch(updateMediaAverageRatingById({ 
            mediaId, 
            newAverageRating: parseFloat(newAverage) 
        }));

        // 3. Delete the review
        await dispatch(deleteReviewById(reviewId)).unwrap();
        onClose();
    } catch (err) {
        console.error(err);
    }
};
    
    return (
        <Modal show onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this review?</p>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </Modal.Footer>
        </Modal>
    );
}

export default ReviewDeleteModal;