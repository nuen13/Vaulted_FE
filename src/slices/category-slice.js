import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ----- ---- ---- ---- ----- // ---- ---- ---- ----  ----//


// -- GET -> Fetch all categories for filter buttons in CategoryFilterComponent.jsx -- //
export const fetchAllCategories = createAsyncThunk(
    'category/fetchAll',
    async (_, thunkAPI) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Category/get-all-categories`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            console.log("Fetched Categories:", data);
            return Array.isArray(data) ? data : [];
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
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- fetchAllCategories --- //
            .addCase(fetchAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.loading = false;
            })
            .addCase(fetchAllCategories.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch categories';
                state.loading = false;  
            });

            // -- Add --// 
            // -- Update --// 
            // -- Delete --//
            
    
    }
});


export const selectAllCategories = (state) => state.category.categories;
// export const selectAllCategories = (state) => []
export const selectCategoryLoading = (state) => state.category.loading;
export const selectCategoryError = (state) => state.category.error;
export default categorySlice.reducer;