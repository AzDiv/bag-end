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
          <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
          <p className="mt-2 text-text-secondary">
            Select the plan that fits your goals and ambitions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const planType = plan.type as 'starter' | 'gold';
            const selected = isSelected(planType);
            
            return (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative p-6 rounded-xl shadow-md overflow-hidden ${
                  selected 
                    ? `border-2 ${plan.borderColor}` 
                    : 'border bg-secondary'
                }`}
              >
                {selected && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-success">
                      <Check className="h-5 w-5 text-success" />
                    </span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${plan.color}`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-3 text-xl font-semibold text-text-primary">{plan.name}</h3>
                </div>
                
                <p className="mt-4 text-4xl font-bold ${plan.textColor}">{plan.price}</p>
                <p className="mt-2 text-sm text-text-secondary">{plan.description}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-success text-success">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="ml-2 text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSelectPlan(planType)}
                  disabled={loading || selected}
                  className={`mt-8 w-full px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${selected
                      ? 'bg-secondary-light text-text-primary cursor-default'
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
          <div className="bg-secondary-light p-4 rounded-lg">
            <h3 className="font-medium text-primary-dark">What's Next?</h3>
            <p className="mt-1 text-sm text-primary-light">
              To activate your plan, please send your payment via one of the methods below and submit proof.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a 
                href="https://t.me/boombag_support" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn bg-[#0088cc] text-white hover:bg-[#0077b5] focus:ring-primary"
              >
                Submit via Telegram
              </a>
              <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn bg-[#25D366] text-white hover:bg-[#128C7E] focus:ring-success"
              >
                Submit via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;