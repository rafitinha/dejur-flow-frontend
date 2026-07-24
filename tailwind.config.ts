import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf3',
          500: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
};
export default config;
