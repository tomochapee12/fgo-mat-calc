type EventParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    zaraz?: { track: (name: string, parameters?: EventParameters) => void };
    gtag?: (command: 'event', name: string, parameters?: EventParameters) => void;
  }
}

export function trackEvent(name: string, parameters: EventParameters = {}) {
  if (typeof window === 'undefined') return;
  window.zaraz?.track(name, parameters);
  window.gtag?.('event', name, parameters);
}
