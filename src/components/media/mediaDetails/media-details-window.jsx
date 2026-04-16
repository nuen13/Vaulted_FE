import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ReviewItem from './review/review-preview-item.jsx';
import { fetchAllReviewsByMediaId, addReviewByMediaId } from '../../../slices/review-slice.js';

import './media-details.css';



const MediaDetailsWindow = ({ item }) => {
    const dispatch = useDispatch();
    const reviews = useSelector((state) => state.review.reviewsByMediaId[item?.id]?.data || []);

    const consumeCount = reviews.length;
    let count = consumeCount + 1;

    useEffect(() => {
        if (item?.id) {
            dispatch(fetchAllReviewsByMediaId(item.id));
        }
    }, [dispatch, item?.id]);

    const handleCapture = (e) => e.stopPropagation();


    // -- Review input -- // 
    const score = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Text Area
    const [reviewContent, setReviewContent] = useState('');
    const [rating, setRating] = useState(1);
    const textAreaRef = useRef(null);

    /*
        useRef ->    
            - Hook that allows to how value that persists across renders without causing re-renders when it changes.
            - Commonly used to access/manipulate DOM elements directly.
            - useState is for reload component when value changes, useRef is for keeping mutable value that doesn't trigger re-render. 
    */

    const handleTextAreaChange = (e) => {
        const target = e.target;
        setReviewContent(target.value);

        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;

        const card = target.closest(".review-input-container");
        if (card) {
            card.scrollTo({
                top: card.scrollHeight,
                behavior: 'smooth'
            });
        }
    };


    // ----- ----- ----- // 

    // Add Review 
    const onSave = async () => {
        if (!reviewContent.trim()) return;
        try {
            const reviewData = {
                mediaId: item.id,
                content: reviewContent,
                rating: rating
            };
            await dispatch(addReviewByMediaId({ mediaId: item.id, reviewData }));
            setReviewContent('');
            setRating(1);
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Error adding review:', error);
        }


    }

    // Calculate percentage for progress bar
    const percentage = (item?.averageScore / 10) * 100;
    const lineStyle = {
        background: `linear-gradient(to right, #000 ${percentage}%, #fff ${percentage}%)`
    };

    const dotStyle = {
        left: `${percentage}%`
    };

    // ----- ----- ----- // 

    return (
        <>
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
                    <p>quote are here - to be done</p>
                </div>
            </div>

            <div className="review-container d-flex flex-column">
                <div >
                    <span className="review-title">Consume & Review: <span> {consumeCount} </span>
                    </span> times</div>

                {/* ----- Review Input ----- */}

                <div className="review-input-container d-flex flex-column mt-4" onClick={handleCapture}>
                    <div className="review-input-header">
                        <div className="score-input d-flex align-items-center gap-2">
                            <label className="m-0">Score:</label>
                            <select
                                className="score-dropdown"
                                value={rating}
                                onChange={(e) => setRating(parseInt(e.target.value))}
                            >
                                {score.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            <span className="opacity-50">/10</span>
                        </div>
                    </div>
                    <div className="review-input-content d-flex flex-row gap-2 mt-2 mb-5">
                        <div className="review-textarea-container flex-grow-1">

                            <textarea
                                ref={textAreaRef}
                                className="review-textarea form-control"
                                placeholder="Write your thoughts here..."
                                value={reviewContent}
                                onChange={handleTextAreaChange}
                                rows={1}
                            />
                        </div>
                        <div className="review-save-btn-container d-flex align-items-start">
                            <button
                                className="save-btn align-self-end "
                                onClick={onSave}
                            >
                                <i className="fa-solid fa-circle-chevron-right p-0 mb-0"></i>
                            </button>
                        </div>
                    </div>



                </div>
                {/* ----- ----- ----- ---- ----  */}
                <div className="review-content">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <ReviewItem
                                key={review.id || `review-${index}`}
                                item={review}
                                // Calculate count based on total length and current index
                                count={reviews.length - index}
                            />
                        ))
                    ) : (
                        <p>No reviews yet.</p>
                    )}
                </div>
            </div>


            {/* <div className="review-container d-flex flex-column">
                <div className="review-title">Consume:</div>

                <div className="review-content">
                    <ReviewItem item={item} />
                </div>

                <button className="btn btn-outline-dark border-1 border-white align-self-start self-align-center mx-auto mt-3 text-white ">View All Reviews</button>

            </div> */}

        </>
    );
}

export default MediaDetailsWindow;