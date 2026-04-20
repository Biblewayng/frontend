import apiClient from './apiClient';

export const emailTemplateService = {
  getAll: async () => {
    const { data } = await apiClient.get('/email-templates');
    return data;
  },
  getByName: async (name: string) => {
    const { data } = await apiClient.get(`/email-templates/${name}`);
    return data;
  },
  sendTestEmail: async (templateName: string, recipientEmail: string) => {
    const { data } = await apiClient.post('/email-templates/test-email', {
      template_name: templateName,
      recipient_email: recipientEmail,
    });
    return data;
  },
};
