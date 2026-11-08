// lib/crawler.ts
export function checkIsCrawler(headers: {
  get: (name: string) => string | null;
}): boolean {
  const SOCIAL_CRAWLERS =
    /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|applebot|pinterestbot/i;

  let userAgent = headers.get("user-agent") || "";

  return SOCIAL_CRAWLERS.test(userAgent);
}
