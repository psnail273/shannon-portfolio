

'use client';

import { useEffect, useMemo, useState } from 'react';
 
export default function Intro() {
  const words = useMemo(() => ['stuff', 'things', 'art', 'websites'] as const, []);
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'highlighting' | 'deleting'>('typing');
 
  const currentWord = words[wordIndex] ?? words[0];
  const displayedWord = currentWord.slice(0, charCount);
 
  useEffect(() => {
    const typingSpeedMs = 200;
    const pauseMs = 3000;
    const highlightMs = 750;
    const deleteSpeedMs = 0;
 
    const timeout = window.setTimeout(() => {
      if (phase === 'typing') {
        if (charCount < currentWord.length) setCharCount((c) => c + 1);
        else setPhase('pausing');
        return;
      }
 
      if (phase === 'pausing') {
        setPhase('highlighting');
        return;
      }
 
      if (phase === 'highlighting') {
        setPhase('deleting');
        return;
      }
 
      if (phase === 'deleting') {
        if (charCount > 0) setCharCount((c) => c - 1);
        else {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase('typing');
        }
      }
    }, phase === 'typing'
      ? typingSpeedMs
      : phase === 'pausing'
        ? pauseMs
        : phase === 'highlighting'
          ? highlightMs
          : deleteSpeedMs);
 
    return () => window.clearTimeout(timeout);
  }, [charCount, currentWord.length, phase, words.length]);
 
  return (
    <div className="text-3xl md:text-4xl lg:text-5xl font-playfair">
      Hello, I&apos;m Shannon! I design{ ' ' }
      <span
        className={ [
          'inline-block transition-colors duration-300 rounded-sm px-1 -mx-1',
          phase === 'highlighting' ? 'bg-[#b997ce] text-white' : 'bg-transparent',
        ].join(' ') }
      >
        { displayedWord }
      </span>
      . Take a look around at my portfolio! This is a bit more info to just fill out the space. What do you think?
    </div>
  );
}