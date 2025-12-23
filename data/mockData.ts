
import type { User, Account } from '../types';

export const mockUsers: User[] = [
  { id: 1, name: 'John Smith', username: 'jsmith', team: 'Giants' },
  { id: 2, name: 'Alice Doe', username: 'adoe', team: 'Jets' },
  { id: 3, name: 'Bob Johnson', username: 'bjohnson', team: 'Giants' },
  { id: 4, name: 'Charlie Brown', username: 'cbrown', team: 'Eagles'},
];

export const mockAccounts: Account[] = [
  {
    id: 'acc_001',
    name: 'Innovate Corp',
    ae: 'John Smith',
    team: 'Giants',
    tier: 1,
    segment: 'Agency',
    activities: [
      {
        id: 'act_001a',
        type: 'meeting',
        date: '2024-07-15',
        summary: 'Initial discovery call',
        content: `Transcript:\nJohn: Thanks for joining, Mark. To start, could you tell me about your current workflow challenges?\nMark (Innovate Corp): Sure, John. Our biggest issue is data fragmentation. Our sales and marketing data are in separate systems, and it's causing a lot of manual work and reporting headaches.\nJohn: I see. That's a very common problem. How much time would you say your team spends on manual data reconciliation each week?\nMark: Easily 5-10 hours per person. It's a huge productivity drain.\nJohn: Understood. Our platform is designed to unify that data. What would be the biggest win for you if this problem was solved?\nMark: A single source of truth for reporting. That would be a game-changer for our strategic decisions.`
      },
      {
        id: 'act_001b',
        type: 'email',
        date: '2024-07-16',
        summary: 'Follow-up email with brochure',
        content: `Subject: Following up on our chat\n\nHi Mark,\n\nGreat chatting with you yesterday. As discussed, our platform can directly address the data fragmentation issues you're facing.\n\nI've attached our brochure that details the data unification module. Let me know if you have any questions.\n\nBest,\nJohn`
      },
      {
        id: 'act_001c',
        type: 'note',
        date: '2024-07-20',
        summary: 'Internal sync note',
        content: `Mark from Innovate Corp seems very interested. Key pain point is data fragmentation. The main decision-maker is the CTO, Sarah. Need to get her on the next call. The budget is approved for Q3.`
      }
    ]
  },
  {
    id: 'acc_002',
    name: 'Quantum Solutions',
    ae: 'John Smith',
    team: 'Giants',
    tier: 2,
    segment: 'ISV',
    activities: [
      {
        id: 'act_002a',
        type: 'note',
        date: '2024-06-20',
        summary: 'Initial contact',
        content: `Reached out via LinkedIn. Spoke with Jane, the marketing director. She's interested in our automation features. Scheduled a demo for next week.`
      },
      {
        id: 'act_002b',
        type: 'meeting',
        date: '2024-06-27',
        summary: 'Product Demo',
        content: `Transcript:\nJohn: ...and as you can see, the campaign automation builder is all drag-and-drop. \nJane (Quantum): This is impressive. Can it integrate with our existing CRM?\nJohn: Absolutely. We have native integrations with the top 3 CRMs and a robust API for custom solutions. What CRM are you using?\nJane: We're on a custom-built system.\nJohn: Not a problem, our API will be perfect for that. The key benefit is reducing manual campaign setup time from hours to minutes. \nJane: My team would love that. What are the next steps?\nJohn: I can set you up with a 14-day trial and connect you with one of our integration specialists.`
      }
    ]
  },
  {
    id: 'acc_003',
    name: 'NextGen Logistics',
    ae: 'Alice Doe',
    team: 'Jets',
    tier: 3,
    segment: 'Franchise/Multi-location',
    activities: [
      {
        id: 'act_003a',
        type: 'email',
        date: '2024-07-01',
        summary: 'Inbound lead query',
        content: `From: tom@nextgen.com\n\nHi, \n\nWe saw your product online and are interested in learning more about its real-time tracking capabilities for supply chain management. Can someone reach out to us?\n\nThanks,\nTom`
      },
       {
        id: 'act_003b',
        type: 'meeting',
        date: '2024-07-05',
        summary: 'Call with Tom from NextGen',
        content: `Transcript:\nAlice: Tom, thanks for your interest. You mentioned real-time tracking. What are the key issues you're trying to solve?\nTom (NextGen): We have visibility gaps. When a shipment leaves our warehouse, we don't have good data until it reaches the destination hub. This causes delays and customer frustration.\nAlice: Our solution provides sub-meter GPS accuracy updated every 10 seconds. You'd see exactly where every asset is, 24/7. How would that impact your operations?\nTom: It would revolutionize our exception handling. We could be proactive about delays instead of reactive. I'm concerned about the cost of the hardware, though.\nAlice: It's a valid concern. We offer both a purchase and a leasing model for the tracking hardware to provide flexibility on CapEx vs OpEx.`
      }
    ]
  },
  {
    id: 'acc_004',
    name: 'Apex Digital',
    ae: 'Charlie Brown',
    team: 'Eagles',
    tier: 4,
    segment: 'Media',
    activities: []
  },
  {
    id: 'acc_005',
    name: 'Managed IT Heroes',
    ae: 'Alice Doe',
    team: 'Jets',
    tier: 5,
    segment: 'MSP',
    activities: [
      {
        id: 'act_005a',
        type: 'meeting',
        date: '2024-07-22',
        summary: 'Security solution pitch',
        content: `Transcript:\nAlice: Thanks for the demo opportunity, David. Our main concern is endpoint security. We manage thousands of devices for our clients.\nDavid (Managed IT Heroes): We hear that a lot. Our solution provides a single dashboard to monitor and manage all endpoints, regardless of location. We can push updates, run scans, and isolate threats remotely.\nAlice: That sounds powerful. What about reporting for our clients?\nDavid: Fully customizable. You can generate white-labeled reports for each client, showing security posture, threats blocked, and compliance status. It's a huge value-add for your MSP services.\nAlice: I like the sound of that. The pricing seems a bit high compared to our current provider, though.\nDavid: It's a premium product, but the efficiency gains from the single dashboard and the value of the automated reporting often lead to a net cost saving. We can run a TCO analysis for you.`
      }
    ]
  },
  {
    id: 'acc_006',
    name: 'Creative Spark Agency',
    ae: 'John Smith',
    team: 'Giants',
    tier: 2,
    segment: 'Agency',
    activities: [
       {
        id: 'act_006a',
        type: 'email',
        date: '2024-07-18',
        summary: 'Inquiry about white-label options',
        content: `Subject: White-labeling your platform\n\nHi John,\n\nWe're an agency looking for a new analytics platform to offer our clients. A key requirement is the ability to fully white-label the dashboard with our own branding. Is this something you support?\n\nThanks,\nLaura`
      }
    ]
  }
];