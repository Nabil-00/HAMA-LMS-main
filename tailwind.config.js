/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'hama-gold': '#F2C94C',
                'bg-primary': '#0B0F19',
                'bg-secondary': '#111827',
                'hama-success': '#22C55E',
                'text-primary': '#F9FAFB',
                'text-secondary': '#9CA3AF',
                'text-muted': '#6B7280',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.35)',
            }
        },
    },
    plugins: [],
}
