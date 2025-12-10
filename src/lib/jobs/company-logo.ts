/**
 * Company Logo Utilities
 * Fetches company logos using free APIs when not provided by job sources
 */

// Cache for logo URLs to avoid repeated lookups
const logoCache = new Map<string, string | null>();

/**
 * Get a company logo URL using Clearbit's free Logo API
 * Falls back to other methods if needed
 */
export function getCompanyLogoUrl(companyName: string, existingLogo?: string | null): string | null {
  // If we already have a valid logo, use it
  if (existingLogo && isValidLogoUrl(existingLogo)) {
    return existingLogo;
  }

  // Check cache
  const cacheKey = companyName.toLowerCase().trim();
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) || null;
  }

  // Generate Clearbit logo URL from company name
  const domain = guessDomainFromCompany(companyName);
  if (domain) {
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    logoCache.set(cacheKey, logoUrl);
    return logoUrl;
  }

  logoCache.set(cacheKey, null);
  return null;
}

/**
 * Check if a logo URL looks valid
 */
function isValidLogoUrl(url: string): boolean {
  if (!url) return false;
  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Guess a company's domain from their name
 * This works well for most companies
 */
function guessDomainFromCompany(companyName: string): string | null {
  if (!companyName) return null;

  // Known company domain mappings
  const knownDomains: Record<string, string> = {
    "google": "google.com",
    "meta": "meta.com",
    "facebook": "facebook.com",
    "amazon": "amazon.com",
    "apple": "apple.com",
    "microsoft": "microsoft.com",
    "netflix": "netflix.com",
    "spotify": "spotify.com",
    "twitter": "twitter.com",
    "x": "x.com",
    "linkedin": "linkedin.com",
    "salesforce": "salesforce.com",
    "oracle": "oracle.com",
    "ibm": "ibm.com",
    "intel": "intel.com",
    "nvidia": "nvidia.com",
    "adobe": "adobe.com",
    "vmware": "vmware.com",
    "cisco": "cisco.com",
    "uber": "uber.com",
    "lyft": "lyft.com",
    "airbnb": "airbnb.com",
    "stripe": "stripe.com",
    "square": "squareup.com",
    "paypal": "paypal.com",
    "shopify": "shopify.com",
    "slack": "slack.com",
    "zoom": "zoom.us",
    "dropbox": "dropbox.com",
    "atlassian": "atlassian.com",
    "github": "github.com",
    "gitlab": "gitlab.com",
    "twilio": "twilio.com",
    "datadog": "datadoghq.com",
    "snowflake": "snowflake.com",
    "mongodb": "mongodb.com",
    "elastic": "elastic.co",
    "splunk": "splunk.com",
    "confluent": "confluent.io",
    "hashicorp": "hashicorp.com",
    "cloudflare": "cloudflare.com",
    "fastly": "fastly.com",
    "okta": "okta.com",
    "crowdstrike": "crowdstrike.com",
    "palo alto": "paloaltonetworks.com",
    "fortinet": "fortinet.com",
    "zscaler": "zscaler.com",
    "workday": "workday.com",
    "servicenow": "servicenow.com",
    "docusign": "docusign.com",
    "hubspot": "hubspot.com",
    "zendesk": "zendesk.com",
    "intercom": "intercom.com",
    "notion": "notion.so",
    "figma": "figma.com",
    "canva": "canva.com",
    "asana": "asana.com",
    "monday": "monday.com",
    "trello": "trello.com",
    "jira": "atlassian.com",
    "wells fargo": "wellsfargo.com",
    "bank of america": "bankofamerica.com",
    "jpmorgan": "jpmorgan.com",
    "chase": "chase.com",
    "citibank": "citi.com",
    "goldman sachs": "goldmansachs.com",
    "morgan stanley": "morganstanley.com",
    "capital one": "capitalone.com",
    "american express": "americanexpress.com",
    "visa": "visa.com",
    "mastercard": "mastercard.com",
    "godaddy": "godaddy.com",
    "stryker": "stryker.com",
    "catawiki": "catawiki.com",
    "horace mann": "horacemann.com",
    "branch": "branch.io",
    "postscript": "postscript.io",
  };

  const nameLower = companyName.toLowerCase().trim();

  // Check known mappings first
  for (const [key, domain] of Object.entries(knownDomains)) {
    if (nameLower.includes(key)) {
      return domain;
    }
  }

  // Try to construct domain from company name
  // Remove common suffixes and clean up
  const cleaned = nameLower
    .replace(/\s*(inc\.?|llc\.?|ltd\.?|corp\.?|corporation|company|co\.?|group|holdings|technologies|technology|tech|software|solutions|services|consulting|partners|labs|studio|digital|media|systems|networks|enterprises|international|global)\s*/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  if (cleaned.length >= 2) {
    return `${cleaned}.com`;
  }

  return null;
}

/**
 * Enhance a job with a logo URL if missing
 */
export function enhanceJobWithLogo<T extends { employer_name: string; employer_logo?: string | null }>(job: T): T {
  if (!job.employer_logo || !isValidLogoUrl(job.employer_logo)) {
    const logoUrl = getCompanyLogoUrl(job.employer_name, job.employer_logo);
    return {
      ...job,
      employer_logo: logoUrl,
    };
  }
  return job;
}

/**
 * Enhance multiple jobs with logos
 */
export function enhanceJobsWithLogos<T extends { employer_name: string; employer_logo?: string | null }>(jobs: T[]): T[] {
  return jobs.map(enhanceJobWithLogo);
}
