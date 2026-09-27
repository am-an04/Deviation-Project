import { configureStore } from '@reduxjs/toolkit';
import deviationReducer from './slices/deviationSlice';
import assessmentReducer from './slices/assessmentSlice';
import deviationsReducer from './slices/deviationsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    deviation: deviationReducer,
    assessment: assessmentReducer,
    deviations: deviationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
