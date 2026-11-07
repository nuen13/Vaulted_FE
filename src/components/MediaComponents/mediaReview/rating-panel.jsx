// -- file: src/components/MediaComponents/mediaReview/rating-panel.jsx
import React from 'react';

import RatingSlider from '../mediaDetails/rating-slider.jsx';

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// The rating pill (dropdown) + slider, always showing the same value.
// Used for a new entry (pop-up) and when editing an entry (on the card).
const RatingPanel = ({ id, value, onChange }) => (
    <div className="rating-panel">
        <div className="rating-panel-header">
            <label className="rating-panel-label" htmlFor={id}>Rating</label>
            <div className="rating-select-wrap">
                {/* What you see; the real <select> lies invisibly on top so a click opens it */}
                <span className="rating-select-value">{value}</span>
                <select id={id} className="rating-select" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))}>
                    {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className="rating-select-max">/10</span>
                <i className="fa-solid fa-chevron-down rating-select-chevron" aria-hidden="true"></i>
            </div>
        </div>
        <RatingSlider value={value} onChange={onChange} />
        <div className="rating-scale" aria-hidden="true">
            <span>1</span>
            <span>10</span>
        </div>
    </div>
);

export default RatingPanel;
