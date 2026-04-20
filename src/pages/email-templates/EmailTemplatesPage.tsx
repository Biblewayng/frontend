import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DataTable from '@/components/common/DataTable';
import EmailTemplateModal from '@/components/modals/EmailTemplateModal';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';

interface EmailTemplate {
  name: string;
  filename: string;
  content: string;
}

export default function EmailTemplatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const { templates, loading } = useEmailTemplates();

  const columns = useMemo<ColumnDef<EmailTemplate>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Template Name',
      cell: ({ row }) => {
        const name = row.original.name
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return (
          <div className="flex items-center">
            <i className="ri-mail-line text-blue-600 text-xl mr-3"></i>
            <span className="font-medium text-gray-900">{name}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedTemplate(row.original)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          <i className="ri-eye-line mr-1"></i>
          View
        </button>
      ),
    },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
              <p className="mt-2 text-gray-600">
                Preview email templates used by the application.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <DataTable
                data={templates}
                columns={columns}
                isLoading={loading}
              />
            </div>
          </div>
        </main>
      </div>

      {selectedTemplate && (
        <EmailTemplateModal
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          templateName={selectedTemplate.name}
          templateContent={selectedTemplate.content}
        />
      )}
    </div>
  );
}
