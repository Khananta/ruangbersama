'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Sparkles, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Gift, 
  Flame, 
  Music, 
  ArrowRight,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { triggerFloatingHearts } from '../lib/gsapUtils';

// 10 Foto Kenangan ontiiii (Arum) & Yunan
const BIRTHDAY_PHOTOS = [
  {
    src: '/birthday/arum-1.jpg',
    title: 'Perempuan Tercantik Sedunia',
    caption: 'Senyum manis ontiiii yang selalu jadi alasan Yunan bersyukur setiap hari 🌸✨',
  },
  {
    src: '/birthday/arum-2.jpg',
    title: 'Momen Bahagia Berdua',
    caption: 'Makan bareng, ngobrol santai, dan selalu penuh tawa. Sederhana tapi paling berharga 🍹❤️',
  },
  {
    src: '/birthday/arum-3.jpg',
    title: 'Berjuang & Belajar Bareng',
    caption: 'Di perpustakaan kampus bareng ontiiii. Berproses bersama meraih mimpi selangkah demi selangkah 📚🎓',
  },
  {
    src: '/birthday/arum-4.jpg',
    title: 'Si Paling Gemesin!',
    caption: 'Pose jempol andalan depan Gudeg Bu Sri! Tetap lucu dan gemesin di mana pun berada 👍🥰',
  },
  {
    src: '/birthday/arum-5.jpg',
    title: 'Peace Bareng Kamu',
    caption: 'Malam yang tenang dengan orang tersayang. Semoga kita bisa terus jalan berdua selamanya 🌙✌️',
  },
  {
    src: '/birthday/arum-6.jpg',
    title: 'Menemani Setiap Langkahmu',
    caption: 'Jalan santai di bawah pohon rindang. Yunan bakal selalu ada menemani langkah ontiiii 🌳✨',
  },
  {
    src: '/birthday/arum-7.jpg',
    title: 'Si Manis yang Bikin Salting',
    caption: 'Pose unyu megang pipi yang selalu sukses bikin Yunan tersenyum dan gemes sendiri 🥰',
  },
  {
    src: '/birthday/arum-8.jpg',
    title: 'Senyuman Penyejuk Hati',
    caption: 'Tatapan teduh dan senyum tulus yang selalu menghangatkan hari-hari Yunan 🌸🤍',
  },
  {
    src: '/birthday/arum-9.jpg',
    title: 'Golden Hour Bareng Kamu',
    caption: 'Boncengan sore naik motor, angin sepoi-sepoi, dan kamu di belakang. Momen sederhana tapi paling berharga 🛵🌅',
  },
  {
    src: '/birthday/arum-10.jpg',
    title: 'Ngeblur Tapi Tetap Juara di Hati',
    caption: 'Meskipun fotonya motion blur saat jalan malam, cantiknya ontiiii tetap nomor satu tanpa tanding 🌙✨',
  },
];

