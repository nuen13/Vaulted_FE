// -- file: src/components/Share/share-modal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

import { closeShare, openShare, selectShareMediaId } from '../../slices/share-slice.js';
import { fetchAllReviewsByMediaId } from '../../slices/review-slice.js';
import { selectCategoryColor } from '../../slices/category-slice.js';
import { renderShareCard, loadCover, ensureFonts, canvasToBlob } from './share-card-renderer.js';

import './share.css';

// --- --- --- --- --- // --- --- --- --- --- //

const EMPTY = [];
const DEFAULT_REVIEW_COUNT = 3;

const fileNameFor = (title) =>
    `${(title || 'media').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'media'}-vaulted.png`;

const canShareFiles = () => typeof navigator !== 'undefined' && !!navigator.canShare
    && navigator.canShare({ files: [new File([''], 'card.png', { type: 'image/png' })] });
const canCopyImage = () => typeof window !== 'undefined' && !!window.ClipboardItem && !!navigator.clipboard?.write;

// Preview + options for one item. Keyed by item in ShareModal, so options reset when you switch.
const ShareCardEditor = ({ item, items }) => {
    const dispatch = useDispatch();
    const mediaId = item.id;
    const color = useSelector((state) => selectCategoryColor(state, item.categoryId));
    const reviews = useSelector((state) => state.review.reviewsByMediaId[mediaId]?.data ?? EMPTY);

    const [includeReviews, setIncludeReviews] = useState(false);
    const [selectedReviewIds, setSelectedReviewIds] = useState([]);
    const [renderedKey, setRenderedKey] = useState(null);
    const [message, setMessage] = useState(null); // { variant, text }
    const canvasRef = useRef(null);

    useEffect(() => {
        dispatch(fetchAllReviewsByMediaId(mediaId));
    }, [dispatch, mediaId]);

    const toggleIncludeReviews = (on) => {
        setIncludeReviews(on);
        // First time on: preselect the most recent few
        if (on && selectedReviewIds.length === 0) {
            setSelectedReviewIds(reviews.slice(0, DEFAULT_REVIEW_COUNT).map(r => r.id));
        }
    };

    const toggleReview = (id) => setSelectedReviewIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // Reviews on the card, newest first, numbered like the details view (#1 = oldest)
    const cardReviews = includeReviews
        ? reviews
            .map((review, index) => ({ ...review, consumeNumber: reviews.length - index }))
            .filter(review => selectedReviewIds.includes(review.id))
        : EMPTY;

    // -- Draw the preview whenever anything on the card changes -- //
    // cardKey identifies what's on the card; "rendering" until that exact version is drawn
    const cardKey = JSON.stringify([item.mediaTitle, item.categoryName, item.status, item.averageRating, item.coverPhotoUrl, color,
        cardReviews.map(r => [r.id, r.rating, r.content])]);
    const rendering = renderedKey !== cardKey;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await ensureFonts();
            const cover = await loadCover(item.coverPhotoUrl);
            if (cancelled || !canvasRef.current) return;
            renderShareCard(canvasRef.current, { item, color, cover, reviews: cardReviews });
            setRenderedKey(cardKey);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- cardKey covers item, color and cardReviews
    }, [cardKey]);

    // -- Actions -- //
    const handleDownload = async () => {
        try {
            const blob = await canvasToBlob(canvasRef.current);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileNameFor(item.mediaTitle);
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setMessage({ variant: 'success', text: `Saved ${link.download}` });
        } catch (err) {
            setMessage({ variant: 'danger', text: err.message || 'Could not create the image.' });
        }
    };

    const handleCopy = async () => {
        try {
            const blob = await canvasToBlob(canvasRef.current);
            await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
            setMessage({ variant: 'success', text: 'Card copied. Paste it anywhere.' });
        } catch {
            setMessage({ variant: 'danger', text: 'Copying images isn’t allowed here. Use Download instead.' });
        }
    };

    const handleShare = async () => {
        try {
            const blob = await canvasToBlob(canvasRef.current);
            const file = new File([blob], fileNameFor(item.mediaTitle), { type: 'image/png' });
            await navigator.share({ files: [file], title: item.mediaTitle });
        } catch (err) {
            if (err?.name !== 'AbortError') setMessage({ variant: 'danger', text: 'Sharing failed. Use Download instead.' });
        }
    };

    return (
        <div className="share-layout">
            {/* -- Preview -- */}
            <div className={`share-preview ${rendering ? 'is-rendering' : ''}`}>
                <canvas ref={canvasRef} aria-label={`Share card for ${item.mediaTitle}`} role="img" />
            </div>

            {/* -- Options -- */}
            <div className="share-options">
                <Form.Group>
                    <Form.Label className="share-label">Media</Form.Label>
                    <Form.Select value={mediaId} onChange={(e) => dispatch(openShare(e.target.value))}>
                        {items.map(i => <option key={i.id} value={i.id}>{i.mediaTitle}</option>)}
                    </Form.Select>
                </Form.Group>

                <div className="share-always">
                    <i className="fa-solid fa-star"></i>
                    Your score ({item.averageRating != null && Number(item.averageRating) > 0
                        ? `${Number(item.averageRating).toFixed(1)}/10` : 'not rated yet'}) is always on the card.
                </div>

                <Form.Check
                    type="switch"
                    id="share-include-reviews"
                    label={`Include reviews${reviews.length ? ` (${reviews.length})` : ''}`}
                    checked={includeReviews}
                    disabled={reviews.length === 0}
                    onChange={(e) => toggleIncludeReviews(e.target.checked)}
                />
                {reviews.length === 0 && <p className="share-hint">No reviews to add yet.</p>}

                {includeReviews && (
                    <ul className="share-review-list">
                        {reviews.map((review, index) => (
                            <li key={review.id}>
                                <Form.Check
                                    type="checkbox"
                                    id={`share-review-${review.id}`}
                                    checked={selectedReviewIds.includes(review.id)}
                                    onChange={() => toggleReview(review.id)}
                                    label={
                                        <span>
                                            <b>#{reviews.length - index} · {review.rating ?? '–'}/10</b>{' '}
                                            <span className="share-review-snippet">{review.content || '(no text)'}</span>
                                        </span>
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {message && (
                    <Alert variant={message.variant} className="py-2 mb-0" onClose={() => setMessage(null)} dismissible>
                        {message.text}
                    </Alert>
                )}

                <div className="share-actions">
                    <Button variant="dark" onClick={handleDownload} disabled={rendering}>
                        <i className="fa-solid fa-download"></i> Download PNG
                    </Button>
                    {canCopyImage() && (
                        <Button variant="outline-dark" onClick={handleCopy} disabled={rendering}>
                            <i className="fa-solid fa-copy"></i> Copy image
                        </Button>
                    )}
                    {canShareFiles() && (
                        <Button variant="outline-dark" onClick={handleShare} disabled={rendering}>
                            <i className="fa-solid fa-share-nodes"></i> Share…
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Share card: the score is always on the card; reviews are optional
const ShareModal = () => {
    const dispatch = useDispatch();
    const mediaId = useSelector(selectShareMediaId);
    const items = useSelector((state) => state.media.items);
    const item = items.find(i => i.id === mediaId);

    return (
        <Modal show={mediaId !== null} onHide={() => dispatch(closeShare())} size="xl" centered dialogClassName="share-modal">
            <Modal.Header closeButton>
                <Modal.Title>Share card</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {item
                    ? <ShareCardEditor key={item.id} item={item} items={items} />
                    : <p className="text-muted mb-0">This item isn’t in the current list. Clear the filters and try again.</p>}
            </Modal.Body>
        </Modal>
    );
};

export default ShareModal;
