// src/App.jsx

// import React and hooks
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';


// Import components
import MediaList from "./components/media/media-list.jsx";
import ToolButtons from './components/tools/tool-buttons';
import AddMedia from './components/addMedia/add-media.jsx';


// import filters
import CategoryFilter from "./components/Filters/categoryFilter/category-filter.jsx";
import ProgressFilter from './components/Filters/progressFilter/progress-filter.jsx';

// import slices
import { selectMediaFocus, clearSelectedFocus } from './slices/media-slice.js';


// Import styles
import './App.css'



export default function App() {

  // Focus - backdrop state for media details
  const dispatch = useDispatch();
  const selectedFocusId = useSelector((state) => state.media.selectedFocusId);
  console.log('Selected Focus ID:', selectedFocusId); // Debugging log

  // Lock Scroll when media details is open
  useEffect(() => {
    if (selectedFocusId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedFocusId]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleToolAction = (actionType) => {
    if (actionType === 'add') setShowAddForm(true);

  };

  return (
    <div className={`App justify-content-between align-items-center gap-4`}>
      <div className={`app-content ${selectedFocusId ? 'dimmed' : ''}`}>
        <AddMedia show={showAddForm} handleClose={() => setShowAddForm(false)} />

        {selectedFocusId && (
          <div
            className="global-overlay"
            onClick={() => dispatch(clearSelectedFocus())}
          />
        )}
        <div className="flex-container d-flex flex-column mx-5">
          {/* TITLE */}
          <h4 className="text-center p-3 mt-5">Media: Vaulted</h4>

          {/* Content Container */}
          <div className="content-container d-flex flex-row align-items-start">

            {/* Progress Filter */}
            <div className="left-container d-flex flex-column align-items-end p-2 gap-5">
              <div className="progress-filter-container mb-5">
                <ProgressFilter />
              </div>

            </div>

            {/* Media List */}
            <span className="media-container align-items-center p-2 mx-5">
              <MediaList />
            </span>


            {/* Right Side Container */}
            <div className="right-filter-container d-flex flex-column align-items-end p-2 gap-5">
              {/* Category Filter */}
              <CategoryFilter />

              {/* Tool Buttons */}
              <ToolButtons onAction={handleToolAction} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}