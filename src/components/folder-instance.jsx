import React, { useState } from 'react';

// 1. BASE COMPONENT: Handles individual folder styling and receiving push/hover states
const FolderInstance = ({ item, index, total, isPushedDown, isHovered, onHover, onLeave }) => {
  const baseZIndex = total - index;

  return (
    <div 
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        width: '400px',
        height: '250px',
        backgroundColor: item.color,
        borderRadius: '24px 24px 10px 10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        
        /* THE STACKING LOGIC */
        // Instant z-index change to jump to front, transition for movement
        zIndex: isHovered ? 999 : baseZIndex, 
        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), margin-top 0.4s ease, z-index 0s',

        /* DYNAMIC MARGIN & MOVEMENT */
        // We use the parent's "isPushedDown" state to add gap
        marginTop: index === 0 ? '0px' : (isPushedDown ? '20px' : '-185px'),
        
        /* VISUAL EFFECTS */
        transform: isHovered ? 'translateY(-15px) scale(1.03)' : 'scale(1)',
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0,0,0,0.4)' 
          : '0 -5px 15px rgba(0,0,0,0.2)',
      }}
    >
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.name}</span>
      {isHovered && <small style={{ marginTop: '8px', opacity: 0.8 }}>Active Folder</small>}
    </div>
  );
};

// 2. PARENT COMPONENT: Manages the list and the shared hover state
const FolderStack = ({ apiData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '120px',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0' 
    }}>
      {apiData.map((item, index) => (
        <FolderInstance 
          key={item.id}
          item={item}
          index={index}
          total={apiData.length}
          // Only push down folders that come AFTER the one being hovered
          isPushedDown={hoveredIndex !== null && index > hoveredIndex}
          isHovered={hoveredIndex === index}
          onHover={() => setHoveredIndex(index)}
          onLeave={() => setHoveredIndex(null)}
        />
      ))}
    </div>
  );
};

export default FolderStack;