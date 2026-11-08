import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export const fetchAllReviewsByMediaId = createAsyncThunk(
    'review/fetchAllByMediaId',
    async (mediaId, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Review/get-reviews-by-media-id/${mediaId}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
            return sortedData;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteReviewById = createAsyncThunk(
    'review/deleteById',
    async (reviewId, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Review/delete-review-by-id/${reviewId}`;
            const response = await fetch(url, { method: 'DELETE' });

            if (!response.ok) throw new Error((await response.text()) || 'Failed to delete');

            // { mediaId, averageRating } after the server recalculates the rating
            const data = await response.json();
            return { reviewId, ...data };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// src/slices/review-slice.js

export const addReviewByMediaId = createAsyncThunk(
    'review/addByMediaId',
    async ({ mediaId, reviewData }, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Review/add-review`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId, ...reviewData }),
            });

            if (!response.ok) throw new Error((await response.text()) || 'Failed to add review');

            // The created review, including the media's recalculated averageRating
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateReviewById = createAsyncThunk(
    'review/updateById',
    async ({ reviewId, reviewData }, thunkAPI) => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Review/update-review-by-id/${reviewId}`;  
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) throw new Error((await response.text()) || 'Failed to update review');

            // The updated review, including mediaId and the recalculated averageRating
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);
const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviewsByMediaId: {},
        reviewContent: '',
        editingReviewId: null,
        // Review / Journal pop-up: which item it's open for, and whether it's writing a new
        // entry ('write') or editing one ('edit', with that entry's reviewId)
        editor: { mediaId: null, mode: 'write', reviewId: null },
    },
    reducers: {
        openReviewEditor: (state, action) => {
            const { mediaId, mode = 'write', reviewId = null } = action.payload;
            state.editor = { mediaId, mode, reviewId };
        },
        closeReviewEditor: (state) => {
            state.editor = { mediaId: null, mode: 'write', reviewId: null };
        },
        setReviewContent: (state, action) => {
      state.reviewContent = action.payload;
        },
        setEditingReviewId: (state, action) => { state.editingReviewId = action.payload; },
        clearEditingState: (state) => {
            state.editingReviewId = null;
            state.reviewContent = '';
        }
    },
    
    extraReducers: (builder) => {
        builder

            // --- fetchAllReviewsByMediaId --- //
            // Change this in fetchAllReviewsByMediaId.pending:
            .addCase(fetchAllReviewsByMediaId.pending, (state, action) => {
                const mediaId = action.meta.arg;
                if (!state.reviewsByMediaId[mediaId]) {
                    state.reviewsByMediaId[mediaId] = { status: 'loading', data: [], error: null };
                } else {
                    state.reviewsByMediaId[mediaId].status = 'loading';
                    // DO NOT set data to null here! Keep existing data while loading.
                }
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
            const { mediaId } = action.meta.arg;
            if (!state.reviewsByMediaId[mediaId]?.data) {
                state.reviewsByMediaId[mediaId] = { data: [], error: null };
            }
            state.reviewsByMediaId[mediaId].status = 'succeeded';
            // Push the new review into the array so the UI sees it immediately
            state.reviewsByMediaId[mediaId].data.unshift(action.payload);
        })
            .addCase(addReviewByMediaId.rejected, (state, action) => {
                const mediaId = action.meta.arg.mediaId;
                if (state.reviewsByMediaId[mediaId]) {
                    state.reviewsByMediaId[mediaId].status = 'failed';
                    state.reviewsByMediaId[mediaId].error = action.payload;
                }
            })

            .addCase(deleteReviewById.fulfilled, (state, action) => {
                const { reviewId } = action.payload;
                for (const mediaId in state.reviewsByMediaId) {
                    const reviewsData = state.reviewsByMediaId[mediaId]?.data;
                    if (reviewsData) {
                        const index = reviewsData.findIndex(review => review.id === reviewId);
                        if (index !== -1) {
                            state.reviewsByMediaId[mediaId].data = [
                                ...reviewsData.slice(0, index),
                                ...reviewsData.slice(index + 1)
                            ];
                            break; 
                        }
                    }
                }
            })
            
            .addCase(updateReviewById.fulfilled, (state, action) => {
            const { mediaId } = action.payload; // Or from meta.arg
            const reviews = state.reviewsByMediaId[mediaId]?.data;
            if (reviews) {
                const index = reviews.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    // Replace the old review with the updated one
                    reviews[index] = action.payload;
                }
            }
        })
            .addCase(updateReviewById.rejected, ( state, action) => {
                // Handle error if needed, e.g., set an error state for the specific review or mediaId
                console.error('Failed to update review:', action.payload);
             })
            
            .addCase(updateReviewById.pending, () => {
                // Optionally, you can set a loading state for the specific review being updated
                // This would require tracking which review is being updated, e.g., by reviewId
             })
            
            ;
    },
});

export const selectReviewById = (state, mediaId) => {
    return state.review?.reviewsByMediaId?.[mediaId];
};

export const selectAllReviewsByMediaId = (state, mediaId) => {
    return state.review?.reviewsByMediaId?.[mediaId];
}

export const selectReviewStatusByMediaId = (state, mediaId) => {
    return state.review?.reviewsByMediaId?.[mediaId]?.status || 'idle';
}
export const {setReviewContent, clearEditingState, setEditingReviewId, openReviewEditor, closeReviewEditor} = reviewSlice.actions;
export const selectReviewEditor = (state) => state.review.editor;

export default reviewSlice.reducer;