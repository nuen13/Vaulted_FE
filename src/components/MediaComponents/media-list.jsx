// -- file: src/components/MediaComponents/media-list.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetchMediaByCategoryAndStatus, selectSearchTerm } from "../../slices/media-slice";
import { selectView } from "../../slices/settings-slice";
import MediaStack from "./media-stack";
import MediaTable from "./media-table";
import MediaGrid from "./media-grid";
import MediaDrawer from "./media-drawer";
import ArchiveBulkEdit from "./archive-bulk-edit";

import "./media-list.css";

// Which component renders each view (see Settings → View)
const renderView = (view, items) => {
    switch (view) {
        case 'table': return <MediaTable items={items} />;
        case 'grid': return <MediaGrid items={items} />;
        case 'drawer': return <MediaDrawer items={items} />;
        default: return <MediaStack apiData={items} />;
    }
};
// --- --- --- --- --- // --- --- --- --- --- //

const MediaList = () => {
    const dispatch = useDispatch();
    const { items, status, hasLoaded } = useSelector((state) => state.media);
    const view = useSelector(selectView);
    const showArchived = useSelector((state) => state.media.showArchived);
    const searchTerm = useSelector(selectSearchTerm).trim().toLowerCase();

    useEffect(() => {
        dispatch(fetchMediaByCategoryAndStatus({ categoryId: null, status: null }));
    }, [dispatch]);

    const loading = status === 'loading';
    const hasItems = items && items.length > 0;

    // The header's search box narrows the list by title (and category name)
    const shownItems = !searchTerm || !hasItems ? items : items.filter((item) =>
        `${item.mediaTitle ?? ''} ${item.categoryName ?? ''}`.toLowerCase().includes(searchTerm));
    const noMatches = hasItems && shownItems.length === 0;

    // 3. First load only: nothing to show yet
    if (!hasLoaded) {
        return <p className="media-list-message">Loading media...</p>;
    }

    // Changing a filter or view: the old list stays (dimmed) until the new one arrives,
    // then the new content fades in. The key changes when the view or the set of items
    // changes, which replays the fade; edits to an item (status, rating) don't.
    const contentKey = `${showArchived ? 'archive' : view}:${hasItems ? items.map(i => i.id).join(',') : 'empty'}`;

    return (
        <div className={`media-list ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
            <div key={contentKey} className="media-list-content">
                {/* Viewing the archive */}
                {showArchived && (
                    <div className="media-archive-banner">
                        <i className="fa-solid fa-box-archive"></i>
                        <span>Archive · these items are hidden from your main lists. Tick some to unarchive, re-file or delete them together, or click one to open it.</span>
                    </div>
                )}

                {/* 4. Empty State */}
                {!hasItems && (
                    <p className="media-list-message d-flex justify-content-center mt-5">
                        {status === 'failed'
                            ? "Couldn't load media. Check that the server is running, then pick a filter to try again."
                            : showArchived
                                ? 'Nothing archived here yet. Use Archive on an item to tuck it away.'
                                : 'No media found. Try adjusting your filters or add new media!'}
                    </p>
                )}

                {/* Search found nothing in this list */}
                {noMatches && (
                    <p className="media-list-message d-flex justify-content-center mt-5">
                        Nothing here matches “{searchTerm}”. Try another title, or clear the search.
                    </p>
                )}

                {/* 5. items is now your Redux-managed media list */}
                {/* The archive is always a table with checkboxes, for bulk edits */}
                {hasItems && !noMatches && (showArchived ? <ArchiveBulkEdit items={shownItems} /> : renderView(view, shownItems))}
            </div>
        </div>
    );
};

export default MediaList;