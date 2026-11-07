import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Notable quotes per media item, in display order (carousel in the details,
// managed in the quotes modal).

const API = import.meta.env.VITE_API_BASE_URL;

// The API answers validation errors as plain text (400)
const readError = async (response, fallback) => (response.status === 400 ? await response.text() : fallback);


export const fetchQuotesByMediaId = createAsyncThunk(
    'quote/fetchByMediaId',
    async (mediaId, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Quote/get-quotes-by-media-id/${mediaId}`);
            if (!response.ok) throw new Error('Failed to fetch quotes');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const addQuote = createAsyncThunk(
    'quote/add',
    async ({ mediaId, quoteText, quoteFrom }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Quote/add-quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId, quoteText, quoteFrom }),
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to add quote'));
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateQuote = createAsyncThunk(
    'quote/update',
    async ({ quoteId, quoteText, quoteFrom }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Quote/update-quote/${quoteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteText, quoteFrom }),
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to save quote'));
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteQuote = createAsyncThunk(
    'quote/delete',
    async ({ quoteId }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Quote/delete-quote/${quoteId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete quote');
            return await response.json(); // { quoteId, mediaId }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Optimistic: the list updates right away; on failure it's reloaded from the server
export const reorderQuotes = createAsyncThunk(
    'quote/reorder',
    async ({ mediaId, quoteIds }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Quote/reorder-quotes/${mediaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteIds }),
            });
            if (!response.ok) throw new Error('Failed to reorder quotes');
            return await response.json();
        } catch (error) {
            thunkAPI.dispatch(fetchQuotesByMediaId(mediaId));
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


const ensureEntry = (state, mediaId) => {
    if (!state.quotesByMediaId[mediaId]) {
        state.quotesByMediaId[mediaId] = { status: 'idle', data: [] };
    }
    return state.quotesByMediaId[mediaId];
};

const quoteSlice = createSlice({
    name: 'quote',
    initialState: {
        quotesByMediaId: {},
        // Manage-quotes modal: which media it's open for, and whether it opened to add one
        manager: { mediaId: null, mode: 'view' },
    },
    reducers: {
        openQuoteManager: (state, action) => {
            const { mediaId, mode = 'view' } = action.payload;
            state.manager = { mediaId, mode };
        },
        closeQuoteManager: (state) => {
            state.manager = { mediaId: null, mode: 'view' };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuotesByMediaId.pending, (state, action) => {
                ensureEntry(state, action.meta.arg).status = 'loading';
            })
            .addCase(fetchQuotesByMediaId.fulfilled, (state, action) => {
                state.quotesByMediaId[action.meta.arg] = { status: 'succeeded', data: action.payload };
            })
            .addCase(fetchQuotesByMediaId.rejected, (state, action) => {
                ensureEntry(state, action.meta.arg).status = 'failed';
            })
            .addCase(addQuote.fulfilled, (state, action) => {
                ensureEntry(state, action.payload.mediaId).data.push(action.payload);
            })
            .addCase(updateQuote.fulfilled, (state, action) => {
                const entry = ensureEntry(state, action.payload.mediaId);
                const index = entry.data.findIndex(q => q.id === action.payload.id);
                if (index !== -1) entry.data[index] = action.payload;
            })
            .addCase(deleteQuote.fulfilled, (state, action) => {
                const { quoteId, mediaId } = action.payload;
                const entry = ensureEntry(state, mediaId);
                entry.data = entry.data.filter(q => q.id !== quoteId);
            })
            .addCase(reorderQuotes.pending, (state, action) => {
                const { mediaId, quoteIds } = action.meta.arg;
                const entry = ensureEntry(state, mediaId);
                const byId = Object.fromEntries(entry.data.map(q => [q.id, q]));
                entry.data = quoteIds.map((id, index) => byId[id] && { ...byId[id], sortOrder: index }).filter(Boolean);
            })
            .addCase(reorderQuotes.fulfilled, (state, action) => {
                ensureEntry(state, action.meta.arg.mediaId).data = action.payload;
            });
    },
});

const EMPTY = [];
export const selectQuotesByMediaId = (state, mediaId) => state.quote.quotesByMediaId[mediaId]?.data ?? EMPTY;
export const selectQuoteManager = (state) => state.quote.manager;

export const { openQuoteManager, closeQuoteManager } = quoteSlice.actions;
export default quoteSlice.reducer;
