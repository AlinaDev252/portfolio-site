import type { ImageMetadata } from 'astro';

export interface ThemeSlide {
  image: ImageMetadata;
  phone: ImageMetadata;
  caption: string;
  alt: string;
}

export interface StoreTheme {
  title: string;
  body: string;
  stack: string;
  name: string;
  slides: ThemeSlide[];
}

const pages = [
  { key: '01-home', caption: 'Homepage' },
  { key: '02-collection', caption: 'Collection' },
  { key: '03-product', caption: 'Product page' },
  { key: '04-cart', caption: 'Cart' },
  { key: '05-checkout', caption: 'Checkout' },
  { key: '06-contact', caption: 'Contact' },
];

const shots = import.meta.glob<ImageMetadata>('../assets/work/themes/*/*.png', { eager: true, import: 'default' });

const slidesFor = (folder: string, name: string): ThemeSlide[] =>
  pages.map(({ key, caption }) => ({
    image: shots[`../assets/work/themes/${folder}/${key}.png`],
    phone: shots[`../assets/work/themes/${folder}/${key}-phone.png`],
    caption,
    alt: `${name}: ${caption.toLowerCase()} on desktop with the phone version beside it`,
  }));

export const storeThemes: StoreTheme[] = [
  {
    title: 'Built for big catalogues',
    body: '12 homepage sections, a mega menu, a product page that keeps "Add to cart" in reach on phones.',
    stack: 'Twig, Bootstrap 5, JavaScript',
    name: 'Tech store theme',
    slides: slidesFor('catalogue', 'Tech store theme'),
  },
  {
    title: 'Built to feel calm',
    body: '9 homepage sections, motion kept subtle, a product page made for swiping.',
    stack: 'Twig, Bootstrap 5, JavaScript',
    name: 'Home store theme',
    slides: slidesFor('calm', 'Home store theme'),
  },
];
