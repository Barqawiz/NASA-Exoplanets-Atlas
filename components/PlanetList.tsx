import React, { useState } from 'react';
import { Planet } from '../types';
import { Search, ChevronRight } from 'lucide-react';

interface PlanetListProps {
    planets: Planet[];
    selectedPlanet: Planet | null;
    onSelect: (planet: Planet) => void;
}

const PlanetList: React.FC<PlanetListProps> = ({ planets, selectedPlanet, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlanets = planets.filter(p => 
        p.pl_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hostname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700 w-full md:w-80 flex-shrink-0">
            <div className="p-4 border-b border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search planets..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredPlanets.map((planet) => (
                    <button
                        key={planet.pl_name}
                        onClick={() => onSelect(planet)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors flex items-center justify-between group ${
                            selectedPlanet?.pl_name === planet.pl_name ? 'bg-cyan-900/30 border-l-4 border-l-cyan-500' : 'border-l-4 border-l-transparent'
                        }`}
                    >
                        <div>
                            <div className={`font-medium ${selectedPlanet?.pl_name === planet.pl_name ? 'text-cyan-400' : 'text-slate-200'}`}>
                                {planet.pl_name}
                            </div>
                            <div className="text-xs text-slate-500">
                                {planet.disc_year} • {planet.sy_dist ? `${planet.sy_dist} pc` : 'Unknown dist'}
                            </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ${selectedPlanet?.pl_name === planet.pl_name ? 'opacity-100 text-cyan-500' : ''}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlanetList;