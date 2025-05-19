import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo-boombag-white.png';
import {  
  ChevronRight, 
  Users, 
  TrendingUp, 
  Shield, 
  Award
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-card min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-dark to-primary shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Boom Bag Logo"
              className="h-10 w-auto drop-shadow-md"
            />
          </div>
          <div className="space-x-2">
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-white/90 transition-colors duration-150"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-card text-primary rounded-md hover:bg-secondary-light shadow-sm transition-colors duration-150"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-dark to-primary text-white py-20 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary opacity-10 rounded-full blur-2xl z-0" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-primary-light opacity-10 rounded-full blur-2xl z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 mb-10 lg:mb-0"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg">
                Progresser ensemble, gagner ensemble
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-primary-light max-w-lg">
                Rejoignez Boom Bag et faites partie d'une communauté dynamique où votre réseau devient votre valeur.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="btn bg-card text-primary hover:bg-secondary-light flex items-center justify-center shadow-md transition-transform duration-150 hover:scale-105"
                >
                  Commencer
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
                <Link
                  to="/login"
                  className="btn border border-white text-white hover:bg-white/10 flex items-center justify-center shadow-md transition-transform duration-150 hover:scale-105"
                >
                  Se connecter à mon compte
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:w-1/2 flex justify-center"
            >
              <div className="w-full max-w-md bg-card/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/10">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary rounded-lg shadow-md">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold">Système de groupes</h3>
                    <p className="text-primary-light">Créez et développez votre réseau</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card/20 rounded-lg p-4 flex items-center">
                    <Award className="h-5 w-5 text-secondary mr-3" />
                    <div>
                      <h4 className="font-medium">Progression de niveau</h4>
                      <p className="text-sm text-primary-light">Progressez dans les niveaux en développant votre groupe</p>
                    </div>
                  </div>
                  <div className="bg-card/20 rounded-lg p-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-secondary mr-3" />
                    <div>
                      <h4 className="font-medium">Membres vérifiés</h4>
                      <p className="text-sm text-primary-light">Débloquez de nouveaux niveaux avec chaque membre vérifié</p>
                    </div>
                  </div>
                  <div className="bg-card/20 rounded-lg p-4 flex items-center">
                    <Shield className="h-5 w-5 text-primary-dark mr-3" />
                    <div>
                      <h4 className="font-medium">Système sécurisé</h4>
                      <p className="text-sm text-primary-light">Système de progression sûr et transparent</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">Comment fonctionne Boom Bag</h2>
            <p className="mt-4 text-xl text-text-secondary max-w-2xl mx-auto">
              Un processus simple pour développer votre réseau et progresser dans les niveaux
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Animation on hover for feature cards */}
            {[
              {
                icon: Users,
                title: 'Créer votre groupe',
                description: 'Une fois vérifié, vous devenez propriétaire d’un groupe et pouvez inviter d’autres membres.',
                color: 'bg-primary-light text-primary'
              },
              {
                icon: Shield,
                title: 'Vérification',
                description: 'Les membres choisissent un plan et sont vérifiés par notre équipe.',
                color: 'bg-secondary-light text-secondary'
              },
              {
                icon: TrendingUp,
                title: 'Progression de niveau',
                description: 'Chaque 4 membres vérifiés vous fait avancer au niveau suivant.',
                color: 'bg-primary-light text-primary'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`bg-card rounded-xl shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group`}
              >
                <div className={`p-3 rounded-lg ${feature.color} inline-block group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-text-primary">{feature.title}</h3>
                <p className="mt-2 text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">Choisissez votre plan</h2>
            <p className="mt-4 text-xl text-text-secondary max-w-2xl mx-auto">
              Sélectionnez le plan qui correspond à vos objectifs et ambitions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Add subtle hover effect and highlight for popular plan */}
            {[
              {
                name: 'Plan Starter',
                price: '$5',
                features: [
                  'Accès aux niveaux 5, 10, 20',
                  'Vitesse de progression standard',
                  'Outils d’invitation de base',
                  'Support communautaire'
                ],
                color: 'border-primary',
                buttonColor: 'bg-primary hover:bg-primary-dark'
              },
              {
                name: 'Plan Gold',
                price: '$50',
                popular: true,
                features: [
                  'Accès aux niveaux 50, 100, 200',
                  'Progression accélérée',
                  'Outils de groupe avancés',
                  'Support prioritaire'
                ],
                color: 'border-secondary',
                buttonColor: 'bg-secondary hover:bg-secondary-dark'
              }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`bg-card rounded-xl shadow-md overflow-hidden border-2 ${plan.color} hover:shadow-xl hover:-translate-y-1 transition-all duration-200 relative`}
              >
                {plan.popular && (
                  <div className="bg-secondary text-white text-center py-1 text-sm font-medium absolute top-0 left-0 right-0 z-10 shadow-md">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className="p-6 pt-8">
                  <h3 className="text-2xl font-bold text-text-primary">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-text-primary">{plan.price}</span>
                    <span className="ml-1 text-xl font-medium text-text-secondary">{plan.price}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-secondary-light text-secondary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="ml-3 text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      to="/register"
                      className={`block w-full text-center py-3 rounded-md font-medium text-white ${plan.buttonColor} shadow-md transition-transform duration-150 hover:scale-105`}
                    >
                      Commencer
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <img
                src={logo}
                alt="Boom Bag Logo"
                className="h-10 w-auto drop-shadow-md"
              />
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-text-secondary hover:text-white transition-colors duration-150">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="text-text-secondary hover:text-white transition-colors duration-150">
                Politique de confidentialité
              </Link>
              <Link to="/faq" className="text-text-secondary hover:text-white transition-colors duration-150">
                FAQ
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} Boom Bag. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

export default Landing;