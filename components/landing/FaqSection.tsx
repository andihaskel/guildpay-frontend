'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Does AccessGate take a commission on my payments?',
    a: 'No. You keep 100% of your revenue, minus Stripe\'s standard processing fees. Payments flow directly from your members into your Stripe account — we never touch the money.',
  },
  {
    q: 'What happens if a member cancels their subscription?',
    a: 'Their role and access are revoked automatically as soon as their billing period ends. If they cancel mid-cycle, access continues until the paid period is over — then it\'s removed without any action from you.',
  },
  {
    q: 'Can I run multiple roles or tiers in the same server?',
    a: 'Yes. Create as many tiers as you want — each mapped to its own Discord role. Members can upgrade, downgrade, or stack tiers, and role permissions update in real time.',
  },
  {
    q: 'Do I need to know how to code to set this up?',
    a: 'Not a line. Setup is three clicks: authorize the bot, connect Stripe, set your price. Most creators are live in about two minutes.',
  },
  {
    q: 'Does it work alongside existing Discord bots?',
    a: 'Yes. AccessGate only touches the roles you assign to it — your existing mod, music, or utility bots keep working normally. No permission conflicts.',
  },
  {
    q: 'Can I use my own domain for the checkout page?',
    a: 'On the Pro plan, yes. Point a subdomain at AccessGate with a single CNAME record and your checkout page lives on your brand — not ours.',
  },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <div className="faq-eyebrow">FAQ</div>
          <h2 className="faq-title">Common questions.</h2>
        </div>

        <div className="faq-panel">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={faq.q} className="faq-item">
                <button
                  type="button"
                  className={`faq-question${isOpen ? ' open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {faq.q}
                  <ChevronDown size={16} className="faq-chevron" aria-hidden />
                </button>
                {isOpen && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
