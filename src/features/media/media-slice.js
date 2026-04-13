import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";


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
            }); 
    },
}); 

export const selectMediaItems = (state) => state.media.items;
export const selectMediaStatus = (state) => state.media.status;
export const selectMediaError = (state) => state.media.error;

export const { setCategory } = mediaSlice.actions; // Check this line!
export default mediaSlice.reducer;