// src/App.jsx

// import React and hooks
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';


// Import components
import MediaList from "./components/MediaComponents/media-list.jsx";
import ToolButtons from './components/ToolButtons/tool-buttons';
import AddMedia from './components/AddMedia/add-media-modal.jsx';
import PhotoGalleryModal from './components/MediaComponents/mediaPhotos/photo-gallery-modal.jsx';
import SettingsModal from './components/Settings/settings-modal.jsx';
import ShareModal from './components/Share/share-modal.jsx';
import ArchiveNotice from './components/ArchiveNotice/archive-notice.jsx';
import QuotesModal from './components/MediaComponents/mediaQuotes/quotes-modal.jsx';
import ReviewsModal from './components/MediaComponents/mediaReview/reviews-modal.jsx';


// import filters
import CategoryFilter from "./components/Filters/CategoryFilter/category-filter.jsx";
import StatusFilter from './components/Filters/StatusFilter/status-filter.jsx';
import ViewSwitcher from './components/Filters/ViewSwitcher/view-switcher.jsx';

// import slices
import { closeMediaFocus } from './slices/media-slice.js';
import { openShare } from './slices/share-slice.js';

import useScrollForwarding from './app/use-scroll-forwarding.js';


// Import styles
import './App.css'

// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----// 

export default function App() {

  // Focus - backdrop state for media details
  const dispatch = useDispatch();
  const selectedFocusId = useSelector((state) => state.media.selectedFocusId);
  const focusClosing = useSelector((state) => state.media.focusClosing);
  const firstItemId = useSelector((state) => state.media.items[0]?.id);

  // Wheel over the sidebars / margins scrolls the card list (not while an item is open)
  useScrollForwarding(!selectedFocusId);


  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleToolAction = (actionType) => {
    if (actionType === 'add') setShowAddForm(true);
    if (actionType === 'settings') setShowSettings(true);
    // Share the open item, or the first one in the list (another can be picked in the modal)
    if (actionType === 'share' && (selectedFocusId || firstItemId)) dispatch(openShare(selectedFocusId || firstItemId));
  };


  // ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----// 
  return (
    <div className={`App justify-content-between align-items-center gap-4`}>
      <div className={`app-content ${selectedFocusId ? 'dimmed' : ''}`}>


        {/* -- Modal -- */}
        <AddMedia show={showAddForm} handleClose={() => setShowAddForm(false)} />
        <PhotoGalleryModal />
        <SettingsModal show={showSettings} handleClose={() => setShowSettings(false)} />
        <ShareModal />
        <ArchiveNotice />
        <QuotesModal />
        <ReviewsModal />


        {/* -- Overlay -- */}
        {selectedFocusId && (
          <div
            className={`global-overlay ${focusClosing ? 'is-closing' : ''}`}
            onClick={() => dispatch(closeMediaFocus())}
          />
        )}



        <div className="flex-container d-flex flex-column mx-5">
          <h4 className="text-center p-3 mt-5">Media: Vaulted</h4>

          {/* -- Content Container -- */}
          <div className="content-container d-flex flex-row align-items-start">

            {/* - Status Filter - */}
            <div className="left-status-filter-container d-flex flex-column align-items-end p-2 gap-5">
              <div className="status-filter-container mb-5">
                <StatusFilter />
                <ViewSwitcher />
              </div>
            </div>

            {/* - Media Container - */}
            {/* The only part of the screen that scrolls; locked while an item is open */}
            <span className={`media-container align-items-center p-2 mx-3 ${selectedFocusId ? 'is-locked' : ''}`}>
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