import { SEO_CONFIG } from './seoConstants';

// Turn a relative path or an image object into a full https URL
const toAbsoluteUrl = (value) => {
  const url = typeof value === 'string' ? value : value?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${SEO_CONFIG.site.url}${url}`;
};

// Organization Schema
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_CONFIG.site.name,
  url: SEO_CONFIG.site.url,
  logo: SEO_CONFIG.site.logo,
  description: SEO_CONFIG.site.description,
  foundingDate: SEO_CONFIG.site.foundingDate,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.site.address.streetAddress,
    addressLocality: SEO_CONFIG.site.address.addressLocality,
    addressRegion: SEO_CONFIG.site.address.addressRegion,
    postalCode: SEO_CONFIG.site.address.postalCode,
    addressCountry: SEO_CONFIG.site.address.addressCountry
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: SEO_CONFIG.site.contactPoint.contactType,
    telephone: SEO_CONFIG.site.contactPoint.telephone,
    email: SEO_CONFIG.site.contactPoint.email
  },
  sameAs: SEO_CONFIG.site.sameAs
});

// LocalBusiness Schema
// (the hardcoded 4.8 / 156 rating was removed: it was not backed by real reviews)
export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SEO_CONFIG.site.name,
  image: SEO_CONFIG.site.logo,
  description: SEO_CONFIG.site.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.site.address.streetAddress,
    addressLocality: SEO_CONFIG.site.address.addressLocality,
    addressRegion: SEO_CONFIG.site.address.addressRegion,
    postalCode: SEO_CONFIG.site.address.postalCode,
    addressCountry: SEO_CONFIG.site.address.addressCountry
  },
  telephone: SEO_CONFIG.site.contactPoint.telephone,
  url: SEO_CONFIG.site.url,
  priceRange: '₹₹'
});

// Product Schema
export const getProductSchema = (product) => {
  if (!product) return null;

  // Images: accept plain strings or { url, alt } objects, output full URLs
  const images = (product.images && product.images.length > 0
    ? product.images
    : [product.image || product.thumbnail]
  )
    .map(toAbsoluteUrl)
    .filter(Boolean);

  // Price: the price the customer actually pays
  const price = product.salePrice || product.price;

  // Stock: use inStock if the API sends it, otherwise the stock number
  const inStock =
    product.inStock !== undefined && product.inStock !== null
      ? Boolean(product.inStock)
      : product.stock === undefined || product.stock === null
        ? true
        : Number(product.stock) > 0;

  // Rating: only when there is at least one review and a valid 1-5 value
  const ratingValue = Number(product.rating);
  const reviewCount = Number(product.reviewCount);
  const hasRating = reviewCount > 0 && ratingValue >= 1 && ratingValue <= 5;

  // Reviews: only ones that carry a valid 1-5 rating
  const reviews = (product.reviews || []).filter((review) => {
    const value = Number(review?.rating);
    return value >= 1 && value <= 5;
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: SEO_CONFIG.site.name
    },
    offers: {
      '@type': 'Offer',
      url: `${SEO_CONFIG.site.url}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: price?.toString(),
      priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SEO_CONFIG.site.name
      }
    },
    ...(hasRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue.toString(),
        reviewCount: reviewCount.toString(),
        bestRating: '5',
        worstRating: '1'
      }
    }),
    ...(reviews.length > 0 && {
      review: reviews.map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.authorName || 'Anonymous'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: Number(review.rating).toString(),
          bestRating: '5',
          worstRating: '1'
        },
        reviewBody: review.text,
        datePublished: review.date
      }))
    })
  };
};

// BreadcrumbList Schema
export const getBreadcrumbSchema = (breadcrumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SEO_CONFIG.site.url}${item.path}`
  }))
});

// Review Schema
export const getReviewSchema = (review) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  author: {
    '@type': 'Person',
    name: review.authorName || 'Anonymous'
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: review.rating.toString(),
    bestRating: '5',
    worstRating: '1'
  },
  reviewBody: review.text,
  datePublished: review.date
});

// Aggregate Rating Schema
export const getAggregateRatingSchema = (rating) => ({
  '@context': 'https://schema.org',
  '@type': 'AggregateRating',
  ratingValue: rating.value.toString(),
  ratingCount: rating.count.toString(),
  reviewCount: rating.reviewCount?.toString() || rating.count.toString(),
  bestRating: '5',
  worstRating: '1'
});
