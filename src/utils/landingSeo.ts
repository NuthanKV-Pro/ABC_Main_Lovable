export type LandingSeoSettings = {
  title: string;
  description: string;
  ogImage: string;
};

export const LANDING_SEO_STORAGE_KEY = "landing_seo_settings_v1";

export const defaultLandingSeo: LandingSeoSettings = {
  title: "ABC - AI Legal & Tax Co-pilot | AnyBody Can Consult",
  description:
    "AI-powered legal and tax consultation platform for India. Instant, reliable, and affordable consultation 24x7. Expert guidance on income tax, GST, legal documents and more.",
  ogImage: "/og-image.png",
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  const head = document.head;
  let el = head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  const head = document.head;
  let el = head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

export function applyLandingSeo(settings: LandingSeoSettings) {
  document.title = settings.title;

  upsertMeta('meta[name="description"]', {
    name: "description",
    content: settings.description,
  });

  upsertMeta('meta[property="og:type"]', {
    property: "og:type",
    content: "website",
  });
  upsertMeta('meta[property="og:title"]', {
    property: "og:title",
    content: settings.title,
  });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: settings.description,
  });
  upsertMeta('meta[property="og:image"]', {
    property: "og:image",
    content: settings.ogImage,
  });

  upsertMeta('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });
  upsertMeta('meta[name="twitter:title"]', {
    name: "twitter:title",
    content: settings.title,
  });
  upsertMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: settings.description,
  });
  upsertMeta('meta[name="twitter:image"]', {
    name: "twitter:image",
    content: settings.ogImage,
  });

  // Canonical URL (best-effort: current location)
  upsertLink('link[rel="canonical"]', {
    rel: "canonical",
    href: window.location.origin + "/",
  });
}

export function loadLandingSeo(): LandingSeoSettings {
  try {
    const raw = localStorage.getItem(LANDING_SEO_STORAGE_KEY);
    if (!raw) return defaultLandingSeo;
    const parsed = JSON.parse(raw) as Partial<LandingSeoSettings>;
    return {
      title: parsed.title || defaultLandingSeo.title,
      description: parsed.description || defaultLandingSeo.description,
      ogImage: parsed.ogImage || defaultLandingSeo.ogImage,
    };
  } catch {
    return defaultLandingSeo;
  }
}

export function saveLandingSeo(next: LandingSeoSettings) {
  localStorage.setItem(LANDING_SEO_STORAGE_KEY, JSON.stringify(next));
}
