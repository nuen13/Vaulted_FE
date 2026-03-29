import React, { useState } from 'react';

const FolderStack = ({ apiData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '100px'
    }}>
      {apiData.map((item, index) => {

        // Logic: If someone is hovering a folder ABOVE this one, push this one down.
      

            // 1. Is this specific folder hovered?
            const isHovered = hoveredIndex === index;

            // 2. Are we pushing folders below the hovered one down?
            const isPushedDown = hoveredIndex !== null && index > hoveredIndex;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'relative',
                  width: '400px',
                  height: '250px',
                  backgroundColor: item.color,
                  borderRadius: '24px 24px 10px 10px',

                  /* THE STACKING LOGIC */
                  // If hovered, jump to 999. Otherwise, use standard descending stack.
                  zIndex: isHovered ? 999 : (100 - index),

                  transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',

                  /* DYNAMIC MARGIN */
                  marginTop: index === 0 ? '0px' : (isPushedDown ? '20px' : '-180px'),

                  /* VISUALS */
                  // Change shadow direction when on top (pointing down instead of up)
                  boxShadow: isHovered
                    ? '0 15px 30px rgba(0,0,0,0.4)'
                    : '0 -5px 20px rgba(0,0,0,0.3)',

                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  cursor: 'pointer',

                  /* POP EFFECT */
                  // Move it slightly UP and make it bigger when it's the top z-index
                  transform: isHovered ? 'translateY(-10px) scale(1.03)' : 'scale(1)',
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.name}</span>
                {isHovered && (
                  <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.8 }}>
                    Viewing Folder
                  </p>
                )}
              </div>
            );
          })
        }
    </div>
  );
}
export default FolderStack;