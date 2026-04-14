import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";



// if category == all then return all media, else return media filtered by category

export const fetchMediaByCategory = createAsyncThunk(
    'media/fetchByCategory',
    async (categoryId, thunkAPI) => {
        const url = categoryId ? `/Media/get-media-by-categoryid/${categoryId}` : '/Media/get-all-media';
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`);
            const data = await response.json();
            return data;
        } catch (error) {
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


const mediaSlice = createSlice({
    name: 'media',
    initialState: {
        items: [],
        selectedCategory: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        setCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMediaByCategory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchMediaByCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchMediaByCategory.rejected, (state, action) => {
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
            });

    },
});


export const selectMediaItems = (state) => state.media.items;
export const selectMediaStatus = (state) => state.media.status;
export const selectMediaError = (state) => state.media.error;

export const selectSelectedCategory = (state) => state.media.selectedCategory;

export const { setCategory } = mediaSlice.actions;
export default mediaSlice.reducer;