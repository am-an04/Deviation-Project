import axios from 'axios';
import type {
  ExtractionApiResponse,
  ReviewedData,
  AssessmentData,
  DeviationSavePayload,
  DeviationRecord,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

export const apiService = {
  async uploadAndExtractDeviation(file: File, signal?: AbortSignal): Promise<ExtractionApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ExtractionApiResponse>(
      '/api/deviations/extract',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal,
      }
    );
    return response.data;
  },

  async assessDeviation(data: ReviewedData, signal?: AbortSignal): Promise<AssessmentData> {
    const response = await apiClient.post<AssessmentData>(
      '/api/deviations/assess',
      data,
      { signal }
    );
    return response.data;
  },

  async createDeviation(data: DeviationSavePayload): Promise<DeviationRecord> {
    const response = await apiClient.post<DeviationRecord>(
      '/api/deviations',
      data
    );
    return response.data;
  },

  async getDeviations(params?: {
    search?: string;
    status?: string;
    severity?: string;
  }): Promise<{ items: DeviationRecord[]; total: number }> {
    const response = await apiClient.get<{ items: DeviationRecord[]; total: number }>(
      '/api/deviations',
      { params }
    );
    return response.data;
  },

  async getDeviationById(deviationId: string): Promise<DeviationRecord> {
    const response = await apiClient.get<DeviationRecord>(
      `/api/deviations/${deviationId}`
    );
    return response.data;
  },
};

export default apiService;
