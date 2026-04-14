import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestReview, selectReviewById } from './review-slice';

const ReviewItem = ({ item }) => {
    const dispatch = useDispatch();
    
    // Ensure this ID matches what the API expects
    const mediaId = item?.id; 

    console.log('Media ID for review:', mediaId); // Debugging log

    // Access the specific slice of state for this ID
    const reviewState = useSelector((state) => selectReviewById(state, mediaId));

    useEffect(() => {
        if (mediaId && !reviewState) {
            dispatch(fetchLatestReview(mediaId));
        }
    }, [dispatch, mediaId, reviewState]);

    if (!reviewState || reviewState.status === 'loading') return <p>Loading...</p>;
    if (reviewState.status === 'failed') return <p>Error: {reviewState.error}</p>;

    console.log('Review State:', reviewState); // Debugging log

    const review = reviewState.data;

    return (
        <div className="review-item">
            {review ? (
                <>  
                <strong>Score: {review.rating}/10</strong>
                    <p>{review.content}</p>                </>
            ) : (
                <p>No reviews yet.</p>
            )}
        </div>
    );
};

export default ReviewItem;