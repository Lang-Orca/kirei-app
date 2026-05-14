import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'admin'>('client');

  function handleSubmit() {
    setLoading(true);
    setError('');

    if (username.trim().length === 0) {
      setError('Veuillez entrer votre nom.');
      setLoading(false);
      return;
    }

    if (selectedRole === 'admin') {
      // Vérification des identifiants admin
      if (username === 'admin' && password === '1234') {
        login('admin');
        navigate('/admin');
      } else {
        setError('Identifiants admin incorrects. (admin / 1234)');
      }
    } else {
      // Pour les clients, juste besoin d'un nom
      login('client', username.trim());
      navigate('/home');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Kirei
          </h1>
          <p className="text-slate-600">Service de nettoyage à domicile</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Choisissez votre rôle
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('client')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  selectedRole === 'client'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Username/Email Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-indigo-600" />
                {selectedRole === 'admin' ? 'Nom d\'utilisateur admin' : 'Votre nom'}
              </div>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder={selectedRole === 'admin' ? "admin" : "Votre nom"}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Password Input - Only for Admin */}
          {selectedRole === 'admin' && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Mot de passe
                </div>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
            </div>
          )}

          {/* Login Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
            >
              {loading ? 'Connexion...' : `Se connecter en tant que ${selectedRole === 'admin' ? 'Admin' : 'Client'}`}
            </button>
          </div>

          {/* Helper Text */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-2">
            <p>
              <span className="font-semibold">Client:</span> Cliquez sur "Client", entrez votre nom et connectez-vous
            </p>
            <p>
              <span className="font-semibold">Admin:</span> Cliquez sur "Admin", entrez admin / 1234
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
          <h3 className="font-semibold text-slate-900 mb-3">Comment ça marche?</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">👔</span>
              <span>
                <strong>Client:</strong> Déposez et récupérez votre linge
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">⚙️</span>
              <span>
                <strong>Admin:</strong> Gérez les commandes et les états
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
