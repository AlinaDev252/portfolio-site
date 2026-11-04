<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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
  phoneAlt?: string;
  caption?: string;
  full?: string;
  phone?: Shot;
  phoneFull?: string;
}

const props = defineProps<{ slides: Slide[]; label: string; eager?: boolean }>();

const view = ref<'desktop' | 'mobile'>('desktop');
const active = ref(0);
const track = ref<HTMLElement | null>(null);
const zoom = ref<HTMLDialogElement | null>(null);
const zoomTrack = ref<HTMLElement | null>(null);
const zoomOpen = ref(false);
const zoomActive = ref(0);
let zoomFrame = 0;
const hasMobile = computed(() => props.slides.some((s) => s.mobile));
const total = computed(() => props.slides.length);
const named = computed(() => total.value > 1 && props.slides.every((s) => s.caption));
const tabs = ref<HTMLElement | null>(null);
const zoomTabs = ref<HTMLElement | null>(null);
const zoomClose = ref<HTMLButtonElement | null>(null);
const isPhone = ref(false);
const tabsFade = ref('none');
let phoneQuery: MediaQueryList | undefined;
let tabsObserver: ResizeObserver | undefined;

const syncPhone = () => {
  isPhone.value = phoneQuery?.matches ?? false;
};

const updateTabsFade = () => {
  const row = tabs.value;
  if (!row) return;
  const left = row.scrollLeft > 1;
  const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
  tabsFade.value = left || right
    ? `linear-gradient(to right, ${left ? 'transparent, #000 2.5rem' : '#000'}, ${right ? '#000 calc(100% - 2.5rem), transparent' : '#000'})`
    : 'none';
};

const revealTab = (row: HTMLElement | null, index: number) => {
  const tab = row?.children[index] as HTMLElement | undefined;
  if (!row || !tab) return;
  row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.clientWidth) / 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
};

watch(active, (i) => revealTab(tabs.value, i));
watch(zoomActive, (i) => revealTab(zoomTabs.value, i));
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

const step = (dir: number) => {
  const next = Math.min(total.value - 1, Math.max(0, active.value + dir));
  if (next !== active.value) goTo(next);
};

const focusSlide = (index: number) => items()[index]?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });

const onKey = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  event.preventDefault();
  const fromSlide = (event.target as HTMLElement).closest('li') !== null;
  step(event.key === 'ArrowRight' ? 1 : -1);
  if (fromSlide) nextTick(() => focusSlide(active.value));
};

const zoomItems = () => Array.from(zoomTrack.value?.children ?? []) as HTMLElement[];

const zoomTo = (index: number, smooth = true) => {
  const el = zoomTrack.value;
  const item = zoomItems()[index];
  if (!el || !item) return;
  el.scrollTo({ left: item.offsetLeft, behavior: smooth && !reduceMotion() ? 'smooth' : 'auto' });
  zoomActive.value = index;
};

const zoomStep = (dir: number) => {
  const next = Math.min(total.value - 1, Math.max(0, zoomActive.value + dir));
  if (next !== zoomActive.value) zoomTo(next);
};

const onZoomScroll = () => {
  cancelAnimationFrame(zoomFrame);
  zoomFrame = requestAnimationFrame(() => {
    const el = zoomTrack.value;
    if (el) zoomActive.value = Math.round(el.scrollLeft / el.clientWidth);
  });
};

const openZoom = async (index: number) => {
  zoomOpen.value = true;
  zoom.value?.showModal();
  await nextTick();
  zoomTo(index, false);
  zoomClose.value?.focus();
};

const closeZoom = () => zoom.value?.close();

const onZoomClose = async () => {
  zoomOpen.value = false;
  const index = zoomActive.value;
  goTo(index);
  await nextTick();
  focusSlide(index);
};

const onZoomKey = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    zoomStep(1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    zoomStep(-1);
  }
};

const onZoomBackdrop = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target === zoom.value || target.dataset.zoomSlide !== undefined) closeZoom();
};

const shotFor = (slide: Slide) => (view.value === 'mobile' && slide.mobile ? slide.mobile : slide.desktop);

const altFor = (slide: Slide) => {
  if (view.value === 'mobile' && slide.mobile) return `${slide.alt}, mobile`;
  return isPhone.value && slide.phone ? (slide.phoneAlt ?? slide.alt) : slide.alt;
};

const zoomAltFor = (slide: Slide) => (isPhone.value && slide.phoneFull ? (slide.phoneAlt ?? slide.alt) : slide.alt);

