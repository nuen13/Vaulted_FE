import { createSlice } from "@reduxjs/toolkit";

// Which media item the share-card modal is open for (null = closed)
const shareSlice = createSlice({
    name: 'share',
    initialState: { mediaId: null },
    reducers: {
        openShare: (state, action) => { state.mediaId = action.payload; },
        closeShare: (state) => { state.mediaId = null; },
    },
});

export const selectShareMediaId = (state) => state.share.mediaId;
export const { openShare, closeShare } = shareSlice.actions;
export default shareSlice.reducer;
