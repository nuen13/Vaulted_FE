import React from 'react';


// Select category button component, used in CategoryFilter.jsx
// -> update media list based on category selected

// Props:
// - category: {id, name} object for this category
// - isSelected: boolean indicating if this category is currently selected
// - onClick: function to call when button is clicked (should update selected category in parent)
// send to parent component (CategoryFilter) when clicked, so it can update the media list based on selected category
// - onClick should pass the category object or just the ID back to the parent, depending on what the parent needs to filter the media list

// Logic:
// - If this category is selected, button should have a dark background (btn-dark)
// - If not selected, button should have no background/border (btn-outline-dark border-0)
// - Align all buttons to the right (align-self-end)




const CategoryButton = ({ category, isSelected, onClick }) => {
    return (
        <button
            type="button"
            onClick={() => onClick(category)}
            className={`btn m-1 ${isSelected
                    ? 'btn-dark' // Black background when selected
                    : 'btn-outline-dark border-0' // No background/border when not selected
                } align-self-end flex-nowrap`}
        >
            {/* {console.log("Rendering CategoryButton for category:", category.name, "isSelected:", isSelected)} */}
            {category.name}
        </button>

    
    
    );
};

export default CategoryButton;