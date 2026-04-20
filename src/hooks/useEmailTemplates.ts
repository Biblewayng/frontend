import { useQuery } from '@tanstack/react-query';
import { emailTemplateService } from '@/services/emailTemplate.service';

export const EMAIL_TEMPLATES_KEY = 'email-templates';

export const useEmailTemplates = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [EMAIL_TEMPLATES_KEY],
    queryFn: emailTemplateService.getAll,
  });

  return {
    templates: data || [],
    loading: isLoading,
    error,
  };
};

export const useEmailTemplate = (name: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [EMAIL_TEMPLATES_KEY, name],
    queryFn: () => emailTemplateService.getByName(name),
    enabled: !!name,
  });

  return {
    template: data,
    loading: isLoading,
    error,
  };
};
