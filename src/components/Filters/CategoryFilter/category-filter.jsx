// components/Filters/CategoryFilter/category-filter.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CategoryButton from './category-button';


import { fetchAllCategories, selectAllCategories, selectCategoryLoading, selectCategoryError } from '../../../slices/category-slice';
import { setCategory, fetchMediaByCategoryAndStatus } from '../../../slices/media-slice';

import '../filter-components.css';


// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----// 
const CategoryFilter = () => {
    const dispatch = useDispatch();


    // -- Fetching categories from Redux store -- //
    const categories = useSelector(selectAllCategories);
    const loading = useSelector(selectCategoryLoading);
    const error = useSelector(selectCategoryError);

    useEffect(() => {
        dispatch(fetchAllCategories());
    }, [dispatch]);


    // -- re-ordering categories based on the length of the words in the category name -- //
    const sortedCategories = [...categories].sort((a, b) => a.name.length - b.name.length);


    // -- -- -- -- //    


    // -- Check filter states from Redux store for button styling and media fetching -- //
    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);

    const handleCategoryClick = (category) => {
        const categoryId = category ? category.id : null;
        dispatch(setCategory(categoryId));

        dispatch(fetchMediaByCategoryAndStatus({
            categoryId: categoryId,
            status: selectedStatus
        }));
    };

    // -- -- -- -- //    

    // -- Handle loading and error states for categories -- //
    if (loading) return <div>Loading categories...</div>;
    if (error) return <div>Error: {error}</div>;

    // ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----// 
    return (

        <div className="category-filter d-flex flex-column gap-2">
            {categories.length > 0 ? (
                <>
                    {/* -- All Button -- */}
                    <button
                        type="button"
                        className={`btn m-1 border-0 align-self-end text-nowrap ${selectedCategory === null ? 'btn-dark' : 'btn-outline-dark'
                            }`}
                        onClick={() => handleCategoryClick(null)}
                    >
                        All
                    </button>

                    {sortedCategories.map((category) => (
                        <CategoryButton
                            key={category.id}
                            category={category}
                            isSelected={selectedCategory === category.id}
                            onClick={() => handleCategoryClick(category)}
                        />
                    ))}
                </>
            ) : (
                /* Logic for when length is 0 */
                <p className="text-muted">No categories found.</p>
            )}
        </div>
    );
};

export default CategoryFilter;