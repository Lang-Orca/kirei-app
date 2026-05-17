import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCommandes, initDb } from '../lib/indexedDB';
import type { Commande } from '../types';
import { Package, Calendar, MapPin, Check, Clock, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'En attente':
      return <Clock className="w-5 h-5 text-yellow-600" />;
    case 'Lavage':
      return <Truck className="w-5 h-5 text-blue-600" />;
    case 'Prêt':
      return <Check className="w-5 h-5 text-green-600" />;
    case 'Livré':
      return <Check className="w-5 h-5 text-slate-600" />;
    default:
      return <Package className="w-5 h-5 text-slate-600" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'En attente':
      return 'bg-yellow-100 text-yellow-800';
    case 'Lavage':
      return 'bg-blue-100 text-blue-800';
    case 'Prêt':
      return 'bg-green-100 text-green-800';
    case 'Livré':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export default function Retrieve() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [allCommandes, setAllCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [selectedCommandeId, setSelectedCommandeId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadCommandes = useCallback(async () => {
    try {
      await initDb();
      const stored = await getAllCommandes();
      const sorted = stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setAllCommandes(sorted);
      setFilteredCommandes([]);
    } catch (err) {
      console.error('Error loading commandes:', err);
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role !== 'client') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  function handleSearch() {
    setError('');
    if (!searchCode.trim()) {
      setError('Veuillez entrer un code de récupération.');
      return;
    }

    const found = allCommandes.filter(c => c.clientId === searchCode.toUpperCase().trim());
    
    if (found.length === 0) {
      setError('Aucune commande trouvée avec ce code. Vérifiez que le code est correct.');
      setFilteredCommandes([]);
    } else {
      setFilteredCommandes(found);
    }
  }

  function handleClearSearch() {
    setSearchCode('');
    setError('');
    setFilteredCommandes([]);
  }

  return (
    <>
      <PageHeader 
        title="Récupérer du linge" 
        subtitle="Consultez l'état de vos commandes et retrouvez vos articles"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Rechercher une commande par code</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="Ex: A1B2"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              Rechercher
            </button>
            {searchCode && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl font-semibold transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
            <p className="mt-4 text-slate-600">Chargement de vos commandes...</p>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center space-y-4">
            <Package className="w-16 h-16 text-slate-300 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Entrez votre code de récupération</h2>
            <p className="text-slate-600 mb-6">
              Utilisez le code que vous avez reçu lors du dépôt pour retrouver vos articles.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredCommandes.map((commande) => (
              <div
                key={commande.id}
                className="bg-white rounded-2xl shadow hover:shadow-xl p-6 border border-slate-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {commande.clientName}
                      </h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(commande.status)}`}>
                        {getStatusIcon(commande.status)}
                        <span className="text-sm font-semibold">{commande.status}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-slate-600 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(commande.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{commande.vetements.length} lot(s) d'articles</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex text-xs text-slate-600 font-semibold mb-1">
                        <span>Suivi de la commande</span>
                      </div>
                      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            commande.status === 'En attente' ? 'w-1/4 bg-yellow-400' :
                            commande.status === 'Lavage' ? 'w-1/2 bg-blue-400' :
                            commande.status === 'Prêt' ? 'w-3/4 bg-green-400' :
                            'w-full bg-slate-400'
                          }`}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Reçu</span>
                        <span>En cours</span>
                        <span>Prêt</span>
                        <span>Livré</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCommandeId(selectedCommandeId === commande.id ? null : commande.id)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors self-center"
                  >
                    {selectedCommandeId === commande.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                {/* Details Section (Expanded) */}
                {selectedCommandeId === commande.id && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="grid gap-4">
                      {commande.vetements.map((v, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl flex gap-4">
                          {v.photos[0] && (
                            <img src={v.photos[0]} alt="Article" className="w-20 h-20 rounded-lg object-cover" />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="font-bold text-slate-800">{v.description}</p>
                            <div className="flex gap-3 text-xs text-slate-500">
                              <span>{v.pieces} pièces</span>
                              <span>•</span>
                              <span>{v.poidsKg} kg</span>
                              <span>•</span>
                              <span className="capitalize">{v.matiere}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl space-y-3">
                      <p className="text-sm font-bold text-purple-900">Rendez-vous de récupération</p>
                      {commande.status === 'Prêt' || commande.status === 'Livré' ? (
                        <>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-slate-600">Lieu de récupération</p>
                              <p className="font-semibold">Kirei Pressing, Centre-ville</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-600">
                          Votre linge est actuellement {commande.status.toLowerCase()}. 
                          Un rendez-vous vous sera proposé dès qu'il sera prêt.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
