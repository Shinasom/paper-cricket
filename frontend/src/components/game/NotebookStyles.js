// src/components/game/NotebookStyles.js
'use client';

export default function NotebookStyles() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Caveat:wght@400;600;700&display=swap');
      
      .notebook-paper {
        background: 
          linear-gradient(90deg, transparent 0px, transparent 79px, rgba(239, 68, 68, 0.3) 79px, rgba(239, 68, 68, 0.3) 81px, transparent 81px),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 39px,
            rgba(59, 130, 246, 0.1) 39px,
            rgba(59, 130, 246, 0.1) 40px
          ),
          radial-gradient(circle at 20% 80%, rgba(0,0,0,0.02) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 50%),
          #fefefe;
      }
      
      .handwritten { 
        font-family: 'Kalam', cursive; 
        line-height: 1.6;
      }
      .handwritten-title { 
        font-family: 'Caveat', cursive; 
        font-weight: 700;
      }
      
      .ink-blue { color: #1e40af; }
      .ink-red { color: #dc2626; }
      .ink-green { color: #059669; }
      .ink-black { color: #1f2937; }
      
      .spiral-holes {
        background: 
          radial-gradient(circle at 50% 10%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
          radial-gradient(circle at 50% 30%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
          radial-gradient(circle at 50% 50%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
          radial-gradient(circle at 50% 70%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
          radial-gradient(circle at 50% 90%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
          #f3f4f6;
      }
      
      /* Animations */
      @keyframes gentle-bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-8px); }
        60% { transform: translateY(-3px); }
      }
      
      @keyframes waiting-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }
      
      @keyframes dots-loading {
        0%, 20% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      @keyframes paper-rustle {
        0%, 100% { transform: rotate(0deg) translateY(0px); }
        25% { transform: rotate(1deg) translateY(-2px); }
        50% { transform: rotate(0deg) translateY(-4px); }
        75% { transform: rotate(-1deg) translateY(-2px); }
      }
      
      @keyframes cricket-ball-bounce {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        25% { transform: translateY(-15px) rotate(90deg); }
        50% { transform: translateY(-25px) rotate(180deg); }
        75% { transform: translateY(-15px) rotate(270deg); }
      }
      
      @keyframes ink-spread {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes pencil-wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(2deg); }
        75% { transform: rotate(-2deg); }
      }
      
      @keyframes pen-bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      @keyframes ink-blot {
        0% { 
          opacity: 0; 
          transform: scale(0.5) rotate(-5deg);
          filter: blur(2px);
        }
        50% { 
          opacity: 1; 
          transform: scale(1.2) rotate(2deg);
          filter: blur(1px);
        }
        100% { 
          opacity: 1; 
          transform: scale(1) rotate(0deg);
          filter: blur(0px);
        }
      }
      
      /* Animation Classes */
      .gentle-bounce { animation: gentle-bounce 2s infinite; }
      .waiting-pulse { animation: waiting-pulse 2s infinite; }
      .dots-loading { animation: dots-loading 1.5s infinite; }
      .paper-rustle { animation: paper-rustle 3s infinite; }
      .cricket-ball-bounce { animation: cricket-ball-bounce 2s infinite; }
      .ink-spread { animation: ink-spread 0.5s ease-out; }
      .pencil-wiggle { animation: pencil-wiggle 2s infinite; }
      .pen-bounce { animation: pen-bounce 2s infinite; }
      .ink-blot { animation: ink-blot 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      
      /* Utility Classes */
      .dashed-box {
        border: 2px dashed #3b82f6;
        background: linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%), 
                    linear-gradient(-45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%);
        background-size: 20px 20px;
      }
      
      .code-highlight {
        background: linear-gradient(45deg, #fef3c7, #fde68a);
        border: 2px solid #f59e0b;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .paper-torn {
        clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 90%, 100% 95%, 95% 100%, 0 100%);
      }
      
      .underline-wavy {
        text-decoration: underline;
        text-decoration-style: wavy;
        text-decoration-color: #dc2626;
      }
      
      .underline-red {
        background-image: linear-gradient(transparent 50%, #dc2626 50%, #dc2626 60%, transparent 60%);
        background-size: 100% 20px;
      }
      
      .circle-answer {
        border: 2px solid #dc2626;
        border-radius: 50%;
        background: rgba(252, 165, 165, 0.3);
      }
      
      .pen-selection {
        background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.3) 100%);
        border: 2px dashed #3b82f6;
      }
    `}</style>
  );
}