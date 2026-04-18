import React, { useEffect } from 'react';
import { useGeneratedDocument } from '../../../hooks/useTemplate';
import { DocumentStatus, OutputFormat } from '../../../types/document';
import { 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  ExternalLink,
  RefreshCw,
  FileCode
} from 'lucide-react';
import { Button } from '../../ui/button';
import { api } from '../../../lib/api';

interface GenerationStatusStepProps {
  documentId: string;
  onRetry: () => void;
  onClose: () => void;
}

export function GenerationStatusStep({ documentId, onRetry, onClose }: GenerationStatusStepProps) {
  const { data: doc, isLoading, error } = useGeneratedDocument(documentId);

  // Auto-download on success (optional UX but helpful)
  // We won't auto-download but we will provide the button

  const handleDownload = () => {
    if (!doc?.id) return;
    // Direct link to the download endpoint which handles the redirect to secure storage
    window.open(`/api/documents/${doc.id}/download`, '_blank');
  };

  const isFailed = doc?.status === DocumentStatus.FAILED;
  const isCompleted = doc?.status === DocumentStatus.COMPLETED;
  const isProcessing = doc?.status === DocumentStatus.PROCESSING || doc?.status === DocumentStatus.QUEUED;

  // Recovery helper for PDF conversion failures
  const pdfConversionFailed = doc?.errorMessage?.includes('[CONVERSION_FAILED]');

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center min-h-[300px]">
      {isLoading && !doc && (
        <div className="space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-500">Initializing generation engine...</p>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
               <FileText className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Generating Document</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-[300px]">
              Our engine is preparing your {doc?.outputFormat} file. This usually takes 10-20 seconds.
            </p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="p-3 bg-green-50 rounded-full mx-auto w-fit">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Success! Document Ready</h4>
            <p className="text-xs text-gray-500 mt-1">
              Your {doc?.template?.name || 'document'} has been generated.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto">
            <Button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Download {doc?.outputFormat}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      {(isFailed || error) && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-3 bg-red-50 rounded-full mx-auto w-fit">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Generation Failed</h4>
            <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mt-2 max-w-[400px]">
              {doc?.errorMessage || (error as any)?.message || "An unexpected error occurred during generation."}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full max-w-[250px] mx-auto">
            {pdfConversionFailed && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-left">
                <p className="text-[10px] text-amber-800 font-medium flex items-center gap-1 mb-2">
                   <FileCode className="h-3 w-3" />
                   Recovery Option
                </p>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  PDF conversion failed, but we can attempt to generate the Word version instead.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="mt-2 h-7 text-[10px] border-amber-200 text-amber-700 hover:bg-amber-100 w-full"
                >
                  Generate as DOCX
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onRetry} className="flex-1">
                <RefreshCw className="mr-2 h-3 w-3" />
                Fix & Retry
              </Button>
              <Button variant="ghost" onClick={onClose} className="flex-1 text-gray-400">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
