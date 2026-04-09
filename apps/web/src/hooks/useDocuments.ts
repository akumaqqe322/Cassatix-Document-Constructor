import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { GeneratedDocument, DocumentFilters } from '../types/document';

export const useDocuments = (filters: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      const { data } = await api.get<GeneratedDocument[]>('/documents');
      
      // Client-side filtering
      let filtered = data;
      
      if (filters.status) {
        filtered = filtered.filter((d) => d.status === filters.status);
      }
      
      if (filters.generationType) {
        filtered = filtered.filter((d) => d.generationType === filters.generationType);
      }
      
      if (filters.outputFormat) {
        filtered = filtered.filter((d) => d.outputFormat === filters.outputFormat);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.caseId.toLowerCase().includes(searchLower) ||
            d.template?.name.toLowerCase().includes(searchLower) ||
            d.template?.code.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    },
  });
};
