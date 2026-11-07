// -- file: src/components/MediaComponents/media-focus-card.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MediaDetails from './mediaDetails/media-details.jsx';
import { closeMediaFocus } from '../../slices/media-slice.js';
import { selectCategoryColor } from '../../slices/category-slice.js';

import './media-focus-card.css';

// --- --- --- --- --- // --- --- --- --- --- //

// The opened item in table and grid view: the same details as a folder card,
// centered over the page. Closes with Esc, the × button, or a click on the overlay (App).
const MediaFocusCard = ({ items }) => {
    const dispatch = useDispatch();
    const selectedFocusId = useSelector((state) => state.media.selectedFocusId);
    const focused = items.find(i => i.id === selectedFocusId);
    const color = useSelector((state) => selectCategoryColor(state, focused?.categoryId));
    const isClosing = useSelector((state) => state.media.focusClosing);

    // Esc closes the open item (unless a modal like the photo gallery is on top)
    useEffect(() => {
        if (!focused) return;
        const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.modal.show')) dispatch(closeMediaFocus()); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [dispatch, focused]);

    if (!focused) return null;

    return (
        <div
            className={`media-focus-card file-card selected ${isClosing ? 'is-closing' : ''}`}
            style={{ backgroundColor: color }}
            role="dialog"
            aria-label={focused.mediaTitle}
        >
            <button type="button" className="media-focus-close" onClick={() => dispatch(closeMediaFocus())} aria-label="Close">
                <i className="fa-solid fa-xmark"></i>
            </button>
            <MediaDetails item={focused} onUpdateStatus={() => { }} />
        </div>
    );
};

export default MediaFocusCard;
