import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Shirt className="w-8 h-8" />
            <span>Kirei</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex flex-col gap-3 items-start md:flex-row md:items-center md:gap-6">
              <Link to="/" className="text-sm font-medium hover:text-indigo-600 transition-colors">Accueil</Link>
            </nav>
          </div>
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
