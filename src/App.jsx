// src/App.jsx

// import React and hooks
import React, { useState } from 'react'


// Import components
import MediaList from "./features/media/media-list";
import ToolButtons from './components/tools/tool-buttons';
import AddMedia from './components/addMedia/add-media.jsx';

import CategoryFilter from "./components/category/category-filter";
import ProgressFilter from './components/progressFilter/progress-filter.jsx';

// Import styles
import './App.css'



export default function App() {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToolAction = (actionType) => {
    if (actionType === 'add') setShowAddForm(true);

  };

  return (
    <div className="App">
      <AddMedia show={showAddForm} handleClose={() => setShowAddForm(false)} />
      <div className="flex-container flex-column mx-5">
        <h4 className="text-center p-3">Media: Vaulted</h4>
        <div className="d-flex flex-row align-items-start">
          <div className="progress-filter-container">
              <ProgressFilter />
          </div>

          <span className="media-container align-items-center p-2 mx-5">
            <MediaList /> 
          </span>

          <div className="right-side-container d-flex flex-column align-items-end p-2 gap-5">
             <CategoryFilter />
             <ToolButtons onAction={handleToolAction} />
          </div>
        </div>
      </div>
    </div>
  );
}