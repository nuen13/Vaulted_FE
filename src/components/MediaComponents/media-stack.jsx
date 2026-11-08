// -- file: src/components/MediaComponents/media-stack.jsx
// Folder view as a "sticky drawer": every card sticks near the top of the list, and the next
// card slides over it as you scroll. Covered cards tuck up, shrink and darken a little, so the
// last few show their top edge like files in a drawer. Scrolling is the browser's own (nothing
// here moves the list or changes its layout), so wheel, trackpad and touch momentum feel normal.

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

import FolderCard from './folder-card.jsx';


// --- --- --- --- --- // --- --- --- --- --- //

const MAX_CARD_HEIGHT = 600;  // px; a card is as tall as the list allows, up to this
const MIN_CARD_HEIGHT = 320;
const GAP = 24;               // px between cards before they stack
const STEP = 14;              // px of each covered card's top edge that shows above the next one
const MAX_DEPTH = 3;          // how many covered cards show an edge; deeper ones fade away
const SHRINK = 0.035;         // each level of covering shrinks a card this much
const DIM = 0.18;             // ...and darkens it this much
const STICK_TOP = 12 + MAX_DEPTH * STEP; // where the front card sticks (room above for the edges)

const COMPACT_CARD_HEIGHT = 124; // phones: cards show just their title bar (tap opens them)
const COMPACT_QUERY = '(max-width: 767.98px)'; // same breakpoint as folder-card.css

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Phones get short title cards: there the details put the cover photo first, which would
// hide the title of every card in the drawer.
const compactQuery = typeof window !== 'undefined' ? window.matchMedia(COMPACT_QUERY) : null;
const subscribeCompact = (cb) => {
  compactQuery?.addEventListener('change', cb);
  return () => compactQuery?.removeEventListener('change', cb);
};
const useCompact = () => useSyncExternalStore(subscribeCompact, () => !!compactQuery?.matches, () => false);

const MediaStack = ({ apiData }) => {
  const selectedFocusId = useSelector((state) => state.media.selectedFocusId);

  const stackRef = useRef(null);
  const slotRefs = useRef([]);
  const [size, setSize] = useState({ list: 0, padTop: 24, padBottom: 48 });
  const [seen, setSeen] = useState(() => new Set()); // cards that came near the screen (details loaded)

  const compact = useCompact();
  const cardHeight = compact
    ? COMPACT_CARD_HEIGHT
    : size.list
      ? Math.round(clamp(size.list - STICK_TOP - GAP, MIN_CARD_HEIGHT, MAX_CARD_HEIGHT))
      : MAX_CARD_HEIGHT;

  // -- Size the cards to the list's height (and follow window resizes) --
  useEffect(() => {
    const scroller = stackRef.current?.closest('.media-container');
    if (!scroller) return;
    const ro = new ResizeObserver(() => {
      // The list's own padding (App.css) differs on phones, so measure it
      const cs = getComputedStyle(scroller);
      const next = { list: scroller.clientHeight, padTop: parseFloat(cs.paddingTop) || 0, padBottom: parseFloat(cs.paddingBottom) || 0 };
      setSize((s) => (s.list === next.list && s.padTop === next.padTop && s.padBottom === next.padBottom ? s : next));
    });
    ro.observe(scroller);
    return () => ro.disconnect();
  }, []);

  // -- Only cards that come near the screen render their full details --
  // (each one loads its photos, so a long list doesn't fire every request at once)
  useEffect(() => {
    const scroller = stackRef.current?.closest('.media-container');
    if (!scroller) return;
    const io = new IntersectionObserver((entries) => {
      const ids = entries.filter((e) => e.isIntersecting).map((e) => e.target.dataset.id);
      if (ids.length) setSeen((prev) => (ids.every((id) => prev.has(id)) ? prev : new Set([...prev, ...ids])));
    }, { root: scroller, rootMargin: '600px 0px' });
    slotRefs.current.slice(0, apiData.length).forEach((slot) => slot && io.observe(slot));
    return () => io.disconnect();
  }, [apiData]);

  // -- Tuck covered cards up, smaller and darker, in step with the scroll --
  // Reads every position first, then writes transforms only (no layout changes), once per frame.
  useLayoutEffect(() => {
    const scroller = stackRef.current?.closest('.media-container');
    if (!scroller) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const slots = slotRefs.current.slice(0, apiData.length);
      const tops = slots.map((slot) => (slot ? slot.getBoundingClientRect().top : 0));

      // cover[i]: how far the next card has slid over card i (0 = not at all, 1 = fully)
      const cover = tops.map((top, i) =>
        i === tops.length - 1 ? 0 : clamp(1 - (tops[i + 1] - top) / (cardHeight + GAP), 0, 1));

      // depth: how many cards are stacked on top of this one (fractional while sliding)
      let depth = 0;
      for (let i = slots.length - 1; i >= 0; i--) {
        depth = i === slots.length - 1 ? 0 : depth + cover[i];
        const card = slots[i]?.firstElementChild;
        if (!card) continue;
        const d = Math.min(depth, MAX_DEPTH);
        card.style.transform = depth > 0.001 ? `translateY(${-d * STEP}px) scale(${1 - d * SHRINK})` : '';
        card.style.filter = depth > 0.001 ? `brightness(${1 - d * DIM})` : '';
        card.style.opacity = depth > MAX_DEPTH ? String(clamp(MAX_DEPTH + 1 - depth, 0, 1)) : '';
        // Covered folders hide their tab text (only a sliver of each tab shows, and the
        // half-cut labels would overlap). A data attribute, so React re-renders leave it alone.
        if (depth > 0.35) card.dataset.covered = ''; else delete card.dataset.covered;
      }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [apiData.length, cardHeight]);

  // Sticky offsets count from inside the list's top padding. The front card sits STICK_TOP
  // from the list's top edge, and the first card starts there too (room above for the edges).
  const stickAt = Math.max(0, STICK_TOP - size.padTop);
  const padTop = stickAt;
  // At the very bottom, the last card should rest exactly where the others stuck: add room
  // below it if the list is tall, or pull the list's own bottom padding in if it's short
  // (otherwise the last cards would scroll up past their spot).
  const extra = size.list - STICK_TOP - cardHeight - size.padBottom;

  return (
    <div ref={stackRef} className="media-stack" style={{ gap: GAP, paddingTop: padTop, paddingBottom: Math.max(0, extra), marginBottom: Math.min(0, extra) }}>
      {apiData.map((item, index) => {
        const isSelected = item.id === selectedFocusId;
        const id = String(item.id ?? index);

        // The slot holds the card's place in the list and does the sticking. When a card is
        // opened it's centered over the screen, but its slot stays, so nothing below moves.
        return (
          <div
            key={id}
            data-id={id}
            ref={(el) => { slotRefs.current[index] = el; }}
            className={`media-stack-slot ${isSelected ? 'is-open' : ''}`}
            style={{
              top: stickAt,
              height: cardHeight,
              zIndex: isSelected ? 1000 : index + 1, // later cards slide over earlier ones
            }}
          >
            <FolderCard
              item={item}
              isSelected={isSelected}
              showDetails={isSelected || (!compact && seen.has(id))}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MediaStack;
