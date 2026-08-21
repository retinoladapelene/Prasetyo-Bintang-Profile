import { useState, useEffect } from 'react';

export type StoneEffect = 'time' | 'space' | 'power' | 'soul' | 'mind' | 'reality' | null;

type Listener = (effect: StoneEffect) => void;
let activeEffect: StoneEffect = null;
const listeners = new Set<Listener>();

// Function to trigger an effect globally
export const triggerInfinityEffect = (effect: StoneEffect) => {
    activeEffect = effect;
    listeners.forEach(l => l(effect));
};

// Hook for components to listen to the active effect
export const useInfinityEffect = () => {
    const [effect, setEffect] = useState<StoneEffect>(activeEffect);

    useEffect(() => {
        const listener: Listener = (newEffect) => {
            setEffect(newEffect);
        };
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    return effect;
};
