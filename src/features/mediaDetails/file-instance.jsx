import React, {useState, useEffect} from 'react';
import './file-instance.css';
import MediaDetails from './media-details';

const FileInstance = ({ item, index, total, isPushedDown, isPulledUp, isHovered, onHover, onLeave }) => {

   
    const [selectedStatus, setSelectedStatus] = useState(item.status || 'Planning');
    const handleUpdateStatus = (newStatus) => {
        setSelectedStatus(newStatus);
    }






    const baseZIndex = total + index;
    const getCategoryColor = (category) => {
        switch (category) {
            case 'anime':
                return '#a1a1a1'; // Tomato
            case 'movies':
                return '#1e90ff';
            case 'music':
                return '#32cd32';
            case 'books':
                return '#ffa500';
            case 'youtube video':
                return '#ff5cad';
            default:
                return '#d43b0c'; // Default color
        }
    };
    const movement = 15; // Adjustment amount

    const dynamicStyles = {
        backgroundColor: getCategoryColor(item.categoryName),
        zIndex: isHovered ? 999 : baseZIndex,

        // Negative margins create the "stacked" look
        // When an item is pushed/pulled, we reduce the overlap (from -400px to -10px)
        marginTop: index === 0 ? '0px' : (isPushedDown ? '-10px' : '-550px'),

        // Combining the hover lift and the squeeze movement
        transform: isHovered
            ? 'translateY(-15px) scale(1.02)'
            : isPulledUp
                ? `translateY(${movement}px)`
                : isPushedDown
                    ? `translateY(-${movement}px)`
                    : 'translateY(0px)',

        transition: 'all 0.3s ease-out', // "all" covers margin, transform, and shadow

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

            {!isHovered ? (
                <div className="file-snippet px-3">

                    <span className="file-title">
                        {item.categoryName} - {item.mediaTitle}
                    </span>

                    <span className="file-status align-self-center justify-self-end">
                        Status: {item.status}
                    </span>
                </div>


            ) : (
                <MediaDetails item={item} onUpdateStatus={handleUpdateStatus} />
            )}


        </div>
    );
};

export default FileInstance;