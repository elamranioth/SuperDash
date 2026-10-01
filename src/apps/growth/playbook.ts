// Growth Playbook — lessons and return playbooks for professional services

export interface PlaybookLesson {
  id: string
  title: string
  section: 'get_clients' | 'keep_clients'
  idea: string
  whyItWorks: string
  badExample?: string
  goodExample?: string
  doThis: string
  actionLabel?: string
  actionType?: 'add_lead' | 'open_leads' | 'open_clients' | 'open_referrals'
}

export const PLAYBOOK_LESSONS: PlaybookLesson[] = [
  // ─── GET CLIENTS ────────────────────────────────────────────────────────────

  {
    id: 'contact_with_reason',
    title: 'Contact With a Reason',
    section: 'get_clients',
    idea:
      'Never reach out cold. Every message should carry a genuine reason to connect — a regulation change, a shared contact, a relevant deadline, or something specific to their situation.',
    whyItWorks:
      'People ignore generic outreach instantly. A message that references something real about their world signals that you paid attention, not that you are hunting for business. That distinction is everything in professional services.',
    badExample:
      'Hi, I am reaching out to introduce our company formation and legal services. We offer competitive pricing and a professional team. Please let us know if you are interested.',
    goodExample:
      'Hi Ahmed, I noticed your company recently started exporting to the GCC region — congrats on the expansion. The UAE free zone rules shifted in January and a few clients in your sector missed the update. Happy to send over a short summary if useful.',
    doThis:
      'Before messaging any lead this week, identify one specific reason why now is the right moment for them to hear from you.',
    actionLabel: 'Add a New Lead',
    actionType: 'add_lead',
  },

  {
    id: 'teach_before_selling',
    title: 'Teach Before Selling',
    section: 'get_clients',
    idea:
      'Answer real questions publicly — on WhatsApp groups, LinkedIn, or in conversation — before anyone asks you for a proposal. Clients who learn from you trust you before they have ever paid you.',
    whyItWorks:
      'Professional services are bought on trust, not on price. When you give away knowledge freely, you demonstrate competence without saying "I am competent." The prospect does the math themselves.',
    badExample:
      'Our team has over 15 years of experience in company formation and licensing. We are the right choice for your business needs. Contact us for a free consultation.',
    goodExample:
      'Someone in a business owners group asks about mainland vs free zone setup. You reply with a clear, honest two-paragraph breakdown with the trade-offs — no pitch, no call to action, just a useful answer. Three people DM you that week.',
    doThis:
      'This week, answer one question about your field in a public space — a group, a post, or a reply — with no ask attached.',
    actionLabel: 'View Leads',
    actionType: 'open_leads',
  },

  {
    id: 'follow_up_without_annoying',
    title: 'Follow Up Without Annoying',
    section: 'get_clients',
    idea:
      'Most professionals either follow up too aggressively or give up after one message. The best follow-ups are short, add new value, and acknowledge the prospect\'s silence without making it awkward.',
    whyItWorks:
      'Timing is often the real barrier — not disinterest. A second or third touch that brings something new (an update, a relevant deadline, a brief insight) stays useful rather than becoming noise.',
    badExample:
      'Hi, just following up on my previous message. Please let me know if you are interested. We are still available to help.',
    goodExample:
      'Hi Sarah, I sent a note a couple of weeks ago about the trade licence renewal window. The deadline is coming up on the 15th, so wanted to flag it in case it slipped by. No rush on your end — happy to help if the timing works.',
    doThis:
      'Review your open leads and send one value-based follow-up today — include a deadline, a regulation update, or a short insight, not just a check-in.',
    actionLabel: 'View Open Leads',
    actionType: 'open_leads',
  },

  {
    id: 'make_it_easy_to_understand',
    title: 'Make It Easy to Understand',
    section: 'get_clients',
    idea:
      'Most professionals use industry jargon that sounds impressive but leaves prospects confused. If a client cannot explain what you do to a friend, they will not refer you — and they may not even hire you.',
    whyItWorks:
      'Clarity signals confidence. When you explain your service in plain language, prospects feel respected, not talked down to. They also remember the conversation and can act on it without needing a second call to decode what you said.',
    badExample:
      'We provide end-to-end corporate structuring, regulatory compliance advisory, and document legalisation services across all relevant jurisdictions.',
    goodExample:
      'We help businesses get set up legally in the UAE — from choosing the right licence to handling all the paperwork with government authorities. Most clients go from zero to operational in four to six weeks.',
    doThis:
      'Write one sentence that explains your main service as if you were telling a friend, then use it the next time someone asks what you do.',
  },

  {
    id: 'referral_loop',
    title: 'Build a Referral Loop',
    section: 'get_clients',
    idea:
      'Referrals do not happen automatically — they happen when you make it easy and timely to refer. The best moment to ask is right after you have delivered real value, not at the end of the relationship.',
    whyItWorks:
      'Satisfied clients want to help you — but they need a prompt and a clear picture of who else you can help. Give them both, and asking feels natural rather than transactional.',
    badExample:
      'If you know anyone who needs our services, please feel free to refer them to us. We appreciate your support.',
    goodExample:
      'We have just finalised your company registration — congratulations again. If you have a colleague or fellow founder going through the same process, I am happy to give them the same straightforward experience. Feel free to send them my way.',
    doThis:
      'Identify one recently satisfied client and send them a warm, specific referral ask today — mention the type of person you can help.',
    actionLabel: 'View Referrals',
    actionType: 'open_referrals',
  },

  // ─── KEEP CLIENTS ───────────────────────────────────────────────────────────

  {
    id: 'first_week_matters',
    title: 'The First Week After Service Matters',
    section: 'keep_clients',
    idea:
      'The period immediately after you complete a service is when clients are most emotionally engaged — positively or negatively. A quick, personal check-in during this window cements the relationship.',
    whyItWorks:
      'Most professionals disappear after the invoice. A brief check-in signals that you care about the outcome, not just the transaction. Clients remember this and mention it when recommending you.',
    badExample:
      'Thank you for choosing our services. Please do not hesitate to contact us for any future requirements.',
    goodExample:
      'Hi Omar, just checking in now that your trade licence is in hand. Everything land smoothly? If you hit any questions with the bank account opening process next, we can help with that too.',
    doThis:
      'Set a reminder to message every new client within five days of completing their service — one short, genuine question.',
    actionLabel: 'View Clients',
    actionType: 'open_clients',
  },

  {
    id: 'stay_useful_after_invoice',
    title: 'Stay Useful After the Invoice',
    section: 'keep_clients',
    idea:
      'The strongest client relationships are built in the gaps between engagements. Sharing a relevant regulation update, a deadline reminder, or a useful article keeps you present without selling anything.',
    whyItWorks:
      'Clients who hear from you only when you need them to sign or pay will feel used. Clients who occasionally receive something useful from you will think of you first when they next need help — or when someone asks for a recommendation.',
    badExample:
      'We hope you are doing well. Please keep us in mind for any future services you may require.',
    goodExample:
      'Hi Fatima, I came across a note from the Ministry of Economy on updated visa eligibility for company partners — it affects a few of our clients\' structures. Sending it across in case it is relevant for your team.',
    doThis:
      'Once a month, send at least three existing clients something genuinely useful with no ask attached.',
    actionLabel: 'View Clients',
    actionType: 'open_clients',
  },

  {
    id: 'contact_with_reason_retention',
    title: 'Contact With a Reason (Retention)',
    section: 'keep_clients',
    idea:
      'Existing clients deserve the same thoughtfulness as new prospects. Every touchpoint should feel intentional — tied to something happening in their business or their world, not just a calendar prompt.',
    whyItWorks:
      'Generic check-ins feel like newsletters. A message tied to a real event — a licence anniversary, an upcoming renewal, a market development — feels like advice from someone who is paying attention to their business.',
    badExample:
      'Hi, we just wanted to check in and see if there is anything we can assist you with at this time.',
    goodExample:
      'Hi Khalid, your mainland licence is up for renewal in about six weeks — just wanted to give you a heads-up so we can start early and avoid any processing delays. Same process as last year, but there is a new fee structure we should factor in.',
    doThis:
      'Review your client list and flag anyone with a renewal, anniversary, or deadline in the next 60 days — reach out with a specific, timely reason.',
    actionLabel: 'View Clients',
    actionType: 'open_clients',
  },

  {
    id: 'ask_for_feedback',
    title: 'Ask for Feedback the Right Way',
    section: 'keep_clients',
    idea:
      'Asking for feedback is not just about learning — it is a relationship signal. It tells clients that their experience mattered to you beyond the payment. Most professionals never ask, which means most clients never say.',
    whyItWorks:
      'A simple, specific feedback question gives clients an opening to share both positives and frustrations. You learn what to improve, and clients who voice their appreciation become more loyal — speaking something positive reinforces it.',
    badExample:
      'We value your feedback. Please take a moment to rate our services on Google. Thank you for your business.',
    goodExample:
      'Hi Nadia, now that your attestation is complete, I wanted to ask — was there any part of the process that felt unclear or took longer than you expected? I ask a few clients this and it genuinely helps us improve.',
    doThis:
      'After your next three completed services, send one specific feedback question — not a survey link, just a plain question in a message.',
  },

  {
    id: 'ask_referral_right_moment',
    title: 'Ask for a Referral at the Right Moment',
    section: 'keep_clients',
    idea:
      'Timing a referral ask is as important as the ask itself. The best moment is when a client has just experienced a win — their licence approved, their documents cleared, their visa issued.',
    whyItWorks:
      'Emotional peaks are when goodwill is highest and recall is strongest. A well-timed ask does not feel like sales — it feels like a natural extension of a good moment.',
    badExample:
      'We would really appreciate if you could refer friends and family to us. Your referrals help us grow our business.',
    goodExample:
      'Great news — your documents have been attested and are ready for collection. Glad we could get that turned around quickly for you. If any colleagues are going through a similar process, I am happy to help them too. Feel free to pass on my contact.',
    doThis:
      'Identify the exact moment in your service delivery when clients feel the most relief or satisfaction — then practise making your referral ask at that specific point.',
    actionLabel: 'View Referrals',
    actionType: 'open_referrals',
  },
]

