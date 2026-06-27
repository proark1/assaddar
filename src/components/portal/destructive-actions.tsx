"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Archive } from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-hairline bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-copper";

/**
 * Submit button that demands a native confirmation before letting the form's
 * server action run, and reflects the pending state. For genuinely
 * irreversible actions (e.g. removing a generated asset).
 */
export function ConfirmSubmit({
  confirmText,
  className = "",
  pendingLabel,
  children,
}: {
  confirmText: string;
  className?: string;
  pendingLabel?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
      className={className}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/**
 * Archive confirmation: the submit button stays disabled until the operator
 * types the exact keyword, so a wrong/empty entry can't trigger a full-page
 * round-trip just to surface an error banner.
 */
export function ArchiveProjectConfirm({
  keyword = "ARCHIVIEREN",
}: {
  keyword?: string;
}) {
  const [value, setValue] = useState("");
  const matches = value.trim() === keyword;

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
      <input
        name="confirmation"
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={keyword}
        aria-label={`Zum Bestätigen ${keyword} eingeben`}
        className={fieldClass}
      />
      <ArchiveButton disabled={!matches} keyword={keyword} />
    </div>
  );
}

function ArchiveButton({
  disabled,
  keyword,
}: {
  disabled: boolean;
  keyword: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      title={disabled ? `Bitte „${keyword}" exakt eingeben` : undefined}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-critical/40 px-4 py-2.5 text-sm font-medium text-critical transition-colors hover:bg-critical/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Archive className="h-4 w-4" />
      {pending ? "Wird archiviert..." : "Archivieren"}
    </button>
  );
}
