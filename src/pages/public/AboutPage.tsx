import { Link } from 'react-router-dom';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import { usePublicContent } from '@/hooks/usePublicContent';

export default function AboutPage() {
  const { content, loading } = usePublicContent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Church</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Building a community of faith, hope, and love since our founding
          </p>
        </div>
      </section>

      {/* Our Leadership */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">OUR LEADERSHIP</h2>
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
              <div className="prose prose-lg max-w-none text-gray-700 [&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:font-bold [&>p:first-child]:first-letter:text-blue-600 [&>p:first-child]:first-letter:mr-2 [&>p:first-child]:first-letter:float-left" dangerouslySetInnerHTML={{ __html: content.leadership_text }}>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white flex flex-col justify-center">
              <div className="prose prose-xl max-w-none text-white [&>p]:text-white [&>p]:italic" dangerouslySetInnerHTML={{ __html: content.scripture_text }}>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brief History */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">BRIEF HISTORY OF OUR CHURCH</h2>
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: content.history_text }}>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We'd love to meet you and help you take your next step in faith.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold">
              Get Started
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
