import { useState, useEffect } from 'react';
import { HomeScreen } from './components/home-screen';
import { ServicesList } from './components/services-list';
import { FormFilling } from './components/form-filling';
import { ServiceCompletion } from './components/service-completion';
import { AdminPanel } from './components/admin-panel';
import { SyncStatus } from './components/sync-status';
import { Dashboard } from './components/dashboard';
// NEW: Institute components
import { InstituteDashboard } from './components/institute-dashboard';
import { InstituteForm } from './components/institute-form';

export type Screen = 'home' | 'services' | 'form' | 'completion' | 'admin' | 'sync' | 'dashboard' | 'instituteDashboard' | 'instituteForm';

export interface User {
  name: string;
  email: string;
}

export interface Service {
  id: string;
  title: string;
  status: 'draft' | 'syncing' | 'synced';
  lastEdited: Date;
  completedDate?: Date;
  referenceId?: string;
}

export interface FormData {
  fullName: string;
  ssn: string;
  dob: string;
  phone: string;
  startTime?: Date;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      title: 'Business License',
      status: 'draft',
      lastEdited: new Date(),
    },
    {
      id: '2',
      title: 'Housing Benefit',
      status: 'syncing',
      lastEdited: new Date(Date.now() - 1000 * 60 * 75), // 1 hour 15 min ago
    },
    {
      id: '3',
      title: 'University Scholarship',
      status: 'synced',
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      referenceId: 'CF-2024-U789-S',
    },
    {
      id: '4',
      title: 'Voter Registration',
      status: 'synced',
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      referenceId: 'CF-2024-V234-R',
    },
    {
      id: '5',
      title: 'Building Permit',
      status: 'synced',
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      referenceId: 'CF-2024-B567-P',
    },
    {
      id: '6',
      title: 'Tax Declaration',
      status: 'synced',
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      referenceId: 'CF-2024-T890-D',
    },
    {
      id: '7',
      title: 'Health Insurance',
      status: 'synced',
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      referenceId: 'CF-2024-H123-I',
    },
    {
      id: '8',
      title: 'Driver License Renewal',
      status: 'synced',
      lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
      completedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      referenceId: 'CF-2024-D456-L',
    },
  ]);

  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    ssn: '',
    dob: '',
    phone: '',
  });

  const [completedService, setCompletedService] = useState<Service | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // NEW: Institute progress state
  const [instituteTotal, setInstituteTotal] = useState(10);
  const [instituteCompleted, setInstituteCompleted] = useState(3);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('civicflow_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('civicflow_user');
    setUser(null);
    setCurrentScreen('home');
  };

  const handleNavigate = (screen: Screen, serviceId?: string) => {
    if (screen === 'form') {
      let service: Service;
      
      if (serviceId) {
        // Editing existing service
        service = services.find(s => s.id === serviceId) || {
          id: Date.now().toString(),
          title: 'Business Permit Renewal',
          status: 'draft',
          lastEdited: new Date(),
          startTime: new Date(),
        } as Service;
      } else {
        // Creating new service
        service = {
          id: Date.now().toString(),
          title: 'Business Permit Renewal',
          status: 'draft',
          lastEdited: new Date(),
        };
        
        // Add to services if it's new
        setServices(prev => [service, ...prev]);
      }
      
      setCurrentService(service);
      setFormData({
        ...formData,
        startTime: new Date(),
      });
    }
    
    setCurrentScreen(screen);
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    
    if (currentService) {
      // Update service
      const updatedService: Service = {
        ...currentService,
        lastEdited: new Date(),
        referenceId: `REF-${Math.floor(Math.random() * 999)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      };
      
      setCompletedService(updatedService);
      
      setServices(prev => 
        prev.map(s => s.id === updatedService.id ? updatedService : s)
      );
    }
    
    setCurrentScreen('completion');
  };

  const handleCompleteService = () => {
    if (completedService) {
      // Update service to synced
      const syncedService: Service = {
        ...completedService,
        status: 'synced',
        completedDate: new Date(),
      };
      
      setServices(prev => 
        prev.map(s => s.id === syncedService.id ? syncedService : s)
      );
      
      setCompletedService(syncedService);
    }
    
    setCurrentScreen('sync');
  };

  // NEW: Handle institute submission
  const handleInstituteSubmit = () => {
    if (instituteCompleted < instituteTotal) {
      setInstituteCompleted(prev => prev + 1);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} services={services} />;
      case 'services':
        return <ServicesList onNavigate={handleNavigate} services={services} user={user} onLogin={handleLogin} />;
      case 'form':
        return (
          <FormFilling 
            onNavigate={handleNavigate} 
            onSubmit={handleFormSubmit}
            initialData={formData}
            service={currentService}
          />
        );
      case 'completion':
        return (
          <ServiceCompletion 
            onNavigate={handleNavigate} 
            onComplete={handleCompleteService}
            service={completedService}
            formData={formData}
          />
        );
      case 'admin':
        return <AdminPanel onNavigate={handleNavigate} services={services} />;
      case 'sync':
        return <SyncStatus onNavigate={handleNavigate} service={completedService} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} services={services} user={user} onLogout={handleLogout} />;
      case 'instituteDashboard':
        return (
          <InstituteDashboard 
            onNavigate={handleNavigate}
            totalSubmissions={instituteTotal}
            completedSubmissions={instituteCompleted}
          />
        );
      case 'instituteForm':
        return (
          <InstituteForm 
            onNavigate={handleNavigate}
            totalSubmissions={instituteTotal}
            completedSubmissions={instituteCompleted}
            onSubmit={handleInstituteSubmit}
          />
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} services={services} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-auto">
        {renderScreen()}
      </div>
    </div>
  );
}