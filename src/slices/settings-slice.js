import { createSlice } from "@reduxjs/toolkit";

// App preferences. The chosen view is remembered in this browser (localStorage).

export const VIEWS = ['folder', 'table', 'grid', 'drawer'];
const VIEW_KEY = 'vaulted.view';

const loadView = () => {
    try {
        const saved = localStorage.getItem(VIEW_KEY);
        return VIEWS.includes(saved) ? saved : 'folder';
    } catch {
        return 'folder';
    }
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        view: loadView(),
    },
    reducers: {
        setView: (state, action) => {
            if (!VIEWS.includes(action.payload)) return;
            state.view = action.payload;
            try { localStorage.setItem(VIEW_KEY, action.payload); } catch { /* private mode: keep it for this session only */ }
        },
    },
});

export const selectView = (state) => state.settings.view;
export const { setView } = settingsSlice.actions;
export default settingsSlice.reducer;
