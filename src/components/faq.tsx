import type { Dict } from "@/content";
import { Container, Kicker, Section } from "./ui";

export function Faq({ t }: { t: Dict["faq"] }) {
  return (
    <Section className="border-t border-hairline">
      <Container>
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-5 font-serif text-3xl font-normal text-ink md:text-[40px]">
          {t.heading}
        </h2>
        <div className="mt-10 divide-y divide-hairline border-y border-hairline">
          {t.items.map((item, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
                <span className="text-base font-medium text-ink">{item.q}</span>
                <span className="shrink-0 font-mono text-lg leading-none text-muted group-open:hidden">
                  +
                </span>
                <span className="hidden shrink-0 font-mono text-lg leading-none text-copper group-open:block">
                  -
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-sm leading-relaxed text-ink2">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
