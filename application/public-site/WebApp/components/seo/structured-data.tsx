/**
 * SEO structured data components for the public storefront.
 *
 * Adapted from GOS-Dev but made tenant-aware — all org name references
 * come from TenantSettings rather than hardcoded values.
 */

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

/**
 * Renders JSON-LD BreadcrumbList structured data.
 */
export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {})
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

interface OrganizationStructuredDataProps {
  name: string;
  description?: string;
  url?: string;
  socialLinks?: string[];
}

/**
 * Renders JSON-LD Organization structured data.
 * All values derived from tenant settings at the page level.
 */
export function OrganizationStructuredData({ name, description, url, socialLinks }: OrganizationStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(socialLinks && socialLinks.length > 0 ? { sameAs: socialLinks } : {})
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqStructuredDataProps {
  faqs: FaqItem[];
}

/**
 * Renders JSON-LD FAQPage structured data.
 */
export function FAQStructuredData({ faqs }: FaqStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

interface LocalBusinessStructuredDataProps {
  name: string;
  address: {
    street: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
  };
  phone?: string;
  openingHours?: string[];
  coordinates?: { lat: number; lng: number };
}

/**
 * Renders JSON-LD LocalBusiness structured data for branch locations.
 */
export function LocalBusinessStructuredData({
  name,
  address,
  phone,
  openingHours,
  coordinates
}: LocalBusinessStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      ...(address.region ? { addressRegion: address.region } : {}),
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.country
    },
    ...(phone ? { telephone: phone } : {}),
    ...(openingHours ? { openingHours } : {}),
    ...(coordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: coordinates.lat,
            longitude: coordinates.lng
          }
        }
      : {})
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
