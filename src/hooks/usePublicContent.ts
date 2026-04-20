import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';

export const usePublicContent = () => {
  const query = useQuery({
    queryKey: ['public-content'],
    queryFn: contentService.getAll,
    staleTime: 1000 * 60 * 10, // 10 min — public content rarely changes
  });

  const content = Array.isArray(query.data)
    ? query.data.reduce((acc: any, item: any) => { acc[item.key] = item.value; return acc; }, {})
    : query.data ?? {};

  return { content, loading: query.isLoading };
};
