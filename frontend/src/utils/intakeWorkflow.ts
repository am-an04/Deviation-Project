import type { AppDispatch } from '../store/store';
import { resetDeviation } from '../store/slices/deviationSlice';
import { resetAssessment } from '../store/slices/assessmentSlice';
import { resetUi } from '../store/slices/uiSlice';

let activeExtractionPromise: { abort: () => void } | null = null;
let activeAssessmentPromise: { abort: () => void } | null = null;

export const setActiveExtractionPromise = (promise: { abort: () => void } | null) => {
  activeExtractionPromise = promise;
};

export const setActiveAssessmentPromise = (promise: { abort: () => void } | null) => {
  activeAssessmentPromise = promise;
};

export const executeResetWorkflow = (dispatch: AppDispatch) => {
  if (activeExtractionPromise) {
    try {
      activeExtractionPromise.abort();
    } catch {
      // safely handle already completed/aborted
    }
    activeExtractionPromise = null;
  }

  if (activeAssessmentPromise) {
    try {
      activeAssessmentPromise.abort();
    } catch {
      // safely handle already completed/aborted
    }
    activeAssessmentPromise = null;
  }

  dispatch(resetDeviation());
  dispatch(resetAssessment());
  dispatch(resetUi());

  // Broadcast event so any mounted file inputs or local states reset immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reset-intake-workflow'));
  }
};
