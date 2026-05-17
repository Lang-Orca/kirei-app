import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveCommande, getAllCommandes, initDb } from '../lib/indexedDB';
import type { Commande } from '../types';
import { Calendar, Package, Shirt, Weight, User, Image, Check, Plus, Trash2, AlertTriangle, Palette, Star, RotateCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

type ItemForm = {
  id: string;
  pieces: number;
  matiere: string;
  poidsKg: number;
  photos: string[];
  description: string;
  qualite: string;
  couleur: string;
  laverSeul: boolean;
};

const createEmptyItem = (): ItemForm => ({
  id: crypto.randomUUID(),
  pieces: 1,
  matiere: 'coton',
  poidsKg: 0.5,
  photos: [],
  description: '',
  qualite: 'Bon état',
  couleur: '',
  laverSeul: false,
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Deposit() {
  const navigate = useNavigate();
  const { role, clientName } = useAuth();
  const [items, setItems] = useState<ItemForm[]>([createEmptyItem()]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [retrievalCode, setRetrievalCode] = useState<string>('');
  const currentDateTime = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    if (role !== 'client') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    initDb().then(loadCommandes).catch((err) => console.error('IndexedDB init failed', err));
  }, []);

  async function loadCommandes() {
    const stored = await getAllCommandes();
    setCommandes(stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  function addItem() {
    setItems([...items, createEmptyItem()]);
  }

  function removeItem(id: string) {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  }

  function updateItem(id: string, updates: Partial<ItemForm>) {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  }

  function handlePhotoChange(id: string, event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    let processed = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          newPhotos.push(result);
        }
        processed++;
        if (processed === files.length) {
          const item = items.find(i => i.id === id);
          if (item) {
            updateItem(id, { photos: [...item.photos, ...newPhotos] });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(itemId: string, photoIndex: number) {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newPhotos = [...item.photos];
      newPhotos.splice(photoIndex, 1);
      updateItem(itemId, { photos: newPhotos });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    // Validation
    for (const item of items) {
      if (item.photos.length === 0) {
        setError('Veuillez ajouter au moins une photo pour chaque lot.');
        return;
      }
      if (!item.description.trim()) {
        setError('Veuillez ajouter une description pour chaque lot.');
        return;
      }
    }

    setSaving(true);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCommande: Commande = {
      id: crypto.randomUUID(),
      clientName: clientName || 'Anonyme',
      clientId: code,
      status: 'En attente',
      createdAt: new Date().toISOString(),
      vetements: items.map(item => ({
        id: item.id,
        pieces: item.pieces,
        matiere: item.matiere,
        poidsKg: item.poidsKg,
        photos: item.photos,
        description: item.description,
        qualite: item.qualite,
        couleur: item.couleur,
        laverSeul: item.laverSeul,
      })),
    };

    try {
      await saveCommande(newCommande);
      setRetrievalCode(code);
      setSuccess(true);
      setItems([createEmptyItem()]);
      await loadCommandes();

      setTimeout(() => {
        navigate('/');
      }, 6000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex p-6 bg-green-100 rounded-full">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Dépôt enregistré!</h2>
            <p className="text-slate-600 mb-6">
              Votre lot de linge a été enregistré avec succès.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg space-y-3">
            <p className="text-sm font-semibold text-slate-600">VOTRE CODE DE RÉCUPÉRATION</p>
            <p className="text-5xl font-bold text-green-600 font-mono tracking-widest">{retrievalCode}</p>
            <p className="text-xs text-slate-500">
              Conservez ce code. Vous en aurez besoin pour récupérer votre linge.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(retrievalCode);
                alert('Code copié dans le presse-papiers!');
              }}
              className="w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-colors"
            >
              Copier le code
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Déposer du linge" 
        subtitle="Constituez votre lot de linge en ajoutant les détails de chaque catégorie d'articles"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Info */}
            <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Client</p>
                  <p className="text-xl font-bold text-slate-900">{clientName || 'Chargement...'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date du dépôt</p>
                  <p className="text-xl font-bold text-slate-900">{currentDateTime}</p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      Article / Lot d'articles
                    </h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Left Column: Details */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-500" />
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Ex: 3 chemises blanches, jeans bleus..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Shirt className="w-4 h-4 text-indigo-500" />
                            Pièces
                          </label>
                          <input
                            type="number"
                            value={item.pieces}
                            onChange={(e) => updateItem(item.id, { pieces: parseInt(e.target.value) || 1 })}
                            min="1"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Weight className="w-4 h-4 text-indigo-500" />
                            Poids (kg)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={item.poidsKg}
                            onChange={(e) => updateItem(item.id, { poidsKg: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Star className="w-4 h-4 text-indigo-500" />
                            Qualité
                          </label>
                          <select
                            value={item.qualite}
                            onChange={(e) => updateItem(item.id, { qualite: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option>Neuf</option>
                            <option>Bon état</option>
                            <option>Usagé</option>
                            <option>Abîmé</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Palette className="w-4 h-4 text-indigo-500" />
                            Couleur
                          </label>
                          <input
                            type="text"
                            value={item.couleur}
                            onChange={(e) => updateItem(item.id, { couleur: e.target.value })}
                            placeholder="Blanc, Noir, Rouge..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                        <input
                          type="checkbox"
                          id={`laverSeul-${item.id}`}
                          checked={item.laverSeul}
                          onChange={(e) => updateItem(item.id, { laverSeul: e.target.checked })}
                          className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label htmlFor={`laverSeul-${item.id}`} className="flex items-center gap-2 text-sm font-semibold text-orange-800 cursor-pointer">
                          <AlertTriangle className="w-4 h-4" />
                          Laver séparément (déteint, délicat...)
                        </label>
                      </div>
                    </div>

                    {/* Right Column: Photos */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Image className="w-4 h-4 text-indigo-500" />
                        Photos ({item.photos.length})
                      </label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {item.photos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/photo">
                            <img src={photo} alt="Linge" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(item.id, pIdx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover/photo:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center cursor-pointer text-slate-400">
                          <Plus className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Ajouter</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePhotoChange(item.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={addItem}
                className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                Ajouter une autre catégorie d'articles
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold text-xl hover:shadow-2xl hover:shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    Valider mon dépôt complet
                    <Check className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recent History */}
          {commandes.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <RotateCw className="w-8 h-8 text-indigo-600" />
                Historique récent
              </h2>
              <div className="space-y-4">
                {commandes.slice(0, 3).map((cmd) => (
                  <div key={cmd.id} className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center justify-between gap-6 hover:shadow-xl transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          cmd.status === 'En attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {cmd.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{cmd.clientId}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">
                        {(cmd.vetements || []).length} catégorie(s) d'articles
                      </h4>
                      <p className="text-sm text-slate-500">{formatDate(cmd.createdAt)}</p>
                    </div>
                    <div className="flex -space-x-4">
                      {(cmd.vetements || []).map((v, i) => (
                        v.photos && v.photos[0] && (
                          <img 
                            key={i} 
                            src={v.photos[0]} 
                            className="w-12 h-12 rounded-full border-4 border-white object-cover" 
                            alt="Aperçu" 
                          />
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
