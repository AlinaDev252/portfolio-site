export const site = {
  name: 'Alina Goiea',
  role: 'Front-end Developer for E-commerce | JavaScript, Twig, Shopify Liquid',
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
  },
  facts: [
    {
      label: 'Now',
      title: 'Front-end developer',
      text: 'At Marbill since 2022',
    },
    {
      label: 'Shipped',
      title: '10+ store themes',
      text: 'Plus 100+ landing pages',
    },
    {
      label: 'Works in',
      title: 'Twig & JavaScript',
      text: 'Shopify Liquid on the side',
    },
    {
      label: 'Open to',
      title: 'Remote roles',
      text: 'Based in Málaga, Spain (CET)',
    },
  ],
};

export const url = (path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};
