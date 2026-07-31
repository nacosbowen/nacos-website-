'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const SLIDES = [
  { src: '/slidingpictures/DSC_7511.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/DSC_7525.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/DSC_7541.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/DSC_7544.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/DSC_7551.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/DSC_7579 (1).jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/OBD_6018 (1).jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/OBD_6129.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/OBD_6207.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/OBD_6301.jpg', alt: 'NACOS Event' },
  { src: '/slidingpictures/OBD_6311.jpg', alt: 'NACOS Event' },
];

export default function AboutSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="pt-56 pb-28 px-4 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">

        {/* 3D Card */}
        <div className="w-full lg:w-[62%] flex justify-start pl-0">
          <div className="card-3d-wrapper w-full">
            <div className="relative">
              <div className="absolute top-6 left-6 right-[-14px] bottom-[-14px] bg-gray-200 rounded-3xl" />
              <div className="absolute top-3 left-3 right-[-7px] bottom-[-7px] bg-gray-300/60 rounded-3xl" />
              <div className="card-3d relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-white/60">
                {SLIDES.map((slide, i) => (
                  <div key={slide.src} className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: i === current ? 1 : 0 }}>
                    <Image src={slide.src} alt={slide.alt} fill className="object-cover" priority={i === 0} />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5' : 'bg-white/40 w-2'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="w-full lg:w-[38%] space-y-6">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">Who We Are</span>
          <h2 className="text-4xl font-black text-gray-900 leading-tight">
            The Home of <br /><span className="text-blue-600">Tech Students</span> at Bowen
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            NACOS Bowen is the official student association for all computer-related departments at Bowen University — connecting, informing, and empowering students across CS, SE, Cyber Security, and IFT.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            From real-time campus notifications and exam past questions to department events and executive broadcasts — everything you need as a tech student is right here.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[{ value: '4', label: 'Departments' }, { value: '1000+', label: 'Students' }, { value: '5', label: 'Levels' }].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
