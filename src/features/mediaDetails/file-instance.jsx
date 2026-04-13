import React from 'react';
import './file-instance.css'; // Don't forget to import the CSS!

const FileInstance = ({ item, index, total, isPushedDown, isHovered, onHover, onLeave }) => {

    // Logic: Lower index = Higher Z-index (First item stays on top)
    const baseZIndex = total + index;
    const getCategoryColor = (category) => {
        switch (category) {
            case 'anime':
                return '#064b72'; // Tomato
            case 'movies':
                return '#1e90ff';
            case 'music':
                return '#32cd32';
            case 'books':
                return '#ffa500';
            default:
                return '#d43b0c'; // Default color
        }
    };

    // We keep the "math" styles inline because they change based on props
    const dynamicStyles = {
        backgroundColor: getCategoryColor(item.categoryName),
        zIndex: isHovered ? 999 : baseZIndex,
        marginTop: index === 0 ? '0px' : (isPushedDown ? '20px' : '-350px'),
        transform: isHovered ? 'translateY(-15px) scale(1.02)' : 'scale(1)',
        boxShadow: isHovered
            ? '0 20px 40px rgba(0,0,0,0.4)'
            : '0 -5px 15px rgba(0,0,0,0.1)',
    };



    return (
        <div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="file-card"
            style={dynamicStyles}
        >
            <span className="file-title">
                {item.mediaTitle}
                {item.categoryName && <span className="file-category"> ({item.categoryName})</span>}
            </span>

            {isHovered && (
                <div className="file-hint">
                    Click to open
                </div>
            )}
        </div>
    );
};

export default FileInstance;