import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogOut } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = true,
  onBackClick 
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  function handleBack() {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/home');
    }
  }

  function handleLogout() {
    logout();
    navigate('/home');
  }

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
            {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>

        {role === 'client' && (
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        )}
      </div>
    </div>
  );
}
