import { configureStore} from '@reduxjs/toolkit';
import mediaReducer from '../features/media/media-slice'; // Path to your slice
import reviewReducer from '../features/mediaDetails/review-slice'; // Path to your review slice
export const store = configureStore({
  reducer: {
    media: mediaReducer, // This name "media" is how you'll access it via useSelector
    review: reviewReducer, // This name "review" is how you'll access it via useSelector
  },
});