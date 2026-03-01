import React, { useState, useRef, useEffect } from 'react';
import { Settings, Play, Pause, Volume2, StopCircle, Upload, ArrowLeft, Heart, Repeat, Shuffle, Plus, Music, Search, X, AlertCircle, Headphones, Cloud, Sparkles, Rocket, Waves, Flame, Coffee, Train } from 'lucide-react';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';

const CATEGORIES = ['All', 'Nature', 'Atmospheric', 'Urban', 'Meditation', 'Favorites', 'Custom'];

export default function SoundSanctuary({ onBack }: { onBack: () => void }) {
  const { sounds, setPlaying, playing, volumes, setVolumes } = useAppContext();
  
  const [masterVolume, setMasterVolume] = useState(80);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['forest-rain', 'lofi-stream']));
  const [isShuffle, setIsShuffle] = useState(false);
  const [mixWithFocus, setMixWithFocus] = useState(true);

  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  
  const togglePlay = (id: string) => {
    setPlaying(prev => ({ ...prev, [id]: !prev[id] }));
    if (volumes[id] === undefined) {
      setVolumes(prev => ({ ...prev, [id]: 60 }));
    }
  };

  const stopAll = () => {
    setPlaying({});
    setIsShuffle(false);
  };

  const handleVolumeChange = (id: string, newVolume: number) => {
    setVolumes(prev => ({ ...prev, [id]: newVolume }));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeSounds = sounds.filter(s => playing[s.id]);
  const nowPlayingName = activeSounds.length > 0 ? activeSounds[activeSounds.length - 1].name : null;

  const filteredSounds = sounds.filter(s => {
    const matchesCategory = activeCategory === 'All' ? true : (activeCategory === 'Favorites' ? favorites.has(s.id) : s.category === activeCategory);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getGradient = (id: string) => {
    const gradients: Record<string, string> = {
      'forest-rain': 'from-green-200 to-emerald-500',
      'summer-meadow': 'from-yellow-100 to-orange-300',
      'ocean-waves': 'from-blue-200 to-cyan-400',
      'crackling-fire': 'from-orange-300 to-rose-500',
      'lofi-stream': 'from-indigo-200 to-purple-400',
      'city-cafe': 'from-slate-200 to-stone-400',
      'train-journey': 'from-blue-300 to-indigo-500',
      'deep-space': 'from-indigo-400 to-purple-600',
      'tibetan-bowls': 'from-amber-200 to-orange-400',
      'wind-chimes': 'from-emerald-100 to-teal-300'
    };
    return gradients[id] || 'from-sage-100 to-sage-300';
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-light text-forest-deep transition-colors duration-300 relative overflow-hidden mesh-forest">
      
      <SharedHeader 
        title="Sounds" 
        onBack={onBack} 
        icon={Music} 
        actions={
          <div className="flex gap-2">
            <button onClick={() => setIsSearching(!isSearching)} className={`size-10 flex items-center justify-center rounded-xl transition-all ${isSearching ? 'bg-primary text-forest-deep' : 'bg-white/50 hover:bg-primary/20'}`}>
              <Search size={20} />
            </button>
            <button className="hidden sm:flex size-10 items-center justify-center rounded-xl bg-white/50 text-forest-deep hover:bg-primary/20 transition-all">
              <Settings size={20} />
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto w-full px-6 py-10">
          
          {/* Hero Section */}
          <div className="flex flex-col gap-2 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-forest-deep text-4xl md:text-5xl font-serif font-bold leading-tight tracking-tight">Sound Sanctuary</h1>
            <p className="text-forest-muted text-lg font-normal">Curated ambient layers for your deep work sessions.</p>
          </div>

          {/* Search Bar (Responsive) */}
          {isSearching && (
            <div className="mb-8 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="relative flex items-center max-w-md">
                <Search className="absolute left-4 text-forest-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Search environments..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl py-3 pl-12 pr-12 text-base outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 text-forest-muted hover:text-forest-deep">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-xl border border-white/50 overflow-x-auto scrollbar-hide max-w-full">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-forest-deep shadow-sm' : 'text-forest-muted hover:text-forest-deep'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-forest-muted whitespace-nowrap">Mix with Focus Timer</span>
              <button 
                onClick={() => setMixWithFocus(!mixWithFocus)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mixWithFocus ? 'bg-primary' : 'bg-forest-deep/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mixWithFocus ? 'translate-x-6' : 'translate-x-1'}`}></span>
              </button>
            </div>
          </div>

          {/* Sound Grid */}
          {filteredSounds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-forest-muted opacity-50">
              <Music size={48} strokeWidth={1} className="mb-4" />
              <p className="text-lg">No soundscapes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSounds.map(sound => (
                <div key={sound.id} className="glass-panel p-4 rounded-2xl flex flex-col gap-4 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                  <div className="aspect-square rounded-xl overflow-hidden relative">
                    {/* Background: Image or Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(sound.id)} opacity-80 group-hover:scale-110 transition-transform duration-700`}></div>
                    {customImages[sound.id] && (
                      <img src={customImages[sound.id]} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" alt="" />
                    )}
                    
                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                      <button onClick={() => toggleFavorite(sound.id)} className={`p-2 rounded-full backdrop-blur-md transition-colors ${favorites.has(sound.id) ? 'bg-rose-500 text-white' : 'bg-white/30 text-forest-deep hover:bg-white/60'}`}>
                        <Heart size={14} className={favorites.has(sound.id) ? 'fill-current' : ''} />
                      </button>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={() => togglePlay(sound.id)}
                        className={`size-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${playing[sound.id] ? 'bg-primary text-forest-deep' : 'bg-white/90 text-forest-deep'}`}
                      >
                        {playing[sound.id] ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif font-bold text-xl text-forest-deep leading-tight">{sound.name}</h3>
                        <p className="text-[10px] font-bold text-forest-muted uppercase tracking-widest mt-1">{sound.category}</p>
                      </div>
                      <span className="material-symbols-outlined text-forest-muted opacity-50">
                        {sound.icon === 'rainy' ? 'cloud' : sound.icon === 'water' ? 'waves' : sound.icon === 'local_fire_department' ? 'fireplace' : 'music_note'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold text-forest-muted uppercase tracking-tighter">
                        <span>Volume</span>
                        <span>{volumes[sound.id] || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-forest-deep/10 rounded-full relative overflow-hidden group/vol cursor-pointer">
                        <div 
                          className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                          style={{ width: `${volumes[sound.id] || 0}%` }}
                        ></div>
                        <input 
                          type="range"
                          min="0" max="100"
                          value={volumes[sound.id] || 0}
                          onChange={(e) => handleVolumeChange(sound.id, parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="h-24"></div> {/* Spacer for sticky footer */}
        </div>
      </main>

      {/* Sticky Master Footer */}
      <footer className="mt-auto glass-panel border-t border-forest-deep/5 px-6 md:px-10 py-6 sticky bottom-0 z-50">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Master Volume */}
          <div className="flex items-center gap-4 min-w-full md:min-w-[350px]">
            <Volume2 className="text-forest-muted" size={20} />
            <div className="relative flex-1 h-2 bg-forest-deep/10 rounded-full cursor-pointer group">
              <div className="absolute inset-y-0 left-0 bg-forest-deep transition-all" style={{ width: `${masterVolume}%` }}></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 size-4 bg-forest-deep rounded-full shadow-md group-hover:scale-125 transition-transform"
                style={{ left: `${masterVolume}%` }}
              ></div>
              <input 
                type="range" 
                min="0" max="100" 
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <span className="text-sm font-bold text-forest-deep w-10">{masterVolume}%</span>
          </div>

          {/* Now Playing & Global Actions */}
          <div className="flex items-center gap-6">
            {nowPlayingName && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-forest-muted tracking-widest uppercase">Now Playing</span>
                  <span className="text-sm font-serif font-bold text-forest-deep">{nowPlayingName}{activeSounds.length > 1 ? ` + ${activeSounds.length - 1} more` : ''}</span>
                </div>
                <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin-slow flex items-center justify-center text-primary">
                  <Headphones size={18} />
                </div>
              </div>
            )}
            
            <div className="hidden md:block h-10 w-[1px] bg-forest-deep/10"></div>
            
            <button 
              onClick={stopAll}
              className="flex items-center gap-2 bg-forest-deep text-white px-6 py-2.5 rounded-xl font-bold hover:bg-forest-deep/90 transition-all active:scale-95 shadow-lg shadow-forest-deep/10"
            >
              <StopCircle size={20} />
              <span>Stop All</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Styles for the slow spin */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .mesh-forest {
          background-color: #f6f8f6;
          background-image: 
            radial-gradient(at 0% 0%, rgba(19, 236, 19, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(19, 236, 19, 0.1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(19, 236, 19, 0.05) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(19, 236, 19, 0.1) 0px, transparent 50%);
        }
      `}</style>
    </div>
  );
}
