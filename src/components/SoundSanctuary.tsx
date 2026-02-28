import React, { useState, useRef } from 'react';
import { Settings, Play, Pause, Volume2, StopCircle, Upload, ArrowLeft, Heart, Repeat, Shuffle, Plus, Music, Search, X, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Favorites', 'Nature', 'Urban', 'Meditation', 'Custom'];

const INITIAL_SOUNDS = [
  { 
    id: 'forest-rain',
    name: 'Forest Rain',
    category: 'Nature',
    description: 'Gentle rain in a dense forest',
    icon: 'rainy', 
    defaultImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'summer-meadow',
    name: 'Summer Meadow',
    category: 'Nature',
    description: 'Warm breeze and insects',
    icon: 'grass', 
    defaultImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'ocean-waves',
    name: 'Ocean Waves',
    category: 'Nature',
    description: 'Calming beach waves',
    icon: 'water', 
    defaultImage: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'crackling-fire',
    name: 'Crackling Fire',
    category: 'Nature',
    description: 'Warm campfire embers',
    icon: 'local_fire_department', 
    defaultImage: 'https://images.unsplash.com/photo-1525905384812-7013e2008e3b?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'lofi-stream',
    name: 'Lo-fi Stream',
    category: 'Urban',
    description: 'Chill beats to focus to',
    icon: 'headset', 
    defaultImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'city-cafe',
    name: 'City Cafe',
    category: 'Urban',
    description: 'Bustling coffee shop chatter',
    icon: 'local_cafe', 
    defaultImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'train-journey',
    name: 'Train Journey',
    category: 'Urban',
    description: 'Rhythmic train tracks',
    icon: 'train', 
    defaultImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'deep-space',
    name: 'Deep Space',
    category: 'Meditation',
    description: 'Low frequency cosmic drone',
    icon: 'rocket_launch', 
    defaultImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'tibetan-bowls',
    name: 'Tibetan Bowls',
    category: 'Meditation',
    description: 'Resonant singing bowls',
    icon: 'self_improvement', 
    defaultImage: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 'wind-chimes',
    name: 'Wind Chimes',
    category: 'Meditation',
    description: 'Gentle bamboo chimes',
    icon: 'air', 
    defaultImage: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=400&q=80' 
  },
];

export default function SoundSanctuary({ onBack }: { onBack: () => void }) {
  const [sounds, setSounds] = useState(INITIAL_SOUNDS);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [masterVolume, setMasterVolume] = useState(72);
  const [mixWithFocus, setMixWithFocus] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['forest-rain', 'lofi-stream']));
  const [looping, setLooping] = useState<Record<string, boolean>>({});
  const [isShuffle, setIsShuffle] = useState(false);

  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [activeSoundForUpload, setActiveSoundForUpload] = useState<string | null>(null);
  
  const [pendingUpload, setPendingUpload] = useState<{type: 'image' | 'audio', file: File, id?: string} | null>(null);
  const [draggedSoundId, setDraggedSoundId] = useState<string | null>(null);

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

  const toggleLoop = (id: string) => {
    setLooping(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShuffle = () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
    if (newShuffleState) {
      const availableSounds = activeCategory === 'All' ? sounds : activeCategory === 'Favorites' ? sounds.filter(s => favorites.has(s.id)) : sounds.filter(s => s.category === activeCategory);
      if (availableSounds.length > 0) {
        const randomSounds = [...availableSounds].sort(() => 0.5 - Math.random()).slice(0, Math.min(3, availableSounds.length));
        const newPlaying: Record<string, boolean> = {};
        const newVolumes: Record<string, number> = { ...volumes };
        randomSounds.forEach(s => {
          newPlaying[s.id] = true;
          if (newVolumes[s.id] === undefined) newVolumes[s.id] = 60;
        });
        setPlaying(newPlaying);
        setVolumes(newVolumes);
      }
    } else {
      setPlaying({});
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSoundForUpload) {
      setPendingUpload({ type: 'image', file, id: activeSoundForUpload });
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingUpload({ type: 'audio', file });
    }
  };

  const confirmUpload = () => {
    if (!pendingUpload) return;
    
    if (pendingUpload.type === 'image' && pendingUpload.id) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImages(prev => ({ ...prev, [pendingUpload.id!]: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(pendingUpload.file);
      setActiveSoundForUpload(null);
    } else if (pendingUpload.type === 'audio') {
      const newSound = {
        id: `custom-${Date.now()}`,
        name: pendingUpload.file.name.replace(/\.[^/.]+$/, "").substring(0, 20),
        category: 'Custom',
        description: 'Custom uploaded audio',
        icon: 'audio_file',
        defaultImage: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=400&q=80'
      };
      setSounds(prev => [newSound, ...prev]);
      setActiveCategory('Custom');
    }
    setPendingUpload(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const cancelUpload = () => {
    setPendingUpload(null);
    setActiveSoundForUpload(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const triggerImageUpload = (id: string) => {
    setActiveSoundForUpload(id);
    imageInputRef.current?.click();
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (activeCategory !== 'Custom') return;
    setDraggedSoundId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedSoundId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (activeCategory !== 'Custom') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (activeCategory !== 'Custom' || !draggedSoundId || draggedSoundId === targetId) return;
    e.preventDefault();
    
    setSounds(prev => {
      const newSounds = [...prev];
      const draggedIndex = newSounds.findIndex(s => s.id === draggedSoundId);
      const targetIndex = newSounds.findIndex(s => s.id === targetId);
      
      const [draggedItem] = newSounds.splice(draggedIndex, 1);
      newSounds.splice(targetIndex, 0, draggedItem);
      
      return newSounds;
    });
    setDraggedSoundId(null);
  };

  const filteredSounds = sounds.filter(s => {
    const matchesCategory = activeCategory === 'All' ? true : (activeCategory === 'Favorites' ? favorites.has(s.id) : s.category === activeCategory);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background-light text-sage-900 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] transition-colors duration-300"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px] transition-colors duration-300"></div>
      </div>

      <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" className="hidden" />

      {/* Header */}
      <header className="relative z-10 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1.5 hover:bg-sage-100 rounded-lg transition-colors">
              <ArrowLeft className="text-sage-700" size={20} />
            </button>
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <Music className="text-purple-600" size={20} />
            </div>
            <h1 className="font-serif text-xl font-semibold text-sage-700">Sound Sanctuary</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsSearching(!isSearching)} className={`p-2 rounded-full transition-colors ${isSearching ? 'bg-purple-100 text-purple-600' : 'hover:bg-sage-100 text-sage-600'}`}>
              <Search size={20} />
            </button>
            <button onClick={() => audioInputRef.current?.click()} className="p-2 hover:bg-sage-100 rounded-full transition-colors" title="Upload Custom Audio">
              <Plus className="text-sage-600" size={20} />
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        {isSearching && (
          <div className="px-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-sage-400" size={16} />
              <input 
                type="text" 
                placeholder="Search sounds..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 backdrop-blur-sm border border-sage-200 rounded-2xl py-2 pl-9 pr-10 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 text-sage-400 hover:text-sage-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Categories */}
      <div className="relative z-10 flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-2 shrink-0">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-purple-600 text-white' : 'glass-panel text-sage-600 hover:bg-sage-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sound Grid (Scrollable) */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {filteredSounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-sage-400">
            <Music size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No sounds found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredSounds.map(sound => (
              <div 
                key={sound.id} 
                draggable={activeCategory === 'Custom'}
                onDragStart={(e) => handleDragStart(e, sound.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sound.id)}
                className={`glass-panel rounded-2xl p-3 flex flex-col gap-3 group border border-sage-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${activeCategory === 'Custom' ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  <img 
                    src={customImages[sound.id] || sound.defaultImage} 
                    alt={sound.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Top Actions */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(sound.id); }} className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${favorites.has(sound.id) ? 'bg-red-500/20 text-red-500' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                      <Heart size={12} className={favorites.has(sound.id) ? 'fill-current' : ''} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleLoop(sound.id); }} className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${looping[sound.id] ? 'bg-primary/80 text-forest-deep' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                      <Repeat size={12} />
                    </button>
                  </div>

                  <button 
                    onClick={() => togglePlay(sound.id)}
                    className={`absolute inset-0 m-auto size-10 backdrop-blur rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg z-10 ${playing[sound.id] ? 'bg-white/90 text-sage-700' : 'bg-white/20 border border-white/30 text-white'}`}
                  >
                    {playing[sound.id] ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerImageUpload(sound.id); }}
                    className="absolute bottom-2 right-2 size-6 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-20"
                    title="Upload custom image"
                  >
                    <Upload size={12} />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-sage-700 leading-tight">{sound.name}</span>
                      <span className="text-[10px] text-sage-500 line-clamp-1">{sound.description}</span>
                    </div>
                    <span className="material-symbols-outlined text-sage-400 text-sm mt-0.5" style={{fontFamily: 'Material Symbols Outlined'}}>{sound.icon}</span>
                  </div>
                  
                  {/* Refined Volume Slider */}
                  <div className="relative group/slider flex items-center h-4 mt-1">
                    <div className="w-full h-1.5 bg-sage-200 rounded-full overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-purple-500 rounded-full transition-all duration-150" style={{ width: `${volumes[sound.id] || 0}%` }}></div>
                    </div>
                    {/* Invisible wider input for easier dragging */}
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volumes[sound.id] || 0} 
                      onChange={(e) => handleVolumeChange(sound.id, parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-sage-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none z-20 shadow-md">
                      {volumes[sound.id] || 0}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Master Control Bar */}
      <footer className="relative z-10 mt-auto pt-2 shrink-0">
        <div className="glass-panel rounded-[2rem] p-5 shadow-sm border border-sage-200/50 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Volume2 className="text-sage-500" size={18} />
              <span className="text-xs font-bold text-sage-600 uppercase tracking-wider">Master Volume</span>
            </div>
            <span className="text-xs font-semibold text-sage-700">{masterVolume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-sage-200 rounded-full relative cursor-pointer group/master">
              <div className="absolute left-0 top-0 h-full bg-sage-600 rounded-full transition-all duration-150" style={{ width: `${masterVolume}%` }}></div>
              <div className="absolute top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-sage-600 rounded-full shadow-md transition-transform group-hover/master:scale-110" style={{ left: `calc(${masterVolume}% - 8px)` }}></div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={masterVolume} 
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShuffle} className={`p-2 rounded-full transition-colors ${isShuffle ? 'bg-purple-100 text-purple-600' : 'bg-sage-100 text-sage-600 hover:bg-sage-200'}`} title="Shuffle Sounds">
                <Shuffle size={16} />
              </button>
              <button onClick={stopAll} className="bg-sage-700 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-sage-800 transition-colors flex items-center gap-1">
                <StopCircle size={16} />
                STOP
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Upload Confirmation Modal */}
      {pendingUpload && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-purple-600" size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Confirm Upload</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to upload <span className="font-semibold text-slate-700">"{pendingUpload.file.name}"</span> as a {pendingUpload.type === 'image' ? 'custom image' : 'custom sound'}?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={cancelUpload}
                  className="flex-1 py-3 rounded-xl font-bold text-sage-600 bg-sage-100 hover:bg-sage-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmUpload}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
