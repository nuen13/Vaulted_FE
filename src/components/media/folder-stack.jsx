// -- file: src/components/media/folder-stack.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import FileInstance from './mediaDetails/file-instance';


// --- --- --- --- --- // --- --- --- --- --- //

const FolderStack = ({ apiData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const selectedFocusId = useSelector((state) => state.media.selectedFocusId);
  const isLocked = selectedFocusId !== null;

  const handleSelect = (index) => {
    // If clicking the same item, unselect it. Otherwise, select the new one.
    setSelectedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="relative">
      {apiData.map((item, index) => {
        // Priority 1: Selection Logic
        const isSelected = item.id === selectedFocusId;
        
        
        // Determine effective "active" index for the stack push/pull
        // If something is selected, that takes priority over hover
        const activeIndex = selectedIndex !== null ? selectedIndex : hoveredIndex;

        // Visual States
        const isHovered = hoveredIndex === index;
        const isPushedDown = activeIndex !== null && index > activeIndex;
        const isPulledUp = activeIndex !== null && index < activeIndex;

        return (
          <div 
            key={item.id || index} 
            className="transition-all duration-300 ease-in-out"
            onClick={() => handleSelect(index)}
          >
            <FileInstance
              item={item}
              index={index}
              total={apiData.length}
              isHovered={isHovered}
              isPulledUp={isPulledUp}
              isPushedDown={isPushedDown}
              isSelected={isSelected}
              onHover={() => !isLocked && setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FolderStack;