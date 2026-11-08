// components/Filters/CategoryFilter/category-button.jsx
import React from 'react';

import { DEFAULT_CATEGORY_COLOR } from '../../../slices/category-slice';

// One category "drawer" in the CategoryFilter: its name on a strip edged in the category's
// color (editable in Settings), and how many items it holds. Dark when selected.
const CategoryButton = ({ category, count, isSelected, onClick }) => {
    return (
        <button
            type="button"
            onClick={() => onClick(category)}
            aria-pressed={isSelected}
            className={`filter-drawer ${isSelected ? 'is-active' : ''}`}
            style={{ '--drawer-color': category.color || DEFAULT_CATEGORY_COLOR }}
        >
            <span className="filter-row-label">{category.name}</span>
            <span className="filter-row-count">{count}</span>
        </button>
    );
};

export default CategoryButton;
