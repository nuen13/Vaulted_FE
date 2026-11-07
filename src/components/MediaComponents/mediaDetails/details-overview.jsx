import React from 'react';

import QuoteCarousel from '../mediaQuotes/quote-carousel.jsx';
import ReviewList from '../mediaReview/review-list.jsx';

import './media-details.css';

// Left side of an item's details: category + rating, title, quotes, and Review / Journal.
// Quotes are a carousel; entries are a list (scroll down). Adding and editing happen in pop-ups.
const DetailsOverview = ({ item }) => {
    const hasRating = item?.averageRating != null && Number(item.averageRating) > 0;

    return (
        <>
            {/* Category tag + average rating */}
            <div className="details-tags">
                <span className="details-category-tag">{item?.categoryName}</span>
                <span className="details-rating-chip" title="Average of your ratings">
                    <i className="fa-solid fa-star"></i> {hasRating ? Number(item.averageRating).toFixed(1) : '–'}<span className="opacity-75">/10</span>
                </span>
                {item?.archived && <span className="details-archived-tag"><i className="fa-solid fa-box-archive"></i> Archived</span>}
            </div>

            {/* Media Title */}
            <h2 className="details-title">
                {item?.mediaTitle}
            </h2>

            {/* Notable quotes carousel */}
            <QuoteCarousel mediaId={item?.id} />

            {/* Review / Journal: all entries, newest first. Write / Edit open the pop-up. */}
            <ReviewList mediaId={item?.id} />
        </>
    );
}

export default DetailsOverview;
