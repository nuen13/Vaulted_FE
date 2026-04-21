import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const fetchMediaByCategoryAndStatus = createAsyncThunk(
    'media/fetchByCategoryAndStatus',
    async ({ categoryId, status }, thunkAPI) => {
        let url = '/Media/get-all-media';
        if (categoryId && status) {
            url = `/Media/get-media-by-categoryid-and-status/categoryId=${categoryId}&status=${status}`;
        } else if (categoryId) {
            url = `/Media/get-media-by-categoryid/${categoryId}`;
        }
        else if (status) {
            url = `/Media/get-media-by-status/${status}`;
        }   

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`);
            const data = await response.json();
            return data;
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


export const updateMediaAverageRatingById = createAsyncThunk(
    'media/updateAverageRatingById',
    async ({ mediaId, newAverageRating }, thunkAPI) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Media/update-media-rating/${mediaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ averageRating: newAverageRating }),
            });

            if (!response.ok) throw new Error('Failed to update');

            return { mediaId, newAverageRating };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


const mediaSlice = createSlice({
    name: 'media',
    initialState: {
        items: [],
        selectedCategory: null,
        selectedStatus: null,
        selectedFocusId: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        setCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setStatus: (state, action) => {
            state.selectedStatus = action.payload;
        },
        selectMediaFocus: (state, action) => {
            state.selectedFocusId = action.payload;
        },
        clearSelectedFocus: (state) => {
            state.selectedFocusId = null;
        }
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchMediaByCategoryAndStatus.pending, (state) => { 
                const currentItems = state.items;
                state.status = 'loading';
                state.error = null;
                state.items = currentItems;
                
            })
            .addCase(fetchMediaByCategoryAndStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchMediaByCategoryAndStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
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

            .addCase(updateMediaAverageRatingById.pending, (state, action) => {
                const { mediaId, newAverageRating } = action.meta.arg;
                const item = state.items.find(i => i.id === mediaId || i._id === mediaId);
                if (item) item.averageRating = newAverageRating;
            })

            .addCase(updateMediaAverageRatingById.fulfilled, (state, action) => {
                const { mediaId, newAverageRating } = action.payload;

                // Find the item in the current global items array
                const item = state.items.find(i => i.id === mediaId || i._id === mediaId);
                if (item) {
                    item.averageRating = newAverageRating; // This triggers the re-render in the UI
                }
                state.status = 'succeeded';
            })
            .addCase(updateMediaAverageRatingById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
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
export const { setCategory, setStatus } = mediaSlice.actions;

// export the reducer to be included in the store
export default mediaSlice.reducer;