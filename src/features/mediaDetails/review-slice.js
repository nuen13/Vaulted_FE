import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchLatestReview = createAsyncThunk(
    'review/fetchLatest',
    async (mediaId, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Comment/get-comments-by-media-id/${mediaId}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to fetch');
            
            const data = await response.json();
            // Assuming the API returns an array, we take the first item
            return data.length > 0 ? data[0] : null; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviewsByMediaId: {}, 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLatestReview.pending, (state, action) => {
                const mediaId = action.meta.arg;
                state.reviewsByMediaId[mediaId] = { 
                    status: 'loading', 
                    data: null, 
                    error: null 
                };
            })
            .addCase(fetchLatestReview.fulfilled, (state, action) => {
                const mediaId = action.meta.arg;
                state.reviewsByMediaId[mediaId] = { 
                    status: 'succeeded', 
                    data: action.payload, 
                    error: null 
                };
            })
            .addCase(fetchLatestReview.rejected, (state, action) => {
                const mediaId = action.meta.arg;
                state.reviewsByMediaId[mediaId] = { 
                    status: 'failed', 
                    data: null, 
                    error: action.payload 
                };
            });
    },
});

// Selector with safety checks
export const selectReviewById = (state, mediaId) => {
    // This ensures if state.review is missing, it doesn't crash
    return state.review?.reviewsByMediaId?.[mediaId];
};

export default reviewSlice.reducer;