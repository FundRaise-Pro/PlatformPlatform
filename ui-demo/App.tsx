
import React, { useState } from 'react';
import { FundraiserConfig, Donation, BeneficiaryStory, FundraiserEvent, BlogPost, Application, Branch, Partner, PartnerTier } from './types';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Dashboard from './components/Dashboard';
import { Layout, Eye, PieChart, Settings, Share2, Rocket, UserCircle, Download, Globe, Layers, Building2, Users, Award, Mail, Briefcase, Plus, Search, X, Camera } from 'lucide-react';

const INITIAL_CONFIG: FundraiserConfig = {
  id: 'tenant-001',
  tenantName: 'Thrive Africa',
  title: 'Urban Water Resilience 2024',
  subtitle: 'Deploying smart grid water sensors across high-density housing projects.',
  story: 'Water scarcity is not just a seasonal crisis; it is a systemic challenge. By integrating IoT sensors into existing municipal pipes, we can identify leaks in seconds rather than months. \n\nThis project aims to deploy 500 sensors across the Guguletu district, saving an estimated 1.2 million liters per year. Your contribution directly funds the hardware and local installer training.',
  goal: 45000,
  raised: 28450,
  primaryColor: '#6366f1',
  heroImage: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1200&h=675',
  active: true,
  terminology: {
    donation: 'Gift',
    donor: 'Sponsor',
    campaign: 'Mission',
    goal: 'Target'
  },
  subscriptionPlan: 'Pro',
  branches: [
    { id: 'b1', name: 'Cape Town HQ', location: 'Waterfront, CP' },
    { id: 'b2', name: 'Joburg Hub', location: 'Sandton, JHB' }
  ],
  partnerTiers: [
    { id: 'pt-1', name: 'Bronze Partner', minCommitment: 5000, benefits: ['Logo on website', 'Annual impact report'], color: '#cd7f32' },
    { id: 'pt-2', name: 'Silver Partner', minCommitment: 15000, benefits: ['Logo on website', 'Quarterly field visits'], color: '#c0c0c0' },
    { id: 'pt-3', name: 'Gold Partner', minCommitment: 50000, benefits: ['Premium logo placement', 'Event keynote invite'], color: '#ffd700' }
  ],
  partners: [
    { id: 'p-1', name: 'EcoFlow Solutions', contactPerson: 'Alice Rivers', email: 'alice@ecoflow.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/EcoFlow_Logo.svg', tierId: 'pt-2', status: 'active', totalContributed: 18500, joinedDate: '2023-01-15' },
    { id: 'p-2', name: 'Urban Grid Corp', contactPerson: 'Mark Sandton', email: 'mark@urbangrid.co.za', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Grid_Logo.svg', tierId: 'pt-1', status: 'active', totalContributed: 6000, joinedDate: '2024-02-10' }
  ],
  beneficiaryStories: [
    { id: 's1', name: 'The Mthembu Family', bio: 'Living with intermittent supply for 3 years, the sensor program restored consistent access for their household.', goal: 1200, raised: 1100, image: 'https://picsum.photos/seed/mthembu/600/600' },
    { id: 's2', name: 'Guguletu Primary', bio: 'Protecting school facilities from major plumbing leaks through advanced real-time detection.', goal: 2500, raised: 800, image: 'https://picsum.photos/seed/creche/600/600' },
    { id: 's3', name: 'Sizwe’s Micro-Garden', bio: 'Utilizing saved greywater for sustainable urban farming in the heart of the community.', goal: 3000, raised: 2100, image: 'https://picsum.photos/seed/garden/600/600' }
  ],
  events: [
    { id: 'e1', title: 'Water Walk Gala 2024', date: '2024-11-12T18:00:00Z', venue: 'V&A Convention Centre', linkedCampaignId: 'tenant-001' },
    { id: 'e2', title: 'Community Hackathon', date: '2024-12-05T09:00:00Z', venue: 'Innovation Hub Guguletu', linkedCampaignId: 'tenant-001' },
    { id: 'e3', title: 'Impact Stakeholder Dinner', date: '2025-01-15T19:30:00Z', venue: 'The Silo Hotel', linkedCampaignId: 'tenant-001' }
  ],
  blogPosts: [
    { id: 'b1', title: 'Scaling Smart Sensors in Q4', excerpt: 'How ultrasonic waves are helping us find water leaks without digging.', content: 'Technical deep dive into the IoT stack...', date: 'Oct 28, 2024', author: 'Dr. Sarah Jones', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&h=300&fit=crop' },
    { id: 'b2', title: 'First 100 Households Secured', excerpt: 'Milestone reached: Our initial pilot project is now fully operational.', content: 'Detailed report on deployment...', date: 'Oct 15, 2024', author: 'Team Lead', image: 'https://images.unsplash.com/photo-1544333346-64e4fe1fefe0?q=80&w=400&h=300&fit=crop' },
    { id: 'b3', title: 'Why Data Matters for Water', excerpt: 'Transparent metrics are changing how we fund infrastructure.', content: 'An editorial on transparency...', date: 'Oct 05, 2024', author: 'Thrive Editor', image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=400&h=300&fit=crop' }
  ],
  applications: [
    { id: 'a1', name: 'Khayelitsha Youth Club', status: 'approved', date: '2024-10-20', description: 'Requesting sensor installation for clubhouse' }
  ],
  donations: [
    { id: 'tx-101', donorName: 'Sarah Miller', amount: 50, date: '2024-03-20', channel: 'direct', certificateGenerated: true },
    { id: 'tx-102', donorName: 'David Chen', amount: 100, date: '2024-03-21', channel: 'social', certificateGenerated: true },
    { id: 'tx-103', donorName: 'Mark Johnson', amount: 25, date: '2024-03-22', channel: 'qrCode', certificateGenerated: true },
    { id: 'tx-104', donorName: 'Emily Watson', amount: 500, date: '2024-03-23', channel: 'direct', certificateGenerated: true },
  ],
  tiers: [
    { id: '1', amount: 10, label: 'The Drop', description: 'Sensor maintenance for one week.' },
    { id: '2', amount: 50, label: 'The Stream', description: 'One residential sensor kit.' },
    { id: '3', amount: 250, label: 'The River', description: 'Technician apprenticeship for a month.' },
    { id: '4', amount: 1000, label: 'The Ocean', description: 'Solar-power backup for a district hub.' },
  ]
};

const App: React.FC = () => {
  const [config, setConfig] = useState<FundraiserConfig>(INITIAL_CONFIG);
  const [view, setView] = useState<'editor' | 'dashboard' | 'donor' | 'public'>('dashboard');
  const [showPreview, setShowPreview] = useState(true);
  const [crmSubTab, setCrmSubTab] = useState<'donors' | 'partners'>('donors');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    name: '',
    contactPerson: '',
    email: '',
    logo: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&h=200&auto=format&fit=crop',
    tierId: INITIAL_CONFIG.partnerTiers[0].id,
    status: 'active'
  });

  const handleDonate = (amount: number, name: string, tierId?: string) => {
    const newDonation: Donation = {
      id: `tx-${Math.random().toString(36).substr(2, 6)}`,
      donorName: name,
      amount,
      date: new Date().toISOString(),
      tierId,
      channel: 'direct',
      certificateGenerated: true
    };

    setConfig(prev => ({
      ...prev,
      raised: prev.raised + amount,
      donations: [...prev.donations, newDonation]
    }));
  };

  const updateConfig = (updates: Partial<FundraiserConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleOnboardPartner = () => {
    if (!newPartner.name || !newPartner.email) return;

    const partner: Partner = {
      id: `p-${Math.random().toString(36).substr(2, 6)}`,
      name: newPartner.name || '',
      contactPerson: newPartner.contactPerson || '',
      email: newPartner.email || '',
      logo: newPartner.logo || '',
      tierId: newPartner.tierId || config.partnerTiers[0].id,
      status: 'active',
      totalContributed: 0,
      joinedDate: new Date().toISOString(),
    };

    setConfig(prev => ({
      ...prev,
      partners: [...prev.partners, partner]
    }));

    setIsPartnerModalOpen(false);
    setNewPartner({
      name: '',
      contactPerson: '',
      email: '',
      logo: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&h=200&auto=format&fit=crop',
      tierId: config.partnerTiers[0].id,
      status: 'active'
    });
  };

  if (view === 'public') {
    return (
      <div className="h-screen w-full relative">
        <Preview config={config} onDonate={handleDonate} />
        <button 
          onClick={() => setView('dashboard')}
          className="fixed bottom-10 right-10 bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs shadow-2xl hover:scale-105 transition flex items-center gap-3 z-[9999] uppercase tracking-widest ring-4 ring-white/10"
        >
          <Layers size={18} /> Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100">
      <aside className="w-24 bg-slate-900 flex flex-col items-center py-10 gap-10 z-50 shadow-2xl shrink-0">
        <div className="text-white mb-6">
          <Rocket className="text-indigo-400" size={42} strokeWidth={3} />
        </div>
        
        <nav className="flex flex-col gap-8">
          <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<PieChart size={28} />} label="Command" />
          <NavItem active={view === 'editor'} onClick={() => setView('editor')} icon={<Layout size={28} />} label="Builder" />
          <NavItem active={view === 'donor'} onClick={() => setView('donor')} icon={<UserCircle size={28} />} label="CRM" />
        </nav>

        <div className="mt-auto flex flex-col gap-8">
          <button onClick={() => setView('public')} className="p-4 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all" title="Public Preview">
            <Globe size={28} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden cursor-pointer shadow-2xl">
            <img src="https://picsum.photos/100/100?seed=saasadmin" alt="Admin" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex overflow-hidden relative">
        {view === 'editor' && (
          <>
            <Editor config={config} onChange={setConfig} />
            <div className="flex-1 flex flex-col bg-slate-100/30">
              <div className="h-16 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live Preview
                  </div>
                </div>
                <button onClick={() => setShowPreview(!showPreview)} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-sm bg-slate-900 text-white">
                  <Eye size={16} className="inline mr-2" /> {showPreview ? 'Live View' : 'Blueprint'}
                </button>
              </div>
              <div className="flex-1 relative overflow-hidden bg-slate-100">
                {showPreview ? (
                  <div className="h-full transform scale-[0.96] origin-top p-6">
                    <div className="h-full rounded-[3.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200">
                      <Preview config={config} onDonate={handleDonate} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in duration-700">
                    <div className="w-32 h-32 bg-white rounded-[3rem] mb-10 flex items-center justify-center text-slate-200 shadow-2xl ring-1 ring-slate-100 rotate-12">
                      <Eye size={64} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">No-Code Builder</h3>
                    <p className="text-slate-400 max-w-md text-xl font-medium">Provisioning your fundraiser environment. All changes persist in real-time.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'dashboard' && <Dashboard config={config} onUpdate={updateConfig} />}
        
        {view === 'donor' && (
          <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
             <header className="bg-white border-b border-slate-200 px-12 py-8 flex justify-between items-end shrink-0">
                <div>
                  <span className="inline-block px-4 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 italic">CRM Management</span>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Impact Relations</h2>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setCrmSubTab('donors')} className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition ${crmSubTab === 'donors' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <Users size={16} className="inline mr-2" /> Supporters
                   </button>
                   <button onClick={() => setCrmSubTab('partners')} className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition ${crmSubTab === 'partners' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <Building2 size={16} className="inline mr-2" /> Partners
                   </button>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                         <span className="block text-5xl font-black text-slate-900 mb-2 tracking-tighter">${config.raised.toLocaleString()}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Giving</span>
                      </div>
                      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                         <span className="block text-5xl font-black text-slate-900 mb-2 tracking-tighter">{crmSubTab === 'donors' ? config.donations.length : config.partners.length}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active {crmSubTab === 'donors' ? 'Contributors' : 'Accounts'}</span>
                      </div>
                      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                         <span className="block text-5xl font-black text-emerald-500 mb-2 tracking-tighter">100%</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">S18A Compliant</span>
                      </div>
                   </div>

                   {crmSubTab === 'donors' ? (
                     <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                           <h3 className="text-xl font-black text-slate-900 uppercase">Constituent Database</h3>
                           <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input type="text" placeholder="Filter people..." className="pl-12 pr-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" />
                           </div>
                        </div>
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <th className="px-10 py-6">Supporter</th>
                                 <th className="px-10 py-6">Value</th>
                                 <th className="px-10 py-6">Last Active</th>
                                 <th className="px-10 py-6 text-right">Certificate</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {config.donations.filter(d => d.donorName !== 'Anonymous').map(d => (
                                <tr key={d.id} className="hover:bg-slate-50 transition">
                                   <td className="px-10 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">{d.donorName[0]}</div>
                                         <div className="font-black text-slate-900">{d.donorName}</div>
                                      </div>
                                   </td>
                                   <td className="px-10 py-6 font-black text-slate-900">${d.amount}</td>
                                   <td className="px-10 py-6 text-slate-500 text-sm font-medium">{new Date(d.date).toLocaleDateString()}</td>
                                   <td className="px-10 py-6 text-right">
                                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                         <Download size={12} /> Issued
                                      </button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                   ) : (
                     <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {config.partnerTiers.map(tier => (
                             <div key={tier.id} className="bg-white p-8 rounded-[3rem] border-t-8 shadow-xl" style={{ borderTopColor: tier.color }}>
                                <Award size={32} style={{ color: tier.color }} className="mb-4" />
                                <h4 className="text-xl font-black text-slate-900 mb-1">{tier.name}</h4>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter mb-6">${tier.minCommitment.toLocaleString()}+</p>
                                <div className="space-y-2">
                                   {tier.benefits.map((b, i) => (
                                     <div key={i} className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-slate-200" /> {b}
                                     </div>
                                   ))}
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                           <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                              <h3 className="text-xl font-black text-slate-900 uppercase">Strategic Accounts</h3>
                              <button 
                                onClick={() => setIsPartnerModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition"
                              >
                                 <Plus size={16} /> Onboard Partner
                              </button>
                           </div>
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="px-10 py-6">Partner Account</th>
                                    <th className="px-10 py-6">Tier Status</th>
                                    <th className="px-10 py-6">Life Value</th>
                                    <th className="px-10 py-6 text-right">Engagement</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {config.partners.map(p => (
                                   <tr key={p.id} className="hover:bg-slate-50 transition">
                                      <td className="px-10 py-6">
                                         <div className="flex items-center gap-4">
                                            <img src={p.logo} className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-2" alt={p.name} />
                                            <div>
                                               <div className="font-black text-slate-900">{p.name}</div>
                                               <div className="text-[10px] text-slate-400 font-bold uppercase">{p.email}</div>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-10 py-6">
                                         <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ color: config.partnerTiers.find(t => t.id === p.tierId)?.color, backgroundColor: config.partnerTiers.find(t => t.id === p.tierId)?.color + '15' }}>
                                            {config.partnerTiers.find(t => t.id === p.tierId)?.name}
                                         </span>
                                      </td>
                                      <td className="px-10 py-6 font-black text-slate-900">${p.totalContributed.toLocaleString()}</td>
                                      <td className="px-10 py-6 text-right">
                                         <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition shadow-sm">
                                            <Briefcase size={18} />
                                         </button>
                                      </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {isPartnerModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPartnerModalOpen(false)} />
                 <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                   <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                     <h3 className="text-2xl font-black text-slate-900 uppercase">Onboarding</h3>
                     <button onClick={() => setIsPartnerModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900 transition"><X size={24} /></button>
                   </div>
                   <div className="p-10 space-y-8">
                     <div className="flex gap-10">
                        <div className="shrink-0 space-y-4">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Mark</label>
                           <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 relative group overflow-hidden cursor-pointer">
                              <img src={newPartner.logo} className="w-full h-full object-contain p-4 group-hover:opacity-20 transition" alt="Logo" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition"><Camera size={24} /></div>
                           </div>
                        </div>
                        <div className="flex-1 space-y-6">
                           <input type="text" placeholder="Company Name" value={newPartner.name} onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-900" />
                           <input type="email" placeholder="Email" value={newPartner.email} onChange={(e) => setNewPartner({...newPartner, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-900" />
                        </div>
                     </div>
                     <button onClick={handleOnboardPartner} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl disabled:opacity-50" disabled={!newPartner.name || !newPartner.email}>Provision Account</button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`p-5 rounded-3xl transition-all relative group ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/50' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon}
    <span className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none translate-x-2 group-hover:translate-x-0">
      {label}
    </span>
  </button>
);

export default App;
