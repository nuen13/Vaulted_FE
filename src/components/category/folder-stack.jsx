import React, { useState } from 'react';
import FileInstance from '../../features/mediaDetails/file-instance';


const FolderStack = ({ apiData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div>
      {apiData.map((item, index) => {
        const isHovered = hoveredIndex === index;
        const isPushedDown = hoveredIndex !== null && index > hoveredIndex;

        return (
          /* The KEY belongs on this outer div! */
          <div key={item.id} className="mt-5">
            <FileInstance
              item={item}
              index={index}
              total={apiData.length}
              isHovered={isHovered}
              isPushedDown={isPushedDown}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          </div>
        );
      })}
    </div>
  );
}

export default FolderStack;