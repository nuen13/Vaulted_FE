// components/Filters/CategoryFilter/category-filter.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CategoryButton from './category-button';

import { fetchAllCategories, selectAllCategories, selectCategoryLoading, selectCategoryError } from '../../../slices/category-slice';
import { setCategory, fetchMediaByCategoryAndStatus } from '../../../slices/media-slice';
import { selectCategoryCounts } from '../../../slices/filter-counts';

import '../filter-components.css';


// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
// Category "drawers": one row per category, edged in its color, with how many items it holds
const CategoryFilter = () => {
    const dispatch = useDispatch();

    const categories = useSelector(selectAllCategories);
    const loading = useSelector(selectCategoryLoading);
    const error = useSelector(selectCategoryError);
    const counts = useSelector(selectCategoryCounts);

    useEffect(() => {
        dispatch(fetchAllCategories());
    }, [dispatch]);

    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);

    const handleCategoryClick = (category) => {
        const categoryId = category ? category.id : null;
        dispatch(setCategory(categoryId));
        dispatch(fetchMediaByCategoryAndStatus({ categoryId, status: selectedStatus }));
    };

    if (loading && categories.length === 0) return <p className="filter-message">Loading categories…</p>;
    if (error) return <p className="filter-message">Couldn't load categories.</p>;

    // ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
    return (
        <nav className="category-filter" aria-label="Category">
            <span className="filter-heading">Drawers</span>
            {categories.length > 0 ? (
                <>
                    <button
                        type="button"
                        className={`filter-drawer ${selectedCategory === null ? 'is-active' : ''}`}
                        aria-pressed={selectedCategory === null}
                        onClick={() => handleCategoryClick(null)}
                    >
                        <span className="filter-row-label">All</span>
                        <span className="filter-row-count">{counts.total}</span>
                    </button>

                    {sortedCategories.map((category) => (
                        <CategoryButton
                            key={category.id}
                            category={category}
                            count={counts.byCategory.get(category.id) ?? 0}
                            isSelected={selectedCategory === category.id}
                            onClick={() => handleCategoryClick(category)}
                        />
                    ))}
                </>
            ) : (
                <p className="filter-message">No categories yet. Add one in Settings.</p>
            )}
        </nav>
    );
};

export default CategoryFilter;
