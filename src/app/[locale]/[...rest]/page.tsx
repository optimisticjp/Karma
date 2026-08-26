import { notFound } from "next/navigation";

/** Catch-all: unknown localized paths render the branded 404 below. */
export default function CatchAllPage() {
  notFound();
}
