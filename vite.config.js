import { defineConfig } from 'vite';

// Relative URLs keep builds working both on username.github.io and /repository/.
export default defineConfig({ base: './' });
