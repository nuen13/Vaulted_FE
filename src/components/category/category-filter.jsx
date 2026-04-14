import React, { useState, useEffect } from 'react';
import './category-filter.css';
import { useDispatch, useSelector } from 'react-redux';
import CategoryButton from './category-button';
import { setCategory, fetchMediaByCategoryAndStatus } from '../../features/media/media-slice';
// ... other imports

const CategoryFilter = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Get dispatch and the current selection from Redux
    const dispatch = useDispatch();
    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Category/get-all-current-categories`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 2. Refactor Click Handler to use Redux
    const handleCategoryClick = (category) => {
        const categoryId = category ? category.id : null;
        dispatch(setCategory(categoryId));

        console.log("Selected Category ID:", categoryId, "Selected Status from Redux:", selectedStatus);

        dispatch(fetchMediaByCategoryAndStatus({
            categoryId: categoryId,
            status: selectedStatus
        }));
    };
    if (loading) return <div>Loading categories...</div>;

    return (
        <div className="d-flex flex-column gap-2">
            {/* "All" button logic */}
            <button
                className={`btn m-1 align-self-end ${selectedCategory === null ? 'btn-dark' : 'btn-outline-dark border-0'}`}
                onClick={() => handleCategoryClick(null)}
            >
                All
            </button>

            {categories.length > 0 ? (
                categories.map((category) => (
                    <CategoryButton
                        key={category.id}
                        category={category}
                        // Use Redux state to check if selected
                        isSelected={selectedCategory === category.id}
                        onClick={() => handleCategoryClick(category)}
                    />
                ))
            ) : (
                <p>No categories found.</p>
            )}
        </div>
    );
};

export default CategoryFilter;