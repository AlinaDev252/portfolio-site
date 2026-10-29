<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

const dark = ref(false);
let media: MediaQueryList | null = null;
let settle = 0;

const apply = (value: boolean) => {
  dark.value = value;
  document.documentElement.classList.toggle('dark', value);
};

const onSystemChange = (event: MediaQueryListEvent) => {
  let saved: string | null = null;
  try { saved = localStorage.getItem('theme'); } catch {}
  if (!saved) apply(event.matches);
};

const toggle = () => {
  const root = document.documentElement;
  root.classList.add('theme-anim');
  apply(!dark.value);
  clearTimeout(settle);
  settle = window.setTimeout(() => root.classList.remove('theme-anim'), 300);
  try { localStorage.setItem('theme', dark.value ? 'dark' : 'light'); } catch {}
};

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark');
  media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onSystemChange);
});

onBeforeUnmount(() => {
  media?.removeEventListener('change', onSystemChange);
  clearTimeout(settle);
  document.documentElement.classList.remove('theme-anim');
});
</script>

<template>
  <button
    type="button"
    class="inline-grid size-10 place-items-center rounded-full text-heading transition-colors hover:bg-tint dark:text-night-heading dark:hover:bg-night-surface"
    :aria-pressed="dark"
    aria-label="Dark theme"
    @click="toggle"
  >
    <svg class="theme-icon col-start-1 row-start-1 size-[18px] transition-[opacity,rotate,scale] duration-300 ease-(--ease-soft) dark:-rotate-90 dark:scale-75 dark:opacity-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    <svg class="theme-icon col-start-1 row-start-1 size-[18px] rotate-90 scale-75 opacity-0 transition-[opacity,rotate,scale] duration-300 ease-(--ease-soft) dark:rotate-0 dark:scale-100 dark:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
  </button>
</template>
