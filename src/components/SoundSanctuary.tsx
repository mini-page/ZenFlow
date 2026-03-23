import React, { useState } from 'react';
import { Play, Pause, Volume2, StopCircle, Upload, Heart, Plus, Music, Search, X, Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import SharedHeader from './SharedHeader';

const CATEGORIES = ['All', 'Nature', 'Atmospheric', 'Urban', 'Meditation', 'Favorites', 'Custom'];

export default function SoundSanctuary({ onBack }: { onBack: () => void }) {
  const { sounds, setPlaying, playing, volumes, setVolumes, customSounds, addCustomSound, deleteCustomSound, masterVolume, setMasterVolume } = useAppContext();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['forest-rain', 'lofi-stream']));
  const [isShuffle, setIsShuffle] = useState(false);
  const [mixWithFocus, setMixWithFocus] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSoundName, setNewSoundName] = useState('');
  const [newSoundFile, setNewSoundFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  
  const togglePlay = (id: string) => {
    setPlaying(prev => ({ ...prev, [id]: !prev[id] }));
    if (volumes[id] === undefined) {
      setVolumes(prev => ({ ...prev, [id]: 60 }));
    }
  };

  const handleAddCustomSound = async () => {
    if (!newSoundName || !newSoundFile) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      addCustomSound({
        id: `custom-${Date.now()}`,
        name: newSoundName,
        category: 'Custom',
        description: 'User uploaded soundscape',
        icon: 'music_note',
        defaultImage: 'https://images.unsplash.com/photo-1514826786317-59744fe2a548?auto=format&fit=crop&w=400&q=80',
        url: url,
        isCustom: true
      });
      setIsUploading(false);
      setShowAddModal(false);
      setNewSoundName('');
      setNewSoundFile(null);
    };
    reader.readAsDataURL(newSoundFile);
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
    if (id.startsWith('custom-')) return 'from-indigo-400 to-cyan-400';
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
        currentView="sounds"
        icon={Music} 
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowAddModal(true)} className="size-10 flex items-center justify-center rounded-xl bg-primary text-forest-deep hover:bg-primary-dark transition-all shadow-sm">
              <Plus size={20} />
            </button>
            <button onClick={() => setIsSearching(!isSearching)} className={`size-10 flex items-center justify-center rounded-xl transition-all ${isSearching ? 'bg-primary text-forest-deep' : 'bg-white/50 hover:bg-primary/20'}`}>
              <Search size={20} />
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto w-full px-6 py-10">
          
          {/* Hero Section */}
          <div className="flex flex-col gap-2 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-forest-deep text-4xl md:text-5xl font-serif font-bold leading-tight tracking-tight">Sound Sanctuary</h1>
                <p className="text-forest-muted text-lg font-normal">Curated ambient layers for your deep work sessions.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="hidden md:flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/50 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary transition-all active:scale-95 shadow-sm"
              >
                <Plus size={18} />
                Add Your Own Sound
              </button>
            </div>
          </div>

          {/* ... (Search and Filter bars unchanged) */}
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
            <div className="flex flex-col items-center justify-center py-20 text-forest-muted">
              <Music size={64} strokeWidth={1} className="mb-6 opacity-20" />
              <h3 className="text-xl font-bold mb-2">No soundscapes found</h3>
              <p className="text-sm opacity-60 mb-8 max-w-xs text-center">
                {activeCategory === 'Custom' 
                  ? "You haven't uploaded any personal soundscapes yet. Use the '+' button to add your favorite MP3s."
                  : "Try adjusting your search or category filters to find what you're looking for."}
              </p>
              {activeCategory === 'Custom' && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Your First Custom Sound
                </button>
              )}
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
                      {sound.isCustom && (
                        <button onClick={() => deleteCustomSound(sound.id)} className="p-2 rounded-full backdrop-blur-md bg-white/30 text-forest-deep hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
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
                        <h3 className="font-serif font-bold text-xl text-forest-deep leading-tight truncate max-w-[150px]">{sound.name}</h3>
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

      {/* Add Custom Sound Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-forest-deep">Add Custom Sound</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-sage-100 rounded-full text-sage-500"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-muted mb-2">Sound Name</label>
                <input 
                  type="text" 
                  value={newSoundName}
                  onChange={(e) => setNewSoundName(e.target.value)}
                  placeholder="e.g., My Favorite Rain"
                  className="w-full bg-sage-50 border border-sage-100 rounded-xl px-4 py-3 outline-none focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-muted mb-2">Audio File</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="audio/*"
                    onChange={(e) => setNewSoundFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full border-2 border-dashed border-sage-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-primary transition-colors bg-sage-50/50">
                    <Upload className="text-sage-400 group-hover:text-primary" size={32} />
                    <span className="text-sm font-medium text-sage-600 truncate max-w-full px-4">
                      {newSoundFile ? newSoundFile.name : 'Click to select audio'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddCustomSound}
                disabled={!newSoundName || !newSoundFile || isUploading}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${!newSoundName || !newSoundFile || isUploading ? 'bg-slate-300' : 'bg-slate-900 hover:bg-slate-800 active:scale-95'}`}
              >
                {isUploading ? 'Processing...' : 'Add to Sanctuary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Master Control Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border-white/40 backdrop-blur-xl">
          
          {/* Master Volume Slider (Compact) */}
          <div className="flex items-center gap-3 bg-slate-100/50 px-4 py-2 rounded-full border border-white/40 group">
            <Volume2 size={16} className="text-forest-muted group-hover:text-primary transition-colors" />
            <div className="relative w-24 h-1.5 bg-forest-deep/10 rounded-full cursor-pointer overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-forest-deep transition-all" style={{ width: `${masterVolume}%` }}></div>
              <input 
                type="range" min="0" max="100" value={masterVolume}
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <span className="text-[10px] font-black text-forest-deep w-6">{masterVolume}%</span>
          </div>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          {/* Global Actions */}
          <div className="flex items-center gap-4">
            {nowPlayingName && (
              <div className="hidden md:flex flex-col items-end mr-2 animate-in fade-in slide-in-from-right-4">
                <span className="text-[8px] font-black text-forest-muted uppercase tracking-widest">Active</span>
                <span className="text-[10px] font-serif font-bold text-forest-deep max-w-[100px] truncate">{nowPlayingName}</span>
              </div>
            )}

            <button 
              onClick={stopAll}
              className="size-12 rounded-full bg-forest-deep text-white flex items-center justify-center shadow-lg hover:bg-forest-deep/90 hover:scale-105 active:scale-95 transition-all"
              title="Stop All"
            >
              <StopCircle size={24} />
            </button>

            <button 
              onClick={onBack}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-all">
                <X size={18} className="text-rose-500" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400">Back</span>
            </button>
          </div>
        </div>
      </nav>

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
