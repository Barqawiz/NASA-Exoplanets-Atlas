import React from 'react';
import { Planet } from '../types';
import { ScatterPlot, DiscoveryBarChart } from './Visualizations';
import { Globe, Star, Calendar } from 'lucide-react';

interface DashboardProps {
    planets: Planet[];
    onSelectPlanet: (planet: Planet) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ planets, onSelectPlanet }) => {
    // Summary Stats
    const totalPlanets = planets.length;
    const latestYear = Math.max(...planets.map(p => parseInt(p.disc_year) || 0));
    const uniqueHostStars = new Set(planets.map(p => p.hostname)).size;

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Mission Overview</h2>
                <p className="text-slate-400">
                    Exploring {totalPlanets} confirmed planets from the TESS mission data.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
                    <div className="p-3 bg-cyan-900/50 rounded-lg text-cyan-400">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-400">Confirmed Planets</div>
                        <div className="text-2xl font-bold text-white">{totalPlanets}</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-900/50 rounded-lg text-indigo-400">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-400">Unique Host Stars</div>
                        <div className="text-2xl font-bold text-white">{uniqueHostStars}</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
                    <div className="p-3 bg-purple-900/50 rounded-lg text-purple-400">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-400">Latest Discovery</div>
                        <div className="text-2xl font-bold text-white">{latestYear > 0 ? latestYear : 'N/A'}</div>
                    </div>
                </div>
            </div>

            {/* Discovery Timeline */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Discoveries by Year</h3>
                <DiscoveryBarChart data={planets} />
            </div>

            {/* Main Interactive Scatter */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Exoplanet Population (Orbital Period vs Radius)</h3>
                    <div className="text-xs text-slate-400">Click a dot to view planet details</div>
                </div>
                <ScatterPlot 
                    data={planets} 
                    selectedPlanet={null} 
                    onPlanetClick={onSelectPlanet}
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                    Logarithmic scale showing the distribution of planetary radii relative to their orbital periods.
                    <br/>
                    Color indicates discovery year (Purple: older, Yellow: newer).
                </p>
            </div>
        </div>
    );
};

export default Dashboard;