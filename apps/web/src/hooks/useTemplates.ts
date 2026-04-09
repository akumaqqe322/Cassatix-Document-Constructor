import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Template, TemplateFilters, TemplateStatus } from '../types/template';

export interface CreateTemplateInput {
  name: string;
  code: string;
  category: string;
  caseType: string;
  status: TemplateStatus;
}

export const useTemplates = (filters: TemplateFilters) => {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: async () => {
      const { data } = await api.get<Template[]>('/templates', {
        params: filters,
      });
      
      // Client-side search if backend doesn't support it yet
      // (The backend TemplateQueryDto doesn't have a search field yet)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return data.filter(
          (t) =>
            t.name.toLowerCase().includes(searchLower) ||
            t.code.toLowerCase().includes(searchLower)
        );
      }
      
      return data;
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data } = await api.post<Template>('/templates', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};
