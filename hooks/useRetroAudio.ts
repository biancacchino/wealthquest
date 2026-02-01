// Retro Audio Hook
import { useCallback, useRef, useEffect } from 'react';

export const useRetroAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const musicOscillatorsRef = useRef<OscillatorNode[]>([]);
    const gainNodesRef = useRef<GainNode[]>([]);
    const isPlayingMusic = useRef(false);

    useEffect(() => {
        // Initialize Audio Context on first interactive action or mount if allowed
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }

        return () => {
            stopMusic();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        if (!audioContextRef.current) return;
        
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playBlip = () => playTone(600, 'square', 0.1);
    const playSelect = () => playTone(440, 'sine', 0.1);
    const playCoin = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.1);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(now + 0.3);
    };

    const playError = () => playTone(150, 'sawtooth', 0.3);

    // New SFX
    const playFootstep = () => {
        // Short, soft click
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Use noise or highly filtered wave, but for simplicity: short low square
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    };

    const playMoneyGained = () => {
        // "Ding-ding"
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1760, now + 0.1); // A6
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.setValueAtTime(0.1, now + 0.1); 
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.5);
    };

    const playMoneySpent = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.1);
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.2);
    };

    const playStorePurchase = playMoneySpent; // Alias

    const playInvestmentMade = () => {
         // Major triad arpeggio
         if (!audioContextRef.current) return;
         const ctx = audioContextRef.current;
         const now = ctx.currentTime;
         
         [523.25, 659.25, 783.99].forEach((freq, i) => { // C, E, G
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             
             osc.type = 'square';
             osc.frequency.value = freq;
             
             const startTime = now + (i * 0.1);
             gain.gain.setValueAtTime(0, startTime);
             gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
             gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
             
             osc.connect(gain);
             gain.connect(ctx.destination);
             osc.start(startTime);
             osc.stop(startTime + 0.4);
         });
    };

    const playEnterBuilding = () => {
         // Whoosh slide up
         if (!audioContextRef.current) return;
         const ctx = audioContextRef.current;
         const now = ctx.currentTime;
         
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(100, now);
         osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
         
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.3);
         
         osc.connect(gain);
         gain.connect(ctx.destination);
         osc.start();
         osc.stop(now + 0.3);
    };

    const playSleep = () => {
        // Lullaby descending
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
         // E5, D5, C5
        [659.25, 587.33, 523.25].forEach((freq, i) => { 
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + (i * 0.4);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 1.2);
        });
   };


    const startBackgroundMusic = useCallback(() => {
        if (isPlayingMusic.current || !audioContextRef.current) return;
        
        // Simple ambient drone
        const ctx = audioContextRef.current;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Low F and C
        osc1.frequency.value = 174.61; // F3
        osc2.frequency.value = 261.63; // C4
        
        osc1.type = 'triangle';
        osc2.type = 'sine';
        
        gain.gain.value = 0.02; // Very quiet
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        musicOscillatorsRef.current = [osc1, osc2];
        gainNodesRef.current = [gain];
        isPlayingMusic.current = true;
    }, []);

    const stopMusic = useCallback(() => {
        musicOscillatorsRef.current.forEach(osc => osc.stop());
        musicOscillatorsRef.current = [];
        isPlayingMusic.current = false;
    }, []);

    return {
        playBlip,
        playSelect,
        playCoin,
        playError,
        playFootstep,
        playMoneyGained,
        playMoneySpent,
        playStorePurchase,
        playInvestmentMade,
        playEnterBuilding,
        playSleep,
        startBackgroundMusic,
        stopMusic
    };
};