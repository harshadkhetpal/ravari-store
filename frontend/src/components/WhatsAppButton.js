import React from 'react';

const WA_URL = 'https://wa.me/919084260869?text=' + encodeURIComponent('Hi RAVARI! 👋 I would like to know more about your products.');

function WhatsAppButton() {
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
      {/* Pulse ring */}
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundColor: '#25D366', opacity: 0.4,
        animation: 'wa-ping 1.8s ease-out infinite',
        pointerEvents: 'none',
      }} />
      <style>{`
        @keyframes wa-ping {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .wa-btn:hover { transform: scale(1.1) !important; box-shadow: 0 8px 30px rgba(37,211,102,0.5) !important; }
      `}</style>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-btn"
        title="Chat on WhatsApp"
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
      >
        {/* WhatsApp SVG icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="#fff">
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.75A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.46 11.46 0 01-5.84-1.6l-.42-.25-4.44 1.04 1.06-4.33-.28-.44A11.5 11.5 0 1116 27.5zm6.33-8.6c-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.37-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.75a10.6 10.6 0 01-1.95-2.43c-.2-.35-.02-.54.15-.71.16-.16.35-.4.52-.6.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.6-.09-.17-.78-1.89-1.07-2.59-.28-.68-.57-.59-.78-.6l-.67-.01c-.23 0-.6.09-.92.43-.32.35-1.2 1.17-1.2 2.86s1.23 3.31 1.4 3.54c.17.23 2.42 3.7 5.86 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.81.29-1.51.2-1.66-.08-.14-.3-.23-.66-.4z"/>
        </svg>
      </a>
    </div>
  );
}

export default WhatsAppButton;
