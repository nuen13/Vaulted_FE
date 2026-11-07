// -- file: src/components/MediaComponents/mediaQuotes/quote-carousel.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchQuotesByMediaId, openQuoteManager, selectQuotesByMediaId } from '../../../slices/quote-slice.js';

import './quotes.css';

// --- --- --- --- --- // --- --- --- --- --- //

// Notable quotes in the details: one at a time, with arrows, dots, swipe and ← → keys.
// "Manage" opens the quotes modal (add, edit, delete, reorder).
const QuoteCarousel = ({ mediaId }) => {
    const dispatch = useDispatch();
    const quotes = useSelector((state) => selectQuotesByMediaId(state, mediaId));

    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState('next'); // which way the slide animates
    const swipeStart = useRef(null);

    useEffect(() => {
        if (mediaId) dispatch(fetchQuotesByMediaId(mediaId));
    }, [dispatch, mediaId]);

    const count = quotes.length;
    const current = count ? ((index % count) + count) % count : 0; // stays valid when quotes are removed
    const quote = quotes[current];

    const go = (step) => {
        if (count < 2) return;
        setDirection(step > 0 ? 'next' : 'prev');
        setIndex(current + step);
    };

    const goTo = (target) => {
        if (target === current) return;
        setDirection(target > current ? 'next' : 'prev');
        setIndex(target);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };

    // Swipe left/right (touch or a mouse drag)
    const onPointerDown = (e) => { swipeStart.current = e.clientX; };
    const onPointerUp = (e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    };

    return (
        <div className="quotes-container">
            <div className="quote-header">
                <span className="quote-title">Notable Quotes</span>
                {count > 0 && <span className="quote-count">{current + 1} / {count}</span>}
                <button
                    type="button"
                    className="quote-manage-btn"
                    onClick={() => dispatch(openQuoteManager({ mediaId, mode: count ? 'view' : 'add' }))}
                >
                    <i className={`fa-solid ${count ? 'fa-pen' : 'fa-plus'}`}></i> {count ? 'Manage' : 'Add quote'}
                </button>
            </div>

            {count === 0 ? (
                <button
                    type="button"
                    className="quote-empty"
                    onClick={() => dispatch(openQuoteManager({ mediaId, mode: 'add' }))}
                >
                    No quotes yet. Add a line that stuck with you.
                </button>
            ) : (
                <div
                    className="quote-carousel"
                    tabIndex={0}
                    role="group"
                    aria-roledescription="carousel"
                    aria-label={`Quote ${current + 1} of ${count}`}
                    onKeyDown={onKeyDown}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => { swipeStart.current = null; }}
                >
                    {count > 1 && (
                        <button type="button" className="quote-arrow is-prev" onClick={() => go(-1)} aria-label="Previous quote">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                    )}

                    {/* key restarts the slide animation for each quote */}
                    <figure key={`${current}:${quote.id}`} className={`quote-slide slide-${direction}`}>
                        <blockquote className="quote-content">{quote.quoteText}</blockquote>
                        {quote.quoteFrom && <figcaption className="quote-from">— {quote.quoteFrom}</figcaption>}
                    </figure>

                    {count > 1 && (
                        <button type="button" className="quote-arrow is-next" onClick={() => go(1)} aria-label="Next quote">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    )}
                </div>
            )}

            {count > 1 && (
                <div className="quote-dots">
                    {quotes.map((q, i) => (
                        <button
                            key={q.id}
                            type="button"
                            className={`quote-dot ${i === current ? 'active' : ''}`}
                            onClick={() => goTo(i)}
                            aria-label={`Quote ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuoteCarousel;
