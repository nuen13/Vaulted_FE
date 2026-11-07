import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addReviewByMediaId, updateReviewById, deleteReviewById } from "./review-slice";
import { setPhotoAsCover } from "./photo-slice";


// Loads the list for the current filters. When the Archived filter is on, the same
// filters apply to archived items instead (callers don't need to pass it).
export const fetchMediaByCategoryAndStatus = createAsyncThunk(
    'media/fetchByCategoryAndStatus',
    async ({ categoryId, status, archived }, thunkAPI) => {
        const showArchived = archived ?? thunkAPI.getState().media.showArchived;
        if (showArchived) status = null; // the archive is shown across all statuses

        const encodedStatus = encodeURIComponent(status ?? '');
        let url = '/Media/get-all-media';
        if (categoryId && status) {
            url = `/Media/get-media-by-categoryid-and-status/categoryId=${categoryId}&status=${encodedStatus}`;
        } else if (categoryId) {
            url = `/Media/get-media-by-categoryid/${categoryId}`;
        }
        else if (status) {
            url = `/Media/get-media-by-status/${encodedStatus}`;
        }
        if (showArchived) url += '?archived=true';

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


export const updateMediaStatusById = createAsyncThunk(
    'media/updateStatusById',
    async ({ mediaId, newStatus }, thunkAPI) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/update-media-status/${mediaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');

            return { mediaId, newStatus };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


// Archive or restore an item. It leaves the list you're looking at right away; when it
// moves *into* the current list (e.g. Undo), the list is reloaded so it lands in the right place.
export const setMediaArchived = createAsyncThunk(
    'media/setArchived',
    async ({ mediaId, archived }, thunkAPI) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/set-archived/${mediaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archived }),
            });
            if (!response.ok) throw new Error(archived ? 'Failed to archive' : 'Failed to restore');
            const item = await response.json();

            const { showArchived, selectedCategory, selectedStatus } = thunkAPI.getState().media;
            if (item.archived === showArchived) {
                thunkAPI.dispatch(fetchMediaByCategoryAndStatus({ categoryId: selectedCategory, status: selectedStatus }));
            }
            return item;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


// Close the open item with an animation: it fades and shrinks with the dark overlay
// (focusClosing), then goes back to its place in the list without sliding there (returningFocusId).
const CLOSE_MS = 200;   // same as the file-card-close animation in folder-card.css
const RETURN_MS = 350;  // same as the file-card-return animation

export const closeMediaFocus = () => async (dispatch, getState) => {
    const { selectedFocusId, focusClosing } = getState().media;
    if (!selectedFocusId || focusClosing) return;

    // (With "reduce motion" on, the CSS turns this into a plain fade)
    dispatch(mediaSlice.actions.startFocusClosing());
    await new Promise(r => setTimeout(r, CLOSE_MS));
    if (getState().media.selectedFocusId !== selectedFocusId) return; // another item was opened meanwhile

    dispatch(mediaSlice.actions.clearSelectedFocus());
    setTimeout(() => dispatch(mediaSlice.actions.clearReturningFocus(selectedFocusId)), RETURN_MS);
};


// Bulk edit (archive view): change several items at once, then reload the list.
// changes: any of { archived, status, categoryId, deleted }. Returns { updatedCount }.
export const bulkUpdateMedia = createAsyncThunk(
    'media/bulkUpdate',
    async ({ ids, changes }, thunkAPI) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/bulk-update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, ...changes }),
            });
            if (!response.ok) throw new Error((await response.text()) || 'Failed to update items');
            const result = await response.json();

            const { selectedCategory, selectedStatus } = thunkAPI.getState().media;
            thunkAPI.dispatch(fetchMediaByCategoryAndStatus({ categoryId: selectedCategory, status: selectedStatus }));
            return result;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


// The server recalculates averageRating whenever a review is added, updated, or deleted,
// and returns it in the response. Copy it onto the matching media item.
const applyAverageRating = (state, action) => {
    const { mediaId, averageRating } = action.payload ?? {};
    const item = state.items.find(i => i.id === mediaId);
    if (item && averageRating !== undefined) item.averageRating = averageRating;
};


