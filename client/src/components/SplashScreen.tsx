'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'visible' | 'fading'>('visible');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fading'), 2000);
    const t2 = setTimeout(() => onComplete(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex items-center gap-5 animate-fade-in">
        <Image src="/1690802623935.jpeg" alt="NACOS" width={75} height={75} className="object-contain" priority />
        <Image src="/images (32).jpeg" alt="Bowen University" width={75} height={75} className="object-contain" priority />
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-black tracking-wide text-gray-900">
          NACOS BOWEN
        </h1>
      </div>
    </div>
  );
}
