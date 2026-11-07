import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Extra photos per media item. The cover photo lives on the media item itself
// (coverPhotoUrl) and is always shown first; these photos follow it in sortOrder.

const API = import.meta.env.VITE_API_BASE_URL;


// -- GET -> photos for one media item, in display order -- //
export const fetchPhotosByMediaId = createAsyncThunk(
    'photo/fetchByMediaId',
    async (mediaId, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Photo/get-photos-by-media-id/${mediaId}`);
            if (!response.ok) throw new Error('Failed to fetch photos');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// -- POST -> append a photo -- //
export const addPhoto = createAsyncThunk(
    'photo/add',
    async ({ mediaId, photoUrl }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Photo/add-photo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId, photoUrl }),
            });
            // 400 carries a readable validation message
            if (!response.ok) throw new Error(response.status === 400 ? await response.text() : 'Failed to add photo');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// -- DELETE -> remove a photo -- //
export const deletePhoto = createAsyncThunk(
    'photo/delete',
    async ({ photoId }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Photo/delete-photo-by-id/${photoId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete photo');
            return await response.json(); // { photoId, mediaId }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// -- PUT -> swap a photo with the current cover -- //
// The old cover takes the photo's place in the gallery, so the photo list is refetched.
// media-slice reads { mediaId, coverPhotoUrl } from the result to update the card.
export const setPhotoAsCover = createAsyncThunk(
    'photo/setAsCover',
    async ({ photoId, mediaId }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Photo/set-as-cover/${photoId}`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to set cover photo');
            const data = await response.json(); // { mediaId, coverPhotoUrl }
            await thunkAPI.dispatch(fetchPhotosByMediaId(mediaId));
            return data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// -- PUT -> save a new order. The UI updates immediately (pending); on failure we refetch. -- //
export const reorderPhotos = createAsyncThunk(
    'photo/reorder',
    async ({ mediaId, photoIds }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Photo/reorder-photos/${mediaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoIds }),
            });
            if (!response.ok) throw new Error('Failed to reorder photos');
            return await response.json();
        } catch (error) {
            thunkAPI.dispatch(fetchPhotosByMediaId(mediaId));
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


const ensureEntry = (state, mediaId) => {
    if (!state.photosByMediaId[mediaId]) {
        state.photosByMediaId[mediaId] = { status: 'idle', data: [], error: null };
    }
    return state.photosByMediaId[mediaId];
};

const photoSlice = createSlice({
    name: 'photo',
    initialState: {
        photosByMediaId: {},
        // Gallery modal: which media it's open for, and whether it opened to add a photo
        gallery: { mediaId: null, mode: 'view' },
    },
    reducers: {
        openGallery: (state, action) => {
            const { mediaId, mode = 'view' } = action.payload;
            state.gallery = { mediaId, mode };
        },
        closeGallery: (state) => {
            state.gallery = { mediaId: null, mode: 'view' };
        },
    },
    extraReducers: (builder) => {
        builder
            // --- fetch --- //
            .addCase(fetchPhotosByMediaId.pending, (state, action) => {
                ensureEntry(state, action.meta.arg).status = 'loading';
            })
            .addCase(fetchPhotosByMediaId.fulfilled, (state, action) => {
                state.photosByMediaId[action.meta.arg] = { status: 'succeeded', data: action.payload, error: null };
            })
            .addCase(fetchPhotosByMediaId.rejected, (state, action) => {
                const entry = ensureEntry(state, action.meta.arg);
                entry.status = 'failed';
                entry.error = action.payload;
            })

            // --- add --- //
            .addCase(addPhoto.fulfilled, (state, action) => {
                ensureEntry(state, action.meta.arg.mediaId).data.push(action.payload);
            })

            // --- delete --- //
            .addCase(deletePhoto.fulfilled, (state, action) => {
                const { photoId, mediaId } = action.payload;
                const entry = ensureEntry(state, mediaId);
                entry.data = entry.data.filter(p => p.id !== photoId);
            })

            // --- reorder (optimistic) --- //
            .addCase(reorderPhotos.pending, (state, action) => {
                const { mediaId, photoIds } = action.meta.arg;
                const entry = ensureEntry(state, mediaId);
                const byId = Object.fromEntries(entry.data.map(p => [p.id, p]));
                entry.data = photoIds.map((id, index) => ({ ...byId[id], sortOrder: index })).filter(p => p.id);
            })
            .addCase(reorderPhotos.fulfilled, (state, action) => {
                ensureEntry(state, action.meta.arg.mediaId).data = action.payload;
            });
    },
});

const EMPTY = [];
export const selectPhotosByMediaId = (state, mediaId) => state.photo.photosByMediaId[mediaId]?.data ?? EMPTY;
export const selectGallery = (state) => state.photo.gallery;

export const { openGallery, closeGallery } = photoSlice.actions;
export default photoSlice.reducer;
