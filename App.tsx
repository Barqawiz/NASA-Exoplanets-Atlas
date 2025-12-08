import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlanetList from './components/PlanetList';
import PlanetDetail from './components/PlanetDetail';
import Dashboard from './components/Dashboard';
import { loadPlanetsData } from './services/dataService';
import { Planet } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
    const [planets, setPlanets] = useState<Planet[]>([]);
    const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const data = await loadPlanetsData();
                setPlanets(data);
            } catch (error) {
                console.error("Failed to initialize data:", error);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                <span className="ml-3 text-lg">Loading TESS Data...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <div className="hidden md:flex">
                    <PlanetList 
                        planets={planets} 
                        selectedPlanet={selectedPlanet} 
                        onSelect={setSelectedPlanet} 
                    />
                </div>
                {selectedPlanet ? (
                    <PlanetDetail 
                        planet={selectedPlanet} 
                        allPlanets={planets} 
                        onBack={() => setSelectedPlanet(null)}
                    />
                ) : (
                    <Dashboard 
                        planets={planets}
                        onSelectPlanet={setSelectedPlanet}
                    />
                )}
            </div>
            {/* Mobile View Toggle */}
            <div className="md:hidden absolute bottom-4 right-4">
                 {/* Mobile navigation controls could go here */}
            </div>
        </div>
    );
};

export default App;