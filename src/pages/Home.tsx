import { Link } from 'react-router-dom';
import { Clock, MapPin, Sparkles, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
          <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Votre linge propre en quelques clics.
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl max-w-lg">
              Kirei s'occupe de tout : lavage, repassage et livraison à domicile. Simple, rapide et sans effort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <Link to="/order" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20">
                Commander en 1 minute
              </Link>
            </div>
          </div>
          <div className="flex-1 relative hidden md:block">
             <div className="bg-indigo-500/30 w-80 h-80 rounded-full blur-3xl absolute -top-20 -right-20"></div>
             <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl rotate-3">
                <Sparkles className="text-white w-12 h-12 mb-4" />
                <p className="text-2xl font-bold">Lavage Eco-Responsable</p>
                <p className="text-indigo-100 mt-2">Nous utilisons des techniques de nettoyage à l'eau respectueuses de l'environnement.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <MapPin />, title: "Adresse & Horaire", text: "Entrez votre adresse et choisissez vos créneaux de collecte." },
            { icon: <Clock />, title: "Collecte express", text: "Un groom récupère votre linge directement à votre porte." },
            { icon: <Truck />, title: "Retour impeccable", text: "Recevez votre linge propre, plié ou repassé sous 48h." }
          ].map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Options Section */}
      <section className="bg-slate-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
           <h2 className="text-3xl font-bold text-center mb-4">Nos Prestations</h2>
           <p className="text-slate-500 text-center mb-16 max-w-2xl mx-auto">
             Que ce soit pour votre linge du quotidien ou vos pièces les plus délicates, Kirei a la solution adaptée.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Linge au kilo", desc: "Pour votre linge du quotidien : t-shirts, jeans, tenues de sport. Payez au poids !" },
                { title: "Linge à la pièce", desc: "Pour vos chemises, robes, costumes et textiles délicats (soie, cachemire)." },
                { title: "Linge de maison", desc: "Couettes, draps, rideaux. Un entretien professionnel pour vos grandes pièces." }
              ].map((service, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-500">{service.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}
