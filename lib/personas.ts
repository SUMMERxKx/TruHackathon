export type PersonaKey =
  | "ticketbot"
  | "gary"
  | "darlene"
  | "todd"
  | "priya"
  | "kevin"
  | "committee";

export interface Persona {
  key: PersonaKey;
  name: string;
  title: string;
  emoji: string;
  color: string; // bubble/name color
}

export const PERSONAS: Record<PersonaKey, Persona> = {
  ticketbot: {
    key: "ticketbot",
    name: "TicketBot 3000",
    title: "Orchestrator-in-Chief",
    emoji: "🤖",
    color: "#60a5fa",
  },
  gary: {
    key: "gary",
    name: "Gary",
    title: "Compliance",
    emoji: "📋",
    color: "#f59e0b",
  },
  darlene: {
    key: "darlene",
    name: "Darlene",
    title: "Director, Strategic Alignment",
    emoji: "🧭",
    color: "#f472b6",
  },
  todd: {
    key: "todd",
    name: "Todd",
    title: "Sr. Manager, Synergy",
    emoji: "🚀",
    color: "#34d399",
  },
  priya: {
    key: "priya",
    name: "Priya",
    title: "VP, Escalations",
    emoji: "📱",
    color: "#c084fc",
  },
  kevin: {
    key: "kevin",
    name: "Kevin",
    title: "Intern (unpaid)",
    emoji: "🧢",
    color: "#a3e635",
  },
  committee: {
    key: "committee",
    name: "The Committee",
    title: "Collective Wisdom",
    emoji: "🏛️",
    color: "#9b9ba6",
  },
};

export function personaFor(raw: string): Persona {
  const key = raw.toLowerCase().trim() as PersonaKey;
  return PERSONAS[key] ?? PERSONAS.committee;
}
