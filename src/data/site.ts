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
    image: heroImage,
    alt: '',
  },
};

export const url = (path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};
