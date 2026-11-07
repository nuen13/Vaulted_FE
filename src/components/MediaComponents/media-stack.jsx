// -- file: src/components/MediaComponents/media-stack.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import FolderCard from './folder-card.jsx';


// --- --- --- --- --- // --- --- --- --- --- //

const CARD_HEIGHT = 600; // px; same as .file-card in folder-card.css
const PEEK = 80;               // px of each card that shows above the next one
const HOVER_INTENT_MS = 250;   // rest on a card this long before it's brought to the middle
const USER_SCROLL_QUIET_MS = 500; // ...and only if you haven't scrolled yourself just now
const CENTER_LOCK_MS = 700;    // while the list glides, hover doesn't change
const LEAVE_DELAY_MS = 120;    // leaving the stack: wait a moment before closing the card

const MediaStack = ({ apiData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const selectedFocusId = useSelector((state) => state.media.selectedFocusId);
  const isLocked = selectedFocusId !== null;

  // Derive the selected index from Redux so closing the overlay also resets the stack
  const selectedIndex = isLocked ? apiData.findIndex((item) => item.id === selectedFocusId) : -1;

  // Determine effective "active" index for the stack push/pull
  // If something is selected, that takes priority over hover
  const activeIndex = selectedIndex !== -1 ? selectedIndex : hoveredIndex;

  // -- Which card is hovered --
  // Decided by real mouse movement only. When cards move under a still mouse (a card
  // grows, the list glides), the browser reports the mouse as being over a new card even
  // though you didn't move it; following that made the hover jump from card to card.
  const stackRef = useRef(null);
  const slotRefs = useRef([]);
  const lastPointer = useRef({ x: -1, y: -1 });
  const leaveTimer = useRef(null);
  const lastUserScroll = useRef(0);
  const gliding = useRef(false);   // true while the list scrolls a card to the middle
  const glideTimer = useRef(null);

  const movedSinceLast = (e) => {
    const moved = e.clientX !== lastPointer.current.x || e.clientY !== lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    return moved;
  };

  const handlePointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!movedSinceLast(e) || isLocked || gliding.current) return;
    clearTimeout(leaveTimer.current);
    const index = slotRefs.current.findIndex(slot => slot?.contains(e.target));
    if (index !== -1 && index !== hoveredIndex) setHoveredIndex(index);
  };

  const handlePointerLeave = (e) => {
    if (e.pointerType !== 'mouse' || gliding.current) return;
    if (!movedSinceLast(e)) return; // the stack moved away from the mouse, not the other way round
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setHoveredIndex(null), LEAVE_DELAY_MS);
  };

  // Where the mouse is anywhere on the page (for the check after a glide)
  const mouse = useRef({ x: -1, y: -1 });
  useEffect(() => {
    const track = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('pointermove', track, { passive: true });
    return () => window.removeEventListener('pointermove', track);
  }, []);

  // Scrolling yourself (wheel / touch) postpones the glide to the middle
  useEffect(() => {
    const scroller = stackRef.current?.closest('.media-container');
    if (!scroller) return;
    const noteUserScroll = () => { lastUserScroll.current = Date.now(); };
    scroller.addEventListener('wheel', noteUserScroll, { passive: true });
    scroller.addEventListener('touchmove', noteUserScroll, { passive: true });
    return () => {
      scroller.removeEventListener('wheel', noteUserScroll);
      scroller.removeEventListener('touchmove', noteUserScroll);
    };
  }, []);

  useEffect(() => () => {
    clearTimeout(leaveTimer.current);
    clearTimeout(glideTimer.current);
  }, []);

  // -- Bring the hovered card to the middle of the screen --
  // The target is worked out from the stack's layout (every card above the hovered one
  // shows PEEK px), not measured on screen, so it's right even while cards are still
  // animating into place.
  useEffect(() => {
    if (hoveredIndex === null || isLocked) return;
    let timer;
    const center = () => {
      // You're still scrolling: wait until it's been quiet for a moment, then try again
      const sinceUserScroll = Date.now() - lastUserScroll.current;
      if (sinceUserScroll < USER_SCROLL_QUIET_MS) {
        timer = setTimeout(center, USER_SCROLL_QUIET_MS - sinceUserScroll);
        return;
      }
      const stack = stackRef.current;
      const scroller = stack?.closest('.media-container');
      if (!scroller) return;

      const stackTop = stack.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      const cardMiddle = stackTop + hoveredIndex * PEEK + CARD_HEIGHT / 2;
      const target = cardMiddle - scroller.clientHeight / 2;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      const top = Math.max(0, Math.min(target, maxScroll));
      if (Math.abs(top - scroller.scrollTop) < 24) return; // already in the middle

      gliding.current = true;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scroller.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });

      // The hovered card stays hovered while it glides; the next real mouse move decides again.
      // If the mouse left the stack meanwhile (moves were ignored), un-hover it now.
      glideTimer.current = setTimeout(() => {
        gliding.current = false;
        const { x, y } = mouse.current;
        const under = document.elementFromPoint(x, y);
        if (!stackRef.current?.contains(under)) setHoveredIndex(null);
      }, CENTER_LOCK_MS);
    };
    timer = setTimeout(center, HOVER_INTENT_MS);
    return () => clearTimeout(timer);
  }, [hoveredIndex, isLocked]);

  return (
    // has-focus: a card is hovered or open, so the others are darkened (folder-card.css)
    <div
      ref={stackRef}
      className={`media-stack ${activeIndex !== null ? 'has-focus' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {apiData.map((item, index) => {
        // Priority 1: Selection Logic
        const isSelected = item.id === selectedFocusId;

        // Visual States
        const isHovered = hoveredIndex === index;
        const isPushedDown = activeIndex !== null && index > activeIndex;
        const isPulledUp = activeIndex !== null && index < activeIndex;

        // The wrapper holds each card's place in the stack: a fixed height and the overlap
        // with the card above. That way, when a card is opened (centered over the screen),
        // the cards below it don't jump up into the gap.
        return (
          <div
            key={item.id || index}
            ref={(el) => { slotRefs.current[index] = el; }}
            className="media-stack-slot"
            style={{
              height: CARD_HEIGHT,
              marginTop: index === 0 ? 0 : (isPushedDown ? -10 : -(CARD_HEIGHT - PEEK)),
            }}
          >
            <FolderCard
              item={item}
              index={index}
              total={apiData.length}
              isHovered={isHovered}
              isActive={index === activeIndex}
              isPulledUp={isPulledUp}
              isPushedDown={isPushedDown}
              isSelected={isSelected}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MediaStack;
