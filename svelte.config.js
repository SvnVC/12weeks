// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    prerender: {
      entries: ['/goals/edit/a52f9871-e539-4028-ad2d-00576aea53a7', 
        '/goals/a52f9871-e539-4028-ad2d-00576aea53a7/edit', 
        '/goals/a52f9871-e539-4028-ad2d-00576aea53a7/plan',
        '/plan/a52f9871-e539-4028-ad2d-00576aea53a7',
      '/dashboard', '/plan', '/review', '/goals/a52f9871-e539-4028-ad2d-00576aea53a7/week/1/actions',]
    }
    
  },
  compilerOptions: {
    customElement: true // Enable custom element compilation globally
  }
  
};

export default config;
