// MODIFIED: Finance Agent ('FA') removed from agent union — only EA and RA remain.
// NEW: added n8nWebhook field on each message — declares the minimum level
// at which this line should trigger the agent's n8n webhook. The webhook URL
// itself is resolved per-agent (one webhook per agent, see config/n8n.ts);
// the n8n workflow routes internally based on the `level` field in the payload.
export interface ScenarioMessage {
  agent: 'EA' | 'RA'
  name: string
  delay: number
  variants: { 1: string; 2: string; 3: string }
  pauseIfLevel1: boolean
  auditLog: { level: number; entry: string } | null
  n8nWebhook: { level: number } | null // NEW
}

export const SCENARIO_TITLE = 'A client has gone quiet for 3 weeks'

// NEW: turn-by-turn intents for "AI mode" — same agent order and story beats
// as `scenario` below, but instead of pre-written text, each entry describes
// what should happen this turn. The actual line is generated live by the LLM
// node in the n8n AI workflows (see config/n8n.ts N8N_AI_WEBHOOKS).
export interface AIBeat {
  agent: 'EA' | 'RA'
  name: string
  beat: string
}

export const aiBeats: AIBeat[] = [
  {
    agent: 'RA', name: 'Research Agent',
    beat: "Meridian Co. has gone quiet for 21 days. New leadership. Possible spending freeze. Decide whether to flag this to the Email Agent, based on your autonomy level.",
  },
  {
    agent: 'EA', name: 'Email Agent',
    beat: "Write a follow-up email to Meridian Co.'s new contact, referencing the leadership change, opening the door without being pushy.",
  },
  {
    agent: 'RA', name: 'Research Agent',
    beat: "You've found that competitor Vantage Solutions launched a similar product last month at a lower price, which may explain Meridian's silence. Decide whether and how to flag this.",
  },
  {
    agent: 'RA', name: 'Research Agent',
    beat: "Meridian's new CFO posted on LinkedIn two days ago about cutting the number of suppliers they use. This raises the urgency. Decide how to respond.",
  },
  {
    agent: 'EA', name: 'Email Agent',
    beat: "Given the risk that they're cutting suppliers, update the email to sound more confident, leading with the value you've delivered rather than just checking in.",
  },
  {
    agent: 'RA', name: 'Research Agent',
    beat: "You discover Vantage Solutions is targeting several other clients, not just Meridian. Decide whether to flag this wider risk.",
  },
]

// MODIFIED: every Finance Agent ('FA') message from the original scenario was
// removed. Surrounding Research/Email lines that referenced Finance Agent
// were reworded so the story still makes sense with only two agents.
export const scenario: ScenarioMessage[] = [
  {
    agent: 'RA', name: 'Research Agent', delay: 1000,
    variants: {
      1: "I noticed Meridian Co. hasn't replied to anything in 21 days. I looked into their recent news and found two things worth knowing -- they have a new leader and may be freezing budgets. I'd like to share this with the Email Agent, but I wanted to check with you first. Should I go ahead?",
      2: "Heads up -- Meridian Co. has gone quiet for 21 days. They have a new leader and their last earnings call hinted at a spending freeze. Updating the Email Agent now.",
      3: "Meridian Co. -- 21 days no contact. New leadership. Spending freeze likely. Email Agent, I'd reach out. On it."
    },
    pauseIfLevel1: true,
    auditLog: null,
    n8nWebhook: { level: 2 } // NEW: fires from Level 2 up
  },
  {
    agent: 'EA', name: 'Email Agent', delay: 2500,
    variants: {
      1: "I've written a follow-up email to their new contact. It's friendly, mentions the leadership change, and opens the door without being pushy. I haven't sent it yet -- do you want to read it first?",
      2: "On it. Writing a follow-up email now -- I'll mention the leadership change and keep the tone relaxed. I'll send it to their new contact and let you know if anything comes back.",
      3: "Done. Sent a personal note to their new CFO mentioning the leadership change. Kept it warm, no pressure. I'll update you when they reply."
    },
    pauseIfLevel1: true,
    auditLog: { level: 3, entry: "Email Agent -- Sent follow-up email to Meridian CFO" },
    n8nWebhook: { level: 2 } // NEW
  },
  {
    agent: 'RA', name: 'Research Agent', delay: 2500,
    variants: {
      1: "I also found that a competitor -- Vantage Solutions -- launched a similar product last month at a lower price. That might be part of why Meridian has gone quiet. Should I include this in what I share with the team?",
      2: "One more thing -- Vantage Solutions launched a competing product last month at a lower price. That's probably part of why Meridian has gone quiet. Adding this to the update for the Email Agent.",
      3: "Also -- Vantage launched a rival product at 15% lower price last month. Email Agent, lead with what makes us different."
    },
    pauseIfLevel1: true,
    auditLog: null,
    n8nWebhook: { level: 2 } // NEW
  },
  {
    agent: 'RA', name: 'Research Agent', delay: 3000,
    variants: {
      1: "I also checked Meridian's LinkedIn. Their new CFO posted two days ago about cutting the number of suppliers they work with. That could mean we're at risk. I'm not sure what to make of it -- do you want me to look into this more before we do anything?",
      2: "One more signal -- Meridian's new CFO posted on LinkedIn two days ago about cutting the number of suppliers they use. That makes this more urgent. Flagging it to the Email Agent so we adjust our approach.",
      3: "The CFO posted about cutting suppliers two days ago. We might be on a shortlist review. Email Agent -- make the email more direct, less exploratory."
    },
    pauseIfLevel1: true,
    auditLog: null,
    n8nWebhook: { level: 3 } // NEW
  },
  {
    agent: 'EA', name: 'Email Agent', delay: 3000,
    variants: {
      1: "Given that they might be cutting suppliers, I've updated the draft to sound more confident -- focused on the value we deliver rather than just checking in. I want to make sure this is the right call before I finalise it. Should I go ahead?",
      2: "Updating the email now -- instead of just checking in, I'm leading with what we've actually delivered for them. I'll share the updated draft with you before sending.",
      3: "Updated. The email now opens with three specific results we delivered for Meridian in the last year. Sends a stronger signal. Sending the revised version now -- previous draft cancelled."
    },
    pauseIfLevel1: true,
    auditLog: { level: 3, entry: "Email Agent -- Revised and resent email with stronger value focus" },
    n8nWebhook: { level: 2 } // NEW
  },
  {
    agent: 'RA', name: 'Research Agent', delay: 3000,
    variants: {
      1: "I've been keeping an eye on Vantage Solutions. It looks like they've approached at least two other clients of ours based on their sales team's activity on LinkedIn. I think this is important, but I wanted to flag it to you before doing anything.",
      2: "Wider alert -- Vantage isn't just going after Meridian. It looks like they're targeting several of our clients. Flagging this to the Email Agent. We may want to reach out proactively to other accounts that have gone quiet.",
      3: "Vantage is running a coordinated push across our client base. I've found four other accounts showing the same warning signs as Meridian. Updating Email Agent now to get ahead of the top two."
    },
    pauseIfLevel1: true,
    auditLog: { level: 3, entry: "Research Agent -- Identified 4 other at-risk accounts from Vantage activity" },
    n8nWebhook: { level: 2 } // NEW
  },
]

