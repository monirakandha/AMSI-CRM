import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, User, UserPlus } from 'lucide-react';
import { Staff, Role } from '../types';
import { MOCK_STAFF } from '../constants';

interface LoginProps {
  onLogin: (user: Staff) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.SALES);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (mode === 'login') {
        // Simple mock authentication logic
        const user = MOCK_STAFF.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      } else {
        // Registration Logic
        if (!email || !password || !name) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        // Check if user already exists
        const existingUser = MOCK_STAFF.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            setError('User with this email already exists');
            setIsLoading(false);
            return;
        }

        const newUser: Staff = {
            id: `ST-${Math.floor(Math.random() * 10000)}`,
            name,
            email,
            phone: '555-000-0000', // Default placeholder
            role,
            activeLeads: 0
        };
        
        // In a real app, we would POST this to an API. 
        // Here we just log them in immediately.
        onLogin(newUser);
      }
    }, 800);
  };

  const handleDemoLogin = (role: Role) => {
    const demoUser = MOCK_STAFF.find(u => u.role === role);
    if (demoUser) {
        setEmail(demoUser.email);
        setPassword('password'); // Dummy fill
        setMode('login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex p-3 bg-[#FFB600] rounded-xl mb-4 shadow-lg shadow-orange-500/20">
            <ShieldCheck className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SecureLogic CRM</h1>
          <p className="text-slate-400 text-sm mt-2">Enterprise Security Management System</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Login
            </button>
            <button 
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {mode === 'register' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none transition-all"
                        placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none transition-all"
                  placeholder="name@securelogic.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'register' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="w-full pl-3 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FFB600] focus:border-[#FFB600] outline-none transition-all bg-white"
                    >
                        {Object.values(Role).map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#FFB600] hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />} 
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400 mb-4 uppercase font-bold tracking-wider">Quick Demo Login</p>
                <div className="bg-slate-50 border border-slate-100 rounded p-2 mb-4 text-center">
                    <p className="text-xs text-slate-500">Default Admin: <span className="font-mono font-bold text-slate-700">admin@securelogic.com</span></p>
                    <p className="text-xs text-slate-500">Password: <span className="font-mono font-bold text-slate-700">password</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleDemoLogin(Role.ADMIN)} className="text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors">
                    As Admin
                </button>
                <button onClick={() => handleDemoLogin(Role.SALES)} className="text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors">
                    As Sales
                </button>
                <button onClick={() => handleDemoLogin(Role.ENGINEER)} className="text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors">
                    As Engineer
                </button>
                <button onClick={() => handleDemoLogin(Role.TECH)} className="text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors">
                    As Tech
                </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;