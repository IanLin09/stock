import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // <== Ensures dark mode works with next-themes
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {},
  plugins: [],
};

export default config;
