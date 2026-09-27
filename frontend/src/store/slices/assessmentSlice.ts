import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import type { ReviewedData, AssessmentData, RetrievedGuidanceItem } from '../../types';

export interface AssessmentState {
  potentialImpact: string | null;
  suggestedSeverity: 'Minor' | 'Moderate' | 'Major' | 'Critical' | null;
  finalSeverity: 'Minor' | 'Moderate' | 'Major' | 'Critical' | null;
  reason: string | null;
  keyFactors: string[];
  ruleCandidate: 'Minor' | 'Moderate' | 'Major' | 'Critical' | null;
  triggeredRules: string[];
  retrievedGuidance: RetrievedGuidanceItem[];
  assessmentStatus: string;
  assessmentError: string | null;
  currentRequestId: string | null;
}

const initialState: AssessmentState = {
  potentialImpact: null,
  suggestedSeverity: null,
  finalSeverity: null,
  reason: null,
  keyFactors: [],
  ruleCandidate: null,
  triggeredRules: [],
  retrievedGuidance: [],
  assessmentStatus: 'idle',
  assessmentError: null,
  currentRequestId: null,
};

export const assessDeviation = createAsyncThunk<
  AssessmentData,
  ReviewedData,
  { rejectValue: string }
>('assessment/assess', async (reviewedData: ReviewedData, { rejectWithValue, signal }) => {
  try {
    const data = await apiService.assessDeviation(reviewedData, signal);
    return data;
  } catch (error: any) {
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED' || signal.aborted) {
      return rejectWithValue('Assessment cancelled');
    }
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Failed to complete AI impact assessment';
    return rejectWithValue(message);
  }
});

export const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setFinalSeverity: (
      state,
      action: PayloadAction<'Minor' | 'Moderate' | 'Major' | 'Critical'>
    ) => {
      state.finalSeverity = action.payload;
    },
    acceptAiSuggestion: (state) => {
      if (state.suggestedSeverity) {
        state.finalSeverity = state.suggestedSeverity;
      }
    },
    resetAssessment: (state) => {
      state.potentialImpact = null;
      state.suggestedSeverity = null;
      state.finalSeverity = null;
      state.reason = null;
      state.keyFactors = [];
      state.ruleCandidate = null;
      state.triggeredRules = [];
      state.retrievedGuidance = [];
      state.assessmentStatus = 'idle';
      state.assessmentError = null;
      state.currentRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(assessDeviation.pending, (state, action) => {
        state.assessmentStatus = 'loading';
        state.assessmentError = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(assessDeviation.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }
        state.potentialImpact = action.payload.potential_impact;
        state.suggestedSeverity = action.payload.suggested_severity;
        state.finalSeverity = action.payload.suggested_severity;
        state.reason = action.payload.reason;
        state.keyFactors = action.payload.key_factors || [];
        state.ruleCandidate = action.payload.rule_candidate || null;
        state.triggeredRules = action.payload.triggered_rules || [];
        state.retrievedGuidance = action.payload.retrieved_guidance || [];
        state.assessmentStatus = action.payload.assessment_status || 'supported';
      })
      .addCase(assessDeviation.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }
        if (action.payload === 'Assessment cancelled') {
          state.assessmentStatus = 'idle';
          state.assessmentError = null;
          return;
        }
        state.assessmentStatus = 'failed';
        state.assessmentError = action.payload || 'Impact assessment failed';
      });
  },
});

export const { setFinalSeverity, acceptAiSuggestion, resetAssessment } =
  assessmentSlice.actions;

export default assessmentSlice.reducer;
