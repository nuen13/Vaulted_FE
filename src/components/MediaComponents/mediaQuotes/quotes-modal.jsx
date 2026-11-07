// -- file: src/components/MediaComponents/mediaQuotes/quotes-modal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

import {
    addQuote, updateQuote, deleteQuote, reorderQuotes, fetchQuotesByMediaId,
    closeQuoteManager, selectQuoteManager, selectQuotesByMediaId
} from '../../../slices/quote-slice.js';

import './quotes.css';

// --- --- --- --- --- // --- --- --- --- --- //

// One quote in the list: view, edit in place, delete (with confirm), move
const QuoteRow = ({ quote, index, total, onMove, dragProps, isDragging, isDropTarget, onError }) => {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [text, setText] = useState(quote.quoteText);
    const [from, setFrom] = useState(quote.quoteFrom ?? '');
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await dispatch(updateQuote({ quoteId: quote.id, quoteText: text, quoteFrom: from })).unwrap();
            setEditing(false);
            onError('');
        } catch (err) {
            onError(err);
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        setText(quote.quoteText);
        setFrom(quote.quoteFrom ?? '');
        setEditing(false);
    };

    return (
        <li
            className={`quote-row ${isDragging ? 'is-dragging' : ''} ${isDropTarget ? 'is-drop-target' : ''}`}
            {...(editing ? {} : dragProps)}
        >
            <span className="quote-row-handle" aria-hidden="true" title="Drag to reorder">
                <i className="fa-solid fa-grip-vertical"></i>
            </span>
            <span className="quote-row-number">{index + 1}</span>

            {editing ? (
                <div className="quote-row-edit">
                    <Form.Control as="textarea" rows={3} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} autoFocus />
                    <Form.Control placeholder="From (optional)" value={from} maxLength={255} onChange={(e) => setFrom(e.target.value)} />
                    <div className="d-flex gap-2">
                        <Button size="sm" variant="dark" onClick={save} disabled={saving || !text.trim()}>Save</Button>
                        <Button size="sm" variant="light" onClick={cancel}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="quote-row-body">
                    <p className="quote-row-text">“{quote.quoteText}”</p>
                    {quote.quoteFrom && <p className="quote-row-from">— {quote.quoteFrom}</p>}

                    {confirmDelete && (
                        <div className="quote-row-confirm">
                            <span>Delete this quote?</span>
                            <Button size="sm" variant="danger" onClick={() => dispatch(deleteQuote({ quoteId: quote.id }))}>Delete</Button>
                            <Button size="sm" variant="light" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                        </div>
                    )}
                </div>
            )}

            {!editing && !confirmDelete && (
                <div className="quote-row-actions">
                    <button type="button" title="Move up" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
                        <i className="fa-solid fa-arrow-up"></i>
                    </button>
                    <button type="button" title="Move down" aria-label="Move down" disabled={index === total - 1} onClick={() => onMove(index, index + 1)}>
                        <i className="fa-solid fa-arrow-down"></i>
                    </button>
                    <button type="button" title="Edit" aria-label="Edit quote" onClick={() => setEditing(true)}>
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" title="Delete" aria-label="Delete quote" className="danger" onClick={() => setConfirmDelete(true)}>
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )}
        </li>
    );
};


// All quotes for one item: add, edit, delete, reorder (drag or ↑ ↓)
const QuotesModal = () => {
    const dispatch = useDispatch();
    const { mediaId, mode } = useSelector(selectQuoteManager);
    const item = useSelector((state) => state.media.items.find(i => i.id === mediaId));
    const quotes = useSelector((state) => selectQuotesByMediaId(state, mediaId));

    const [newText, setNewText] = useState('');
    const [newFrom, setNewFrom] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (mediaId) dispatch(fetchQuotesByMediaId(mediaId));
    }, [dispatch, mediaId]);

    const handleClose = () => {
        dispatch(closeQuoteManager());
        setNewText('');
        setNewFrom('');
        setError('');
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;
        setAdding(true);
        try {
            await dispatch(addQuote({ mediaId, quoteText: newText, quoteFrom: newFrom })).unwrap();
            setNewText('');
            setNewFrom('');
            setError('');
            textRef.current?.focus();
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to add quote.');
        } finally {
            setAdding(false);
        }
    };

    const moveTo = (from, to) => {
        if (from === null || to === null || from === to || to < 0 || to >= quotes.length) return;
        const ids = quotes.map(q => q.id);
        const [moved] = ids.splice(from, 1);
        ids.splice(to, 0, moved);
        dispatch(reorderQuotes({ mediaId, quoteIds: ids }));
    };

    const dragPropsFor = (index) => ({
        draggable: true,
        onDragStart: (e) => { setDragIndex(index); e.dataTransfer.effectAllowed = 'move'; },
        onDragOver: (e) => { e.preventDefault(); setDragOverIndex(index); },
        onDragLeave: () => setDragOverIndex(null),
        onDrop: (e) => { e.preventDefault(); moveTo(dragIndex, index); setDragIndex(null); setDragOverIndex(null); },
        onDragEnd: () => { setDragIndex(null); setDragOverIndex(null); },
    });

    return (
        <Modal
            show={mediaId !== null}
            onHide={handleClose}
            onEntered={() => mode === 'add' && textRef.current?.focus()}
            size="lg"
            centered
            dialogClassName="quotes-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>{item?.mediaTitle} — Notable Quotes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* -- Add -- */}
                <Form onSubmit={handleAdd} className="quote-add-form">
                    <Form.Control
                        ref={textRef}
                        as="textarea"
                        rows={2}
                        placeholder="Add a quote…"
                        value={newText}
                        maxLength={2000}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd(e); }}
                    />
                    <div className="d-flex gap-2">
                        <Form.Control
                            placeholder="From (optional) — who said it, chapter, episode…"
                            value={newFrom}
                            maxLength={255}
                            onChange={(e) => setNewFrom(e.target.value)}
                        />
                        <Button type="submit" variant="dark" className="text-nowrap" disabled={adding || !newText.trim()}>
                            <i className="fa-solid fa-plus"></i> Add
                        </Button>
                    </div>
                </Form>

                {error && <Alert variant="danger" className="py-2 mt-2 mb-0" onClose={() => setError('')} dismissible>{error}</Alert>}

                {/* -- All quotes -- */}
                {quotes.length > 0 ? (
                    <>
                        <p className="quote-hint">The carousel shows them in this order. Drag (or use ↑ ↓) to rearrange.</p>
                        <ol className="quote-list">
                            {quotes.map((quote, index) => (
                                <QuoteRow
                                    // text in the key: the row restarts from the saved text after an edit
                                    key={`${quote.id}:${quote.quoteText}:${quote.quoteFrom}`}
                                    quote={quote}
                                    index={index}
                                    total={quotes.length}
                                    onMove={moveTo}
                                    onError={setError}
                                    dragProps={dragPropsFor(index)}
                                    isDragging={dragIndex === index}
                                    isDropTarget={dragOverIndex === index && dragIndex !== index}
                                />
                            ))}
                        </ol>
                    </>
                ) : (
                    <p className="text-muted text-center mt-4 mb-1">No quotes yet. Add the first one above.</p>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default QuotesModal;
