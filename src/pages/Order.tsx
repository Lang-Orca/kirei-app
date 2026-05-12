import { useState } from 'react';
import { Calendar, CheckCircle2, MapPin, Package, Settings2 } from 'lucide-react';

export default function Order() {
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= s ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Où et quand ?</h2>
            <p className="text-slate-500">Dites-nous où nous devons récupérer votre linge.</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Votre adresse de collecte" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="datetime-local" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="datetime-local" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setStep(2)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Continuer vers les services
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Choisissez votre service</h2>
            <p className="text-slate-500">Sélectionnez le type de nettoyage souhaité.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'kilo', title: 'Linge au kilo', icon: <Package />, desc: 'Vêtements du quotidien. Lavé, séché, plié ou repassé.' },
              { id: 'piece', title: 'Linge à la pièce', icon: <Settings2 />, desc: 'Pièces fragiles, chemises, costumes. Nettoyage soigné.' },
              { id: 'house', title: 'Linge de maison', icon: <CheckCircle2 />, desc: 'Couettes, rideaux, draps. Traitement spécialisé.' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setOrderType(option.id)}
                className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
                  orderType === option.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  orderType === option.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{option.title}</h3>
                  <p className="text-slate-500 text-sm">{option.desc}</p>
                </div>
              </button>
            ))}
          </div>
          
          {orderType && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
               <h4 className="font-bold">Options supplémentaires</h4>
               {orderType === 'kilo' && (
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                      <input type="checkbox" /> Repassage (+2€/kg)
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                      <input type="checkbox" /> Linge plié
                    </label>
                 </div>
               )}
               {orderType === 'piece' && (
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                      <input type="radio" name="piece-type" /> Soigné (Standard)
                    </label>
                    <label className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-slate-200">
                      <input type="radio" name="piece-type" /> Haute Qualité (+30%)
                    </label>
                 </div>
               )}
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => setStep(1)}
              className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Retour
            </button>
            <button 
              disabled={!orderType}
              onClick={() => setStep(3)}
              className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer la commande
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold">Commande envoyée !</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Votre demande a bien été prise en compte. Un groom Kirei passera récupérer votre linge au créneau choisi.
          </p>
          <button 
            onClick={() => { setStep(1); setOrderType(null); }}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Nouvelle commande
          </button>
        </div>
      )}
    </div>
  );
}
