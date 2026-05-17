import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Download, RotateCw, Sparkles, LogOut, Shield, User as UserIcon } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  // Rediriger si admin, sinon afficher bienvenue ou contenu client
  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin');
    }
  }, [role, navigate]);

  function handleLogout() {
    logout();
    navigate('/home');
  }

  // Page de bienvenue (pas connecté)
  if (role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-600">Service de nettoyage à domicile</span>
              </div>
            </div>

            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
                Bienvenue sur Kirei
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 font-light">
                Votre solution de nettoyage simple et efficace
              </p>
            </div>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Déposez vos vêtements et laissez nos professionnels s'en charger. Récupérez-les propres et prêts à porter.
            </p>
          </div>
        </section>

        {/* Login Options */}
        <section className="px-4 pb-32">
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Client Login */}
            <button
              onClick={() => navigate('/login', { state: { userType: 'client' } })}
              className="group relative overflow-hidden rounded-3xl bg-white border-2 border-indigo-100 p-8 text-left transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative space-y-4">
                <div className="inline-flex p-3 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
                  <UserIcon className="w-6 h-6 text-indigo-600" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Je suis client</h3>
                  <p className="text-slate-600">
                    Déposez et récupérez votre linge facilement
                  </p>
                </div>

                <div className="flex items-center gap-2 text-indigo-600 font-semibold pt-2 group-hover:gap-3 transition-all">
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            {/* Admin Login */}
            <button
              onClick={() => navigate('/login', { state: { userType: 'admin' } })}
              className="group relative overflow-hidden rounded-3xl bg-white border-2 border-purple-100 p-8 text-left transition-all hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative space-y-4">
                <div className="inline-flex p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Je suis admin</h3>
                  <p className="text-slate-600">
                    Gérez les commandes et les grooms
                  </p>
                </div>

                <div className="flex items-center gap-2 text-purple-600 font-semibold pt-2 group-hover:gap-3 transition-all">
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 pb-16 bg-slate-900 text-white rounded-t-3xl">
          <div className="max-w-4xl mx-auto py-12">
            <h2 className="text-3xl font-bold text-center mb-12">Pourquoi nous faire confiance?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Rapide</h3>
                <p className="text-slate-300">Livraison en 48 à 72 heures</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-2">Professionnel</h3>
                <p className="text-slate-300">Équipe expérimentée et certifiée</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
                <p className="text-slate-300">Suivi complet de vos articles</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Page client (connecté)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Kirei
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Service de nettoyage à domicile</span>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Bienvenue dans votre espace
            </h2>
            <p className="text-xl md:text-xl text-slate-600 font-light">
              Gérez votre linge facilement
            </p>
          </div>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Déposez vos vêtements ou suivez vos commandes en cours
          </p>
        </div>
      </section>

      {/* Main Actions */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Deposit Card */}
          <button
            onClick={() => navigate('/deposit')}
            className="group relative overflow-hidden rounded-3xl bg-white border-2 border-indigo-100 p-12 text-left transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative space-y-6">
              <div className="inline-flex p-4 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
                <Download className="w-8 h-8 text-indigo-600" />
              </div>

              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">Déposer du linge</h3>
                <p className="text-slate-600 text-lg">
                  Envoyez-nous vos vêtements pour un nettoyage rapide et professionnel
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span>Formulaire simple avec photos</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span>Date et heure enregistrées</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span>Suivi de votre commande</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-indigo-600 font-semibold pt-4 group-hover:gap-3 transition-all">
                Commencer
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Retrieve Card */}
          <button
            onClick={() => navigate('/retrieve')}
            className="group relative overflow-hidden rounded-3xl bg-white border-2 border-purple-100 p-12 text-left transition-all hover:border-purple-400 hover:shadow-xl hover:shadow-purple-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative space-y-6">
              <div className="inline-flex p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                <RotateCw className="w-8 h-8 text-purple-600" />
              </div>

              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">Récupérer du linge</h3>
                <p className="text-slate-600 text-lg">
                  Consultez l'état de votre linge et récupérez-le quand vous le souhaitez
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Suivi en temps réel</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Historique de vos commandes</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>États mises à jour par admin</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-purple-600 font-semibold pt-4 group-hover:gap-3 transition-all">
                Consulter
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 pb-16 bg-slate-900 text-white rounded-t-3xl">
        <div className="max-w-4xl mx-auto py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi nous faire confiance?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Rapide</h3>
              <p className="text-slate-300">Livraison en 48 à 72 heures</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Professionnel</h3>
              <p className="text-slate-300">Équipe expérimentée et certifiée</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
              <p className="text-slate-300">Suivi complet de vos articles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-indigo-600 py-20 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Besoin d'aide ?</h2>
          <p className="text-xl opacity-90">Nos conseillers sont à votre disposition pour vous accompagner.</p>
          
          <div className="grid md:grid-cols-2 gap-6 pt-8">
            <a 
              href="tel:+237600000000"
              className="flex items-center justify-center gap-4 bg-white/10 hover:bg-white/20 p-6 rounded-3xl border border-white/20 transition-all group"
            >
              <div className="p-3 bg-white rounded-2xl group-hover:scale-110 transition-transform">
                <span className="text-indigo-600 text-2xl">📞</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xl">Appelez-nous</p>
                <p className="opacity-70 text-sm">Réponse immédiate</p>
              </div>
            </a>

            <button 
              onClick={() => {
                const chatBtn = document.querySelector('button[class*="fixed bottom-6"]') as HTMLButtonElement;
                if (chatBtn) chatBtn.click();
              }}
              className="flex items-center justify-center gap-4 bg-white text-indigo-600 hover:bg-indigo-50 p-6 rounded-3xl transition-all group"
            >
              <div className="p-3 bg-indigo-100 rounded-2xl group-hover:scale-110 transition-transform">
                <span className="text-indigo-600 text-2xl">💬</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-xl">Chattez avec nous</p>
                <p className="text-indigo-400 text-sm">Support 24/7</p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
