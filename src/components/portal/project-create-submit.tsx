"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";

export function ProjectCreateSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-4 py-3 text-sm font-medium text-oncopper transition-colors hover:bg-copper-hi disabled:cursor-wait disabled:opacity-70"
    >
      <Plus className="h-4 w-4" />
      {pending ? "Projekt wird erstellt..." : "Projekt erstellen"}
    </button>
  );
}
