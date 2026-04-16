// -- file: src/components/media/mediaDetails/file-instance.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import MediaDetails from './media-details';
import { selectMediaFocus, clearSelectedFocus } from '../../../slices/media-slice.js';

import './file-instance.css';

// --- --- --- --- --- // --- --- --- --- --- //

const FileInstance = ({
    item,
    index,
    total,
    isPushedDown,
    isPulledUp,
    isHovered,
    isSelected,
    onHover,
    onLeave
}) => {
    const [selectedStatus, setSelectedStatus] = useState(item.status || 'Planning');
    const dispatch = useDispatch();

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

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'anime': return '#a1a1a1';
            case 'movies': return '#1e90ff';
            case 'music': return '#32cd32';
            case 'books': return '#ffa500';
            case 'youtube video': return '#ff5cad';
            default: return '#d43b0c';
        }
    };

    const movement = 15;

    const dynamicStyles = {
        backgroundColor: getCategoryColor(item.categoryName),
        
        zIndex: isSelected ? 1000 : (isHovered ? 999 : baseZIndex),
        marginTop: index === 0
            ? '0px'
            : ( isPushedDown ? '-10px' : '-520px'),

        transform: isSelected
            ? 'translateY(-40px) scale(1.2)' 
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

    return (
        <div
            onClick={handleClick}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className={`file-card ${isSelected ? 'selected' : ''}`}
            style={dynamicStyles}
        >
            {!(isHovered || isSelected) ? (
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

export default FileInstance;