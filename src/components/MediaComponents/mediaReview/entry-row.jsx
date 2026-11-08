// -- file: src/components/MediaComponents/mediaReview/entry-row.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatEntryDate } from './entry-date.js';
import { deleteReviewById, openReviewEditor } from '../../../slices/review-slice.js';
import { isMine } from '../../../auth/auth.js';

import './reviews.css';

// One Review / Journal entry on the card. "Edit" opens the pop-up with it filled in;
// "Delete" asks first, right here. Only the person who wrote an entry can edit or delete it.
const EntryRow = ({ entry, number }) => {
    const dispatch = useDispatch();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const canChange = isMine(entry.userId);
    const edit = () => dispatch(openReviewEditor({ mediaId: entry.mediaId, mode: 'edit', reviewId: entry.id }));

    return (
        <li className="entry-row">
            <div className="entry-meta">
                <span>
                    {entry.authorName && (
                        <span className="entry-author">
                            {entry.authorPictureUrl && <img src={entry.authorPictureUrl} alt="" referrerPolicy="no-referrer" />}
                            {entry.authorName}
                        </span>
                    )}
                    {entry.authorName ? ' · ' : ''}Entry #{number} · {formatEntryDate(entry.dateCreated)}
                </span>
                <span className="entry-rating"><i className="fa-solid fa-star"></i> {entry.rating ?? '–'}/10</span>
            </div>

            <p className={`entry-text ${entry.content ? '' : 'is-empty'}`}>
                {entry.content || 'Rated only, no review written.'}
            </p>

            {!canChange ? null : confirmDelete ? (
                <div className="entry-confirm">
                    <span>Delete this entry?</span>
                    <button type="button" className="entry-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button type="button" className="entry-btn is-danger" onClick={() => dispatch(deleteReviewById(entry.id))}>Delete</button>
                </div>
            ) : (
                <div className="entry-actions is-end">
                    <button type="button" className="entry-link" onClick={edit}>
                        <i className="fa-solid fa-pen"></i> Edit
                    </button>
                    <button type="button" className="entry-link" onClick={() => setConfirmDelete(true)}>
                        <i className="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            )}
        </li>
    );
};

export default EntryRow;
