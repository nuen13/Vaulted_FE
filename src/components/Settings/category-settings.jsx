// -- file: src/components/Settings/category-settings.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-bootstrap';

import {
    addCategory, updateCategory, deleteCategory, previewCategoryColor,
    selectAllCategories, nextCategoryColor, DEFAULT_CATEGORY_COLOR
} from '../../slices/category-slice.js';

// --- --- --- --- --- // --- --- --- --- --- //

// One category row: color, editable name, item count, delete
const CategoryRow = ({ category, categories, onError }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState(category.name);
    const [confirming, setConfirming] = useState(false);
    const [moveTo, setMoveTo] = useState('');
    const [busy, setBusy] = useState(false);
    const colorTimer = useRef(null);
    const savedColor = useRef(category.color);

    // Stop a pending color save if the row goes away
    useEffect(() => () => clearTimeout(colorTimer.current), []);

    const others = categories.filter(c => c.id !== category.id);

    // -- Rename: saves on Enter or when the field loses focus; Esc reverts -- //
    const saveName = async () => {
        const trimmed = name.trim();
        if (trimmed === category.name) { setName(category.name); return; }
        try {
            await dispatch(updateCategory({ id: category.id, name: trimmed })).unwrap();
            onError('');
        } catch (err) {
            setName(category.name);
            onError(err);
        }
    };

    // -- Recolor: cards update live, the API call waits until you stop dragging -- //
    const handleColor = (color) => {
        dispatch(previewCategoryColor({ id: category.id, color }));
        clearTimeout(colorTimer.current);
        colorTimer.current = setTimeout(async () => {
            try {
                await dispatch(updateCategory({ id: category.id, name: category.name, color })).unwrap();
                savedColor.current = color;
                onError('');
            } catch (err) {
                dispatch(previewCategoryColor({ id: category.id, color: savedColor.current }));
                onError(err);
            }
        }, 400);
    };

    // -- Delete (moving items first when the category is in use) -- //
    const handleDelete = async () => {
        setBusy(true);
        try {
            await dispatch(deleteCategory({ id: category.id, reassignToId: moveTo ? Number(moveTo) : null })).unwrap();
            onError('');
        } catch (err) {
            onError(err);
            setBusy(false);
        }
    };

    return (
        <li className="category-row">
            <div className="category-row-main">
                <input
                    type="color"
                    className="category-color-input"
                    value={category.color || DEFAULT_CATEGORY_COLOR}
                    onChange={(e) => handleColor(e.target.value)}
                    title="Change color"
                    aria-label={`Color for ${category.name}`}
                />
                <input
                    type="text"
                    className="form-control form-control-sm category-name-input"
                    value={name}
                    maxLength={50}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                        if (e.key === 'Escape') { setName(category.name); e.stopPropagation(); }
                    }}
                    aria-label="Category name"
                />
                <span className="category-count" title="Media items in this category">
                    {category.mediaCount} {category.mediaCount === 1 ? 'item' : 'items'}
                </span>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger border-0"
                    onClick={() => setConfirming(true)}
                    disabled={confirming}
                    title="Delete category"
                    aria-label={`Delete ${category.name}`}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>

            {confirming && (
                <div className="category-delete-confirm">
                    {category.mediaCount > 0 ? (
                        <>
                            <span>Move its {category.mediaCount} {category.mediaCount === 1 ? 'item' : 'items'} to</span>
                            <select
                                className="form-select form-select-sm w-auto"
                                value={moveTo}
                                onChange={(e) => setMoveTo(e.target.value)}
                                aria-label="Move items to"
                            >
                                <option value="">Choose a category…</option>
                                {others.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <span>then delete?</span>
                        </>
                    ) : (
                        <span>Delete “{category.name}”?</span>
                    )}
                    <div className="d-flex gap-1 ms-auto">
                        <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={handleDelete}
                            disabled={busy || (category.mediaCount > 0 && !moveTo)}
                        >
                            Delete
                        </button>
                        <button type="button" className="btn btn-sm btn-light" onClick={() => { setConfirming(false); setMoveTo(''); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};


const CategorySettings = () => {
    const dispatch = useDispatch();
    const categories = useSelector(selectAllCategories);
    const [error, setError] = useState('');

    const nextColor = () => nextCategoryColor(categories);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(nextColor);
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        try {
            await dispatch(addCategory({ name: newName.trim(), color: newColor })).unwrap();
            setNewName('');
            setNewColor(nextColor());
            setError('');
        } catch (err) {
            setError(err);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="category-settings">
            <p className="settings-hint">
                Click a name to rename it (Enter to save, Esc to undo). The color is used for that category's cards.
            </p>

            {error && <Alert variant="danger" className="py-2" onClose={() => setError('')} dismissible>{error}</Alert>}

            <ul className="category-list">
                {categories.map(category => (
                    // Name in the key: the row restarts from the saved name after a rename
                    <CategoryRow key={`${category.id}:${category.name}`} category={category} categories={categories} onError={setError} />
                ))}
            </ul>

            {/* -- Add -- */}
            <form className="category-row-main category-add" onSubmit={handleAdd}>
                <input
                    type="color"
                    className="category-color-input"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    aria-label="New category color"
                />
                <input
                    type="text"
                    className="form-control form-control-sm category-name-input"
                    placeholder="New category name"
                    value={newName}
                    maxLength={50}
                    onChange={(e) => setNewName(e.target.value)}
                    aria-label="New category name"
                />
                <button type="submit" className="btn btn-sm btn-dark text-nowrap" disabled={adding || !newName.trim()}>
                    <i className="fa-solid fa-plus"></i> Add
                </button>
            </form>
        </div>
    );
};

export default CategorySettings;
