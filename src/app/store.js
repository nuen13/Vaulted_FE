import { configureStore } from '@reduxjs/toolkit';
import mediaReducer from '../features/media/media-slice'; // Path to your slice

export const store = configureStore({
  reducer: {
    media: mediaReducer, // This name "media" is how you'll access it via useSelector
  },
});