// -- file: src/components/MediaComponents/mediaPhotos/photo-gallery-modal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

import {
    addPhoto, deletePhoto, reorderPhotos, fetchPhotosByMediaId, setPhotoAsCover,
    closeGallery, selectGallery, selectPhotosByMediaId
} from '../../../slices/photo-slice.js';

import './photo-gallery.css';

// --- --- --- --- --- // --- --- --- --- --- //

// One photo tile. Shows a placeholder if the link is broken.
const PhotoTile = ({ url, alt, badge, children, className = '', ...rest }) => {
    const [broken, setBroken] = useState(false);
    return (
        <div className={`photo-tile ${className}`} {...rest}>
            {broken
                ? <div className="photo-tile-broken">Image link<br />not loading</div>
                : <img src={url} alt={alt} draggable={false} onError={() => setBroken(true)} />}
            {badge && <span className="photo-tile-badge">{badge}</span>}
            {children}
        </div>
    );
};

// Gallery modal for one media item: add photos, drag (or ← →) to reorder, remove.
// Mounted once in App so it stays open even when the hovered card collapses.
const PhotoGalleryModal = () => {
    const dispatch = useDispatch();
    const { mediaId, mode } = useSelector(selectGallery);
    const item = useSelector((state) => state.media.items.find(i => i.id === mediaId));
    const photos = useSelector((state) => selectPhotosByMediaId(state, mediaId));

    const [newUrl, setNewUrl] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [confirmRemoveId, setConfirmRemoveId] = useState(null);
    const urlInputRef = useRef(null);

    const show = mediaId !== null;

    useEffect(() => {
        if (mediaId) dispatch(fetchPhotosByMediaId(mediaId));
        setNewUrl('');
        setError('');
        setConfirmRemoveId(null);
    }, [dispatch, mediaId]);

    const handleClose = () => dispatch(closeGallery());

    // -- Add -- //
    const handleAdd = async (e) => {
        e.preventDefault();
        const photoUrl = newUrl.trim();
        if (!photoUrl) return;
        setSaving(true);
        setError('');
        try {
            await dispatch(addPhoto({ mediaId, photoUrl })).unwrap();
            setNewUrl('');
            urlInputRef.current?.focus();
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to add photo.');
        } finally {
            setSaving(false);
        }
    };

    // -- Reorder -- //
    const moveTo = (from, to) => {
        if (from === null || to === null || from === to || to < 0 || to >= photos.length) return;
        const ids = photos.map(p => p.id);
        const [moved] = ids.splice(from, 1);
        ids.splice(to, 0, moved);
        dispatch(reorderPhotos({ mediaId, photoIds: ids }));
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        moveTo(dragIndex, index);
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // -- Remove -- //
    const handleRemove = (photoId) => {
        dispatch(deletePhoto({ photoId }));
        setConfirmRemoveId(null);
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            onEntered={() => mode === 'add' && urlInputRef.current?.focus()}
            size="lg"
            centered
            dialogClassName="photo-gallery-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>{item?.mediaTitle} — Photos</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {/* -- Add photo -- */}
                <Form onSubmit={handleAdd} className="photo-add-form d-flex gap-2 mb-2">
                    <Form.Control
                        ref={urlInputRef}
                        type="url"
                        placeholder="Paste an image URL (https://...)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                    />
                    <Button variant="dark" type="submit" disabled={saving || !newUrl.trim()} className="text-nowrap">
                        <i className="fa-solid fa-plus"></i> Add
                    </Button>
                </Form>
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                <p className="photo-gallery-hint">
                    Drag photos (or use ← →) to rearrange. The cover always shows first; use ★ to swap a photo with it.
                </p>

                {/* -- Grid -- */}
                <div className="photo-grid">
                    {item?.coverPhotoUrl && (
                        <PhotoTile url={item.coverPhotoUrl} alt={`${item.mediaTitle} cover`} badge="Cover" className="is-cover" />
                    )}

                    {photos.map((photo, index) => (
                        <PhotoTile
                            key={photo.id}
                            url={photo.photoUrl}
                            alt={`${item?.mediaTitle} photo ${index + 1}`}
                            badge={index + 1}
                            className={`${dragIndex === index ? 'is-dragging' : ''} ${dragOverIndex === index && dragIndex !== index ? 'is-drop-target' : ''}`}
                            draggable
                            onDragStart={(e) => { setDragIndex(index); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                            onDragLeave={() => setDragOverIndex(null)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                        >
                            {confirmRemoveId === photo.id ? (
                                <div className="photo-tile-confirm">
                                    <span>Remove this photo?</span>
                                    <div className="d-flex gap-1">
                                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemove(photo.id)}>Remove</button>
                                        <button type="button" className="btn btn-sm btn-light" onClick={() => setConfirmRemoveId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="photo-tile-actions">
                                    <button type="button" title="Move left" aria-label="Move left" disabled={index === 0} onClick={() => moveTo(index, index - 1)}>
                                        <i className="fa-solid fa-arrow-left"></i>
                                    </button>
                                    <button type="button" title="Move right" aria-label="Move right" disabled={index === photos.length - 1} onClick={() => moveTo(index, index + 1)}>
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                    <button type="button" title="Set as cover" aria-label="Set as cover" className="set-cover" onClick={() => dispatch(setPhotoAsCover({ photoId: photo.id, mediaId }))}>
                                        <i className="fa-solid fa-star"></i>
                                    </button>
                                    <button type="button" title="Remove" aria-label="Remove photo" className="remove" onClick={() => setConfirmRemoveId(photo.id)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            )}
                        </PhotoTile>
                    ))}
                </div>

                {photos.length === 0 && (
                    <p className="text-muted text-center mt-3 mb-0">No extra photos yet. Add one above.</p>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default PhotoGalleryModal;
