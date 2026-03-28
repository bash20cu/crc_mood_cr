import type { Trend } from "@lib/exchange-rate";

export type MoodContent = {
  badge: string;
  headline: string;
  body: string;
  mascotLabel: string;
};

const moodMap: Record<Trend, MoodContent> = {
  up: {
    badge: "Modo Pichudo",
    headline: "El dolar amanecio jugando de vivo.",
    body: "Subio con demasiada actitud. El colon anda haciendo numeros y sudando bonito.",
    mascotLabel: "Mascota dolar toda dramatica",
  },
  down: {
    badge: "Modo Tuanis",
    headline: "El colon ya puede aflojar la quijada.",
    body: "Bajo el dolar y se siente como viernes. Saquen la birrita imaginaria y el Excel.",
    mascotLabel: "Mascota colon bien relajada",
  },
  stable: {
    badge: "Modo Meh",
    headline: "Todo esta demasiado calmado... que raro.",
    body: "No sube, no baja, solo vibra. Esta sospechosamente en paz, como compa que fijo trama algo.",
    mascotLabel: "Mascota sospechosamente tranquila",
  },
};

export function getMoodContent(trend: Trend): MoodContent {
  return moodMap[trend];
}
