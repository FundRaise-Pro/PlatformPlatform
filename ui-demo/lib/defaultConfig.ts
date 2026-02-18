import { FundraiserConfig } from "@/types";

export const INITIAL_CONFIG: FundraiserConfig = {
  id: "tenant-001",
  tenantName: "Thrive Africa",
  title: "Urban Water Resilience 2024",
  subtitle: "Deploying smart-grid water sensors across high-density housing projects.",
  story:
    "Water scarcity is not just a seasonal crisis; it is a systemic challenge. By integrating IoT sensors into existing municipal pipes, we can identify leaks in seconds rather than months.\n\nThis project aims to deploy 500 sensors across the Guguletu district, saving an estimated 1.2 million liters per year. Your contribution directly funds the hardware and local installer training.",
  goal: 45000,
  raised: 28450,
  primaryColor: "#0f766e",
  heroImage:
    "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1200&h=675",
  active: true,
  terminology: {
    donation: "Gift",
    donor: "Sponsor",
    campaign: "Mission",
    goal: "Target",
  },
  subscriptionPlan: "Pro",
  branches: [
    { id: "b1", name: "Cape Town HQ", location: "Waterfront, CP" },
    { id: "b2", name: "Joburg Hub", location: "Sandton, JHB" },
  ],
  partnerTiers: [
    {
      id: "pt-1",
      name: "Community Partner",
      minCommitment: 5000,
      benefits: ["Homepage logo mention", "Quarterly impact brief", "Local event listing"],
      color: "#a16207",
    },
    {
      id: "pt-2",
      name: "Growth Partner",
      minCommitment: 15000,
      benefits: ["Story-level mentions", "Branded campaign feature", "Quarterly stakeholder walkthrough"],
      color: "#0f766e",
    },
    {
      id: "pt-3",
      name: "Anchor Partner",
      minCommitment: 50000,
      benefits: ["Premier logo placement", "Dedicated impact spotlight", "Annual keynote invitation"],
      color: "#c2410c",
    },
  ],
  partners: [
    {
      id: "p-1",
      name: "EcoFlow Solutions",
      contactPerson: "Alice Rivers",
      email: "alice@ecoflow.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/EcoFlow_Logo.svg",
      tierId: "pt-2",
      status: "active",
      totalContributed: 18500,
      joinedDate: "2023-01-15",
      lastContributionDate: "2025-11-21",
    },
    {
      id: "p-2",
      name: "Urban Grid Corp",
      contactPerson: "Mark Sandton",
      email: "mark@urbangrid.co.za",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Grid_Logo.svg",
      tierId: "pt-1",
      status: "active",
      totalContributed: 6000,
      joinedDate: "2024-02-10",
      lastContributionDate: "2025-09-10",
    },
  ],
  partnerMentions: [
    {
      id: "pm-1",
      partnerId: "p-1",
      quote: "We finally have transparent neighborhood-level impact metrics.",
      context: "Q4 Impact Review",
      highlighted: true,
    },
    {
      id: "pm-2",
      partnerId: "p-2",
      quote: "This program ties every contribution to measurable water savings.",
      context: "Board Presentation",
      highlighted: false,
    },
  ],
  beneficiaryStories: [
    {
      id: "s1",
      name: "The Mthembu Family",
      bio: "Living with intermittent supply for 3 years, the sensor program restored consistent access for their household.",
      goal: 1200,
      raised: 1100,
      image: "https://picsum.photos/seed/mthembu/600/600",
    },
    {
      id: "s2",
      name: "Guguletu Primary",
      bio: "Protecting school facilities from major plumbing leaks through advanced real-time detection.",
      goal: 2500,
      raised: 800,
      image: "https://picsum.photos/seed/creche/600/600",
    },
    {
      id: "s3",
      name: "Sizwe's Micro-Garden",
      bio: "Utilizing saved greywater for sustainable urban farming in the heart of the community.",
      goal: 3000,
      raised: 2100,
      image: "https://picsum.photos/seed/garden/600/600",
    },
  ],
  events: [
    {
      id: "e1",
      title: "Water Walk Gala 2024",
      date: "2024-11-12T18:00:00Z",
      venue: "V&A Convention Centre",
      linkedCampaignId: "tenant-001",
    },
    {
      id: "e2",
      title: "Community Hackathon",
      date: "2024-12-05T09:00:00Z",
      venue: "Innovation Hub Guguletu",
      linkedCampaignId: "tenant-001",
    },
    {
      id: "e3",
      title: "Impact Stakeholder Dinner",
      date: "2025-01-15T19:30:00Z",
      venue: "The Silo Hotel",
      linkedCampaignId: "tenant-001",
    },
  ],
  blogPosts: [
    {
      id: "b1",
      title: "Scaling Smart Sensors in Q4",
      excerpt: "How ultrasonic waves are helping us find water leaks without digging.",
      content: "Technical deep dive into the IoT stack...",
      date: "Oct 28, 2024",
      author: "Dr. Sarah Jones",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&h=300&fit=crop",
    },
    {
      id: "b2",
      title: "First 100 Households Secured",
      excerpt: "Milestone reached: Our initial pilot project is now fully operational.",
      content: "Detailed report on deployment...",
      date: "Oct 15, 2024",
      author: "Team Lead",
      image: "https://images.unsplash.com/photo-1544333346-64e4fe1fefe0?q=80&w=400&h=300&fit=crop",
    },
    {
      id: "b3",
      title: "Why Data Matters for Water",
      excerpt: "Transparent metrics are changing how we fund infrastructure.",
      content: "An editorial on transparency...",
      date: "Oct 05, 2024",
      author: "Thrive Editor",
      image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=400&h=300&fit=crop",
    },
  ],
  applications: [
    {
      id: "a1",
      name: "Khayelitsha Youth Club",
      status: "approved",
      date: "2024-10-20",
      description: "Requesting sensor installation for clubhouse",
    },
  ],
  donations: [
    {
      id: "tx-101",
      donorName: "Sarah Miller",
      amount: 50,
      date: "2024-03-20",
      channel: "direct",
      certificateGenerated: true,
    },
    {
      id: "tx-102",
      donorName: "David Chen",
      amount: 100,
      date: "2024-03-21",
      channel: "social",
      certificateGenerated: true,
    },
    {
      id: "tx-103",
      donorName: "Mark Johnson",
      amount: 25,
      date: "2024-03-22",
      channel: "qrCode",
      certificateGenerated: true,
    },
    {
      id: "tx-104",
      donorName: "Emily Watson",
      amount: 500,
      date: "2024-03-23",
      channel: "direct",
      certificateGenerated: true,
    },
  ],
  tiers: [
    { id: "1", amount: 10, label: "The Drop", description: "Sensor maintenance for one week." },
    { id: "2", amount: 50, label: "The Stream", description: "One residential sensor kit." },
    { id: "3", amount: 250, label: "The River", description: "Technician apprenticeship for a month." },
    { id: "4", amount: 1000, label: "The Ocean", description: "Solar-power backup for a district hub." },
  ],
  pageCustomizations: {
    landing: {
      navigationLabel: "Home",
      heading: "Urban Water Resilience 2024",
      subheading: "Deploying smart-grid water sensors across high-density housing projects.",
      heroImage:
        "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1200&h=675",
      isVisible: true,
      sections: [
        {
          id: "landing-sec-1",
          title: "Neighborhood-first deployment",
          description: "Sensors are prioritised for communities with long-standing supply instability.",
          image:
            "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=900&auto=format&fit=crop",
          ctaLabel: "View rollout map",
        },
        {
          id: "landing-sec-2",
          title: "Auditable donor impact",
          description: "Every funded unit maps to a deployment record and audit-ready certificate flow.",
          image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop",
          ctaLabel: "Open impact dashboard",
        },
      ],
    },
    stories: {
      navigationLabel: "Stories",
      heading: "Lives impacted through resilient infrastructure",
      subheading: "Every story links to measurable delivery and transparent funding evidence.",
      heroImage:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
      isVisible: true,
      sections: [
        {
          id: "stories-sec-1",
          title: "Beneficiary interviews",
          description: "Monthly field interviews provide context on outcomes and local challenges.",
          image:
            "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop",
          ctaLabel: "Watch interviews",
        },
      ],
    },
    events: {
      navigationLabel: "Events",
      heading: "Field activations and donor engagement events",
      subheading: "Keep supporters close to the work with transparent event programming.",
      heroImage:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
      isVisible: true,
      sections: [
        {
          id: "events-sec-1",
          title: "On-site demonstrations",
          description: "Live demonstrations explain sensor diagnostics and infrastructure priorities.",
          image:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=900&auto=format&fit=crop",
          ctaLabel: "Reserve seats",
        },
      ],
    },
    blog: {
      navigationLabel: "Media",
      heading: "Updates, evidence, and transparent reporting",
      subheading: "Stay current on milestones, policy shifts, and deployment transparency.",
      heroImage:
        "https://images.unsplash.com/photo-1504711331083-9c895941bf81?q=80&w=1200&auto=format&fit=crop",
      isVisible: true,
      sections: [
        {
          id: "blog-sec-1",
          title: "Monthly impact memo",
          description: "A concise operations memo for supporters, partners, and compliance teams.",
          image:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=900&auto=format&fit=crop",
          ctaLabel: "Read this month",
        },
      ],
    },
    partners: {
      navigationLabel: "Partners",
      heading: "Strategic partners that scale delivery",
      subheading: "Tiered partnerships with clear commitments, benefits, and public recognition.",
      heroImage:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
      isVisible: true,
      sections: [
        {
          id: "partners-sec-1",
          title: "Mention-ready partner wall",
          description: "Spotlight trusted partners with narrative mentions tied to outcomes.",
          image:
            "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=900&auto=format&fit=crop",
          ctaLabel: "Meet current partners",
        },
      ],
    },
  },
};
