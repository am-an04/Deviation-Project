import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import type { ExtractedData, ReviewedData, FieldTraceability, ExtractionApiResponse } from '../../types';

export interface UploadedFileMeta {
  name: string;
  size: number;
}

export interface DeviationState {
  uploadedFileMeta: UploadedFileMeta | null;
  extractedText: string;
  extractedData: ExtractedData | null;
  reviewedData: ReviewedData;
  traceability: Record<string, FieldTraceability>;
  sourceFilename: string | null;
  extractionStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  extractionError: string | null;
  currentRequestId: string | null;
}

const initialReviewedData: ReviewedData = {
  source_document_reference: null,
  date_of_occurrence: null,
  site: null,
  department: null,
  title: null,
  detection_source: null,
  related_product: null,
  batch_number: null,
  description: null,
  immediate_action: null,
};

const initialState: DeviationState = {
  uploadedFileMeta: null,
  extractedText: '',
  extractedData: null,
  reviewedData: initialReviewedData,
  traceability: {},
  sourceFilename: null,
  extractionStatus: 'idle',
  extractionError: null,
  currentRequestId: null,
};

export const extractDeviation = createAsyncThunk<
  ExtractionApiResponse,
  File,
  { rejectValue: string }
>('deviation/extract', async (file: File, { rejectWithValue, signal }) => {
  try {
    const data = await apiService.uploadAndExtractDeviation(file, signal);
    return data;
  } catch (error: any) {
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED' || signal.aborted) {
      return rejectWithValue('Request cancelled');
    }
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to analyze deviation document';
    return rejectWithValue(message);
  }
});

export const deviationSlice = createSlice({
  name: 'deviation',
  initialState,
  reducers: {
    setUploadedFileMeta: (state, action: PayloadAction<UploadedFileMeta | null>) => {
      state.uploadedFileMeta = action.payload;
      state.sourceFilename = action.payload ? action.payload.name : null;
    },
    updateReviewedField: (
      state,
      action: PayloadAction<{ field: keyof ReviewedData; value: string | null }>
    ) => {
      state.reviewedData[action.payload.field] = action.payload.value;
      if (!action.payload.value || action.payload.value.trim() === '') {
        state.traceability[action.payload.field] = {
          value: null,
          source: 'user',
          status: 'Not identified',
        };
      } else {
        state.traceability[action.payload.field] = {
          value: action.payload.value,
          source: 'user',
          status: 'Edited by User',
        };
      }
    },
    clearUploadedFile: (state) => {
      state.uploadedFileMeta = null;
      state.sourceFilename = null;
      state.extractedText = '';
      state.extractedData = null;
      state.reviewedData = { ...initialReviewedData };
      state.traceability = {};
      state.extractionStatus = 'idle';
      state.extractionError = null;
      state.currentRequestId = null;
    },
    resetDeviation: (state) => {
      state.uploadedFileMeta = null;
      state.extractedText = '';
      state.extractedData = null;
      state.reviewedData = { ...initialReviewedData };
      state.traceability = {};
      state.sourceFilename = null;
      state.extractionStatus = 'idle';
      state.extractionError = null;
      state.currentRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(extractDeviation.pending, (state, action) => {
        state.extractionStatus = 'loading';
        state.extractionError = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(extractDeviation.fulfilled, (state, action) => {
        // Stale response guard: ignore if a reset or different request occurred
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }
        state.extractionStatus = 'succeeded';
        state.extractedText = action.payload.extracted_text;
        state.extractedData = action.payload.structured_data;

        // Normalize traceability status
        const normTrace: Record<string, FieldTraceability> = {};
        for (const [key, t] of Object.entries(action.payload.traceability || {})) {
          normTrace[key] = {
            ...t,
            status: t.status === 'Extracted' ? 'Extracted by AI' : t.status,
          };
        }
        state.traceability = normTrace;
        state.reviewedData = { ...action.payload.structured_data };
      })
      .addCase(extractDeviation.rejected, (state, action) => {
        // Stale response guard
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }
        if (action.payload === 'Request cancelled') {
          state.extractionStatus = 'idle';
          state.extractionError = null;
          return;
        }
        state.extractionStatus = 'failed';
        state.extractionError = action.payload || 'Document analysis failed';
      });
  },
});

export const {
  setUploadedFileMeta,
  clearUploadedFile,
  updateReviewedField,
  resetDeviation,
} = deviationSlice.actions;

export default deviationSlice.reducer;
