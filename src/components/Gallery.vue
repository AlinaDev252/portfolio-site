<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface Shot {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

interface Slide {
  desktop: Shot;
  mobile?: Shot;
  alt: string;
  caption?: string;
}

const props = defineProps<{ slides: Slide[]; label: string }>();

const view = ref<'desktop' | 'mobile'>('desktop');
const active = ref(0);
const track = ref<HTMLElement | null>(null);
const hasMobile = computed(() => props.slides.some((s) => s.mobile));
const total = computed(() => props.slides.length);
let frame = 0;

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const items = () => Array.from(track.value?.children ?? []) as HTMLElement[];

const onScroll = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const el = track.value;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    items().forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft + item.clientWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    active.value = best;
  });
};

const goTo = (index: number) => {
  const el = track.value;
  const item = items()[index];
  if (!el || !item) return;
  el.scrollTo({
    left: item.offsetLeft - (el.clientWidth - item.clientWidth) / 2,
    behavior: reduceMotion() ? 'auto' : 'smooth',
  });
  active.value = index;
};

const step = (dir: number) => goTo(Math.min(total.value - 1, Math.max(0, active.value + dir)));

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    step(1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    step(-1);
  }
};

const shotFor = (slide: Slide) => (view.value === 'mobile' && slide.mobile ? slide.mobile : slide.desktop);

onMounted(() => track.value?.addEventListener('scroll', onScroll, { passive: true }));
onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(frame);
});
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div
        v-if="hasMobile"
        class="inline-flex rounded-full border border-hairline p-1 text-sm font-medium dark:border-night-hairline"
        role="group"
        aria-label="Screenshot size"
      >
        <button
          v-for="option in (['desktop', 'mobile'] as const)"
          :key="option"
          type="button"
          class="rounded-full px-4 py-1.5 capitalize transition-colors aria-pressed:bg-accent aria-pressed:text-white dark:aria-pressed:bg-accent-bright dark:aria-pressed:text-ink"
          :aria-pressed="view === option"
          @click="view = option"
        >
          {{ option }}
        </button>
      </div>
      <div class="hidden items-center gap-2 md:flex">
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-full border border-hairline text-heading transition-colors hover:border-line disabled:opacity-40 dark:border-night-hairline dark:text-night-heading dark:hover:border-night-line"
          :disabled="active === 0"
          aria-label="Previous screenshot"
          @click="step(-1)"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-full border border-hairline text-heading transition-colors hover:border-line disabled:opacity-40 dark:border-night-hairline dark:text-night-heading dark:hover:border-night-line"
          :disabled="active === total - 1"
          aria-label="Next screenshot"
          @click="step(1)"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </div>

    <ul
      ref="track"
      class="relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:scroll-px-0 [scrollbar-width:none] sm:mx-0 sm:px-0 md:gap-6 [&::-webkit-scrollbar]:hidden"
      tabindex="0"
      :aria-label="`${label} screenshots`"
      @keydown="onKey"
    >
      <li
        v-for="(slide, i) in slides"
        :key="i"
        class="w-[88%] shrink-0 snap-center md:w-full"
        :aria-label="`${i + 1} of ${total}`"
        role="group"
      >
        <figure>
          <div
            class="flex items-center justify-center overflow-hidden rounded-xl border border-hairline bg-tint dark:border-night-hairline dark:bg-night-surface"
            :class="view === 'mobile' && slide.mobile ? 'aspect-[4/5] p-5 sm:aspect-[16/10] sm:p-8' : 'aspect-[16/10]'"
          >
            <img
              :src="shotFor(slide).src"
              :srcset="shotFor(slide).srcset"
              :sizes="view === 'mobile' && slide.mobile ? '(min-width: 768px) 320px, 45vw' : '(min-width: 1024px) 940px, 90vw'"
              :width="shotFor(slide).width"
              :height="shotFor(slide).height"
              :alt="view === 'mobile' && slide.mobile ? `${slide.alt}, mobile` : slide.alt"
              :loading="i === 0 ? 'eager' : 'lazy'"
              decoding="async"
              :class="view === 'mobile' && slide.mobile ? 'h-full w-auto rounded-lg shadow-sm' : 'h-full w-full object-cover object-top'"
            />
          </div>
          <figcaption v-if="slide.caption" class="mt-3 text-sm text-muted dark:text-night-muted">{{ slide.caption }}</figcaption>
        </figure>
      </li>
    </ul>

    <div v-if="total > 1" class="mt-5 flex items-center justify-between gap-4">
      <div class="flex items-center">
        <button
          v-for="(slide, i) in slides"
          :key="i"
          type="button"
          class="group inline-flex size-6 items-center justify-center"
          :aria-label="`Show screenshot ${i + 1}`"
          :aria-current="active === i ? 'true' : undefined"
          @click="goTo(i)"
        >
          <span
            class="block size-2 rounded-full transition-colors"
            :class="active === i ? 'bg-accent dark:bg-accent-bright' : 'bg-line group-hover:bg-muted dark:bg-night-line dark:group-hover:bg-night-muted'"
          ></span>
        </button>
      </div>
      <p class="text-sm tabular-nums text-muted dark:text-night-muted" aria-live="polite">{{ active + 1 }} / {{ total }}</p>
    </div>
  </div>
</template>
