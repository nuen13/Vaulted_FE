// -- file: src/slices/filter-counts.js
// The numbers next to each filter. Each one counts within the other filter that's set:
// a status counts the items in the selected category, a category counts the items in the
// selected status (or the archive, while viewing it).
import { createSelector } from '@reduxjs/toolkit';

const selectCounts = (state) => state.media.counts;
const selectCategoryId = (state) => state.media.selectedCategory;
const selectStatus = (state) => state.media.selectedStatus;
const selectArchived = (state) => state.media.showArchived;

const tally = (items, key) => {
    const byKey = new Map();
    items.forEach((item) => byKey.set(item[key], (byKey.get(item[key]) ?? 0) + 1));
    return byKey;
};

// { total, byStatus: Map(status -> n), archived } within the selected category
export const selectStatusCounts = createSelector(
    [selectCounts, selectCategoryId],
    ({ active, archived }, categoryId) => {
        const inCategory = (item) => categoryId === null || item.categoryId === categoryId;
        const items = active.filter(inCategory);
        return { total: items.length, byStatus: tally(items, 'status'), archived: archived.filter(inCategory).length };
    }
);

// { total, byCategory: Map(categoryId -> n) } within the selected status (or the archive)
export const selectCategoryCounts = createSelector(
    [selectCounts, selectStatus, selectArchived],
    ({ active, archived }, status, showArchived) => {
        const items = showArchived ? archived : active.filter((item) => status === null || item.status === status);
        return { total: items.length, byCategory: tally(items, 'categoryId') };
    }
);
