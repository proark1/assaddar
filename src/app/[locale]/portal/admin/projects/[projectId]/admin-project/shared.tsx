import type { Locale } from "@/content";

export type AdminPanelContext = any;

export function amountInputValue(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function HiddenProjectFields({
  locale,
  projectId,
}: {
  locale: Locale;
  projectId: string;
}) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="projectId" value={projectId} />
    </>
  );
}
