// -- file: src/app/use-scroll-forwarding.js
import { useEffect } from 'react';

// The page itself never scrolls (only the card list does), so a mouse wheel over the title,
// the sidebars or the empty margins would do nothing. This sends those wheel turns to the
// card list instead, unless the mouse is over something that can scroll that way itself
// (the status / category lists, the card list, a scrolling box inside a card...).

const LINE_HEIGHT = 16; // px per "line" when the wheel reports lines (Firefox)

// Can this element (or one around it, up to the page) scroll further in direction dy?
const canScroll = (el, dy) => {
    for (let node = el; node && node !== document.body; node = node.parentElement) {
        const { overflowY } = getComputedStyle(node);
        if (overflowY !== 'auto' && overflowY !== 'scroll') continue;
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const atTop = node.scrollTop <= 0;
        const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) return true;
    }
    return false;
};

const useScrollForwarding = (enabled) => {
    useEffect(() => {
        if (!enabled) return;

        const onWheel = (e) => {
            if (e.ctrlKey || e.deltaY === 0) return;                 // pinch-zoom / sideways only
            if (document.querySelector('.modal.show')) return;       // a pop-up is open
            const list = document.querySelector('.media-container');
            if (!list || list.contains(e.target)) return;            // the list scrolls itself
            const dy = e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT : e.deltaY;
            if (canScroll(e.target, dy)) return;                     // let that box scroll

            // Wheel clicks are big jumps: glide them. Trackpads send many small steps: follow directly.
            list.scrollBy({ top: dy, behavior: Math.abs(dy) >= 50 ? 'smooth' : 'auto' });
        };

        window.addEventListener('wheel', onWheel, { passive: true });
        return () => window.removeEventListener('wheel', onWheel);
    }, [enabled]);
};

export default useScrollForwarding;
