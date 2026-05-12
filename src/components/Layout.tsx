import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Shirt className="w-8 h-8" />
            <span>Kirei</span>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link to="/" className="text-sm font-medium hover:text-indigo-600 transition-colors">Accueil</Link>
            <Link to="/order" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
              Commander
            </Link>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 text-indigo-600">
             <Shirt className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-sm">© 2026 Kirei - Votre linge en un clic.</p>
        </div>
      </footer>
    </div>
  );
}
