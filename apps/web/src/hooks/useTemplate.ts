import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Template, TemplateVersion } from '../types/template';

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
