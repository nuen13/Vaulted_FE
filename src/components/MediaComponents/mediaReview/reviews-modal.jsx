// -- file: src/components/MediaComponents/mediaReview/reviews-modal.jsx
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';

import RatingPanel from './rating-panel.jsx';
import {
    addReviewByMediaId, updateReviewById, closeReviewEditor, selectReviewEditor
} from '../../../slices/review-slice.js';
import { selectCategoryColor } from '../../../slices/category-slice.js';

import './reviews.css';

// --- --- --- --- --- // --- --- --- --- --- //

const DEFAULT_RATING = 5;
const EMPTY = [];

// The form inside the pop-up. It's given a fresh `key` each time the pop-up opens
// (see below), so its rating/text start from `initial` without any extra syncing code.
const EntryForm = ({ mediaId, entry, onDone, autoFocusRef }) => {
    const dispatch = useDispatch();
    const isEdit = !!entry;
    const [rating, setRating] = useState(entry?.rating ?? DEFAULT_RATING);
    const [text, setText] = useState(entry?.content ?? '');
    const [confirmRatingOnly, setConfirmRatingOnly] = useState(false);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const content = text.trim() || null;
            // Either way the server recalculates the average rating; media-slice picks it up.
            if (isEdit) {
                await dispatch(updateReviewById({ reviewId: entry.id, reviewData: { content, rating } })).unwrap();
            } else {
                await dispatch(addReviewByMediaId({ mediaId, reviewData: { mediaId, content, rating } })).unwrap();
            }
            onDone(); // close; the entry shows (or updates) on the card
        } finally {
            setSaving(false);
        }
    };

    // Nothing written: ask before saving just the rating
    const onSave = () => {
        if (text.trim()) save();
        else setConfirmRatingOnly(true);
    };

    const writeInstead = () => {
        setConfirmRatingOnly(false);
        autoFocusRef.current?.focus();
    };

    return (
        <section className="entry-new">
            <RatingPanel id={`entry-rating-${entry?.id ?? mediaId}`} value={rating} onChange={setRating} />
            <textarea
                ref={autoFocusRef}
                className="entry-textarea"
                rows={5}
                value={text}
                placeholder="Write a review or journal entry… (optional)"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onSave(); } }}
            />

            {confirmRatingOnly ? (
                <div className="entry-confirm" role="alert">
                    <span>Save just the rating <b>{rating}/10</b>, with no review?</span>
                    <button type="button" className="entry-btn" onClick={writeInstead}>Write something</button>
                    <button type="button" className="entry-btn is-primary" onClick={save} disabled={saving}>Save rating only</button>
                </div>
            ) : (
                <div className="entry-actions is-end">
                    <button type="button" className="entry-btn" onClick={onDone}>Cancel</button>
                    <button type="button" className="entry-btn is-primary" onClick={onSave} disabled={saving}>
                        <i className="fa-solid fa-check"></i> {isEdit ? 'Save changes' : 'Save entry'}
                    </button>
                </div>
            )}
        </section>
    );
};


// Pop-up for a Review / Journal entry: "Write" opens it empty, "Edit" opens it with that
// entry filled in. Existing entries are listed on the card (review-list.jsx).
// Mounted once in App (like the photo and quote pop-ups) so it stays open on its own.
const ReviewsModal = () => {
    const dispatch = useDispatch();
    const { mediaId, mode, reviewId } = useSelector(selectReviewEditor);
    const item = useSelector((state) => state.media.items.find(i => i.id === mediaId));
    const color = useSelector((state) => selectCategoryColor(state, item?.categoryId));
    const reviews = useSelector((state) => state.review.reviewsByMediaId[mediaId]?.data ?? EMPTY);
    const textRef = useRef(null);

    const entry = mode === 'edit' ? reviews.find(r => r.id === reviewId) : null;
    const entryNumber = entry ? reviews.length - reviews.indexOf(entry) : null; // #1 is the oldest

    const handleClose = () => dispatch(closeReviewEditor());

    return (
        <Modal
            show={mediaId !== null}
            onHide={handleClose}
            onEntered={() => textRef.current?.focus()}
            centered
            dialogClassName="reviews-modal"
            style={{ '--entry-color': color }}
        >
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>
                    <span className="reviews-modal-kicker">
                        {entry ? `Edit entry #${entryNumber}` : 'New entry'} · Review / Journal
                    </span>
                    {item?.mediaTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mediaId && (
                    <EntryForm
                        key={`${mode}:${reviewId ?? 'new'}`}
                        mediaId={mediaId}
                        entry={entry}
                        onDone={handleClose}
                        autoFocusRef={textRef}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ReviewsModal;
