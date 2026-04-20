import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.success('Password reset email sent');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Pacifico, serif' }}>
              Bibleway
            </h2>
            <h3 className="mt-6 text-3xl font-bold text-gray-900">Reset your password</h3>
            <p className="mt-2 text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <i className="ri-mail-check-line text-green-600 text-5xl mb-4"></i>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h4>
              <p className="text-sm text-gray-600 mb-4">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <Link
                to="/login"
                className="inline-block text-blue-600 hover:text-blue-500 font-medium text-sm"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-white text-center">
            <i className="ri-lock-password-line text-8xl mb-6"></i>
            <h2 className="text-4xl font-bold mb-4">Forgot Your Password?</h2>
            <p className="text-xl text-blue-100">No worries, we'll help you reset it</p>
          </div>
        </div>
      </div>
    </div>
  );
}
