import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchLatestReview = createAsyncThunk(
    'review/fetchLatest',
    async (mediaId, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Comment/get-comments-by-media-id/${mediaId}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            return data.length > 0 ? data[0] : null;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const fetchAllReviewsByMediaId = createAsyncThunk(
    'review/fetchAllByMediaId',
    async (mediaId, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Comment/get-comments-by-media-id/${mediaId}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return sortedData;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const addReviewByMediaId = createAsyncThunk(
    'review/addByMediaId',
    async ({ mediaId, reviewData }, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Comment/add-comment`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId, ...reviewData }),
            });

            if (!response.ok) throw new Error('Failed to add review');
            const data = await response.json();
            thunkAPI.dispatch(fetchAllReviewsByMediaId(mediaId));
            return data;
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
            })

            // --- fetchAllReviewsByMediaId --- //
            .addCase(fetchAllReviewsByMediaId.pending, (state, action) => {
                const mediaId = action.meta.arg;
                state.reviewsByMediaId[mediaId] = {
                    status: 'loading',
                    data: null,
                    error: null
                };
            })
            .addCase(fetchAllReviewsByMediaId.fulfilled, (state, action) => {
                const mediaId = action.meta.arg;
                state.reviewsByMediaId[mediaId] = {
                    status: 'succeeded',
                    data: action.payload,
                    error: null
                };
            })
            .addCase(fetchAllReviewsByMediaId.rejected, (state, action) => {
                const mediaId = action.meta.arg;
                state.reviewsByMediaId[mediaId] = {
                    status: 'failed',
                    data: null,
                    error: action.payload
                };
            })
            .addCase(addReviewByMediaId.pending, (state, action) => {
                const mediaId = action.meta.arg.mediaId;
                if (!state.reviewsByMediaId[mediaId]) {
                    state.reviewsByMediaId[mediaId] = { status: 'loading', data: [], error: null };
                } else {
                    state.reviewsByMediaId[mediaId].status = 'loading';
                }
            })
            .addCase(addReviewByMediaId.fulfilled, (state, action) => {
                const mediaId = action.meta.arg.mediaId;

                // Safety check: handle cases where payload might be nested (e.g., action.payload.data)
                const newReview = action.payload;

                if (!state.reviewsByMediaId[mediaId]) {
                    state.reviewsByMediaId[mediaId] = {
                        status: 'succeeded',
                        data: [newReview],
                        error: null
                    };
                } else {
                    // ALWAYS spread to create a new array reference
                    state.reviewsByMediaId[mediaId] = {
                        ...state.reviewsByMediaId[mediaId], // Keep existing status/error
                        status: 'succeeded',
                        data: [newReview, ...(state.reviewsByMediaId[mediaId]?.data || [])]
                    };
                    state.reviewsByMediaId[mediaId].status = 'succeeded';
                }
            })
            .addCase(addReviewByMediaId.rejected, (state, action) => {
                const mediaId = action.meta.arg.mediaId;
                if (state.reviewsByMediaId[mediaId]) {
                    state.reviewsByMediaId[mediaId].status = 'failed';
                    state.reviewsByMediaId[mediaId].error = action.payload;
                }
            })

    },
});

export const selectReviewById = (state, mediaId) => {
    return state.review?.reviewsByMediaId?.[mediaId];
};

export const selectAllReviewsByMediaId = (state, mediaId) => {
    return state.review?.reviewsByMediaId?.[mediaId];
}

export default reviewSlice.reducer;