'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, Pause, SkipForward, Music } from 'lucide-react';
import { useEmergencyMode } from '@/components/providers/EmergencyProvider';

const AUDIO_TRACKS = [
  { id: 'rain', name: 'Calming Rain', url: 'https://www.soundjay.com/nature/sounds/rain-07.mp3' },
  { id: 'lofi', name: 'Lo-Fi Study', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'forest', name: 'Ambient Forest', url: 'https://www.youtube.com/watch?v=atgjKEgSqSU&list=RDatgjKEgSqSU&start_radio=1' },
];

export default function FocusAudio() {
  const { emergency } = useEmergencyMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = AUDIO_TRACKS[currentTrackIndex];

  // Initialize audio ref
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update track URL when index changes
  useEffect(() => {
    if (!audioRef.current) return;

    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current.src = currentTrack.url;
    audioRef.current.load();
    audioRef.current.volume = volume;

    if (wasPlaying && emergency.isActive) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Audio play failed:', err);
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-pause when emergency mode is turned off
  useEffect(() => {
    if (!emergency.isActive && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [emergency.isActive]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Playback failed:', err);
        });
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % AUDIO_TRACKS.length);
  };

  if (!emergency.isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-indigo-500/20 bg-slate-950/85 backdrop-blur-xl p-4 shadow-2xl shadow-indigo-500/10"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Spinning music icon or pulsing wave */}
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <motion.div
                    className="w-0.75 bg-indigo-400 rounded-full"
                    animate={{ height: ['20%', '80%', '20%'] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="w-0.75 bg-indigo-400 rounded-full"
                    animate={{ height: ['40%', '100%', '40%'] }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut', delay: 0.2 }}
                  />
                  <motion.div
                    className="w-0.75 bg-indigo-400 rounded-full"
                    animate={{ height: ['15%', '60%', '15%'] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.4 }}
                  />
                </div>
              ) : (
                <Music className="w-4 h-4 text-indigo-400" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Calming Soundscape</p>
              <h4 className="text-xs font-semibold text-slate-200 truncate">{currentTrack.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            {/* Next Track Button */}
            <button
              onClick={nextTrack}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Volume slider */}
        <div className="mt-3 flex items-center gap-2 px-1">
          <Volume2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 focus:outline-none"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
