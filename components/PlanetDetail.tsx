import React from 'react';
import { Planet } from '../types';
import { ScatterPlot, SizeComparison } from './Visualizations';
import GeminiPanel from './GeminiPanel';
import { ArrowLeft } from 'lucide-react';

interface PlanetDetailProps {
    planet: Planet;
    allPlanets: Planet[];
    onBack: () => void;
}

const PlanetDetail: React.FC<PlanetDetailProps> = ({ planet, allPlanets, onBack }) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <button 
                    onClick={onBack}
                    className="flex items-center text-sm text-slate-400 hover:text-white transition-colors gap-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1">{planet.pl_name}</h2>
                        <p className="text-cyan-400 text-lg">Orbiting {planet.hostname}</p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                        <span className="text-slate-400 text-sm block">Discovery Method</span>
                        <span className="text-white font-medium">{planet.discoverymethod} ({planet.disc_year})</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase tracking-wider">Radius</div>
                    <div className="text-2xl font-bold text-white mt-1">{planet.pl_rade?.toFixed(2) || 'N/A'} <span className="text-sm font-normal text-slate-500">R⊕</span></div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase tracking-wider">Mass</div>
                    <div className="text-2xl font-bold text-white mt-1">{planet.pl_bmasse?.toFixed(2) || 'N/A'} <span className="text-sm font-normal text-slate-500">M⊕</span></div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase tracking-wider">Period</div>
                    <div className="text-2xl font-bold text-white mt-1">{planet.pl_orbper?.toFixed(2) || 'N/A'} <span className="text-sm font-normal text-slate-500">days</span></div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase tracking-wider">Temp</div>
                    <div className="text-2xl font-bold text-white mt-1">{planet.pl_eqt ? `${planet.pl_eqt.toFixed(0)} K` : 'N/A'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Visuals */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Planet Context</h3>
                        <ScatterPlot 
                            data={allPlanets} 
                            selectedPlanet={planet} 
                            // Disable click in detail view to avoid confusion or keep it to switch?
                            // Let's keep it static-ish for context, or allow switching. 
                            // The user asked to select "from the same slide", assuming dashboard.
                            // In detail view, let's keep it highlighting the current one.
                        />
                        <p className="text-xs text-slate-500 mt-2 text-center">Log-Log Scale: Orbital Period (x) vs Radius (y)</p>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                         <h3 className="text-lg font-semibold text-white mb-4">Size Comparison (Earth vs {planet.pl_name})</h3>
                         <SizeComparison planet={planet} />
                    </div>
                </div>

                {/* Right Column: Gemini Panel */}
                <div className="lg:col-span-1">
                    <GeminiPanel planet={planet} />
                </div>
            </div>
            
            {/* Extended Data Table */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Stellar & System Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                     <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">Star Temp (K)</span>
                        <span className="text-white">{planet.st_teff || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">Star Radius (Solar)</span>
                        <span className="text-white">{planet.st_rad || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">Star Mass (Solar)</span>
                        <span className="text-white">{planet.st_mass || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">Distance (pc)</span>
                        <span className="text-white">{planet.sy_dist || 'N/A'}</span>
                    </div>
                     <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">RA</span>
                        <span className="text-white">{planet.ra || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">Dec</span>
                        <span className="text-white">{planet.dec || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanetDetail;