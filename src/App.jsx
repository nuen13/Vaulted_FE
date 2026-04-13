import { useState } from 'react'

import './App.css'
import React from "react";
import MediaList from "./features/media/media-list";

import CategoryFilter from "./components/category/category-filter";

import ToolButtons from './components/tools/tool-buttons';
import AddMedia from './components/addMedia/add-media.jsx';


import './App.css'



export default function App() {
  const testClassname = "btn m-1 btn-outline-dark border-0 align-self-start";
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToolAction = (actionType) => {
    if (actionType === 'add') {
      setShowAddForm(true); 
    } else if (actionType === 'share') {
      console.log("Share logic here");
    }
  };

  return (
    <div className="App">
      {/* ADD THIS LINE HERE */}
      <AddMedia show={showAddForm} handleClose={() => setShowAddForm(false)} />

      <div className="flex-container flex-column mx-5">
        <h4 className="text-center p-3">Media: Vaulted</h4>

        <div className="d-flex flex-row align-items-start">
          <span className="progress-filter-container align-items-start p-2 ">
            <div className="d-flex flex-column align-items-end p-2">
              <h5 className={testClassname}>Progress Filter</h5>
              <button className={testClassname}>All</button>
              <button className={testClassname}>Watching</button>
              <button className={testClassname}>Completed</button>
              <button className={testClassname}>Planning to Watch</button>
            </div>
          </span>

          <span className="media-container align-items-center p-2 mx-5">
            <MediaList />
          </span>

          <div className="right-side-container d-flex flex-column align-items-end p-2 gap-5">
            <span className="category-filter align-items-end p-2 mb-5">
              <CategoryFilter />
            </span>

            <span className="tools-container align-items-end p-2 mt-5">
              <ToolButtons onAction={handleToolAction} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}