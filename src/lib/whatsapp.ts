/**
 * Central WhatsApp conversion helper.
 * Every CTA on the site routes through here so the number + tracking
 * live in exactly one place.
 *
 * wa.me requires the number in international format with NO "+" and no spaces.
 */
export const WHATSAPP_NUMBER = '447411202861'
export const WHATSAPP_DISPLAY = '+44 7411 202861'

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/** Pre-written, intent-rich messages for each funnel entry point. */
export const WA = {
  freeTrial: waLink('Hi HellIPTV 👋 I want my FREE 12-hour 4K trial. Please activate it now.'),
  worldCup: waLink('Hi HellIPTV 👋 I want my free 12h World Cup trial in 4K. Send me the link!'),
  plan: (planName: string, price: string) =>
    waLink(`Hi HellIPTV 👋 I want the ${planName} plan (${price}). How do I activate it?`),
  pricingGeneral: waLink('Hi HellIPTV 👋 I want to subscribe. Which plan fits me best?'),
  support: waLink('Hi HellIPTV 👋 I have a question before I subscribe.'),
  speedTest: (mbps: number) =>
    waLink(
      `Hi HellIPTV 👋 My speed test shows ${mbps} Mbps — confirmed 4K-ready. Activate my free trial please!`,
    ),
} as const
