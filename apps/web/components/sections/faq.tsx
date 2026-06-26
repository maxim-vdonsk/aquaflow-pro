"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/reveal";
import { faq } from "@/lib/data";

export function Faq() {
  return (
    <section id="faq" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(176,107,255,0.05),transparent_60%)]" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[3px] text-[var(--color-primary)]">
              /04 — FAQ
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
              Частые{" "}
              <span className="grad-text">вопросы</span>
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <Accordion type="single" collapsible className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] px-6 backdrop-blur-xl">
            {faq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
