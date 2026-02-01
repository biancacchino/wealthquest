// Retro Audio Hook
import { useCallback, useRef, useEffect } from 'react';

export const useRetroAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodesRef = useRef<GainNode[]>([]);
    
    useEffect(() => {
        // Initialize Audio Context on first interactive action or mount if allowed
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }

        return () => {
             if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
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
    }, []);

    const playBlip = useCallback(() => playTone(600, 'square', 0.1), [playTone]);
    const playSelect = useCallback(() => playTone(440, 'sine', 0.1), [playTone]);
    const playCoin = useCallback(() => {
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
    }, []);

    const playError = useCallback(() => playTone(150, 'sawtooth', 0.3), [playTone]);

    // New SFX
    const playFootstep = useCallback(() => {
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
    }, []);

    const playMoneyGained = useCallback(() => {
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
    }, []);

    const playMoneySpent = useCallback(() => {
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
    }, []);

    const playStorePurchase = playMoneySpent; // Alias

    const playInvestmentMade = useCallback(() => {
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
    }, []);

    const playEnterBuilding = useCallback(() => {
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
    }, []);

    const playSleep = useCallback(() => {
        // Lullaby descending
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        
        [659.25, 587.33, 523.25].forEach((freq, i) => { // E, D, C
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
   }, []);



    const stopMusic = useCallback(() => {
        // Background music removed
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
        stopMusic
    };
};