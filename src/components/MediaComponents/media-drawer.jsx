// -- file: src/components/MediaComponents/media-drawer.jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MediaFocusCard from './media-focus-card.jsx';
import { selectMediaFocus } from '../../slices/media-slice.js';
import { selectAllCategories, DEFAULT_CATEGORY_COLOR } from '../../slices/category-slice.js';

import './media-drawer.css';

// --- --- --- --- --- // --- --- --- --- --- //

// Drawer view: a card-index drawer seen from above. Every item is an outlined folder
// showing only its tab (number + title), grouped by category; each tab carries a light
// tint of its category color. Folders widen toward the front for perspective.
// Hover pops a folder up (the ones in front part to make room); click opens it.

const TAB_H = 30;          // tab height
const GAP = 34;            // distance between folder edges
const BODY = 14;           // how far each folder shows below its edge before the next one covers it
const FRONT_BODY = 96;     // the front folder shows more of itself
const R = 10;              // folder corner radius
const FLARE = 12;          // width of the curve where a tab rises from the folder edge

const pad = (n, size) => String(n).padStart(size, '0');
const byText = (a, b) => (a || '').localeCompare(b || '', undefined, { sensitivity: 'base' });

// Grouped by category (A–Z), then by title within each category
const buildRows = (items) => {
    const sorted = [...items].sort((a, b) =>
        byText(a.categoryName, b.categoryName) || byText(a.mediaTitle, b.mediaTitle));
    return sorted.map((item, index) => ({ key: item.id, item, number: index + 1 }));
};

// The tab's curved bump: rises from the folder edge, runs along the top, comes back down
const tabCurve = ({ x, width }) =>
    `L ${x - FLARE} ${TAB_H}
        C ${x - 2} ${TAB_H}, ${x - 4} 0, ${x + 8} 0
        L ${x + width - 8} 0
        C ${x + width + 4} 0, ${x + width + 2} ${TAB_H}, ${x + width + FLARE} ${TAB_H}`;

// Outline of one folder's top edge, with its tab
const edgePath = (w, h, tab) =>
    `M 0 ${h} L 0 ${TAB_H + R} Q 0 ${TAB_H} ${R} ${TAB_H}
        ${tabCurve(tab)}
        L ${w - R} ${TAB_H} Q ${w} ${TAB_H} ${w} ${TAB_H + R} L ${w} ${h}`;

// Just the tab area, for the category tint
const tabAreaPath = (tab) => `M ${tab.x - FLARE} ${TAB_H} ${tabCurve(tab)} Z`;


const MediaDrawer = ({ items }) => {
    const dispatch = useDispatch();
    const categories = useSelector(selectAllCategories);
    const colorOf = (categoryId) => categories.find(c => c.id === categoryId)?.color || DEFAULT_CATEGORY_COLOR;

    // The drawer is drawn in pixels, so track its width: measured right away when it
    // mounts (no blank first frame), then kept up to date as the window resizes
    const [stageWidth, setStageWidth] = useState(0);
    const observerRef = useRef(null);
    const stageRef = useCallback((node) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!node) return;
        setStageWidth(node.clientWidth);
        observerRef.current = new ResizeObserver(([entry]) => setStageWidth(Math.floor(entry.contentRect.width)));
        observerRef.current.observe(node);
    }, []);
    useEffect(() => () => observerRef.current?.disconnect(), []);

    const rows = buildRows(items);
    const narrow = stageWidth < 560; // phones: one tab column, wider tabs
    const last = rows.length - 1;

    // Each row: width grows toward the front (perspective), tab placed in its column
    const layout = rows.map((row, i) => {
        const depth = last > 0 ? i / last : 1;
        const width = Math.round(stageWidth * (0.82 + 0.18 * depth));
        const left = Math.round((stageWidth - width) / 2);
        const height = TAB_H + (i === last ? FRONT_BODY : GAP + BODY);

        // Two staggered tab columns (one wide column on phones)
        const column = narrow ? 0.28 : (row.number % 2 === 0 ? 0.33 : 0.635);
        const tab = { x: Math.round(width * column), width: Math.round(width * (narrow ? 0.62 : 0.3)) };
        return { row, top: i * GAP, left, width, height, tab };
    });

    const stageHeight = last >= 0 ? last * GAP + TAB_H + FRONT_BODY : 0;
    const numberSize = items.length > 99 ? 3 : 2;

    return (
        <>
            <div className="media-drawer">
                <div ref={stageRef} className="drawer-index" style={{ height: stageHeight + 36 /* top padding in media-drawer.css */ }}>
                    {stageWidth > 0 && layout.map(({ row, top, left, width, height, tab }, i) => (
                        <div
                            key={row.key}
                            className="drawer-row"
                            style={{ top, left, width, height, zIndex: i + 1, '--category-color': colorOf(row.item.categoryId) }}
                        >
                            <svg className="drawer-row-shape" width={width} height={height} aria-hidden="true">
                                <path className="drawer-row-fill" d={`${edgePath(width, height, tab)} Z`} />
                                <path className="drawer-tab-tint" d={tabAreaPath(tab)} />
                                <path className="drawer-row-edge" d={edgePath(width, height, tab)} />
                            </svg>

                            <button
                                type="button"
                                className="drawer-tab-label"
                                style={{ left: tab.x + 10, width: tab.width - 20 }}
                                onClick={() => dispatch(selectMediaFocus(row.item.id))}
                                title={`${row.item.mediaTitle} · ${row.item.categoryName} · ${row.item.status}`}
                            >
                                <span className="drawer-tab-number">
                                    <span className="drawer-tab-dot" />
                                    {pad(row.number, numberSize)}
                                </span>
                                <span className="drawer-tab-title">{row.item.mediaTitle}</span>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="drawer-controls">
                    <span className="drawer-counter">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                    <span className="drawer-hint drawer-hint-mouse">Hover a folder to lift it · click to open</span>
                    <span className="drawer-hint drawer-hint-touch">Tap a folder to open it</span>
                </div>
            </div>

            <MediaFocusCard items={items} />
        </>
    );
};

export default MediaDrawer;