// ─── RETURN PLAYBOOKS ────────────────────────────────────────────────────────

export interface ReturnPlaybookStep {
  id: string
  label: string
  timing: string
  action: string
}

export interface ReturnPlaybook {
  id: string
  name: string
  serviceType: string
  steps: ReturnPlaybookStep[]
}

export const RETURN_PLAYBOOKS: ReturnPlaybook[] = [
  {
    id: 'business_setup',
    name: 'Business Setup Follow-Up',
    serviceType: 'Company Formation / Trade Licence',
    steps: [
      {
        id: 'bs_step_1',
        label: 'Completion check-in',
        timing: '3–5 days after licence is issued',
        action:
          'Send a personal message confirming everything landed smoothly and ask if they have started the bank account process. Offer a pointer if needed.',
      },
      {
        id: 'bs_step_2',
        label: 'Visa & establishment card reminder',
        timing: '3 weeks after licence',
        action:
          'Remind them to initiate their visa applications before the establishment card window lapses. Offer to handle it or point them in the right direction.',
      },
      {
        id: 'bs_step_3',
        label: 'Renewal alert — early flag',
        timing: '60 days before annual renewal',
        action:
          'Send an early heads-up about the upcoming renewal window. Highlight any fee or process changes from last year and offer to start the paperwork.',
      },
      {
        id: 'bs_step_4',
        label: 'Renewal confirmation',
        timing: '30 days before renewal',
        action:
          'Follow up if no response was received. Confirm whether they want to proceed with renewal through you and lock in the timeline.',
      },
      {
        id: 'bs_step_5',
        label: 'Post-renewal check + referral moment',
        timing: '1 week after renewal is complete',
        action:
          'Confirm all renewed documents are in order. If the experience was positive, make a natural referral ask tied to the milestone.',
      },
    ],
  },

  {
    id: 'document_attestation',
    name: 'Document Attestation Follow-Up',
    serviceType: 'Attestation / Legalisation',
    steps: [
      {
        id: 'da_step_1',
        label: 'Collection confirmation',
        timing: 'Same day documents are ready',
        action:
          'Notify the client promptly that their documents are ready for collection or delivery. Include any storage or expiry considerations if relevant.',
      },
      {
        id: 'da_step_2',
        label: 'Use-case check-in',
        timing: '1 week after collection',
        action:
          'Send a brief message checking whether the attested documents were accepted by the receiving authority. Flag that you are available if any re-attestation or additional stamps are needed.',
      },
      {
        id: 'da_step_3',
        label: 'Future needs prompt',
        timing: '2 months after completion',
        action:
          'Touch base with a note about commonly needed follow-on attestations (e.g., for visa renewals, company changes, or new employees). Keep it informational, not salesy.',
      },
      {
        id: 'da_step_4',
        label: 'Referral ask',
        timing: '2 weeks after a smooth delivery',
        action:
          'If the client expressed satisfaction, send a natural referral message mentioning colleagues or partners who may need similar document services.',
      },
    ],
  },

  {
    id: 'legal_matter',
    name: 'Legal Matter Follow-Up',
    serviceType: 'Legal Services / Advisory',
    steps: [
      {
        id: 'lm_step_1',
        label: 'Matter closure summary',
        timing: 'Within 2 days of matter closing',
        action:
          'Send a concise written summary of what was resolved or delivered. Confirm any outstanding obligations the client should be aware of. This is a professionalism signal.',
      },
      {
        id: 'lm_step_2',
        label: 'Regulatory update relevant to their matter',
        timing: '4–6 weeks after closure',
        action:
          'If a regulation, court ruling, or authority guidance relevant to their matter is published, send a brief summary with your interpretation. No invoice needed — this is relationship equity.',
      },
      {
        id: 'lm_step_3',
        label: 'Annual legal health check prompt',
        timing: '10–11 months after closure',
        action:
          'Reach out with an offer for a brief annual review of their contracts, corporate documents, or compliance position. Frame it as proactive, not reactive.',
      },
      {
        id: 'lm_step_4',
        label: 'Feedback conversation',
        timing: '3 weeks after matter closure',
        action:
          'Ask one specific question about their experience — what was clearest, what could have been communicated better. Keep it conversational, not a form.',
      },
      {
        id: 'lm_step_5',
        label: 'Warm referral ask',
        timing: 'After a positive feedback exchange',
        action:
          'Following a positive reply, make a specific and dignified referral ask — mention the type of matter or client profile you work best with so the referral is easy to make.',
      },
    ],
  },
]
