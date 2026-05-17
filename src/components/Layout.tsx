import type { ReactNode } from 'react';
import Chat from './Chat';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2026 Kirei - Votre linge en un clic.</p>
        </div>
      </footer>
      <Chat />
    </div>
  );
}
