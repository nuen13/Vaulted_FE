import React, { useState, useEffect } from 'react';


import { Modal, Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { fetchMediaByCategoryAndStatus } from '../../slices/media-slice.js';


import './add-media.css';


const AddMedia = ({ show, handleClose }) => {
    const dispatch = useDispatch();

    // status option: 
    const statusOptions = ['Paused', 'Dropped', 'Planning', 'Completed', 'Consuming',];


    const [categories, setCategories] = useState([]);
    const [msg, setMsg] = useState({ type: '', text: '' });



    const [formData, setFormData] = useState({
        mediaTitle: "",
        categoryId: 0,
        coverPhotoUrl: "",
        status: "Planning",
        mediaLink: ""
    });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/Category/get-all-current-categories`)
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(err => console.error("Error fetching categories:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "categoryId" ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: 'info', text: 'Saving...' });
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/create-media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                dispatch(fetchMediaByCategoryAndStatus({ categoryId: null, status: null }));
                setFormData({ mediaTitle: "", categoryId: 0, coverPhotoUrl: "", status: "Planning", mediaLink: "" });
                setMsg({ type: '', text: '' }); // Clear messages
                handleClose();
            } else {
                setMsg({ type: 'danger', text: 'Failed to save media.' });
            }
        } catch (err) {
            setMsg({ type: 'danger', text: 'Error connecting to server.' });
        }
    };



    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Media</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Media Title</Form.Label>
                        <Form.Control name="mediaTitle" value={formData.mediaTitle} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value={0}>Select a category...</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Cover Photo URL</Form.Label>
                        <Form.Control name="coverPhotoUrl" value={formData.coverPhotoUrl} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={formData.status} onChange={handleChange}>
                            {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                        </Form.Select>
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