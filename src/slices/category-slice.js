import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMediaByCategoryAndStatus, setCategory } from "./media-slice";

// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//

const API = import.meta.env.VITE_API_BASE_URL;
export const DEFAULT_CATEGORY_COLOR = '#d43b0c';

// The API answers validation errors as plain text (400) or { message } (409)
const readError = async (response, fallback) => {
    const text = await response.text();
    try { return JSON.parse(text).message ?? fallback; } catch { return text || fallback; }
};


// -- GET -> Fetch all categories ({ id, name, color, mediaCount }) -- //
export const fetchAllCategories = createAsyncThunk(
    'category/fetchAll',
    async (_, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Category/get-all-categories`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// -- POST -> Add a category -- //
export const addCategory = createAsyncThunk(
    'category/add',
    async ({ name, color }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Category/add-category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color }),
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to add category'));
            return await response.json();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// -- PUT -> Rename and/or recolor -- //
export const updateCategory = createAsyncThunk(
    'category/update',
    async ({ id, name, color }, thunkAPI) => {
        try {
            const response = await fetch(`${API}/Category/update-category/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, color }),
            });
            if (!response.ok) throw new Error(await readError(response, 'Failed to update category'));
            return await response.json();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// -- DELETE -> Delete, optionally moving its media items to another category first -- //
export const deleteCategory = createAsyncThunk(
    'category/delete',
    async ({ id, reassignToId = null }, thunkAPI) => {
        try {
            const query = reassignToId ? `?reassignToId=${reassignToId}` : '';
            const response = await fetch(`${API}/Category/delete-category/${id}${query}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(await readError(response, 'Failed to delete category'));
            const result = await response.json();

            // Reset the filter if it pointed at the deleted category, and reload media so
            // moved items show their new category
            const { selectedCategory, selectedStatus } = thunkAPI.getState().media;
            const categoryId = selectedCategory === id ? null : selectedCategory;
            if (selectedCategory === id) thunkAPI.dispatch(setCategory(null));
            if (result.movedItems > 0 || selectedCategory === id) {
                thunkAPI.dispatch(fetchMediaByCategoryAndStatus({ categoryId, status: selectedStatus }));
            }
            thunkAPI.dispatch(fetchAllCategories()); // refresh counts
            return result;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);


const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        loading: false,
        error: null
    },
    reducers: {
        // Live color preview while the picker is open (saved separately with updateCategory)
        previewCategoryColor: (state, action) => {
            const { id, color } = action.payload;
            const category = state.categories.find(c => c.id === id);
            if (category) category.color = color;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- fetchAllCategories --- //
            .addCase(fetchAllCategories.pending, (state) => {
                // Only show the loading state on the first load, so refreshes don't blank the filter
                if (state.categories.length === 0) state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.loading = false;
            })
            .addCase(fetchAllCategories.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch categories';
                state.loading = false;
            })

            // -- Add --//
            .addCase(addCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            // -- Update --//
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.categories[index] = action.payload;
            })
            // -- Delete --//
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.id !== action.payload.id);
            });
    }
});


export const selectAllCategories = (state) => state.category.categories;
export const selectCategoryLoading = (state) => state.category.loading;
export const selectCategoryError = (state) => state.category.error;
export const selectCategoryColor = (state, categoryId) =>
    state.category.categories.find(c => c.id === categoryId)?.color || DEFAULT_CATEGORY_COLOR;

export const { previewCategoryColor } = categorySlice.actions;
export default categorySlice.reducer;