// Surat Cinta Lengkap dari Yunan
const LOVE_LETTER_PARAGRAPHS = [
  "Haiiii loveee, wahhh hari inii tuh hari spesial, adaa apa yaa? Omggg hari mingguu pantes spesiall, harii dimana semuaa orang menantii hari inii. Tapii.... hari inii lebih darii ituu...",
  "18 Oktober 2005, dimanaa adaa seorang perempuann yang teramaattt cantik, cakepp deh pokoknya, teruss baikk, perhatian, kadang sukaa pundung, kadaang bisa nangiss dilahirkan keduniaa...",
  "Dan yaaa perempuan ituu sekarang udahh beranjak dewasa yaaa... Udahh mulai merasakann pahitnyaa duniaa, duhhh... Udahh buanyakk hal yang perempuan inii jalanin, baikk susah, senang, sedihh pastii udah pernah dirasainn.",
  "21 tahun bukann waktuu yang sedikit, banyakk waktu yang udahh dilewatinn, darii fase balita, fase anakk anak, hinggaa sekarang remaja menuju dewasaa. Gimanaaa rasanyaa? Terus bersyukur yaaa.",
  "Sepertii Yunan yang bersyukurr buangett bisaa kenall, dekett, dann dapett perempuan yang lahir dii hari inii. Banyakk kenangan yang Yunan udahh laluin bareng perempuann inii, Yunan merasaa bisaa berkembang bareng, walaupun prosesnyaa nggaa instan, nggaa cepet yaa.",
  "Yaa soalnyaa di dunia inii gada yang instann yaa, mie instan yang menjanjikan kalauu kita bisaa langsung menunda laparr, masih perlu prosess buat bisaa dimakann. Yaa ituu kayaa kitaa, teruss berproses, walaupunn jalannyaa nggaa cepett.",
  "Tapii Yunan banggaa samaa perempuann inii, teruss darii dulu teruss berkembang darii tahun ke tahunn sampai sekarang udahh dii usia ke-21 tahun inii omgggg.",
  "Siapaa sii perempuan ituu? Yaaa ituu kamuu love, perempuan yang dikasih nama Dwi Okta Suryaningrum atauu biasaa dipanggil Arum, atauu bisaa sii dipanggil \"um\", tapii jarang yang manggil ituu mwehehee....",
  "Happy birthday lovee, doaa terbaikk buatt km, yang pastii semogaa panjang umurr, bisaa bareng Yunan teruss, susah seneng samaa Yunan yaa, happy teruss, se-happy Yunan samaa kamuu, harus semangatt teruss jugaa.",
  "Jangann jadikann umur menjadii patokan yang pastii, umur hanyalahh angkaa, teruss berkembang menjadiii seseorang yang lebihh baik lagii. Fokuss ke diri sendirii, jangan terlaluu mendengar omongann darii orang lainnn. Kalauu dengerr, jadiin masukan dan ambill sisi positifnyaa yaaa omggg.",
  "Mauu ketik apaa lagii yaa? Udahh dehh cukup yappingnyaa, happy birthday love and I lovee youu💖"
];

