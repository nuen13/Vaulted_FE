// -- file: src/components/MediaComponents/media-grid.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MediaFocusCard from './media-focus-card.jsx';
import { selectMediaFocus } from '../../slices/media-slice.js';
import { selectAllCategories, DEFAULT_CATEGORY_COLOR } from '../../slices/category-slice.js';

import './media-grid.css';

// --- --- --- --- --- // --- --- --- --- --- //

// One tile: cover photo, or the category color with the title's first letter when there's no working cover
const GridTile = ({ item, color, onOpen }) => {
    const [broken, setBroken] = useState(false);
    const hasCover = item.coverPhotoUrl && !broken;

    return (
        <button
            type="button"
            className="media-grid-tile"
            style={{ '--category-color': color }}
            onClick={onOpen}
            aria-label={`Open ${item.mediaTitle}`}
        >
            {hasCover ? (
                <img src={item.coverPhotoUrl} alt="" loading="lazy" onError={() => setBroken(true)} />
            ) : (
                <span className="media-grid-placeholder" aria-hidden="true">
                    {item.mediaTitle?.trim().charAt(0).toUpperCase() || '?'}
                </span>
            )}

            {item.averageRating != null && Number(item.averageRating) > 0 && (
                <span className="media-grid-rating">
                    <i className="fa-solid fa-star"></i> {Number(item.averageRating).toFixed(1)}
                </span>
            )}

            <span className="media-grid-info">
                <span className="media-grid-title">{item.mediaTitle}</span>
                <span className="media-grid-meta">
                    <span className="media-grid-chip">{item.categoryName}</span>
                    <span className="media-grid-status">{item.status}</span>
                </span>
            </span>
        </button>
    );
};

// Grid view: a gallery of covers; click one to open its details
const MediaGrid = ({ items }) => {
    const dispatch = useDispatch();
    const categories = useSelector(selectAllCategories);
    const colorOf = (categoryId) => categories.find(c => c.id === categoryId)?.color || DEFAULT_CATEGORY_COLOR;

    return (
        <>
            <div className="media-grid">
                {items.map(item => (
                    <GridTile
                        key={item.id}
                        item={item}
                        color={colorOf(item.categoryId)}
                        onOpen={() => dispatch(selectMediaFocus(item.id))}
                    />
                ))}
            </div>

            <MediaFocusCard items={items} />
        </>
    );
};

export default MediaGrid;
