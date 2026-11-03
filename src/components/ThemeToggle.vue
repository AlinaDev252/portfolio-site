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
    class="group relative inline-flex size-10 justify-center md:size-11 rounded-md text-heading dark:text-night-heading"
    :aria-label="dark ? 'Switch to day mode' : 'Switch to night mode'"
    @click="toggle"
  >
    <span aria-hidden="true" class="absolute top-0.5 left-1/2 z-10 size-[5px] -translate-x-1/2 rounded-full bg-line dark:bg-night-line"></span>
    <span aria-hidden="true" class="theme-icon flex origin-[50%_4px] flex-col items-center pt-[4px] group-hover:animate-swing motion-reduce:animate-none">
      <svg class="h-[8px] w-7 text-line dark:text-night-line" viewBox="0 0 28 8" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 0.5 4 8M14 0.5 24 8"/></svg>
      <span class="theme-icon grid perspective-[200px] transform-3d">
        <span class="theme-icon col-start-1 row-start-1 grid transition-transform duration-500 ease-(--ease-soft) transform-3d dark:rotate-y-180">
          <span class="col-start-1 row-start-1 grid h-6 w-7 place-items-center rounded-[4px] border-2 border-line bg-paper backface-hidden transition-colors group-hover:border-accent dark:border-night-line dark:bg-ink">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          </span>
          <span class="col-start-1 row-start-1 grid h-6 w-7 rotate-y-180 place-items-center rounded-[4px] border-2 border-line bg-paper backface-hidden transition-colors dark:border-night-line dark:bg-ink dark:group-hover:border-accent-bright">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          </span>
        </span>
      </span>
    </span>
  </button>
</template>
