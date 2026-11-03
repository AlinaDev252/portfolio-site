import heroImage from '../assets/hero.png';

export const site = {
  name: 'Alina Goiea',
  role: 'Front-End Developer | JavaScript & eCommerce Platforms',
  description:
    'Front-end developer building storefront themes, landing pages and checkout flows for e-commerce. Open to remote Shopify and front-end roles.',
  email: 'costachealina25@gmail.com',
  linkedin: 'https://www.linkedin.com/in/alina-goiea-26350b53',
  github: 'https://github.com/AlinaDev252',
  cv: 'Alina_Goiea_Frontend_Developer.pdf',
  ogImage: 'og-image.png',
  hero: {
    headline: 'I build online stores, from the homepage to the checkout.',
    intro:
      'Six years of front-end, four of them on a live e-commerce platform: storefront themes, campaign pages and checkouts that real shoppers use every day.',
    image: heroImage,
    alt: '',
    caption: 'Placeholder caption, replace with a line about the photo',
  },
  facts: [
    {
      label: 'Now',
      title: 'Front-end developer',
      text: 'At Marbill since 2022',
    },
    {
      label: 'Shipped',
      title: '20+ store themes',
      text: 'Plus 20 company sites',
    },
    {
      label: 'Works in',
      title: 'Twig & JavaScript',
      text: 'Tailwind, Bootstrap, Vue 3',
    },
    {
      label: 'Open to',
      title: 'Remote roles',
      text: 'Front-end in e-commerce',
    },
  ],
};

export const url = (path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};