export const BirthdaySurpriseModal = ({ isOpen, onClose }) => {
  // Stages: 'cake' (3D cake centerpiece & blow candle) | 'revealed' (full reveal with photos & love letter)
  const [stage, setStage] = useState('cake');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isCandleLit, setIsCandleLit] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [hugged, setHugged] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const modalRef = useRef(null);
  const cakeSectionRef = useRef(null);
  const revealContainerRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const synthTimerRef = useRef(null);

  // ── Open Animation & Confetti ──
  useEffect(() => {
    if (!isOpen) return;

    setStage('cake');
    setIsCandleLit(true);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#FB7185', '#38BDF8', '#FBBF24', '#EC4899'],
      zIndex: 99999,
    });

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.88, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
      );
    }
  }, [isOpen]);

  // ── 3D Mouse Tilt Effect on Cake Card ──
  const handleMouseMove = (e) => {
    if (!cakeSectionRef.current || stage !== 'cake') return;
    const rect = cakeSectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 12,
      y: (x / (rect.width / 2)) * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // ── Synthesizer Music Engine (Web Audio API) ──
  const startRomanticSynth = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = {
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
      };

      const melody = [
        { note: notes.G4, dur: 0.35, pause: 0.05 },
        { note: notes.G4, dur: 0.35, pause: 0.05 },
        { note: notes.A4, dur: 0.7, pause: 0.1 },
        { note: notes.G4, dur: 0.7, pause: 0.1 },
        { note: notes.C5, dur: 0.7, pause: 0.1 },
        { note: notes.B4, dur: 1.2, pause: 0.2 },

        { note: notes.G4, dur: 0.35, pause: 0.05 },
        { note: notes.G4, dur: 0.35, pause: 0.05 },
        { note: notes.A4, dur: 0.7, pause: 0.1 },
        { note: notes.G4, dur: 0.7, pause: 0.1 },
        { note: notes.D5, dur: 0.7, pause: 0.1 },
        { note: notes.C5, dur: 1.2, pause: 0.2 },

        { note: notes.E4, dur: 0.4, pause: 0.05 },
        { note: notes.G4, dur: 0.4, pause: 0.05 },
        { note: notes.C5, dur: 0.4, pause: 0.05 },
        { note: notes.E5, dur: 0.8, pause: 0.1 },
        { note: notes.D5, dur: 0.4, pause: 0.05 },
        { note: notes.C5, dur: 0.4, pause: 0.05 },
        { note: notes.A4, dur: 0.8, pause: 0.1 },

        { note: notes.F4, dur: 0.4, pause: 0.05 },
        { note: notes.A4, dur: 0.4, pause: 0.05 },
        { note: notes.C5, dur: 0.4, pause: 0.05 },
        { note: notes.G4, dur: 1.0, pause: 0.3 }
      ];

      let noteIndex = 0;

      const playNextNote = () => {
        if (!isOpen) return;
        const current = melody[noteIndex % melody.length];
        noteIndex++;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(current.note, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + current.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + current.dur);

        const nextDelay = (current.dur + current.pause) * 1000;
        synthTimerRef.current = setTimeout(playNextNote, nextDelay);
      };

      playNextNote();
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  };

  const stopRomanticSynth = () => {
    if (synthTimerRef.current) {
      clearTimeout(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend();
    }
  };

  // Sound effect: candle blow breath whoosh
  const playBlowSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = audioCtxRef.current || new AudioContext();
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  };

  // ── Music Playback Control ──
  useEffect(() => {
    if (isOpen && isPlayingMusic) {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          startRomanticSynth();
        });
      } else {
        startRomanticSynth();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopRomanticSynth();
    }

    return () => {
      stopRomanticSynth();
    };
  }, [isOpen, isPlayingMusic]);

  // ── Auto advance carousel on revealed stage ──
  useEffect(() => {
    if (!isOpen || stage !== 'revealed') return;
    const timer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % BIRTHDAY_PHOTOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isOpen, stage]);

  // ── Tiup Lilin & Trigger Reveal Sequence ──
  const handleBlowCandleAndReveal = (e) => {
    if (e) triggerFloatingHearts(e);
    playBlowSound();
    setIsCandleLit(false);

    // Big festive confetti explosion!
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#FBBF24', '#F472B6', '#38BDF8', '#FFFFFF', '#EC4899', '#A855F7'],
      zIndex: 99999,
    });

    // Smooth transition from 3D Cake stage to Full Reveal stage
    setTimeout(() => {
      if (cakeSectionRef.current) {
        gsap.to(cakeSectionRef.current, {
          opacity: 0,
          scale: 0.94,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setStage('revealed');
            setTimeout(() => {
              if (revealContainerRef.current) {
                gsap.fromTo(
                  revealContainerRef.current,
                  { opacity: 0, y: 30 },
                  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
                );
              }
            }, 60);
          }
        });
      } else {
        setStage('revealed');
      }
    }, 900);
  };

  // ── Hug Yunan Button ──
  const handleHugYunan = (e) => {
    triggerFloatingHearts(e);
    setHugged(true);
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#F43F5E', '#FB7185', '#EC4899', '#38BDF8'],
      zIndex: 99999,
    });
    setTimeout(() => setHugged(false), 4000);
  };

  if (!isOpen) return null;

  const currentPhoto = BIRTHDAY_PHOTOS[activePhotoIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md overflow-y-auto font-sans">
      
      {/* Dynamic Keyframes for 3D Cake, Flame, Smoke, & Floating sparkles */}
      <style>{`
        @keyframes cakeFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
        }
        @keyframes flameSway {
          0%, 100% { transform: scale(1) rotate(-1.5deg); }
          25% { transform: scale(1.06, 0.94) rotate(2deg); }
          50% { transform: scale(0.95, 1.05) rotate(-2deg); }
          75% { transform: scale(1.03, 0.97) rotate(1deg); }
        }
        @keyframes flameAuraGlow {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.22); }
        }
        @keyframes smokePuff {
          0% { opacity: 0.9; transform: translate(-50%, 0) scale(0.5); }
          50% { opacity: 0.6; transform: translate(-45%, -20px) scale(1.1); }
          100% { opacity: 0; transform: translate(-55%, -45px) scale(1.6); }
        }
        @keyframes sprinkleGlint {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Hidden Audio Tag for custom MP3 */}
      <audio 
        ref={audioRef} 
        src="/birthday/instrumental.mp3" 
        loop 
        onEnded={() => {}}
      />

      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[32px] border border-rose-200/90 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] transition-all duration-300"
      >

        {/* ── Top Festive Header Banner ── */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-rose-500 via-pink-500 to-sky-500 text-white shrink-0 overflow-hidden shadow-sm">
          
          <div className="absolute top-2 left-6 text-white/30 text-2xl select-none animate-pulse">✨</div>
          <div className="absolute bottom-2 right-8 text-white/20 text-3xl select-none animate-bounce">💖</div>
          <div className="absolute top-3 right-20 text-white/25 text-xl select-none">🌸</div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white mb-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>18 Oktober 2005 - 18 Oktober 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Selamat Ulang Tahun ke-21, ontiiii! 🎂</span>
              </h2>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                title={isPlayingMusic ? 'Matikan musik' : 'Putar musik'}
                className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
              >
                {isPlayingMusic ? (
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4 text-white/70" />
                )}
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                title="Tutup popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick tab to switch back to cake when in revealed stage */}
          {stage === 'revealed' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20 text-xs">
              <button
                onClick={() => setStage('cake')}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Lihat Kue 3D Lagi 🎂</span>
              </button>
              <span className="text-white/80 font-medium">
                • 10 Foto Kenangan & Surat Cinta
              </span>
            </div>
          )}
        </div>

        {/* ── STAGE 1: TAMPILAN ANIMASI 3D KUE ULANG TAHUN (Tiup Lilin Dulu) ── */}
        {stage === 'cake' && (
          <div 
            ref={cakeSectionRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 overflow-y-auto flex-1 bg-gradient-to-b from-stone-50 via-rose-50/40 to-pink-50/20 perspective-[1000px]"
          >
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Make a Wish & Tiup Lilinnya Yuk ontiiii!</span>
            </div>

            {/* ── 3D Interactive Birthday Cake Showcase ── */}
            <div 
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="relative p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border-2 border-rose-200/90 shadow-2xl hover:shadow-rose-300/40 max-w-sm w-full cursor-pointer select-none group"
              onClick={isCandleLit ? handleBlowCandleAndReveal : () => setStage('revealed')}
              title={isCandleLit ? 'Klik untuk tiup lilin!' : 'Klik untuk melihat kado'}
            >
              
              {/* Floating ambient glow behind cake */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-400/10 via-amber-300/15 to-pink-400/10 rounded-3xl blur-xl -z-10" />

              {/* 3D Animated Cake Container with Floating Bobbing */}
              <div 
                style={{ animation: 'cakeFloat 3.8s ease-in-out infinite' }}
                className="relative flex flex-col items-center justify-center py-4"
              >

                {/* ── The Candle with Flickering 3D Flame ── */}
                <div className="relative z-30 flex flex-col items-center -mb-2">
                  
                  {/* Flame or Extinguished Smoke */}
                  {isCandleLit ? (
                    <div className="relative group-hover:scale-110 transition-transform">
                      {/* Outer Glowing Aura */}
                      <span 
                        style={{ animation: 'flameAuraGlow 1.8s ease-in-out infinite' }}
                        className="absolute -inset-2 bg-amber-400/40 rounded-full blur-md" 
                      />

                      {/* Main Teardrop Flame with Sway */}
                      <div 
                        style={{ animation: 'flameSway 0.8s ease-in-out infinite' }}
                        className="relative w-5 h-8 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full flex items-center justify-center shadow-[0_0_15px_#F59E0B]"
                      >
                        {/* Hot White-Yellow Inner Core */}
                        <span className="w-2 h-4 bg-white/95 rounded-full mt-2" />
                      </div>

                      {/* Sparkle highlights on flame */}
                      <span className="absolute -top-1 -right-1 text-[10px] text-yellow-200 animate-spin">✨</span>
                    </div>
                  ) : (
                    /* Smoke wisps after blowing */
                    <div 
                      style={{ animation: 'smokePuff 1.2s ease-out forwards' }}
                      className="text-xs font-bold text-rose-500"
                    >
                      💨✨
                    </div>
                  )}

                  {/* Candle Wick */}
                  <div className="w-1 h-2 bg-stone-700 rounded-full" />

                  {/* 3D Candle Stick (Number 21 Badge & Striped Pillar) */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-4 h-8 bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 rounded-t-sm shadow-sm border border-amber-300/60 overflow-hidden flex flex-col justify-between">
                      {/* Red/Pink Spirals */}
                      <span className="h-1 bg-rose-400/80 -rotate-12 w-8 -ml-2" />
                      <span className="h-1 bg-rose-400/80 -rotate-12 w-8 -ml-2" />
                      <span className="h-1 bg-rose-400/80 -rotate-12 w-8 -ml-2" />
                    </div>

                    {/* 3D Numeral "21" Badge */}
                    <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 text-white font-black text-[11px] shadow-md border border-white/80">
                      21
                    </div>
                  </div>
                </div>

                {/* ── 3D SVG Cake Graphics with Layers & Frosting ── */}
                <div className="relative w-48 sm:w-56 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 200 130" className="w-full h-full filter drop-shadow-xl overflow-visible">
                    <defs>
                      {/* Gradients for Cake 3D Volumes */}
                      <linearGradient id="standGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#E2E8F0" />
                        <stop offset="50%" stopColor="#CBD5E1" />
                        <stop offset="100%" stopColor="#94A3B8" />
                      </linearGradient>
                      <linearGradient id="bottomTierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FB7185" />
                        <stop offset="30%" stopColor="#FDA4AF" />
                        <stop offset="70%" stopColor="#F43F5E" />
                        <stop offset="100%" stopColor="#E11D48" />
                      </linearGradient>
                      <linearGradient id="topTierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FECDD3" />
                        <stop offset="40%" stopColor="#FFF1F2" />
                        <stop offset="80%" stopColor="#FDA4AF" />
                        <stop offset="100%" stopColor="#FB7185" />
                      </linearGradient>
                      <linearGradient id="frostingDripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#FFF1F2" />
                      </linearGradient>
                      <radialGradient id="cakeTopGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Cake Plate Stand Oval with 3D Depth */}
                    <ellipse cx="100" cy="115" rx="85" ry="12" fill="#000000" opacity="0.15" />
                    <ellipse cx="100" cy="112" rx="82" ry="10" fill="url(#standGrad)" />
                    <ellipse cx="100" cy="111" rx="80" ry="9" fill="#F8FAFC" />

                    {/* ── Bottom Tier Cylinder (Base) ── */}
                    {/* Cylinder Side */}
                    <path d="M 35 75 Q 100 90 165 75 L 165 102 Q 100 117 35 102 Z" fill="url(#bottomTierGrad)" />
                    {/* Cream Rim Bottom Border */}
                    <path d="M 35 102 Q 100 117 165 102" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />

                    {/* Decorative Piping Swirls on Bottom Tier */}
                    <circle cx="45" cy="100" r="3" fill="#FFFFFF" />
                    <circle cx="65" cy="106" r="3" fill="#FFFFFF" />
                    <circle cx="85" cy="108" r="3" fill="#FFFFFF" />
                    <circle cx="105" cy="108" r="3" fill="#FFFFFF" />
                    <circle cx="125" cy="106" r="3" fill="#FFFFFF" />
                    <circle cx="145" cy="102" r="3" fill="#FFFFFF" />
                    <circle cx="155" cy="98" r="3" fill="#FFFFFF" />

                    {/* Sprinkles on Base */}
                    <rect x="52" y="86" width="5" height="2" rx="1" fill="#FBBF24" transform="rotate(25 52 86)" />
                    <rect x="75" y="90" width="5" height="2" rx="1" fill="#38BDF8" transform="rotate(-15 75 90)" />
                    <rect x="110" y="93" width="5" height="2" rx="1" fill="#A855F7" transform="rotate(30 110 93)" />
                    <rect x="135" y="87" width="5" height="2" rx="1" fill="#34D399" transform="rotate(-25 135 87)" />
                    <rect x="92" y="84" width="5" height="2" rx="1" fill="#FBBF24" transform="rotate(10 92 84)" />

                    {/* Bottom Tier Top Surface */}
                    <ellipse cx="100" cy="75" rx="65" ry="11" fill="#FB7185" />
                    <ellipse cx="100" cy="74" rx="64" ry="10" fill="#FFF1F2" />

                    {/* ── Top Tier Cylinder ── */}
                    <path d="M 55 45 Q 100 58 145 45 L 145 74 Q 100 87 55 74 Z" fill="url(#topTierGrad)" />
                    
                    {/* Melty Dripping Frosting on Top Tier */}
                    <path 
                      d="M 55 45 
                         C 62 55, 66 65, 70 56 
                         C 74 68, 80 72, 85 58 
                         C 90 70, 96 73, 102 59 
                         C 107 72, 114 69, 118 57 
                         C 124 67, 130 65, 134 54 
                         C 139 60, 142 55, 145 45 
                         Z" 
                      fill="url(#frostingDripGrad)" 
                    />

                    {/* Top Tier Top Surface Oval */}
                    <ellipse cx="100" cy="45" rx="45" ry="9" fill="url(#frostingDripGrad)" />
                    <ellipse cx="100" cy="44" rx="43" ry="8" fill="url(#cakeTopGlow)" />

                    {/* Strawberries & Cream Rosettes */}
                    {/* Left Strawberry */}
                    <path d="M 67 40 C 65 34, 75 32, 75 39 C 75 44, 70 47, 67 40 Z" fill="#E11D48" />
                    <path d="M 69 34 L 71 31 L 73 34 Z" fill="#22C55E" />
                    {/* Center Right Strawberry */}
                    <path d="M 125 41 C 123 35, 133 33, 133 40 C 133 45, 128 48, 125 41 Z" fill="#E11D48" />
                    <path d="M 127 35 L 129 32 L 131 35 Z" fill="#22C55E" />
                    
                    {/* Cream Swirls */}
                    <circle cx="83" cy="43" r="3.5" fill="#FFFFFF" />
                    <circle cx="117" cy="43" r="3.5" fill="#FFFFFF" />
                    <circle cx="100" cy="48" r="4" fill="#FFFFFF" />
                  </svg>
                </div>

                <div className="mt-2 space-y-1">
                  <h3 className="text-base font-extrabold text-stone-900 flex items-center justify-center gap-1.5">
                    <span>Kue Ulang Tahun 3D Spesial</span>
                    <span className="text-rose-500">✨</span>
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    {isCandleLit 
                      ? 'Tutup mata sebentar, buat satu permintaan (make a wish), lalu klik lilinnya yaaa... 🕯️' 
                      : 'Yeay! Permintaan sudah terkirim ke langit! 🤲💖'
                    }
                  </p>
                </div>

              </div>

            </div>

            {/* Action Button: Tiup Lilin */}
            <button
              onClick={handleBlowCandleAndReveal}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-sky-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-rose-300/40 transition-all active:scale-95 group"
            >
              <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>Tiup Lilin & Buka Kado Spesial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[11px] text-stone-400">
              🎵 Musik instrumental romantis sedang diputar untuk menemani hari ulang tahunmu
            </p>

          </div>
        )}

        {/* ── STAGE 2: KUE PADAM & MUNCUL 10 FOTO SERTA SURAT CINTA ── */}
        {stage === 'revealed' && (
          <div 
            ref={revealContainerRef}
            className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 bg-stone-50/50 transition-all duration-500"
          >

            {/* Banner Wish Terkabul */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  Yaaay! Lilin ke-21 berhasil ditiup! Semoga semua doa, harapan, dan impian ontiiii dikabulkan Allah SWT 🤲💖
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCandleLit(true);
                  setStage('cake');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-[10px] font-bold text-amber-800 border border-amber-200 shrink-0 transition-colors"
              >
                Tiup Lagi 🕯️
              </button>
            </div>

            {/* 1. Galeri 10 Foto Kenangan Berdua */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  <span>10 Kenangan Indah Bersama ({activePhotoIndex + 1}/{BIRTHDAY_PHOTOS.length})</span>
                </span>
                <div className="flex items-center gap-1">
                  {BIRTHDAY_PHOTOS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activePhotoIndex ? 'w-4 bg-rose-500' : 'w-1.5 bg-stone-200 hover:bg-stone-300'
                      }`}
                      aria-label={`Foto ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Foto Card Container */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 aspect-[4/3] sm:aspect-[16/10] shadow-md border border-stone-200 group">
                <img
                  src={currentPhoto.src}
                  alt={currentPhoto.title}
                  className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for Caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                  <span className="text-xs font-bold text-rose-300 tracking-wide uppercase">
                    {currentPhoto.title}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-stone-100 mt-0.5 leading-snug">
                    {currentPhoto.caption}
                  </p>
                </div>

                {/* Previous & Next Buttons */}
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev - 1 + BIRTHDAY_PHOTOS.length) % BIRTHDAY_PHOTOS.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 hover:bg-white/60 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev + 1) % BIRTHDAY_PHOTOS.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/30 hover:bg-white/60 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
                  aria-label="Foto selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails Row (10 Foto) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar">
                {BIRTHDAY_PHOTOS.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activePhotoIndex ? 'border-rose-500 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Surat Cinta Lengkap dari Yunan */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white border border-rose-100 shadow-bento space-y-4 relative overflow-hidden">
              
              <div className="absolute top-3 right-4 text-rose-100 text-6xl font-serif select-none pointer-events-none opacity-40">
                💌
              </div>

              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                  ✍️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Surat Cinta Spesial dari Yunan
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Ditulis setulus hati untuk ontiiii tersayang
                  </p>
                </div>
              </div>

              {/* Teks Surat */}
              <div className="space-y-3.5 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                {LOVE_LETTER_PARAGRAPHS.map((p, idx) => (
                  <p key={idx} className={`${idx === 0 ? 'font-medium text-stone-800' : ''} ${idx === LOVE_LETTER_PARAGRAPHS.length - 1 ? 'font-bold text-rose-600 pt-2 text-sm sm:text-base' : ''}`}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Signature */}
              <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Selalu mencintaimu, Yunan (Khanif)</span>
                </div>
                <span className="text-[11px] text-stone-400">
                  18 Oktober 2026 • Ruang Bersama
                </span>
              </div>

            </div>

          </div>
        )}

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 bg-white border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Music className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
            <span>Musik instrumental: {isPlayingMusic ? 'Menyala 🎶' : 'Mati 🔇'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleHugYunan}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{hugged ? 'Pelukan Terkirim! 🥰' : 'Peluk Yunan 🤗❤️'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all"
            >
              Tutup & Lanjut
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
