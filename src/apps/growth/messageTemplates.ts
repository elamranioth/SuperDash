// Message Templates — Follow-Up Assistant for Growth app
// Professional services context: company formation, visas, legal, attestation, licence renewal

export type MessageTemplateType =
  | 'first_followup'
  | 'quotation_followup'
  | 'no_response_followup'
  | 'final_gentle_followup'
  | 'referral_introduction'
  | 'existing_client_reconnect'
  | 'care_checkin'
  | 'renewal_reminder'

export interface MessageTemplate {
  type: MessageTemplateType
  title: string
  description: string
  template: string // Uses {{name}}, {{service}}, {{company}} placeholders
  tip: string
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    type: 'first_followup',
    title: 'First Follow-Up',
    description: 'For leads who have shown interest but have not yet responded or committed.',
    template: `Hi {{name}},

Thank you for reaching out about {{service}}. I wanted to follow up in case my earlier message did not land in the right place.

We have helped a number of clients navigate this process, and I am happy to walk you through what it typically involves and what to expect at each stage — no pressure to commit.

If you have a few minutes this week, I can answer any questions you have.

Warm regards,
{{company}}`,
    tip: 'Send this within 3–5 days of the initial enquiry. Keep the tone open and informative, not closing.',
  },

  {
    type: 'quotation_followup',
    title: 'Quotation Follow-Up',
    description: 'For leads who have received a proposal or quotation and have not yet responded.',
    template: `Hi {{name}},

I hope this finds you well. I wanted to check in on the quotation we sent across for {{service}}.

If you have had a chance to review it and have any questions — about the scope, the timeline, or the fees — I am happy to go through it together. And if your situation has changed or you would like to adjust what is included, just let me know.

No rush on your end. I just wanted to make sure the proposal was clear and that you have what you need to make a comfortable decision.

Best,
{{company}}`,
    tip: 'Follow up on quotations after 5–7 business days. Avoid asking "Did you get a chance to review?" — it puts them on the spot.',
  },

  {
    type: 'no_response_followup',
    title: 'No Response Follow-Up',
    description: 'For leads who have gone quiet after initial contact or a meeting.',
    template: `Hi {{name}},

I realise you may have a lot on at the moment, so I will keep this brief.

I sent a note a couple of weeks ago about {{service}} and wanted to check in one more time. If the timing is not right, that is completely fine — I just did not want to assume you were not interested without asking.

If there is something specific holding things up, I am happy to have a quick call and see if there is a way we can make it easier.

Kind regards,
{{company}}`,
    tip: 'Use this only after 2+ unanswered messages. Acknowledge their silence without guilt-tripping. Short messages get read more than long ones.',
  },

  {
    type: 'final_gentle_followup',
    title: 'Final Follow-Up',
    description: 'A dignified closing message for leads who have not responded after multiple attempts.',
    template: `Hi {{name}},

I did not want to keep sending messages without hearing from you, so I will make this the last one.

If the need for {{service}} has passed or you have found another solution, that is completely fine — I genuinely hope it worked out well. And if things change in the future and it would be useful to speak again, you are always welcome to reach out.

Wishing you well,
{{company}}`,
    tip: 'This message should feel final and respectful. Do not include a call to action or another question. Leave the door open, not ajar.',
  },

  {
    type: 'referral_introduction',
    title: 'Referral Introduction',
    description: 'To introduce yourself to a referred lead with warmth and context.',
    template: `Hi {{name}},

I hope you are doing well. A mutual contact passed on your details and mentioned you may be exploring options for {{service}} — I hope it is alright to reach out.

We work with a number of businesses and individuals on exactly this, and I would be happy to give you a straightforward picture of what the process involves, what it costs, and how long it typically takes.

No obligation at all — feel free to reach out whenever it suits you, or let me know if you would prefer I send some information first.

Warm regards,
{{company}}`,
    tip: 'Always mention who referred them in the first message — it is your most powerful trust signal. Personalise the mutual contact reference before sending.',
  },

  {
    type: 'existing_client_reconnect',
    title: 'Existing Client Reconnect',
    description: 'To re-engage an existing client who has not been in touch for some time.',
    template: `Hi {{name}},

I hope things have been going well on your end. It has been a while since we last spoke, and I wanted to check in.

We have been working on a few updates related to {{service}} — there have been some regulatory changes that may be relevant depending on where your business is at. I did not want to assume you were already across everything, so thought it worth a brief note.

If you are happy with how things are set up at the moment, that is great to hear. But if anything has changed or there is something you have been meaning to sort out, I am here.

Best,
{{company}}`,
    tip: 'Use a specific reason to reconnect — a regulation change, an anniversary, or an upcoming deadline. A vague "just checking in" message rarely gets a reply.',
  },

  {
    type: 'care_checkin',
    title: 'Care Check-In',
    description: 'A post-service message to show genuine interest in the client outcome.',
    template: `Hi {{name}},

Now that we have wrapped up the {{service}}, I wanted to check in and make sure everything has landed properly on your end.

Was there anything that felt unclear or took longer than you expected? And is there anything still outstanding that we should help you close out?

I ask every client this — it helps us improve, and I want to make sure you have everything you need going forward.

Warm regards,
{{company}}`,
    tip: 'Send this 3–7 days after service completion, not immediately. Give clients time to experience the outcome before asking about it.',
  },

  {
    type: 'renewal_reminder',
    title: 'Renewal Reminder',
    description: 'To prompt an existing client about an upcoming licence, visa, or document renewal.',
    template: `Hi {{name}},

I wanted to give you a heads-up that your {{service}} is coming up for renewal in the next few weeks.

Starting the process early tends to avoid delays, especially if any supporting documents need to be gathered or updated. There have also been a couple of minor changes to the renewal process this year that are worth knowing about.

If you would like us to handle it again, just let me know and we can get started right away. If you have any questions before deciding, I am happy to answer those too.

Best,
{{company}}`,
    tip: 'Send renewal reminders at 60 days and again at 30 days before expiry. The 60-day message should be informational; the 30-day message more action-oriented.',
  },
]
