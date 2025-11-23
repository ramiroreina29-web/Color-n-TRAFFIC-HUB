import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { X } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full border border-white/50 animate-scale-in">
        {/* Close Button */}
        <Link 
            to="/" 
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-all"
            title="Volver al inicio"
        >
            <X className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Colorín Admin</h1>
          <p className="text-gray-500 font-medium">Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-200 bg-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
              placeholder="admin@colorin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-gray-200 bg-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100 text-center font-medium">
                {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full py-3.5 text-lg shadow-lg shadow-indigo-500/30" variant="primary">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;