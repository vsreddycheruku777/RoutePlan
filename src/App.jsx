import { useState } from 'react';
import { Map, Route, Navigation, Settings, Upload } from 'lucide-react';
import MapView from './components/MapView';
import StepAddresses from './components/StepAddresses';
import StepGoals from './components/StepGoals';
import StepRoutes from './components/StepRoutes';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [goals, setGoals] = useState({
    maxVehicles: 1,
    maxStopsPerVehicle: 50,
    optimizeFor: 'time', // time or distance
  });
  const [routes, setRoutes] = useState(null);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepAddresses 
            addresses={addresses} 
            setAddresses={setAddresses} 
            onNext={() => setCurrentStep(2)} 
          />
        );
      case 2:
        return (
          <StepGoals 
            goals={goals} 
            setGoals={setGoals} 
            onBack={() => setCurrentStep(1)} 
            onNext={() => setCurrentStep(3)} 
            addresses={addresses}
            setRoutes={setRoutes}
          />
        );
      case 3:
        return (
          <StepRoutes 
            routes={routes} 
            onBack={() => setCurrentStep(2)} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <Route size={28} />
            <span>Route Planner</span>
          </div>
          
          {/* Wizard Navigation */}
          <div className="wizard-nav">
            <div 
              className={`wizard-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
              onClick={() => currentStep > 1 && setCurrentStep(1)}
            >
              <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
              <span>Addresses</span>
            </div>
            <div 
              className={`wizard-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
              onClick={() => (currentStep > 2 || (currentStep === 1 && addresses.length > 0)) && setCurrentStep(2)}
            >
              <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
              <span>Goals</span>
            </div>
            <div 
              className={`wizard-step ${currentStep === 3 ? 'active' : ''}`}
            >
              <div className="step-number">3</div>
              <span>Routes</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content based on Step */}
        <div className="sidebar-content">
          {renderStepContent()}
        </div>
      </div>

      {/* Map Area */}
      <div className="map-container">
        <MapView addresses={addresses} routes={routes} />
      </div>
    </div>
  );
}

export default App;
