import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import EventSyncApp from "../EventSyncApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EventSync — Curated Live Experiences & Digital Passes" },
      {
        name: "description",
        content:
          "Discover and book concerts, summits, sports, theatre, and festivals across India with instant digital passes.",
      },
      { property: "og:title", content: "EventSync — Curated Live Experiences" },
      {
        property: "og:description",
        content:
          "Book unforgettable live events across India with transparent INR pricing and instant digital passes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <EventSyncApp />
    </ClientOnly>
  );
}