onMounted(() => {
  track.value?.addEventListener('scroll', onScroll, { passive: true });
  phoneQuery = matchMedia('(max-width: 639px)');
  syncPhone();
  phoneQuery.addEventListener('change', syncPhone);
  if (tabs.value) {
    tabsObserver = new ResizeObserver(updateTabsFade);
    tabsObserver.observe(tabs.value);
  }
});
onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', onScroll);
  phoneQuery?.removeEventListener('change', syncPhone);
  tabsObserver?.disconnect();
  cancelAnimationFrame(frame);
  cancelAnimationFrame(zoomFrame);
});
</script>

<template>
  <div>
    <div class="mb-5 items-center justify-between gap-3" :class="named ? 'hidden sm:flex' : 'flex flex-wrap'">
      <div
        v-if="named"
        ref="tabs"
        class="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        :style="{ maskImage: tabsFade }"
        role="group"
        :aria-label="`${label} pages`"
        @scroll.passive="updateTabsFade"
      >
        <button
          v-for="(slide, i) in slides"
          :key="i"
          type="button"
          class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
          :class="active === i ? 'border-accent bg-accent text-white dark:border-accent-bright dark:bg-accent-bright dark:text-ink' : 'border-hairline text-muted hover:border-line hover:text-heading dark:border-night-hairline dark:text-night-muted dark:hover:border-night-line dark:hover:text-night-heading'"
          :aria-current="active === i ? 'true' : undefined"
          @click="goTo(i)"
        >
          {{ slide.caption }}
        </button>
      </div>
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
      <div class="hidden shrink-0 items-center gap-2 md:flex">
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-full border border-hairline text-heading transition-colors hover:border-line aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-hairline dark:border-night-hairline dark:text-night-heading dark:hover:border-night-line dark:aria-disabled:hover:border-night-hairline"
          :aria-disabled="active === 0"
          aria-label="Previous screenshot"
          @click="step(-1)"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-full border border-hairline text-heading transition-colors hover:border-line aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-hairline dark:border-night-hairline dark:text-night-heading dark:hover:border-night-line dark:aria-disabled:hover:border-night-hairline"
          :aria-disabled="active === total - 1"
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
            :class="view === 'mobile' && slide.mobile ? 'aspect-[4/5] p-5 sm:aspect-[16/10] sm:p-8' : slide.phone ? 'aspect-[4/5] sm:aspect-[16/10]' : 'aspect-[16/10]'"
          >
            <component
              :is="slide.full ? 'button' : 'div'"
              :type="slide.full ? 'button' : undefined"
              :aria-label="slide.full ? `Enlarge: ${altFor(slide)}` : undefined"
              :tabindex="slide.full ? (active === i ? 0 : -1) : undefined"
              class="group relative h-full w-full"
              :class="slide.full && 'cursor-zoom-in focus-visible:-outline-offset-4'"
              @click="slide.full && openZoom(i)"
            >
            <picture class="contents">
            <source
              v-if="slide.phone && view !== 'mobile'"
              media="(max-width: 639px)"
              :srcset="slide.phone.srcset"
              sizes="88vw"
              :width="slide.phone.width"
              :height="slide.phone.height"
            />
            <img
              :src="shotFor(slide).src"
              :srcset="shotFor(slide).srcset"
              :sizes="view === 'mobile' && slide.mobile ? '(min-width: 768px) 320px, 45vw' : '(min-width: 1024px) 940px, 90vw'"
              :width="shotFor(slide).width"
              :height="shotFor(slide).height"
              :alt="altFor(slide)"
              :loading="eager && i === 0 ? 'eager' : 'lazy'"
              :fetchpriority="eager && i === 0 ? 'high' : undefined"
              decoding="async"
              :class="view === 'mobile' && slide.mobile ? 'h-full w-auto rounded-lg shadow-sm' : 'h-full w-full object-cover object-top'"
            />
            </picture>
              <span v-if="slide.full" aria-hidden="true" class="absolute right-3 bottom-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"><span class="[@media(hover:none)]:hidden">Click</span><span class="hidden [@media(hover:none)]:inline">Tap</span> to enlarge</span>
            </component>
          </div>
          <figcaption v-if="slide.caption" :class="named && 'sr-only'" class="mt-3 text-sm text-muted dark:text-night-muted">{{ slide.caption }}</figcaption>
        </figure>
      </li>
    </ul>

    <div v-if="total > 1" class="flex items-center justify-between gap-x-4" :class="named ? 'mt-3 sm:hidden' : 'mt-5'">
      <div class="flex shrink-0 items-center">
        <button
          v-for="(slide, i) in slides"
          :key="i"
          type="button"
          class="group inline-flex size-6 items-center justify-center"
          :aria-label="named ? `Show ${slide.caption}` : `Show screenshot ${i + 1}`"
          :aria-current="active === i ? 'true' : undefined"
          @click="goTo(i)"
        >
          <span
            class="block size-2 rounded-full transition-colors"
            :class="active === i ? 'bg-accent dark:bg-accent-bright' : 'bg-line group-hover:bg-muted dark:bg-night-line dark:group-hover:bg-night-muted'"
          ></span>
        </button>
      </div>
      <p class="min-w-0 truncate text-sm tabular-nums text-muted dark:text-night-muted" aria-live="polite">
        <template v-if="named"><span class="font-medium text-heading dark:text-night-heading">{{ slides[active].caption }}</span> · </template>{{ active + 1 }} / {{ total }}
      </p>
    </div>

    <dialog
      ref="zoom"
      :aria-label="`${label} screenshots, enlarged`"
      class="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-white backdrop:bg-ink/90 backdrop:backdrop-blur-sm [&_:focus-visible]:outline-white"
      @click="onZoomBackdrop"
      @close="onZoomClose"
      @keydown="onZoomKey"
    >
      <div v-if="zoomOpen" class="flex h-full flex-col">
        <div class="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6">
          <p class="truncate text-sm text-white/80" aria-live="polite">
            <template v-if="named">{{ label }}<span class="sr-only"> · {{ slides[zoomActive].caption }}</span></template>
            <template v-else>{{ zoomActive + 1 }} / {{ total }}<span v-if="slides[zoomActive]?.caption"> · {{ slides[zoomActive].caption }}</span></template>
          </p>
          <button ref="zoomClose" type="button" class="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20" aria-label="Close" @click="closeZoom">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="relative min-h-0 flex-1">
          <ul
            ref="zoomTrack"
            class="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabindex="-1"
            @scroll.passive="onZoomScroll"
          >
            <li
              v-for="(slide, i) in slides"
              :key="i"
              data-zoom-slide
              class="flex h-full w-full shrink-0 snap-center items-center justify-center p-4 sm:px-20 sm:py-6"
              role="group"
              :aria-label="`${i + 1} of ${total}`"
            >
              <picture v-if="slide.full && Math.abs(i - zoomActive) <= 1" class="contents">
                <source v-if="slide.phoneFull" media="(max-width: 639px)" :srcset="slide.phoneFull" />
                <img :src="slide.full" :alt="zoomAltFor(slide)" decoding="async" class="max-h-full max-w-full rounded-lg object-contain" />
              </picture>
            </li>
          </ul>
          <button
            type="button"
            class="absolute top-1/2 left-4 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-white/10 sm:inline-flex"
            :aria-disabled="zoomActive === 0"
            aria-label="Previous screenshot"
            @click="zoomStep(-1)"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            class="absolute top-1/2 right-4 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-white/10 sm:inline-flex"
            :aria-disabled="zoomActive === total - 1"
            aria-label="Next screenshot"
            @click="zoomStep(1)"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
        <p v-if="named" class="px-4 pb-1 text-center text-sm text-white/70 tabular-nums sm:hidden">
          <span class="font-medium text-white">{{ slides[zoomActive].caption }}</span> · {{ zoomActive + 1 }} / {{ total }}
        </p>
        <div v-if="named" ref="zoomTabs" class="hidden justify-center gap-2 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden">
          <button
            v-for="(slide, i) in slides"
            :key="i"
            type="button"
            class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
            :class="zoomActive === i ? 'bg-white text-ink' : 'bg-white/10 text-white/80 hover:bg-white/20'"
            :aria-current="zoomActive === i ? 'true' : undefined"
            @click="zoomTo(i)"
          >
            {{ slide.caption }}
          </button>
        </div>
        <div class="flex justify-center pb-5 sm:pb-6" :class="named && 'sm:hidden'">
          <button
            v-for="(slide, i) in slides"
            :key="i"
            type="button"
            class="inline-flex size-7 items-center justify-center"
            :aria-label="named ? `Show ${slide.caption}` : `Show screenshot ${i + 1}`"
            :aria-current="zoomActive === i ? 'true' : undefined"
            @click="zoomTo(i)"
          >
            <span class="block size-2 rounded-full transition-colors" :class="zoomActive === i ? 'bg-white' : 'bg-white/35'"></span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>
