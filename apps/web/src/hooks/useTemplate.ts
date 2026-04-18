import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Template, TemplateVersion } from '../types/template';
import { GeneratedDocument, DocumentStatus } from '../types/document';

export const useTemplate = (id: string | undefined) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: async () => {
      if (!id) throw new Error('Template ID is required');
      const { data } = await api.get<Template>(`/templates/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useTemplateVersions = (templateId: string | undefined) => {
  return useQuery({
    queryKey: ['templates', templateId, 'versions'],
    queryFn: async () => {
      if (!templateId) throw new Error('Template ID is required');
      const { data } = await api.get<TemplateVersion[]>(`/templates/${templateId}/versions`);
      return data;
    },
    enabled: !!templateId,
  });
};

export const useGeneratePreview = () => {
  return useMutation({
    mutationFn: async ({ templateId, versionId, caseId, outputFormat, customVariables }: { 
      templateId: string; 
      versionId: string; 
      caseId?: string; 
      outputFormat?: string;
      customVariables?: Record<string, any>;
    }) => {
      const { data } = await api.post<GeneratedDocument>(`/templates/${templateId}/versions/${versionId}/preview`, { 
        caseId, 
        outputFormat,
        customVariables,
      });
      return data;
    },
  });
};

export const useGenerateFinal = () => {
  return useMutation({
    mutationFn: async ({ templateId, versionId, caseId, outputFormat, customVariables }: { 
      templateId: string; 
      versionId: string; 
      caseId?: string; 
      outputFormat?: string;
      customVariables?: Record<string, any>;
    }) => {
      const { data } = await api.post<GeneratedDocument>(`/templates/${templateId}/versions/${versionId}/generate`, { 
        caseId, 
        outputFormat,
        customVariables,
      });
      return data;
    },
  });
};

export const useGeneratedDocument = (id: string | undefined) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      if (!id) throw new Error('Document ID is required');
      const { data } = await api.get<GeneratedDocument>(`/documents/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const doc = query.state.data;
      const error = query.state.error;
      // Stop polling if we got a terminal state or a hard error (like document missing/API error)
      if (error || (doc && (doc.status === DocumentStatus.COMPLETED || doc.status === DocumentStatus.FAILED))) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
};

export const useVersionDocuments = (templateId: string, versionId: string) => {
  return useQuery({
    queryKey: ['templates', templateId, 'versions', versionId, 'documents'],
    queryFn: async () => {
      const { data } = await api.get<GeneratedDocument[]>(`/templates/${templateId}/versions/${versionId}/documents`);
      return data;
    },
    enabled: !!templateId && !!versionId,
    refetchInterval: (query) => {
      const docs = query.state.data;
      const hasRunning = docs?.some(d => d.status === DocumentStatus.QUEUED || d.status === DocumentStatus.PROCESSING);
      return hasRunning ? 3000 : false;
    }
  });
};

export const useUploadTemplateFile = () => {
  return useMutation({
    mutationFn: async ({ templateId, versionId, file }: { templateId: string; versionId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<TemplateVersion>(`/templates/${templateId}/versions/${versionId}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
  });
};

export const useCreateTemplateVersion = () => {
  return useMutation({
    mutationFn: async ({ 
      templateId, 
      changelog, 
      variablesSchemaJson, 
      conditionsSchemaJson 
    }: { 
      templateId: string; 
      changelog: string; 
      variablesSchemaJson?: any; 
      conditionsSchemaJson?: any; 
    }) => {
      const { data } = await api.post<TemplateVersion>(`/templates/${templateId}/versions`, {
        changelog,
        variablesSchemaJson,
        conditionsSchemaJson,
      });
      return data;
    },
  });
};

export const usePublishVersion = () => {
  return useMutation({
    mutationFn: async ({ templateId, versionId }: { templateId: string; versionId: string }) => {
      const { data } = await api.post<TemplateVersion>(`/templates/${templateId}/versions/${versionId}/publish`);
      return data;
    },
  });
};

export const useArchiveVersion = () => {
  return useMutation({
    mutationFn: async ({ templateId, versionId }: { templateId: string; versionId: string }) => {
      const { data } = await api.post<TemplateVersion>(`/templates/${templateId}/versions/${versionId}/archive`);
      return data;
    },
  });
};

export const useDeleteTemplate = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/templates/${id}`);
      return data;
    },
  });
};
