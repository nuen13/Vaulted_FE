import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMediaByCategoryAndStatus, setStatus } from "./media-slice";

// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//
// Statuses (Planning, Consuming...), editable in Settings. Works like category-slice.
// Media items store the status *name*, so a rename also renames it on every item.

const API = import.meta.env.VITE_API_BASE_URL;

// The API answers validation errors as plain text (400) or { message } (409)
const readError = async (response, fallback) => {
    const text = await response.text();
    try { return JSON.parse(text).message ?? fallback; } catch { return text || fallback; }
};


// -- GET -> Fetch all statuses ({ id, name, sortOrder, mediaCount }) in display order -- //
export const fetchAllStatuses = createAsyncThunk(
    'status/fetchAll',
    async (_, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Status/get-all-statuses`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// -- POST -> Add a status (goes to the end of the list) -- //
export const addStatus = createAsyncThunk(
    'status/add',
    async ({ name }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Status/add-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to add status'));
            return await response.json();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// -- PUT -> Rename. Returns the status plus oldName, so media-slice can rename it on items -- //
export const updateStatus = createAsyncThunk(
    'status/update',
    async ({ id, name }, thunkAPI) => {
        try {
            const oldName = thunkAPI.getState().status.statuses.find(s => s.id === id)?.name;
            const response = await fetch(`${API}/Status/update-status/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to rename status'));
            return { ...(await response.json()), oldName };
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// -- DELETE -> Delete, optionally moving its items to another status first -- //
export const deleteStatus = createAsyncThunk(
    'status/delete',
    async ({ id, reassignTo = null }, thunkAPI) => {
        try {
            const query = reassignTo ? `?reassignTo=${encodeURIComponent(reassignTo)}` : '';
            const response = await fetch(`${API}/Status/delete-status/${id}${query}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(await readError(response, 'Failed to delete status'));
            const result = await response.json();

            // Reset the filter if it pointed at the deleted status, and reload media so
            // moved items show their new status
            const { selectedCategory, selectedStatus } = thunkAPI.getState().media;
            const wasSelected = selectedStatus === result.name;
            if (wasSelected) thunkAPI.dispatch(setStatus(null));
            if (result.movedItems > 0 || wasSelected) {
                thunkAPI.dispatch(fetchMediaByCategoryAndStatus({
                    categoryId: selectedCategory,
                    status: wasSelected ? null : selectedStatus,
                }));
            }
            thunkAPI.dispatch(fetchAllStatuses()); // refresh counts
            return result;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);


const statusSlice = createSlice({
    name: 'status',
    initialState: {
        statuses: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- fetchAllStatuses --- //
            .addCase(fetchAllStatuses.pending, (state) => {
                if (state.statuses.length === 0) state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllStatuses.fulfilled, (state, action) => {
                state.statuses = action.payload;
                state.loading = false;
            })
            .addCase(fetchAllStatuses.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch statuses';
                state.loading = false;
            })

            // -- Add / Update / Delete -- //
            .addCase(addStatus.fulfilled, (state, action) => {
                state.statuses.push(action.payload);
            })
            .addCase(updateStatus.fulfilled, (state, action) => {
                const { oldName: _oldName, ...status } = action.payload;
                const index = state.statuses.findIndex(s => s.id === status.id);
                if (index !== -1) state.statuses[index] = status;
            })
            .addCase(deleteStatus.fulfilled, (state, action) => {
                state.statuses = state.statuses.filter(s => s.id !== action.payload.id);
            });
    }
});


export const selectAllStatuses = (state) => state.status.statuses;

export default statusSlice.reducer;
