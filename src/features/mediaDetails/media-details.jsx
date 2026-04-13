import React from 'react';
import './media-details.css';
import ReviewItem from './review-item';



const MediaDetails = ({ item }) => {

    // Drop box for Status
    // with 
    // Planning, Complete, Watching, Paused, Dropped

    const statusOptions = ['Planning', 'Complete', 'Watching', 'Paused', 'Dropped'];

    const percentage = (item.averageScore / 10) * 100;
    const lineStyle = {
        background: `linear-gradient(to right, #000 ${percentage}%, #fff ${percentage}%)`
    };

    const dotStyle = {
        left: `${percentage}%`
    };


    return (
        <div className="media-details-container d-flex flex-row justify-content-between align-items-start gap-4 p-4">

            {/* start top */}
            <div className="media-details d-flex flex-column justify-content-start 
                align-items-start gap-3">

                {/* Media Title */}
                <div className="file-title">
                    {item.mediaTitle}
                </div>


                {/* Score */}
                <div className="score-container">
                    Score: {item.averageScore}
                    <div className="progress-line-wrapper">
                        <div className="progress-line" style={lineStyle}></div>
                        <div className="progress-dot" style={dotStyle}></div>
                    </div>
                </div>


                <div className="category-container">
                    <div className="category">
                        Category: {item.categoryName}
                    </div>

                </div>

                <div className="quotes-container">
                    <div className="quote-title">Notable Quotes:</div>
                    <div className="quote-content">
                        <p>quote are here</p>
                    </div>
                </div>

                <div className="review-container d-flex flex-column">
                    <div className="review-title">Latest Review:</div>

                    <div className="review-content">
                        <ReviewItem item={item} />
                    </div>

                    <button className="btn btn-outline-dark border-0 align-self-start self-align-center mx-auto mt-3">View All Reviews</button>

                </div>

            </div>
            <div className="right-container gap-3">

                
                
                <div className="status-container">
                    Status:
                    <select className="status-dropdown">
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                <div className = "cover-photo-container">
                    <img src={item.coverPhotoUrl} alt={`${item.mediaTitle} cover`} className="cover-image " />
                </div>
            </div>
        </div>
    );

};

export default MediaDetails;