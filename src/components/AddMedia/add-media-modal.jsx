import React, { useEffect, useRef, useState } from 'react';


import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMediaByCategoryAndStatus, selectSelectedCategory, selectSelectedStatus } from '../../slices/media-slice.js';
import { addCategory, selectAllCategories, nextCategoryColor } from '../../slices/category-slice.js';


import { addStatus, selectAllStatuses } from '../../slices/status-slice.js';

import './add-media.css';

// The last option of the Category and Status dropdowns opens a "new ..." row instead of picking one
const ADD_NEW = '__new__';


// The row under a dropdown for making a new category or status without leaving the form.
// Not a <form>: it sits inside the media form. Enter adds, Esc closes.
// color: shown (and editable) only when given, i.e. for categories.
const NewOptionRow = ({ label, color, onColorChange, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const input = useRef(null);

    // Focus the name field after a frame: the closing dropdown hands focus back to itself
    // first, which would take it from an autoFocus field.
    useEffect(() => {
        const frame = requestAnimationFrame(() => input.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, []);

    const save = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setSaving(true);
        try {
            await onSave(trimmed);
        } catch (err) {
            setError(err || `Failed to add ${label}`);
            setSaving(false);
        }
    };

    return (
        <>
            <div className="add-media-new-option">
                {color !== undefined && (
                    <input
                        type="color"
                        className="add-media-new-option-color"
                        value={color}
                        onChange={(e) => onColorChange(e.target.value)}
                        aria-label={`New ${label} color`}
                    />
                )}
                <Form.Control
                    size="sm"
                    ref={input}
                    placeholder={`New ${label} name`}
                    maxLength={50}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); save(); }
                        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCancel(); }
                    }}
                    aria-label={`New ${label} name`}
                />
                <Button size="sm" variant="dark" className="text-nowrap" onClick={save} disabled={saving || !name.trim()}>
                    <i className="fa-solid fa-plus"></i> Add
                </Button>
                <Button size="sm" variant="link" className="text-reset" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
            {error && <div className="add-media-new-option-error" role="alert">{error}</div>}
        </>
    );
};


const AddMedia = ({ show, handleClose }) => {
    const dispatch = useDispatch();
    const selectedCategory = useSelector(selectSelectedCategory);
    const selectedStatus = useSelector(selectSelectedStatus);
    const categories = useSelector(selectAllCategories);

    // Status options come from the database; new items start as "Planning" when it exists
    const statusOptions = useSelector(selectAllStatuses).map(s => s.name);
    const defaultStatus = statusOptions.includes('Planning') ? 'Planning' : (statusOptions[0] ?? '');


    const [msg, setMsg] = useState({ type: '', text: '' });



    const [formData, setFormData] = useState({
        mediaTitle: "",
        categoryId: "",
        coverPhotoUrl: "",
        status: "", // "" = the default status
        mediaLink: ""
    });

    // -- New category / status, made right here. The filters and settings pick them up from the store -- //
    const [newCategoryColor, setNewCategoryColor] = useState(null); // null = row closed
    const [addingStatus, setAddingStatus] = useState(false);

    const saveNewCategory = async (name) => {
        const created = await dispatch(addCategory({ name, color: newCategoryColor })).unwrap();
        setFormData(prev => ({ ...prev, categoryId: created.id }));
        setNewCategoryColor(null);
    };

    const saveNewStatus = async (name) => {
        const created = await dispatch(addStatus({ name })).unwrap();
        setFormData(prev => ({ ...prev, status: created.name }));
        setAddingStatus(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value === ADD_NEW) {
            if (name === "categoryId") setNewCategoryColor(nextCategoryColor(categories));
            if (name === "status") setAddingStatus(true);
            return;
        }
        setFormData(prev => ({
            ...prev,
            // keep "" for the placeholder so the `required` check blocks submit
            [name]: name === "categoryId" && value !== "" ? parseInt(value) : value
        }));
    };

    const resetAndClose = () => {
        setNewCategoryColor(null);
        setAddingStatus(false);
        setMsg({ type: '', text: '' });
        handleClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: 'info', text: 'Saving...' });
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/create-media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: formData.status || defaultStatus })
            });

            if (response.ok) {
                // Refetch with the filters the user currently has selected
                dispatch(fetchMediaByCategoryAndStatus({ categoryId: selectedCategory, status: selectedStatus }));
                setFormData({ mediaTitle: "", categoryId: "", coverPhotoUrl: "", status: "", mediaLink: "" });
                resetAndClose();
            } else {
                setMsg({ type: 'danger', text: 'Failed to save media.' });
            }
        } catch {
            setMsg({ type: 'danger', text: 'Error connecting to server.' });
        }
    };



    return (
        <Modal show={show} onHide={resetAndClose} centered dialogClassName="add-media-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add New Media</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Media Title</Form.Label>
                        <Form.Control name="mediaTitle" value={formData.mediaTitle} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="add-media-category">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">Select a category...</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            <option value={ADD_NEW}>+ New category…</option>
                        </Form.Select>
                        {newCategoryColor !== null && (
                            <NewOptionRow
                                label="category"
                                color={newCategoryColor}
                                onColorChange={setNewCategoryColor}
                                onSave={saveNewCategory}
                                onCancel={() => setNewCategoryColor(null)}
                            />
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Cover Photo URL</Form.Label>
                        <Form.Control name="coverPhotoUrl" value={formData.coverPhotoUrl} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="add-media-status">
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={formData.status || defaultStatus} onChange={handleChange}>
                            {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                            <option value={ADD_NEW}>+ New status…</option>
                        </Form.Select>
                        {addingStatus && (
                            <NewOptionRow
                                label="status"
                                onSave={saveNewStatus}
                                onCancel={() => setAddingStatus(false)}
                            />
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Media Link</Form.Label>
                        <Form.Control name="mediaLink" value={formData.mediaLink} onChange={handleChange} />
                    </Form.Group>
                    {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}
                    <Button variant="dark" type="submit" className="w-100 mt-2">Add Media</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddMedia;
