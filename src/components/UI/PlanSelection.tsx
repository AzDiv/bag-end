import React from 'react';
import { motion } from 'framer-motion';
import { Check, Award, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const PlanSelection: React.FC = () => {
  const { user, selectPlan } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

  const handleSelectPlan = async (packType: 'starter' | 'gold') => {
    setLoading(true);
    
    try {
      const { success, error } = await selectPlan(packType);
      
      if (success) {
        toast.success(`${packType.charAt(0).toUpperCase() + packType.slice(1)} plan selected!`);
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to select plan');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (packType: 'starter' | 'gold') => {
    return user?.pack_type === packType;
  };

  const plans = [
    {
      type: 'starter',
      name: 'Starter Plan',
      price: '$5',
      description: 'Perfect for beginners looking to start their journey',
      features: [
        'Access to Levels 10, 20, 30',
        'Standard progression speed',
        'Basic invitation tools',
        'Community support'
      ],
      icon: Zap,
      color: 'bg-primary',
      textColor: 'text-primary',
      borderColor: 'border-primary'
    },
    {
      type: 'gold',
      name: 'Gold Plan',
      price: '$50',
      description: 'Accelerated progress for serious members',
      features: [
        'Access to Levels 10-60',
        'Faster progression rates',
        'Advanced group tools',
        'Priority support'
      ],
      icon: Award,
      color: 'bg-secondary',
      textColor: 'text-secondary-dark',
      borderColor: 'border-secondary'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-primary-dark mb-2">Choose Your Plan</h2>
          <p className="mt-2 text-lg text-secondary-dark">
            Select the plan that fits your goals and ambitions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const planType = plan.type as 'starter' | 'gold';
            const selected = isSelected(planType);
            return (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative p-8 rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-200 group bg-white hover:shadow-2xl ${
                  selected 
                    ? `${plan.borderColor}` 
                    : 'border-secondary-light'
                }`}
              >
                {selected && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-success text-white text-xs font-semibold shadow">
                      <Check className="h-4 w-4 mr-1" /> Current
                    </span>
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl ${plan.color} shadow-md group-hover:scale-110 transition-transform`}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="ml-4 text-2xl font-bold text-primary-dark group-hover:text-secondary transition-colors">{plan.name}</h3>
                </div>
                <p className={`mt-2 text-4xl font-extrabold ${plan.textColor}`}>{plan.price}</p>
                <p className="mt-2 text-base text-secondary-dark mb-4">{plan.description}</p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-success/20 text-success mr-2">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm text-primary-dark">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(planType)}
                  disabled={loading || selected}
                  className={`mt-8 w-full px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 shadow-md
                    ${selected
                      ? 'bg-secondary-light text-primary-dark cursor-default'
                      : `${plan.color} text-white hover:opacity-90 focus:ring-${plan.type === 'gold' ? 'secondary' : 'primary'}`
                    }`}
                >
                  {selected ? 'Current Plan' : 'Select Plan'}
                </button>
              </motion.div>
            );
          })}
        </div>

        {user?.pack_type && (
          <div className="bg-gradient-to-r from-secondary-light to-primary-light p-5 rounded-xl shadow flex flex-col items-center mt-8">
            <h3 className="font-bold text-primary-dark text-lg mb-1">What's Next?</h3>
            <p className="text-sm text-primary-dark mb-3 text-center max-w-xl">
              To activate your plan, please send your payment via one of the methods below and submit proof.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a 
                href="https://t.me/boombag2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn bg-[#0088cc] text-white hover:bg-[#0077b5] focus:ring-primary shadow"
              >
                Submit via Telegram
              </a>
              {/*<a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn bg-[#25D366] text-white hover:bg-[#128C7E] focus:ring-success shadow"
              >
                Submit via WhatsApp
              </a>*/}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;