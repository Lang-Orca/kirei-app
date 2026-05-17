import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveCommande, getAllCommandes, initDb } from '../lib/indexedDB';
import type { Commande } from '../types';
import { Calendar, Package, Shirt, Weight, User, Check, Plus, Trash2, AlertTriangle, Palette, Star, RotateCw, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// React Hook Form & Yup
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation Schema
const schema = yup.object().shape({
  items: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      pieces: yup.number().typeError('Nombre requis').min(1, 'Minimum 1').required(),
      matiere: yup.string().required(),
      poidsKg: yup.number().typeError('Nombre requis').min(0, 'Minimum 0').required(),
      photos: yup.array().of(yup.string()).min(1, 'Ajoutez au moins une photo'),
      description: yup.string().required('La description est requise'),
      qualite: yup.string().required(),
      couleur: yup.string().required('La couleur est requise'),
      laverSeul: yup.boolean(),
    })
  ).min(1, 'Ajoutez au moins un lot')
});

type FormData = yup.InferType<typeof schema>;

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

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      items: [{
        id: crypto.randomUUID(),
        pieces: 1,
        matiere: 'coton',
        poidsKg: 0.5,
        photos: [],
        description: '',
        qualite: 'Bon état',
        couleur: '',
        laverSeul: false,
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const loadCommandes = useCallback(async () => {
    try {
      await initDb();
      const stored = await getAllCommandes();
      
      // PRIVACY: Filter history by current client name
      const filtered = stored.filter(c => c.clientName === clientName);
      
      setCommandes(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      console.error('IndexedDB load failed', err);
    }
  }, [clientName]);

  useEffect(() => {
    if (role !== 'client') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  function handlePhotoChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentPhotos = watch(`items.${index}.photos`) || [];
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
          setValue(`items.${index}.photos`, [...currentPhotos, ...newPhotos], { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(itemIndex: number, photoIndex: number) {
    const currentPhotos = watch(`items.${itemIndex}.photos`) || [];
    const updated = [...currentPhotos];
    updated.splice(photoIndex, 1);
    setValue(`items.${itemIndex}.photos`, updated, { shouldValidate: true });
  }

  const onSubmit = async (data: FormData) => {
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
      vetements: (data.items || []).map(item => ({
        id: item.id || crypto.randomUUID(),
        pieces: item.pieces || 1,
        matiere: item.matiere || 'coton',
        poidsKg: item.poidsKg || 0,
        photos: item.photos || [],
        description: item.description || '',
        qualite: item.qualite || 'Bon état',
        couleur: item.couleur || '',
        laverSeul: !!item.laverSeul,
      })),
    };

    try {
      await saveCommande(newCommande);
      setRetrievalCode(code);
      setSuccess(true);
      await loadCommandes();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader title="Dépôt Réussi" showBackButton={false} />
        <div className="py-12 px-4 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex p-6 bg-green-100 rounded-full">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Dépôt enregistré!</h2>
            <p className="text-slate-600">Votre lot de linge a été enregistré avec succès.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-xl space-y-4 w-full max-w-sm text-center">
            <p className="text-sm font-bold text-slate-500 uppercase">Code de récupération</p>
            <p className="text-5xl font-black text-green-600 font-mono tracking-widest">{retrievalCode}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(retrievalCode);
                alert('Code copié!');
              }}
              className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-bold transition-colors"
            >
              Copier le code
            </button>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader 
        title="Déposer du linge" 
        subtitle="Constituez votre lot de linge"
      />
      
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Client</p>
                  <p className="text-xl font-bold text-slate-900">{clientName || '...'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date</p>
                  <p className="text-xl font-bold text-slate-900">{currentDateTime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Lot #{index + 1}</h3>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-red-500 p-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                        <textarea
                          {...register(`items.${index}.description` as const)}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.items?.[index]?.description ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                          rows={2}
                          placeholder="Ex: 3 chemises, 2 pantalons..."
                        />
                        {errors.items?.[index]?.description && <p className="text-red-500 text-xs">{errors.items[index]?.description?.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Pièces</label>
                          <input
                            type="number"
                            {...register(`items.${index}.pieces` as const)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Poids (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            {...register(`items.${index}.poidsKg` as const)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Qualité</label>
                          <select
                            {...register(`items.${index}.qualite` as const)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200"
                          >
                            <option value="Neuf">Neuf</option>
                            <option value="Bon état">Bon état</option>
                            <option value="Usagé">Usagé</option>
                            <option value="Abîmé">Abîmé</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Couleur</label>
                          <input
                            type="text"
                            {...register(`items.${index}.couleur` as const)}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.items?.[index]?.couleur ? 'border-red-500' : 'border-slate-200'}`}
                            placeholder="Multi, Blanc..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
                        <input
                          type="checkbox"
                          id={`laverSeul-${index}`}
                          {...register(`items.${index}.laverSeul` as const)}
                        />
                        <label htmlFor={`laverSeul-${index}`} className="text-sm font-bold text-orange-800">Laver séparément</label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Photos ({watch(`items.${index}.photos`)?.length || 0})
                      </label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {watch(`items.${index}.photos`)?.map((photo, pIdx) => (
                          <div key={pIdx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                            <img src={photo} alt="Linge" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removePhoto(index, pIdx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className={`aspect-square rounded-xl border-2 border-dashed ${errors.items?.[index]?.photos ? 'border-red-500 bg-red-50' : 'border-slate-300'} flex flex-col items-center justify-center cursor-pointer text-slate-400`}>
                          <Plus className="w-8 h-8" />
                          <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoChange(index, e)} className="hidden" />
                        </label>
                      </div>
                      {errors.items?.[index]?.photos && <p className="text-red-500 text-xs">{errors.items[index]?.photos?.message}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => append({
                  id: crypto.randomUUID(),
                  pieces: 1,
                  matiere: 'coton',
                  poidsKg: 0.5,
                  photos: [],
                  description: '',
                  qualite: 'Bon état',
                  couleur: '',
                  laverSeul: false,
                })}
                className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-600 font-bold hover:bg-indigo-50 transition-all"
              >
                + Ajouter une autre catégorie
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-bold text-xl disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Valider mon dépôt'}
              </button>
            </div>
          </form>

          {!success && (commandes || []).length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <RotateCw className="w-6 h-6 text-indigo-600" />
                Mon historique de dépôts
              </h2>
              <div className="space-y-4">
                {(commandes || []).slice(0, 3).map((cmd) => (
                  <div key={cmd.id} className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                          {cmd.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{cmd.clientId}</span>
                      </div>
                      <h4 className="font-bold text-slate-800">
                        {(cmd.vetements || []).length} catégorie(s)
                      </h4>
                      <p className="text-xs text-slate-500">{formatDate(cmd.createdAt)}</p>
                    </div>
                    <div className="flex -space-x-4">
                      {(cmd.vetements || []).map((v, i) => (
                        v.photos && v.photos[0] && (
                          <img key={i} src={v.photos[0]} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Aperçu" />
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
    </div>
  );
}
