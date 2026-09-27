import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface UiState {
  activeStep: number;
  notification: Notification | null;
  isSaving: boolean;
}

const initialState: UiState = {
  activeStep: 1, // 1: Document Upload, 2: Review Extracted Info, 3: AI Impact Assessment, 4: Record Saved
  notification: null,
  isSaving: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    setNotification: (state, action: PayloadAction<Notification | null>) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    setIsSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    resetUi: (state) => {
      state.activeStep = 1;
      state.notification = null;
      state.isSaving = false;
    },
  },
});

export const {
  setActiveStep,
  setNotification,
  clearNotification,
  setIsSaving,
  resetUi,
} = uiSlice.actions;

export default uiSlice.reducer;
