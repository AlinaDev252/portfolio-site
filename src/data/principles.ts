import type { ImageMetadata } from 'astro';
import checkoutForm from '../assets/work/principles/checkout-form.png';
import offersAndTotal from '../assets/work/principles/offers-and-total.png';
import swipeGallery from '../assets/work/principles/swipe-gallery.png';

export interface Principle {
  title: string;
  body: string;
  result: string;
  visual: 'screenshot' | 'diagram';
  image?: ImageMetadata;
  imageAlt?: string;
}

export const principles: Principle[] = [
  {
    title: 'Let people finish typing',
    body: "The checkout form used to flag every field as wrong the moment you left one, sometimes before you'd typed anything. Now each field is checked on its own, only once you've finished with it.",
    result: 'Shipped in 10 campaigns.',
    visual: 'screenshot',
    image: checkoutForm,
    imageAlt: 'Checkout form before and after: before, every empty field shows a red warning after leaving one field; after, only the filled email field is marked valid.',
  },
  {
    title: 'The price you see is the price you pay',
    body: "Add-on offers were converted from the wrong currency, so the total on the page didn't match the card charge. I fixed the maths, and built a \"before you pay\" step that shows only the offers you haven't picked yet.",
    result: 'Totals match the charge in every currency. Offers show once, then get out of the way.',
    visual: 'screenshot',
    image: offersAndTotal,
    imageAlt: 'A before-you-pay window listing only the two offers not yet picked, next to an order summary whose total matches the pay button.',
  },
  {
    title: "Show it, don't explain it",
    body: 'On phones, gallery arrows covered the product photo. I swapped them for a swipe gallery that shows the edge of the next photo, so people swipe without being told. The product page got a sticky add-to-cart bar, so the main action stays in reach.',
    result: 'Swipe, snap and photo counter built for phones.',
    visual: 'screenshot',
    image: swipeGallery,
    imageAlt: 'Phone product gallery on photo 1 of 4 with the next photo peeking in, then after a swipe on photo 2 of 4 with the dots updated.',
  },
  {
    title: 'Fix it once, for every site',
    body: 'Email layouts had been copied from each other so often that editing one could quietly break another. I replaced the copied image code with one shared snippet, and set up membership plans so each site shows the right offer from a single setting.',
    result: 'About 183 email layouts covered by one fix.',
    visual: 'diagram',
  },
];
