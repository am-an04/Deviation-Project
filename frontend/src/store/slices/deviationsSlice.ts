import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import type { DeviationRecord, DeviationSavePayload } from '../../types';

export interface DeviationsState {
  records: DeviationRecord[];
  total: number;
  loading: boolean;
  error: string | null;
  currentRecord: DeviationRecord | null;
  detailLoading: boolean;
  detailError: string | null;
  filters: {
    search: string;
    status: string;
    severity: string;
  };
}

const initialState: DeviationsState = {
  records: [],
  total: 0,
  loading: false,
  error: null,
  currentRecord: null,
  detailLoading: false,
  detailError: null,
  filters: {
    search: '',
    status: 'All',
    severity: 'All',
  },
};

export const fetchDeviations = createAsyncThunk<
  { items: DeviationRecord[]; total: number },
  void,
  { state: { deviations: DeviationsState }; rejectValue: string }
>('deviations/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    const { filters } = getState().deviations;
    const data = await apiService.getDeviations({
      search: filters.search || undefined,
      status: filters.status !== 'All' ? filters.status : undefined,
      severity: filters.severity !== 'All' ? filters.severity : undefined,
    });
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.detail || error.message || 'Failed to fetch deviations';
    return rejectWithValue(message);
  }
});

export const fetchDeviationById = createAsyncThunk<
  DeviationRecord,
  string,
  { rejectValue: string }
>('deviations/fetchById', async (deviationId: string, { rejectWithValue }) => {
  try {
    const data = await apiService.getDeviationById(deviationId);
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.detail || error.message || 'Failed to fetch deviation detail';
    return rejectWithValue(message);
  }
});

export const saveDeviation = createAsyncThunk<
  DeviationRecord,
  DeviationSavePayload,
  { rejectValue: string }
>('deviations/save', async (payload: DeviationSavePayload, { rejectWithValue }) => {
  try {
    const data = await apiService.createDeviation(payload);
    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.detail || error.message || 'Failed to save deviation';
    return rejectWithValue(message);
  }
});

export const deviationsSlice = createSlice({
  name: 'deviations',
  initialState,
  reducers: {
    setFilterSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    setFilterSeverity: (state, action: PayloadAction<string>) => {
      state.filters.severity = action.payload;
    },
    resetFilters: (state) => {
      state.filters = { search: '', status: 'All', severity: 'All' };
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
      state.detailError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchDeviations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeviations.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchDeviations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load records';
      });

    // Fetch By ID
    builder
      .addCase(fetchDeviationById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchDeviationById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchDeviationById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || 'Failed to load record';
      });

    // Save
    builder
      .addCase(saveDeviation.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
        state.total += 1;
      });
  },
});

export const {
  setFilterSearch,
  setFilterStatus,
  setFilterSeverity,
  resetFilters,
  clearCurrentRecord,
} = deviationsSlice.actions;

export default deviationsSlice.reducer;
