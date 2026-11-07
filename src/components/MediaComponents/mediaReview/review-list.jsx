// -- file: src/components/MediaComponents/mediaReview/review-list.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import EntryRow from './entry-row.jsx';
import { fetchAllReviewsByMediaId, openReviewEditor } from '../../../slices/review-slice.js';

import './reviews.css';

const EMPTY = [];

// Review / Journal on the card: every entry listed, newest first (scroll down to see
// older ones). "Write" opens the pop-up for a new entry; each entry's "Edit" opens it
// filled in with that entry.
const ReviewList = ({ mediaId }) => {
    const dispatch = useDispatch();
    const reviews = useSelector((state) => state.review.reviewsByMediaId[mediaId]?.data ?? EMPTY);

    useEffect(() => {
        if (mediaId) dispatch(fetchAllReviewsByMediaId(mediaId));
    }, [dispatch, mediaId]);

    const openWriter = () => dispatch(openReviewEditor({ mediaId, mode: 'write' }));

    return (
        <div className="entries-container">
            <div className="entries-header">
                <span className="entries-title">
                    Review / Journal <span className="entries-count">· {reviews.length} {reviews.length === 1 ? 'entry' : 'entries'}</span>
                </span>
                <button type="button" className="entries-write-btn" onClick={openWriter}>
                    <i className="fa-solid fa-plus"></i> Write
                </button>
            </div>

            {reviews.length === 0 ? (
                <button type="button" className="entries-empty" onClick={openWriter}>
                    No entries yet. Rate it, or write your first thoughts.
                </button>
            ) : (
                <ol className="entry-list">
                    {reviews.map((entry, index) => (
                        <EntryRow key={entry.id} entry={entry} number={reviews.length - index} />
                    ))}
                </ol>
            )}
        </div>
    );
};

export default ReviewList;
