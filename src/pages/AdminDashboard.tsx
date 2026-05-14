import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCommandes, updateCommande } from '../lib/indexedDB';
import type { Commande } from '../types';
import { LogOut, Eye, Save } from 'lucide-react';

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
  const [saving, setSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Redirect si pas admin
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [role, navigate]);

  // Charger les commandes
  useEffect(() => {
    loadCommandes();
  }, []);

  async function loadCommandes() {
    try {
      const data = await getAllCommandes();
      setCommandes(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      console.error('Error loading commandes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(commandeId: string, newSt: string) {
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestion des commandes</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Chargement des commandes...</p>
          </div>
        ) : commandes.length === 0 ? (
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{commandes.length}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700/30">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">En attente</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {commandes.filter(c => c.status === 'En attente').length}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/30">
                <p className="text-blue-800 dark:text-blue-200 text-sm">En lavage</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {commandes.filter(c => c.status === 'Lavage').length}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700/30">
                <p className="text-green-800 dark:text-green-200 text-sm">Prêt</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {commandes.filter(c => c.status === 'Prêt').length}
                </p>
              </div>
            </div>

            {/* Commandes Table */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                        Détails
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                        Date dépôt
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                        État
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {commandes.map((commande) => (
                      <tr key={commande.id} className="hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors">
                        {/* Client */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{commande.clientName}</p>
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <p className="text-slate-700 dark:text-slate-300">
                              {commande.vetement.pieces} pièce(s) • <span className="capitalize">{commande.vetement.matiere}</span>
                            </p>
                            <p className="text-slate-500 dark:text-slate-500 text-xs">{commande.vetement.poidsKg} kg</p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(commande.createdAt)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {editingId === commande.id ? (
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                commande.status === 'En attente'
                                  ? 'bg-yellow-900/30 text-yellow-200'
                                  : commande.status === 'Lavage'
                                  ? 'bg-blue-900/30 text-blue-200'
                                  : commande.status === 'Prêt'
                                  ? 'bg-green-900/30 text-green-200'
                                  : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {commande.status}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingId === commande.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(commande.id, newStatus)
                                  }
                                  disabled={saving}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                  Valider
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                >
                                  Annuler
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(commande.id);
                                    setNewStatus(commande.status);
                                  }}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => setSelectedPhoto(commande.vetement.photoDataUrl)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aperçu de la photo</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <img
              src={selectedPhoto}
              alt="Linge"
              className="w-full rounded-lg max-h-96 object-cover"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
