import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoo from '../../assets/logo-boombag.png';
import {  
  Home, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  BarChart3,
  Wrench
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = user?.role === 'admin' ? [
    { name: 'Tableau de bord', icon: BarChart3, href: '/admin' },
    { name: 'Vérifier les utilisateurs', icon: Shield, href: '/admin/verify' },
    { name: 'Réparer les groupes', icon: Wrench, href: '/admin/groups-repair' },
    { name: 'Utilisateurs', icon: Users, href: '/admin/users' },
    // Removed Settings from admin navigation
  ] : [
    { name: 'Tableau de bord', icon: Home, href: '/dashboard' },
    { name: 'Mes groupes', icon: Users, href: '/groups' },
    { name: 'Inviter des membres', icon: UserPlus, href: '/invite' },
    { name: 'Paramètres', icon: Settings, href: '/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={closeSidebar}></div>
            <motion.div 
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ ease: "easeOut" }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={closeSidebar}
                >
                  <span className="sr-only">Fermer la barre latérale</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              {/* Sidebar content */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Link to="/" className="flex items-center">
                    <div>
                      <img src={logoo} alt="Logo Boom Bag" className="h-12" />
                    </div>
                  </Link>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item: { name: string; icon: any; href: string }) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        location.pathname === item.href
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100',
                        'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                      )}
                      onClick={closeSidebar}
                    >
                      <item.icon 
                        className={clsx(
                          'mr-4 h-5 w-5',
                          location.pathname === item.href
                            ? 'text-white'
                            : 'text-gray-500 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              {/* User information */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                        {user?.name}
                      </p>
                      <button
                        onClick={handleSignOut}
                        className="mt-1 text-sm font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link to="/" className="flex items-center">
                  <div>
                    <img src={logoo} alt="Logo Boom Bag" className="h-12" />
                  </div>
                </Link>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item: { name: string; icon: any; href: string }) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      location.pathname === item.href
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon 
                      className={clsx(
                        'mr-3 h-5 w-5',
                        location.pathname === item.href
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="ml-3 w-full">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                      {user?.status === 'active' ? 'Compte vérifié' : 'Vérification en attente'}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="mt-2 text-sm font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la barre latérale</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;