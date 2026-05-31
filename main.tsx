@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: "Cormorant Garamond", serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-accent: "Libre Baskerville", serif;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.markdown-body {
  @apply leading-relaxed;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  @apply font-serif font-bold mb-2;
}

.markdown-body p {
  @apply mb-4;
}

.markdown-body strong {
  @apply font-bold text-[#A0522D];
}