const mediaSlice = createSlice({
    name: 'media',
    initialState: {
        items: [],
        hasLoaded: false,
        latestRequestId: null,
        selectedCategory: null,
        selectedStatus: null,
        selectedFocusId: null,
        focusClosing: false,      // the open item is playing its closing animation
        returningFocusId: null,   // the item that just closed, settling back into the list
        showArchived: false,      // the "Archived" filter: list archived items instead
        archiveNotice: null,      // { id, title, archived } for the "Archived · Undo" notice
        status: 'idle',
        error: null,
    },
    reducers: {
        setCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setStatus: (state, action) => {
            state.selectedStatus = action.payload;
            state.showArchived = false; // picking a status leaves the archive
        },
        setShowArchived: (state, action) => {
            state.showArchived = action.payload;
            if (action.payload) state.selectedStatus = null;
        },
        dismissArchiveNotice: (state) => {
            state.archiveNotice = null;
        },
        selectMediaFocus: (state, action) => {
            state.selectedFocusId = action.payload;
            state.focusClosing = false;
        },
        clearSelectedFocus: (state) => {
            state.returningFocusId = state.selectedFocusId;
            state.selectedFocusId = null;
            state.focusClosing = false;
        },
        // Closing animation steps (see closeMediaFocus)
        startFocusClosing: (state) => {
            state.focusClosing = true;
        },
        clearReturningFocus: (state, action) => {
            if (state.returningFocusId === action.payload) state.returningFocusId = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // Only the latest request counts: when filters are clicked quickly, an older,
            // slower response must not overwrite the newer one.
            .addCase(fetchMediaByCategoryAndStatus.pending, (state, action) => {
                state.status = 'loading';
                state.error = null;
                state.latestRequestId = action.meta.requestId;
            })
            .addCase(fetchMediaByCategoryAndStatus.fulfilled, (state, action) => {
                if (action.meta.requestId !== state.latestRequestId) return;
                state.status = 'succeeded';
                state.items = action.payload;
                state.hasLoaded = true; // after the first load, refetches keep the old list on screen
            })
            .addCase(fetchMediaByCategoryAndStatus.rejected, (state, action) => {
                if (action.meta.requestId !== state.latestRequestId) return;
                state.status = 'failed';
                state.error = action.payload;
                state.hasLoaded = true;
            })
            .addCase(updateMediaStatusById.pending, (state, action) => {
                // action.meta.arg contains the data you sent to the thunk!
                const { mediaId, newStatus } = action.meta.arg;
                const item = state.items.find(i => i.id === mediaId);
                if (item) item.status = newStatus;
            })
            .addCase(updateMediaStatusById.fulfilled, (state, action) => {
                const { mediaId, newStatus } = action.payload;

                // Find the item in the current global items array
                const item = state.items.find(i => i.id === mediaId || i._id === mediaId);

                if (item) {
                    item.status = newStatus; // This triggers the re-render in the UI
                }
                state.status = 'succeeded';
            })
            .addCase(updateMediaStatusById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(addReviewByMediaId.fulfilled, applyAverageRating)
            .addCase(updateReviewById.fulfilled, applyAverageRating)
            .addCase(deleteReviewById.fulfilled, applyAverageRating)

            // A category was renamed: keep the cards' category names in sync.
            // Matched by type string because category-slice imports this file (avoids a circular import).
            .addCase('category/update/fulfilled', (state, action) => {
                const { id, name } = action.payload;
                state.items.forEach(item => { if (item.categoryId === id) item.categoryName = name; });
            })
            // Same for a renamed status (status-slice adds oldName), including the selected filter
            .addCase('status/update/fulfilled', (state, action) => {
                const { oldName, name } = action.payload;
                state.items.forEach(item => { if (item.status === oldName) item.status = name; });
                if (state.selectedStatus === oldName) state.selectedStatus = name;
            })

            // Archived / restored: drop it from a list it no longer belongs to, close it, show the notice
            .addCase(setMediaArchived.fulfilled, (state, action) => {
                const item = action.payload;
                if (item.archived !== state.showArchived) {
                    state.items = state.items.filter(i => i.id !== item.id);
                    if (state.selectedFocusId === item.id) state.selectedFocusId = null;
                }
                state.archiveNotice = { id: item.id, title: item.mediaTitle, archived: item.archived };
            })

            // A gallery photo was swapped in as the cover
            .addCase(setPhotoAsCover.fulfilled, (state, action) => {
                const { mediaId, coverPhotoUrl } = action.payload;
                const item = state.items.find(i => i.id === mediaId);
                if (item) item.coverPhotoUrl = coverPhotoUrl;
            });
        }
});

// -- export selectors for use in components

// export for focus selector 
export const { selectMediaFocus, clearSelectedFocus } = mediaSlice.actions;

// export selectors for media items, status, and error
export const selectMediaItems = (state) => state.media.items;
export const selectMediaStatus = (state) => state.media.status;
export const selectMediaError = (state) => state.media.error;

// export selectors for selected filters
export const selectSelectedCategory = (state) => state.media.selectedCategory;
export const selectSelectedStatus = (state) => state.media.selectedStatus;
export const selectMediaByCategoryAndStatus = (state) => state.media.items;
export const { setCategory, setStatus, setShowArchived, dismissArchiveNotice } = mediaSlice.actions;
export const selectShowArchived = (state) => state.media.showArchived;
export const selectArchiveNotice = (state) => state.media.archiveNotice;

// export the reducer to be included in the store
export default mediaSlice.reducer;