import React, { useState } from 'react';
import { Rocket, Info, X } from 'lucide-react';

const Header: React.FC = () => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Rocket className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        TESS Planet Atlas
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 hidden sm:flex">
                    <span>Powered by NASA Data & Google Gemini</span>
                    <button 
                        onClick={() => setShowInfo(true)} 
                        className="hover:text-cyan-400 transition-colors p-1"
                        aria-label="About"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowInfo(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-cyan-400" />
                            About
                        </h3>
                        
                        <div className="space-y-4 text-slate-300">
                            <p>
                                This application visualizes exoplanet discoveries from the NASA TESS mission using interactive charts and AI-generated narratives powered by Google Gemini.
                            </p>
                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Created by</p>
                                <a 
                                    href="https://www.linkedin.com/in/barqawi/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline"
                                >
                                    Ahmad Albarqawi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;