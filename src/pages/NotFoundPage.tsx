export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden">
      <div className="text-center">
        {/* Animation Container */}
        <div className="relative w-[300px] h-[200px] mx-auto mb-6">
          {/* Ground */}
          <div className="absolute bottom-[40px] left-0 right-0 h-[2px] bg-neutral-300" />
          {/* Hole in the ground */}
          <div className="absolute bottom-[34px] left-[55%] w-[40px] h-[12px] rounded-[50%] bg-neutral-800" />

          {/* Stick Figure */}
          <div className="absolute bottom-[42px] left-0 animate-[walkAndFall_4s_ease-in-out_infinite]">
            <svg width="40" height="60" viewBox="0 0 40 60" className="animate-[bobbing_0.5s_ease-in-out_infinite_alternate]">
              {/* Head */}
              <circle cx="20" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
              {/* Body */}
              <line x1="20" y1="17" x2="20" y2="38" stroke="currentColor" strokeWidth="2" className="text-foreground" />
              {/* Arms */}
              <line x1="20" y1="24" x2="10" y2="32" stroke="currentColor" strokeWidth="2" className="text-foreground animate-[swingArm_0.5s_ease-in-out_infinite_alternate]" />
              <line x1="20" y1="24" x2="30" y2="32" stroke="currentColor" strokeWidth="2" className="text-foreground animate-[swingArm_0.5s_ease-in-out_infinite_alternate-reverse]" />
              {/* Legs */}
              <line x1="20" y1="38" x2="12" y2="55" stroke="currentColor" strokeWidth="2" className="text-foreground animate-[walkLeg_0.5s_ease-in-out_infinite_alternate]" />
              <line x1="20" y1="38" x2="28" y2="55" stroke="currentColor" strokeWidth="2" className="text-foreground animate-[walkLeg_0.5s_ease-in-out_infinite_alternate-reverse]" />
            </svg>
          </div>
        </div>

        <p className="text-[80px] font-bold text-neutral-200 leading-none">404</p>
        <p className="text-lg font-medium text-foreground mt-3">Oops! You fell off the path</p>
        <p className="text-sm text-foreground-muted mt-1">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
          ← Go back home
        </a>
      </div>

      <style>{`
        @keyframes walkAndFall {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          50% { transform: translateX(155px) translateY(0px) rotate(0deg); }
          60% { transform: translateX(170px) translateY(0px) rotate(0deg); }
          70% { transform: translateX(180px) translateY(15px) rotate(15deg); }
          80% { transform: translateX(185px) translateY(60px) rotate(30deg); opacity: 1; }
          85% { transform: translateX(185px) translateY(100px) rotate(45deg); opacity: 0; }
          86% { transform: translateX(0px) translateY(0px) rotate(0deg); opacity: 0; }
          95% { opacity: 0; }
          100% { transform: translateX(0px) translateY(0px) rotate(0deg); opacity: 1; }
        }
        @keyframes bobbing {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-3px); }
        }
        @keyframes swingArm {
          0% { transform: rotate(-10deg); transform-origin: 20px 24px; }
          100% { transform: rotate(10deg); transform-origin: 20px 24px; }
        }
        @keyframes walkLeg {
          0% { transform: rotate(-15deg); transform-origin: 20px 38px; }
          100% { transform: rotate(15deg); transform-origin: 20px 38px; }
        }
      `}</style>
    </div>
  );
}
