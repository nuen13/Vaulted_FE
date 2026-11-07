import { configureStore} from '@reduxjs/toolkit';
import mediaReducer from '../slices/media-slice'; // Path to your slice
import reviewReducer from '../slices/review-slice'; // Path to your review slice
import categoryReducer from '../slices/category-slice'; // Path to your category slice
import photoReducer from '../slices/photo-slice'; // Path to your photo slice
import settingsReducer from '../slices/settings-slice'; // Path to your settings slice
import shareReducer from '../slices/share-slice'; // Path to your share slice
import quoteReducer from '../slices/quote-slice'; // Path to your quote slice
import statusReducer from '../slices/status-slice'; // Path to your status slice
export const store = configureStore({
  reducer: {
    media: mediaReducer, // This name "media" is how you'll access it via useSelector
    review: reviewReducer, // This name "review" is how you'll access it via useSelector
    category: categoryReducer, // This name "category" is how you'll access it via useSelector
    photo: photoReducer, // This name "photo" is how you'll access it via useSelector
    settings: settingsReducer, // This name "settings" is how you'll access it via useSelector
    share: shareReducer, // This name "share" is how you'll access it via useSelector
    quote: quoteReducer, // This name "quote" is how you'll access it via useSelector
    status: statusReducer, // This name "status" is how you'll access it via useSelector
  },
});