import { Link } from 'react-router-dom';
import { usePublicContent } from '@/hooks/usePublicContent';

export default function PublicFooter() {
  const { content } = usePublicContent();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-4" style={{ fontFamily: "Pacifico, serif" }}>
              Bibleway
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Building a community of faith, hope, and love. Join us as we grow together in our relationship with God and serve others.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><a href="/#services" className="text-gray-300 hover:text-white">Services</a></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <i className="ri-map-pin-line mr-2 mt-1 flex-shrink-0"></i>
                <span>
                  {content.address_line1}<br />
                  {content.address_line2}<br />
                  {content.address_line3}<br />
                  {content.address_line4}
                </span>
              </li>
              <li className="flex items-center">
                <i className="ri-mail-line mr-2"></i>
                {content.contact_email}
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 mt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Bibleway. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
