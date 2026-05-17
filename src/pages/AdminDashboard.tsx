import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCommandes, updateCommande } from '../lib/indexedDB';
import type { Commande } from '../types';
import { LogOut, Save, Package, AlertTriangle, Shirt, Weight, Palette, Star, ChevronDown, ChevronUp, X } from 'lucide-react';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statuses = ['En attente', 'Lavage', 'Prêt', 'Livré'] as const;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);

  const loadCommandes = useCallback(async () => {
    try {
      const data = await getAllCommandes();
      setCommandes(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      console.error('Error loading commandes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  async function handleStatusChange(commandeId: string, newSt: string) {
    try {
      const commande = commandes.find(c => c.id === commandeId);
      if (commande) {
        const updated = { ...commande, status: newSt as any };
        await updateCommande(updated);
        setCommandes(commandes.map(c => c.id === commandeId ? updated : c));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Admin</h1>
            <p className="text-slate-500 text-sm mt-1">Gestion du Pressing Kirei</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total', value: commandes.length, color: 'bg-indigo-600' },
                { label: 'En attente', value: commandes.filter(c => c.status === 'En attente').length, color: 'bg-yellow-500' },
                { label: 'En lavage', value: commandes.filter(c => c.status === 'Lavage').length, color: 'bg-blue-500' },
                { label: 'Prêts', value: commandes.filter(c => c.status === 'Prêt').length, color: 'bg-green-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  <div className={`h-1 w-12 ${stat.color} mt-4 rounded-full`}></div>
                </div>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Commandes récentes</h2>
              
              {commandes.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Aucun dépôt enregistré</p>
                </div>
              ) : (
                commandes.map((commande) => (
                  <div key={commande.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">#{commande.clientId}</span>
                          <span className="text-xs text-slate-400">{formatDate(commande.createdAt)}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{commande.clientName}</h3>
                        <p className="text-slate-500">{commande.vetements.length} catégorie(s) d'articles</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {editingId === commande.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="px-4 py-2 rounded-xl bg-slate-100 border-none font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button
                              onClick={() => handleStatusChange(commande.id, newStatus)}
                              className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(commande.id); setNewStatus(commande.status); }}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                              commande.status === 'En attente' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                              commande.status === 'Lavage' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                              commande.status === 'Prêt' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {commande.status}
                          </button>
                        )}
                        
                        <button
                          onClick={() => setExpandedId(expandedId === commande.id ? null : commande.id)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          {expandedId === commande.id ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === commande.id && (
                      <div className="px-6 pb-6 border-t border-slate-50 animate-in slide-in-from-top-2">
                        <div className="pt-6 space-y-6">
                          {commande.vetements.map((v) => (
                            <div key={v.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                              <div className="flex flex-col md:flex-row gap-6">
                                {/* Photos */}
                                <div className="flex -space-x-4 overflow-hidden">
                                  {v.photos.map((p, pIdx) => (
                                    <button 
                                      key={pIdx} 
                                      onClick={() => setSelectedPhotos(v.photos)}
                                      className="relative"
                                    >
                                      <img 
                                        src={p} 
                                        className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-sm hover:scale-110 transition-transform cursor-zoom-in" 
                                        alt="Linge" 
                                      />
                                      {pIdx === 0 && v.laverSeul && (
                                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-full shadow-lg">
                                          <AlertTriangle className="w-3 h-3" />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>

                                {/* Info */}
                                <div className="flex-1 grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</p>
                                    <p className="font-bold text-slate-800">{v.description}</p>
                                    <div className="flex gap-4 mt-2">
                                      <span className="flex items-center gap-1 text-sm text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        <Shirt className="w-4 h-4 text-indigo-500" /> {v.pieces} pcs
                                      </span>
                                      <span className="flex items-center gap-1 text-sm text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        <Weight className="w-4 h-4 text-indigo-500" /> {v.poidsKg} kg
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Détails techniques</p>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="flex items-center gap-1 text-sm text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        <Star className="w-4 h-4 text-yellow-500" /> {v.qualite}
                                      </span>
                                      <span className="flex items-center gap-1 text-sm text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        <Palette className="w-4 h-4 text-purple-500" /> {v.couleur}
                                      </span>
                                      {v.laverSeul && (
                                        <span className="flex items-center gap-1 text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 font-bold">
                                          <AlertTriangle className="w-4 h-4" /> LAVER SEUL
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium capitalize italic">{v.matiere}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhotos && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-8">
          <div className="relative max-w-5xl w-full">
            <button 
              onClick={() => setSelectedPhotos(null)}
              className="absolute -top-12 right-0 text-white hover:text-indigo-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[80vh] p-4">
              {selectedPhotos.map((p, i) => (
                <img key={i} src={p} className="w-full h-auto rounded-3xl shadow-2xl" alt="Linge" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
