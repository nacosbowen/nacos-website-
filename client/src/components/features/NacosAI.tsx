'use client';

export default function NacosAI() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center"
      style={{ height: 'calc(100vh - 120px)', minHeight: 500 }}>
      <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      </div>
      <p className="text-xl font-black text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        NACOS AI
      </p>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">
        Your personal study assistant is coming soon. We're putting the finishing touches on it.
      </p>
    </div>
  );
}