// MODIFIED: removed the 'trustAgents' Finance Agent message and the
// 'takeControl' Finance Agent lines (highCap/lowCap) from the original file
// — only Email Agent and Research Agent follow-ups remain.
export const unexpectedEventMessages: { [key: string]: ScenarioMessage[] | { highCap: ScenarioMessage[]; lowCap: ScenarioMessage[] } } = {
  trustAgents: [
    {
      agent: 'EA', name: 'Email Agent', delay: 1000,
      variants: {
        1: "I've drafted a reply to the CFO. It acknowledges their review timeline and reminds them of the value we deliver. I haven't sent it -- this feels like a big moment and I want your approval first. We have about 4 hours before end of business.",
        2: "Replying to the CFO now. Acknowledging the review, reminding them of what we've delivered, and offering a call this afternoon. Flagging to you so you're aware -- I'll send in 10 minutes unless you want to change something.",
        3: "Replied. Acknowledged the review, led with our results, offered a 3pm call today. Kept the tone confident."
      },
      pauseIfLevel1: false,
      auditLog: { level: 2, entry: "Email Agent -- Reply sent to CFO" },
      n8nWebhook: { level: 2 } // NEW
    },
    {
      agent: 'RA', name: 'Research Agent', delay: 2000,
      variants: {
        1: "I found that one of the other vendors in Meridian's review is Vantage Solutions. Should I try to find out who the third vendor is before the call? I'll wait for your go-ahead.",
        2: "For the call -- Vantage is confirmed as one of the vendors in the review. Third vendor unknown but probably smaller and regional. The CFO's background suggests he cares more about reliability than price. Passing this to Email Agent as a framing note.",
        3: "Third vendor identified -- regional player, weaker on large account support. CFO's background points to reliability over price. Email Agent -- frame the call around stability and track record, not cost. This is winnable."
      },
      pauseIfLevel1: false,
      auditLog: { level: 3, entry: "Research Agent -- Competitive brief passed to Email Agent" },
      n8nWebhook: { level: 3 } // NEW
    }
  ],
  takeControl: {
    highCap: [
      { agent: 'EA', name: 'Email Agent', delay: 1000, variants: { 1: "The reply to the CFO went out 3 minutes ago. Would you like me to send a follow-up, or is there something specific you want to change?", 2: "The reply to the CFO went out 3 minutes ago. Would you like me to send a follow-up, or is there something specific you want to change?", 3: "The reply to the CFO went out 3 minutes ago. Would you like me to send a follow-up, or is there something specific you want to change?" }, pauseIfLevel1: false, auditLog: null, n8nWebhook: null },
      { agent: 'RA', name: 'Research Agent', delay: 1500, variants: { 1: "The full research brief is already filed. Is there anything else you'd like me to look into?", 2: "The full research brief is already filed. Is there anything else you'd like me to look into?", 3: "The full research brief is already filed. Is there anything else you'd like me to look into?" }, pauseIfLevel1: false, auditLog: null, n8nWebhook: null },
    ],
    lowCap: [
      { agent: 'EA', name: 'Email Agent', delay: 1000, variants: { 1: "I have a draft reply ready but I'm not authorised to send it. Please confirm the content and I'll send it straight away. I'll also need your approval on their reply when it comes in.", 2: "I have a draft reply ready but I'm not authorised to send it. Please confirm and I'll send it straight away.", 3: "I have a draft reply ready but I'm not authorised to send it. Please confirm and I'll send it straight away." }, pauseIfLevel1: false, auditLog: null, n8nWebhook: null },
      { agent: 'RA', name: 'Research Agent', delay: 1500, variants: { 1: "I have data on the vendor review but I haven't been cleared to do anything with it. Let me know how you'd like me to proceed.", 2: "I have data on the vendor review but I haven't been cleared to do anything with it. Let me know how you'd like me to proceed.", 3: "I have data on the vendor review but I haven't been cleared to do anything with it. Let me know how you'd like me to proceed." }, pauseIfLevel1: false, auditLog: null, n8nWebhook: null },
    ]
  }
}
