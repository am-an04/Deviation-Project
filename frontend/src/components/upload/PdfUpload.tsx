import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setUploadedFileMeta,
  clearUploadedFile,
  extractDeviation,
} from '../../store/slices/deviationSlice';
import { resetAssessment } from '../../store/slices/assessmentSlice';
import { setActiveStep } from '../../store/slices/uiSlice';
import { setActiveExtractionPromise } from '../../utils/intakeWorkflow';

export const PdfUpload: React.FC = () => {
  const dispatch = useAppDispatch();
  const { uploadedFileMeta, extractionStatus, extractionError } = useAppSelector(
    (state) => state.deviation
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize with Redux reset actions and window reset event
  useEffect(() => {
    if (!uploadedFileMeta) {
      setSelectedFile(null);
      setLocalError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploadedFileMeta]);

  useEffect(() => {
    const handleResetEvent = () => {
      setSelectedFile(null);
      setLocalError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    window.addEventListener('reset-intake-workflow', handleResetEvent);
    return () => {
      window.removeEventListener('reset-intake-workflow', handleResetEvent);
    };
  }, []);

  const validateAndSetFile = (file: File) => {
    setLocalError(null);

    // Validate MIME type and extension
    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf';

    if (!isPdf) {
      setLocalError('Please upload a PDF file.');
      return;
    }

    if (file.size === 0) {
      setLocalError('The uploaded PDF file is empty (0 bytes). Please upload a valid document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError('File size exceeds the 10 MB limit.');
      return;
    }

    // Replace previous file and reset any previous extraction state so no data leaks
    dispatch(clearUploadedFile());
    dispatch(resetAssessment());
    dispatch(setActiveStep(1));

    setSelectedFile(file);
    dispatch(
      setUploadedFileMeta({
        name: file.name,
        size: file.size,
      })
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
    // Always clear the input element value so re-selecting the exact same file fires onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    dispatch(clearUploadedFile());
    dispatch(resetAssessment());
    dispatch(setActiveStep(1));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLocalError(null);
    const promise = dispatch(extractDeviation(selectedFile));
    setActiveExtractionPromise(promise);
    try {
      const result = await promise;
      if (extractDeviation.fulfilled.match(result)) {
        dispatch(setActiveStep(2));
      }
    } finally {
      setActiveExtractionPromise(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isAnalyzing = extractionStatus === 'loading';

  return (
    <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE2E8]">
        <div>
          <h2 className="text-sm font-semibold text-[#17212B] uppercase tracking-wider">
            1. Source Document
          </h2>
          <p className="text-xs text-[#5B6875] mt-0.5">
            Attach the initial deviation report, excursion alert, or inspection sheet.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block text-[11px] font-medium text-[#174A7E] bg-[#EEF4FF] px-2 py-0.5 rounded border border-[#CBD4DD]">
            PDF Only · Max 10MB
          </span>
        </div>
      </div>

      {/* Upload Drop Zone / Selected File View */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-[#2F6FED] bg-[#EEF4FF]'
              : 'border-[#CBD4DD] hover:border-[#174A7E] bg-[#F5F7FA]/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EEF4FF] text-[#2F6FED] flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <div className="text-sm font-semibold text-[#17212B]">
                Upload deviation document
              </div>
              <div className="text-xs text-[#5B6875] mt-1">
                Drag and drop your PDF here or{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-[#2F6FED] font-semibold hover:underline focus:outline-none"
                >
                  Browse Files
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#8A96A3]">
              PDF files up to 10 MB
            </p>
          </div>
        </div>
      ) : (
        /* Selected File Card State */
        <div className="border border-[#CBD4DD] rounded-lg p-4 bg-[#F5F7FA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded bg-[#EEF4FF] text-[#174A7E] flex items-center justify-center shrink-0 border border-[#CBD4DD]">
                <FileText className="w-5 h-5 text-[#2F6FED]" />
              </div>
              <div className="min-w-0">
                <div
                  className="text-xs font-semibold text-[#17212B] truncate"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </div>
                <div className="text-[11px] text-[#5B6875]">
                  {formatFileSize(selectedFile.size)} · PDF Document
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isAnalyzing}
              className="text-xs text-[#5B6875] hover:text-[#B42318] px-2.5 py-1 rounded border border-[#CBD4DD] bg-white hover:bg-red-50 transition-colors flex items-center shrink-0"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Remove
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCE2E8] flex justify-end">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedFile}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-md flex items-center space-x-2 shadow-sm transition-all ${
                isAnalyzing || !selectedFile
                  ? 'bg-[#8A96A3] cursor-not-allowed'
                  : 'bg-[#174A7E] hover:bg-[#123A63]'
              }`}
            >
              <span>
                {isAnalyzing ? 'Analyzing Deviation...' : 'Analyze Deviation'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Validation / API Error Banner */}
      {(localError || extractionError) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2 text-xs text-[#B42318]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{localError || extractionError}</div>
        </div>
      )}
    </div>
  );
};
