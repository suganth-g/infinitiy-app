  import React, { useState } from 'react';
import { apiFetch, setAuthToken } from '../services/api';
import { DashboardMockupWidget } from '../components/DashboardMockupWidget';
import { ArrowRight, Lock, Mail, Building, Phone, UserCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, company: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login fields
  const [email, setEmail] = useState('admin@infinitytech.com');
  const [password, setPassword] = useState('Infinity@2026');

  // Register fields
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!companyName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
          setError('Please fill in Company Name, Full Name, Email, and Password');
          setLoading(false);
          return;
        }
        const res = await apiFetch<any>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            companyName: companyName.trim(),
            fullName: fullName.trim(),
            email: email.trim(),
            password: password.trim(),
            phone: phone || '+91 98765 43210',
          }),
        });
        setAuthToken(res.accessToken);
        onLoginSuccess(res.user, res.company);
      } else {
        const res = await apiFetch<any>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setAuthToken(res.accessToken);
        onLoginSuccess(res.user, res.company);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-8 shadow-soft">
          <div className="mb-8">
            {/* Text Only Logo matching Navbar header with margin gap */}
            <div className="mb-6">
              <span className="font-extrabold text-slate-900 text-xl tracking-tight font-sans">
                Infinity <span className="text-primary font-normal">Business Suite</span>
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 font-sans">
              {isRegistering ? 'Register Company' : 'Sign In'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegistering ? 'Enter details to setup your ERP account.' : 'Access your business dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-primary/20">
                    <Building className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      required
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-transparent outline-none w-full text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-primary/20">
                    <UserCheck className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-transparent outline-none w-full text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-primary/20">
                    <Phone className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-transparent outline-none w-full text-slate-800"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-primary/20">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="email"
                  required
                  placeholder="admin@infinitytech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-primary/20">
                <Lock className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-hover flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <span>{loading ? 'Please wait...' : isRegistering ? 'Register' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-primary font-bold hover:underline"
            >
              {isRegistering ? 'Already registered? Sign In' : "New company? Register"}
            </button>
          </div>

          {!isRegistering && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block">Demo Credentials:</span>
              <span>admin@infinitytech.com / Infinity@2026</span>
            </div>
          )}
        </div>

        {/* Right UI Visual Mockup Panel */}
        <div className="lg:col-span-7 hidden lg:block">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Software that empowers your business
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Cloud ERP solution by Infinity Technologies.
            </p>
          </div>
          <DashboardMockupWidget />
        </div>
      </div>
    </div>
  );
};
