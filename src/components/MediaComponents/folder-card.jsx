// -- file: src/components/MediaComponents/folder-card.jsx
// One card in the Folder view (a file folder in the stack)
import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';

import MediaDetails from './mediaDetails/media-details.jsx';
import { selectMediaFocus, closeMediaFocus, FOCUS_CLOSE_MS } from '../../slices/media-slice.js';
import { selectCategoryColor } from '../../slices/category-slice.js';

import './folder-card.css';

// --- --- --- --- --- // --- --- --- --- --- //

// Opening and closing, the card flies between its spot in the list and the middle of the
// screen (the overlay in App.css fades in step with it).
const FOCUS_OPEN_MS = 380;
const EASE_OPEN = 'cubic-bezier(0.22, 1, 0.36, 1)';    // quick start, long gentle landing
const EASE_CLOSE = 'cubic-bezier(0.4, 0, 0.2, 1)';     // eases in and out, lands softly in the list

// The transform that makes a card sitting at `to` look like it's at `from`
// (scaled from the middle, so transform-origin must be 50% 50%)
const flightTransform = (from, to) => {
    const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FolderCard = ({
    item,
    isSelected,
    showDetails,   // false until the card comes near the screen: just the title bar
}) => {
    const [selectedStatus, setSelectedStatus] = useState(item.status || 'Planning');
    const dispatch = useDispatch();
    // Closing animation: flying back to its spot in the list, then its contents fade back in
    const isClosing = useSelector((state) => isSelected && state.media.focusClosing);
    const isReturning = useSelector((state) => state.media.returningFocusId === item.id);

    const cardRef = useRef(null);
    const listRect = useRef(null);   // where the card sat in the list when it was opened
    const flight = useRef(null);     // the running open / close animation

    const handleUpdateStatus = (newStatus) => {
        setSelectedStatus(newStatus);
    };

    // Every way of opening the card comes through here, so its spot in the list is measured
    // before it jumps to the middle of the screen
    const openCard = () => {
        if (isSelected) return;
        listRect.current = cardRef.current?.getBoundingClientRect() ?? null;
        dispatch(selectMediaFocus(item.id));
    };

    // -- Open / close flight --
    // Runs after React has moved the card (fixed in the middle, or back in the list) but before
    // the browser paints, so the jump is never seen: the animation starts from where it was.
    useLayoutEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        flight.current?.cancel();   // also drops a finished close, now that the card is back
        flight.current = null;

        if (!isSelected) { listRect.current = null; return; }
        const from = listRect.current;
        if (!from || from.width === 0) return;   // opened some other way: it just appears

        const reduce = prefersReducedMotion();
        const center = card.getBoundingClientRect();
        const inList = flightTransform(from, center);

        flight.current = isClosing
            ? card.animate(
                reduce ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: 'none' }, { transform: inList }],
                // "forwards" holds it in the list's spot until the store puts it back there
                { duration: FOCUS_CLOSE_MS, easing: EASE_CLOSE, fill: 'forwards' })
            : card.animate(
                reduce ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: inList }, { transform: 'none' }],
                { duration: FOCUS_OPEN_MS, easing: EASE_OPEN });
    }, [isSelected, isClosing]);

    // --- Redux Interaction ---
    const handleClick = (e) => {
        e.stopPropagation(); // Prevents the App's "click outside" from firing
        openCard();
    };

    // Card color comes from the category (editable in Settings)
    const categoryColor = useSelector((state) => selectCategoryColor(state, item.categoryId));

    // Position, size, shading while stacked, and the overlap with other cards are set by
    // media-stack.jsx (on this card and its slot) as you scroll; only the color is set here.
    const dynamicStyles = { backgroundColor: categoryColor };

    // Touchscreens have no hover: a tap opens the item directly. (The browser's emulated
    // hover would otherwise expand the card first and swallow the tap.)
    const handlePointerUp = (e) => {
        if (e.pointerType !== 'mouse') openCard();
    };

    // Clicking or starting to edit anything inside a hovered card (status, rating, review box,
    // buttons...) opens it, same as clicking the card. "Capture" handlers run on the way *down*
    // to the clicked element, so they still fire even though the details area stops clicks
    // from bubbling back *up* to the card.
    const focusCard = openCard;

    const handleClose = (e) => {
        e.stopPropagation();
        dispatch(closeMediaFocus());
    };

    // The folder's tab: its category and a short file number from the item's id
    // (a number padded to 3 digits, or the first 4 characters of a GUID), like a catalog card
    const rawId = String(item.id ?? '');
    const fileNumber = /^\d+$/.test(rawId) ? rawId.padStart(3, '0') : rawId.slice(0, 4).toUpperCase();
    const rating = Number(item.averageRating) > 0 ? `${Number(item.averageRating).toFixed(1)} / 10` : null;

    const card = (
            <div
                ref={cardRef}
                onClick={handleClick}
                onPointerUp={handlePointerUp}
                onPointerDownCapture={(e) => e.pointerType === 'mouse' && focusCard()}
                onFocusCapture={focusCard}
                className={`file-card ${isSelected ? 'selected' : ''} ${isClosing ? 'is-closing' : ''} ${isReturning ? 'is-returning' : ''}`}
                style={dynamicStyles}
            >
                {isSelected && (
                    <button type="button" className="file-card-close" onClick={handleClose} aria-label="Close">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                )}
                {!showDetails ? (
                    <div className="file-snippet">
                        <span className="file-title">{item.mediaTitle}</span>
                        <span className="file-status">
                            {selectedStatus}{rating && ` · ${rating}`}
                        </span>
                    </div>
                ) : (
                    <MediaDetails item={item} onUpdateStatus={handleUpdateStatus} />
                )}
            </div>
    );

    return (
        // The folder (tab + card) is what media-stack.jsx moves and shades while stacked
        <div
            className={`file-folder ${isSelected ? 'is-open' : ''}`}
            style={{ '--folder-color': categoryColor }}
        >
            <div className="file-tab" onClick={handleClick} aria-hidden="true">
                <span className="file-tab-label">{item.categoryName}</span>
                <span className="file-tab-number">No. {fileNumber}</span>
            </div>
            {/* An opened card is rendered at the end of <body>, not inside the list. Inside the
                list, the scrolling box and the sticky slots can (in some browsers) become what
                the fixed card is positioned against, so it lands off-center and gets cut off at
                the list's edges. An empty card of the same color holds its place meanwhile. */}
            {isSelected ? (
                <>
                    <div className="file-card file-card-placeholder" style={dynamicStyles} aria-hidden="true" />
                    {createPortal(card, document.body)}
                </>
            ) : card}
        </div>
    );
};

export default FolderCard;