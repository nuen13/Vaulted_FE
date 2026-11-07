// -- file: src/components/MediaComponents/folder-card.jsx
// One card in the Folder view (a file folder in the stack)
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import MediaDetails from './mediaDetails/media-details.jsx';
import { selectMediaFocus, closeMediaFocus } from '../../slices/media-slice.js';
import { selectCategoryColor } from '../../slices/category-slice.js';

import './folder-card.css';

// --- --- --- --- --- // --- --- --- --- --- //

const FolderCard = ({
    item,
    index,
    total,
    isPushedDown,
    isPulledUp,
    isHovered,
    isActive,      // hovered or open: stays bright while the other cards darken
    isSelected,
}) => {
    const [selectedStatus, setSelectedStatus] = useState(item.status || 'Planning');
    const dispatch = useDispatch();
    // Closing animation: fading out while centered, then settling back into the list
    const isClosing = useSelector((state) => isSelected && state.media.focusClosing);
    const isReturning = useSelector((state) => state.media.returningFocusId === item.id);

    const handleUpdateStatus = (newStatus) => {
        setSelectedStatus(newStatus);
    };

    // --- Redux Interaction ---
    const handleClick = (e) => {
        e.stopPropagation(); // Prevents the App's "click outside" from firing
        if (isSelected) {
            return; 
        } else {
            dispatch(selectMediaFocus(item.id));
        }
    };

    const baseZIndex = total + index;

    // The last card isn't covered by another one, so its details are always shown
    // (the other cards only show their title bar until hovered)
    const isLast = index === total - 1;

    // Card color comes from the category (editable in Settings)
    const categoryColor = useSelector((state) => selectCategoryColor(state, item.categoryId));

    const movement = 15;

    const dynamicStyles = {
        backgroundColor: categoryColor,
        
        zIndex: isSelected ? 1000 : (isHovered ? 999 : baseZIndex),
        // The stacking overlap (negative margin) lives on the wrapper in media-stack.jsx,
        // so the card's space is kept while it's opened in the middle of the screen.

        transform: isSelected
            ? 'none' // opened: centered over the screen by .file-card.selected (folder-card.css)
            : isHovered
                ? 'translateY(-15px) scale(1.02)'
                : isPulledUp
                    ? `translateY(${movement}px)`
                    : isPushedDown
                        ? `translateY(-${movement}px)`
                        : 'translateY(0px)',

        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Added some "pop" ease

        boxShadow: (isSelected || isHovered)
            ? '0 25px 50px rgba(0,0,0,0.5)'
            : '0 -5px 15px rgba(0,0,0,0.1)',

        cursor: 'pointer'
    };

    // Touchscreens have no hover: a tap opens the item directly. (The browser's emulated
    // hover would otherwise expand the card first and swallow the tap.)
    const handlePointerUp = (e) => {
        if (e.pointerType !== 'mouse' && !isSelected) dispatch(selectMediaFocus(item.id));
    };

    // Clicking or starting to edit anything inside a hovered card (status, rating, review box,
    // buttons...) opens it, same as clicking the card. "Capture" handlers run on the way *down*
    // to the clicked element, so they still fire even though the details area stops clicks
    // from bubbling back *up* to the card.
    const focusCard = () => {
        if (!isSelected) dispatch(selectMediaFocus(item.id));
    };

    const handleClose = (e) => {
        e.stopPropagation();
        dispatch(closeMediaFocus());
    };

    return (
        <div
            onClick={handleClick}
            onPointerUp={handlePointerUp}
            onPointerDownCapture={(e) => e.pointerType === 'mouse' && focusCard()}
            onFocusCapture={focusCard}
            className={`file-card ${isSelected ? 'selected' : ''} ${isActive ? 'is-active' : ''} ${isClosing ? 'is-closing' : ''} ${isReturning ? 'is-returning' : ''}`}
            style={dynamicStyles}
        >
            {isSelected && (
                <button type="button" className="file-card-close" onClick={handleClose} aria-label="Close">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
            {!(isHovered || isSelected || isLast) ? (
                <div className="file-snippet px-3">
                    <span className="file-title">
                        {item.categoryName} - {item.mediaTitle}
                    </span>
                    <span className="file-status align-self-center justify-self-end">
                        Status: {selectedStatus}
                    </span>
                </div>
            ) : (
                <MediaDetails item={item} onUpdateStatus={handleUpdateStatus} />
            )}
        </div>
    );
};

export default FolderCard;