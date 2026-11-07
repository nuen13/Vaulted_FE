// "Oct 25, 2026" for a review / journal entry's date
export const formatEntryDate = (value) => value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
