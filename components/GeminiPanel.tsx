import React, { useState, useEffect } from 'react';
import { Planet, GeminiStatus, SearchResult } from '../types';
import { generatePlanetNarrative, generateSpeech, searchPlanetInfo, generatePlanetImage, generateImageDescription } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Play, Loader2, Info, Image as ImageIcon, Search as SearchIcon, Volume2 } from 'lucide-react';

interface GeminiPanelProps {
    planet: Planet;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ planet }) => {
    const [narrative, setNarrative] = useState<string>('');
    const [status, setStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
    const [audioStatus, setAudioStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
    const [searchStatus, setSearchStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
    const [imageStatus, setImageStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
    const [searchData, setSearchData] = useState<SearchResult | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");

    // Reset state when planet changes
    useEffect(() => {
        setNarrative('');
        setStatus(GeminiStatus.IDLE);
        setAudioStatus(GeminiStatus.IDLE);
        setSearchStatus(GeminiStatus.IDLE);
        setImageStatus(GeminiStatus.IDLE);
        setSearchData(null);
        setGeneratedImage(null);
    }, [planet]);

    const getReferenceInfo = (refString: string) => {
        if (!refString) return undefined;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(refString, 'text/html');
            const a = doc.querySelector('a');
            if (a) {
                return { title: a.textContent || '', url: a.href || '' };
            }
        } catch (e) {
            console.error("Error parsing reference:", e);
        }
        return undefined;
    };

    const handleGenerateNarrative = async () => {
        setStatus(GeminiStatus.LOADING);
        try {
            const props = `Mass: ${planet.pl_bmasse} Earths, Radius: ${planet.pl_rade} Earths, Orbital Period: ${planet.pl_orbper} days, Temp: ${planet.pl_eqt}K, Star: ${planet.hostname} (${planet.st_teff}K)`;
            const refInfo = getReferenceInfo(planet.pl_refname);
            const text = await generatePlanetNarrative(planet.pl_name, props, refInfo);
            setNarrative(text);
            setStatus(GeminiStatus.SUCCESS);
        } catch (e) {
            setStatus(GeminiStatus.ERROR);
        }
    };

    const handleSpeak = async () => {
        if (!narrative) return;
        setAudioStatus(GeminiStatus.LOADING);
        try {
            const base64Audio = await generateSpeech(narrative);
            if (base64Audio) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    audioContext,
                    24000,
                    1
                );
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
                setAudioStatus(GeminiStatus.SUCCESS);
            } else {
                setAudioStatus(GeminiStatus.ERROR);
            }
        } catch (e) {
            setAudioStatus(GeminiStatus.ERROR);
        }
    };

    const handleSearch = async () => {
        setSearchStatus(GeminiStatus.LOADING);
        try {
            const result = await searchPlanetInfo(planet.pl_name);
            setSearchData(result);
            setSearchStatus(GeminiStatus.SUCCESS);
        } catch (e) {
            setSearchStatus(GeminiStatus.ERROR);
        }
    };

    const handleGenerateImage = async () => {
        // Check for API key for image generation
        if ((window as any).aistudio) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey) {
                 const success = await (window as any).aistudio.openSelectKey();
                 if (!success) return; 
             }
        }

        setImageStatus(GeminiStatus.LOADING);
        try {
            // Step 1: Generate description using Gemini Flash with reference info
            const props = `Mass: ${planet.pl_bmasse} Earths, Radius: ${planet.pl_rade} Earths, Orbital Period: ${planet.pl_orbper} days, Temp: ${planet.pl_eqt}K, Star: ${planet.hostname} (${planet.st_teff}K)`;
            const refInfo = getReferenceInfo(planet.pl_refname);
            const description = await generateImageDescription(planet.pl_name, props, refInfo);
            
            // Step 2: Generate Image using Gemini Pro Image
            const img = await generatePlanetImage(description, imageSize);
            setGeneratedImage(img);
            setImageStatus(GeminiStatus.SUCCESS);
        } catch (e) {
            console.error(e);
            setImageStatus(GeminiStatus.ERROR);
        }
    };

    const refInfo = getReferenceInfo(planet.pl_refname);

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Gemini Intelligence</span>
            </h3>

            {/* Narrative Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300">Planet Narrative</h4>
                    <button 
                        onClick={handleGenerateNarrative}
                        disabled={status === GeminiStatus.LOADING}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50"
                    >
                        {status === GeminiStatus.LOADING ? <Loader2 className="w-3 h-3 animate-spin"/> : <Info className="w-3 h-3"/>}
                        Generate
                    </button>
                </div>
                {refInfo && (
                     <div className="text-xs text-slate-500 italic">
                        Reference: <a href={refInfo.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{refInfo.title}</a>
                     </div>
                )}
                {narrative && (
                    <div className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 leading-relaxed border border-slate-700">
                        {narrative}
                    </div>
                )}
                {narrative && (
                    <button 
                        onClick={handleSpeak}
                        disabled={audioStatus === GeminiStatus.LOADING}
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-cyan-300 px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50"
                    >
                         {audioStatus === GeminiStatus.LOADING ? <Loader2 className="w-3 h-3 animate-spin"/> : <Volume2 className="w-3 h-3"/>}
                         Read Aloud
                    </button>
                )}
            </div>

            {/* Search Section */}
            <div className="pt-4 border-t border-slate-700 space-y-3">
                 <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300">Search Grounding</h4>
                    <button 
                        onClick={handleSearch}
                        disabled={searchStatus === GeminiStatus.LOADING}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50"
                    >
                        {searchStatus === GeminiStatus.LOADING ? <Loader2 className="w-3 h-3 animate-spin"/> : <SearchIcon className="w-3 h-3"/>}
                        Latest Info
                    </button>
                </div>
                {searchData && (
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-300 mb-3">{searchData.content}</p>
                        {searchData.urls.length > 0 && (
                            <div>
                                <div className="text-xs text-slate-500 mb-2 font-medium">Sources (Google Search):</div>
                                <div className="flex flex-wrap gap-2">
                                    {searchData.urls.map((u, i) => (
                                        <a key={i} href={u.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                                            <span>{u.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Generation Section */}
            <div className="pt-4 border-t border-slate-700 space-y-3">
                 <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-medium text-slate-300">Artistic Visualization</h4>
                    <div className="flex items-center gap-2">
                        <select 
                            value={imageSize} 
                            onChange={(e) => setImageSize(e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1"
                        >
                            <option value="1K">1K</option>
                            <option value="2K">2K</option>
                            <option value="4K">4K</option>
                        </select>
                        <button 
                            onClick={handleGenerateImage}
                            disabled={imageStatus === GeminiStatus.LOADING}
                            className="text-xs bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 disabled:opacity-50"
                        >
                            {imageStatus === GeminiStatus.LOADING ? <Loader2 className="w-3 h-3 animate-spin"/> : <ImageIcon className="w-3 h-3"/>}
                            Generate Image
                        </button>
                    </div>
                </div>
                
                {/* Note to user */}
                <div className="text-xs text-slate-400 italic">
                    Note: Generate the <strong>Planet Narrative</strong> first for a context-aware visualization.
                </div>

                {generatedImage && (
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                        <img src={generatedImage} alt="AI Generated Planet" className="w-full h-auto object-cover" />
                        <div className="bg-slate-900 px-3 py-1 text-xs text-slate-500 text-center">
                            Generated by Gemini 3 Pro
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeminiPanel;