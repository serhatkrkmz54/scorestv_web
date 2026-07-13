import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { detectPlatform, isBot } from "@/lib/platform";
import { APPSTORE_URL, PLAYSTORE_URL } from "@/lib/store-links";

// Sunucuda çalışır: gerçek iOS/Android cihazı doğrudan mağazaya yönlendirir.
// Bot ve masaüstü yönlendirilmez (landing gösterilir → indekslenebilir).
export async function redirectByDevice(): Promise<void> {
  const ua = (await headers()).get("user-agent");
  if (isBot(ua)) return;
  const platform = detectPlatform(ua);
  if (platform === "ios") redirect(APPSTORE_URL);
  if (platform === "android") redirect(PLAYSTORE_URL);
}
