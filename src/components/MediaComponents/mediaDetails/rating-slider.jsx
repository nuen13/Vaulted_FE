// -- file: src/components/MediaComponents/mediaDetails/rating-slider.jsx
import React from 'react';

// Rating 1–10 as a slider: a thin line, a blurred blue trail over the part you've
// slid past, and a small triangle that spins as it moves along.
//
// How it's built: a real <input type="range"> sits on top, invisible, so dragging,
// clicking the line and arrow keys all work for free. The line, trail and triangle
// underneath are just drawings that follow its value (via the CSS variables below).

const MIN = 1;
const MAX = 10;
const KNOB = 22;            // px; the invisible thumb's size in media-details.css
const SPIN_PER_STEP = 72;   // degrees per rating step: 1 → 10 is almost two full turns

// Same math the browser uses to place the thumb, so the triangle sits right under it
const positionOf = (value) => `calc(${KNOB / 2}px + (100% - ${KNOB}px) * ${(value - MIN) / (MAX - MIN)})`;

// Triangle shade: black at 1, white at 10. In hsl(), the last number is lightness:
// 0% is black, 100% is white, so we just turn the rating into a percentage.
const shadeOf = (value) => `hsl(0 0% ${Math.round(((value - MIN) / (MAX - MIN)) * 100)}%)`;

const RatingSlider = ({ value, onChange }) => (
    <div
        className="rating-slider"
        style={{
            '--knob-at': positionOf(value),
            '--spin': `${(value - MIN) * SPIN_PER_STEP}deg`,
            '--triangle-color': shadeOf(value),
        }}
    >
        <div className="rating-slider-track" aria-hidden="true" />
        <div className="rating-slider-trail" aria-hidden="true" />

        <svg className="rating-slider-triangle" viewBox="0 0 20 20" aria-hidden="true">
            {/* equilateral triangle centered on (10, 10), so it spins around its middle */}
            <polygon points="10,2.5 17,15 3,15" />
        </svg>

        <input
            type="range"
            className="rating-slider-input"
            min={MIN}
            max={MAX}
            step={1}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            aria-label="Rating"
            aria-valuetext={`${value} out of 10`}
        />
    </div>
);

export default RatingSlider;
