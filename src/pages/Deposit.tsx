import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveCommande, getAllCommandes, initDb } from '../lib/indexedDB';
import type { Commande } from '../types';
import { Calendar, Package, Shirt, Weight, User, Image, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';

type FormState = {
  clientName: string;
  pieces: number;
  matiere: string;
  poidsKg: number;
  photoDataUrl: string;
  description: string;
};

const defaultFormState: FormState = {
  clientName: '',
  pieces: 1,
  matiere: 'coton',
  poidsKg: 0.5,
  photoDataUrl: '',
  description: '',
};

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
  const [form, setForm] = useState<FormState>(defaultFormState);
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

  // Rediriger si pas connecté comme client
  useEffect(() => {
    if (role !== 'client') {
      navigate('/login');
    }
  }, [role, navigate]);

  // Pré-remplir le nom du client depuis le contexte
  useEffect(() => {
    if (clientName) {
      setForm((current) => ({ ...current, clientName }));
    }
  }, [clientName]);

  useEffect(() => {
    initDb().then(loadCommandes).catch((err) => console.error('IndexedDB init failed', err));
  }, []);

  async function loadCommandes() {
    const stored = await getAllCommandes();
    setCommandes(stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  function handleInputChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      handleInputChange('photoDataUrl', '');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        handleInputChange('photoDataUrl', result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.photoDataUrl) {
      setError('Veuillez ajouter une photo du vêtement.');
      return;
    }

    if (!form.clientName.trim()) {
      setError('Veuillez indiquer votre nom.');
      return;
    }

    setSaving(true);

    // Générer un code unique de 4 caractères (lettres et chiffres)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCommande: Commande = {
      id: crypto.randomUUID(),
      clientName: form.clientName.trim(),
      clientId: code,
      status: 'En attente',
      createdAt: new Date().toISOString(),
      vetement: {
        id: crypto.randomUUID(),
        pieces: form.pieces,
        matiere: form.matiere,
        poidsKg: form.poidsKg,
        photoDataUrl: form.photoDataUrl,
      },
    };

    try {
      await saveCommande(newCommande);
      setRetrievalCode(code);
      setSuccess(true);
      setForm(defaultFormState);
      await loadCommandes();

      setTimeout(() => {
        navigate('/');
      }, 4000);
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
              Votre linge a été enregistré avec succès.
            </p>
          </div>

          {/* Retrieval Code Card */}
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
        subtitle="Remplissez le formulaire ci-dessous avec les informations de votre linge"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Main Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8">
          {/* Date/Time Info */}
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-sm text-slate-600">Date et heure du dépôt</p>
                <p className="text-xl font-bold text-slate-900">{currentDateTime}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Client Name - Display Only */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <User className="w-5 h-5 text-indigo-600" />
                Votre nom
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-indigo-50 text-slate-900 font-semibold">
                {form.clientName || 'Nom non défini'}
              </div>
              <p className="text-xs text-slate-500 italic">Connectez-vous à nouveau si vous souhaitez changer de nom.</p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Package className="w-5 h-5 text-indigo-600" />
                Description du linge
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ex: 1 chemise blanche, 2 t-shirts, 1 pantalon..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Pieces */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Shirt className="w-5 h-5 text-indigo-600" />
                Nombre de pièces
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.pieces}
                onChange={(e) => handleInputChange('pieces', parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Material */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Shirt className="w-5 h-5 text-indigo-600" />
                Matière principale
              </label>
              <select
                value={form.matiere}
                onChange={(e) => handleInputChange('matiere', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="coton">Coton</option>
                <option value="soie">Soie</option>
                <option value="synthétique">Synthétique</option>
                <option value="laine">Laine</option>
                <option value="lin">Lin</option>
                <option value="mélange">Mélange de fibres</option>
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Weight className="w-5 h-5 text-indigo-600" />
                Poids estimé (kg)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                max="50"
                value={form.poidsKg}
                onChange={(e) => handleInputChange('poidsKg', parseFloat(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Photo */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Image className="w-5 h-5 text-indigo-600" />
                Photo du linge
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="px-4 py-12 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center cursor-pointer bg-slate-50">
                  {form.photoDataUrl ? (
                    <div className="space-y-4">
                      <img
                        src={form.photoDataUrl}
                        alt="Aperçu"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-slate-600">Cliquez pour changer la photo</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Image className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-slate-600">Cliquez ou glissez une photo de votre linge</p>
                      <p className="text-sm text-slate-500">PNG, JPG, GIF jusqu'à 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
            >
              {saving ? 'Enregistrement en cours...' : 'Valider le dépôt'}
            </button>
          </form>
        </div>

        {/* Recent Deposits */}
        {commandes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Vos dépôts récents</h2>
            <div className="space-y-4">
              {commandes.slice(0, 3).map((commande) => (
                <div key={commande.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2">{commande.clientName}</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {commande.vetement.pieces} pièce(s) • {commande.vetement.matiere}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(commande.createdAt)}
                      </p>
                    </div>
                    {commande.vetement.photoDataUrl && (
                      <img
                        src={commande.vetement.photoDataUrl}
                        alt="Linge"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        {commande.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>    </>  );
}
