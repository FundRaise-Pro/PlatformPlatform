
import React, { useState } from 'react';
import { FundraiserConfig, Donation, FundraiserEvent, BlogPost, BeneficiaryStory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, Users, DollarSign, MousePointer2, Calendar, 
  Search, Download, BookOpen, MapPin, 
  Settings, ChevronRight, Layers, Plus, ShieldCheck, Edit3, Trash2, Heart,
  Sparkles, Wand2, Newspaper, Image as ImageIcon
} from 'lucide-react';
import { generateEventContent, generateBlogPost, generateCampaignStory } from '../services/geminiService';

interface DashboardProps {
  config: FundraiserConfig;
  onUpdate: (updates: Partial<FundraiserConfig>) => void;
}

const analyticsData = [
  { date: 'Mon', donations: 120, visits: 800 },
  { date: 'Tue', donations: 300, visits: 1200 },
  { date: 'Wed', donations: 450, visits: 1500 },
  { date: 'Thu', donations: 400, visits: 1100 },
  { date: 'Fri', donations: 900, visits: 2400 },
  { date: 'Sat', donations: 1200, visits: 3100 },
  { date: 'Sun', donations: 1540, visits: 3800 },
];

const Dashboard: React.FC<DashboardProps> = ({ config, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'donations' | 'events' | 'blogs' | 'certificates' | 'settings'>('overview');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleAiEvent = async () => {
    setIsGenerating('event');
    try {
      const data = await generateEventContent(config.title);
      const newEvent: FundraiserEvent = {
        id: `e-${Date.now()}`,
        title: data.title,
        date: new Date().toISOString().split('T')[0],
        venue: data.venue,
        linkedCampaignId: config.id,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
      };
      onUpdate({ events: [newEvent, ...config.events] });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleAiBlog = async () => {
    setIsGenerating('blog');
    try {
      const data = await generateBlogPost(config.title);
      const newPost: BlogPost = {
        id: `b-${Date.now()}`,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: 'Staff Writer',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800'
      };
      onUpdate({ blogPosts: [newPost, ...config.blogPosts] });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{config.tenantName} Command Hub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Content Manager
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition uppercase tracking-widest shadow-sm">
            <Download size={14} /> Audit Trail
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-black transition uppercase tracking-widest active:scale-95">
            <Plus size={14} /> Provision Record
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-8 flex overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'overview', label: 'Stats', icon: <TrendingUp size={16} /> },
          { id: 'stories', label: 'Stories', icon: <Heart size={16} /> },
          { id: 'donations', label: 'Ledger', icon: <DollarSign size={16} /> },
          { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
          { id: 'blogs', label: 'News', icon: <BookOpen size={16} /> },
          { id: 'certificates', label: 'Compliance', icon: <ShieldCheck size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600 bg-indigo-50/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.3)]" />}
          </button>
        ))}
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatItem label="Total Volume" value={`$${config.raised.toLocaleString()}`} trend="+14%" icon={<DollarSign />} />
              <StatItem label="Impact Assets" value={config.beneficiaryStories.length.toString()} icon={<Heart />} />
              <StatItem label="News Reach" value="12.4k" trend="+2k" icon={<MousePointer2 />} />
              <StatItem label="Tax Verified" value="Secure" icon={<ShieldCheck />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Donation Velocity</h3>
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Real-time Metrics</span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                      <YAxis hide />
                      <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 900}} />
                      <Area type="monotone" dataKey="donations" stroke="#4f46e5" strokeWidth={5} fill="url(#areaGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-10">Recent Actions</h3>
                <div className="space-y-6">
                  {config.donations.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400">{d.donorName[0]}</div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-900">{d.donorName}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${d.amount} GIFT</div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300">NOW</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Impact Narratives</h3>
                <button onClick={() => onUpdate({ beneficiaryStories: [{ id: `s-${Date.now()}`, name: 'Subject Name', bio: 'Describe impact context...', goal: 1000, raised: 0, image: 'https://picsum.photos/400/400' }, ...config.beneficiaryStories] })} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition">
                  <Plus size={16} /> Add Story
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {config.beneficiaryStories.map(story => (
                  <div key={story.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl group relative">
                    <button 
                      onClick={() => onUpdate({ beneficiaryStories: config.beneficiaryStories.filter(s => s.id !== story.id) })}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-6 mb-6">
                       <img src={story.image} className="w-20 h-20 rounded-[1.5rem] object-cover" />
                       <input 
                         type="text" 
                         value={story.name} 
                         onChange={(e) => onUpdate({ beneficiaryStories: config.beneficiaryStories.map(s => s.id === story.id ? {...s, name: e.target.value} : s) })}
                         className="flex-1 bg-transparent border-none p-0 text-xl font-black text-slate-900 focus:ring-0 outline-none" 
                       />
                    </div>
                    <textarea 
                      value={story.bio} 
                      onChange={(e) => onUpdate({ beneficiaryStories: config.beneficiaryStories.map(s => s.id === story.id ? {...s, bio: e.target.value} : s) })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs italic font-medium text-slate-500 resize-none h-24 mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Impact narrative..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</span>
                          <span className="text-sm font-black text-slate-900">${story.goal}</span>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Raised</span>
                          <span className="text-sm font-black text-slate-900">${story.raised}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
             <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <div className="relative group w-full max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input type="text" placeholder="Search by donor name..." className="pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold w-full outline-none focus:ring-4 focus:ring-indigo-500/10 transition shadow-sm" />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition">
                  <Download size={16} /> Export CSV
                </button>
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-8">Ledger Ref</th>
                      <th className="px-10 py-8">Donor</th>
                      <th className="px-10 py-8">Gift Value</th>
                      <th className="px-10 py-8">Timestamp</th>
                      <th className="px-10 py-8 text-right">Certificate</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {config.donations.map(tx => (
                     <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-10 py-8 font-mono text-[10px] font-black text-slate-300 uppercase">{tx.id}</td>
                        <td className="px-10 py-8 font-black text-slate-900">{tx.donorName}</td>
                        <td className="px-10 py-8 font-black text-indigo-600 text-lg">${tx.amount}</td>
                        <td className="px-10 py-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="px-10 py-8 text-right">
                           {tx.certificateGenerated ? <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">Verified</span> : <button className="text-indigo-600 font-black text-[10px] uppercase underline tracking-widest">Issue PDF</button>}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Engagement Protocol</h3>
                <div className="flex gap-4">
                  <button onClick={handleAiEvent} disabled={isGenerating === 'event'} className="flex items-center gap-2 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition shadow-sm">
                    {isGenerating === 'event' ? <Sparkles size={16} className="animate-spin"/> : <Wand2 size={16} />} AI Generate
                  </button>
                  <button onClick={() => onUpdate({ events: [{ id: `e-${Date.now()}`, title: 'New Gala Event', date: new Date().toISOString().split('T')[0], venue: 'Main Hall', linkedCampaignId: config.id }, ...config.events] })} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition">
                    <Plus size={16} /> Create Event
                  </button>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {config.events.map(event => (
                  <div key={event.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl flex flex-col group relative">
                     <button 
                        onClick={() => onUpdate({ events: config.events.filter(e => e.id !== event.id) })}
                        className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 size={20} />
                     </button>
                     <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem] w-fit mb-8 shadow-inner">
                        <Calendar size={32} />
                     </div>
                     <input 
                       type="text" 
                       value={event.title} 
                       onChange={(e) => onUpdate({ events: config.events.map(ev => ev.id === event.id ? {...ev, title: e.target.value} : ev) })}
                       className="text-2xl font-black text-slate-900 mb-2 tracking-tight bg-transparent border-none p-0 focus:ring-0 outline-none" 
                     />
                     <div className="flex items-center gap-2 text-rose-400 mb-10">
                        <MapPin size={14} />
                        <input 
                           type="text" 
                           value={event.venue} 
                           onChange={(e) => onUpdate({ events: config.events.map(ev => ev.id === event.id ? {...ev, venue: e.target.value} : ev) })}
                           className="bg-transparent border-none p-0 text-[10px] text-slate-400 font-black uppercase tracking-widest focus:ring-0 outline-none w-full" 
                        />
                     </div>
                     <div className="mt-auto flex justify-between items-center pt-8 border-t border-slate-50">
                        <input 
                           type="date" 
                           value={event.date.split('T')[0]} 
                           onChange={(e) => onUpdate({ events: config.events.map(ev => ev.id === event.id ? {...ev, date: e.target.value} : ev) })}
                           className="bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 outline-none" 
                        />
                        <button className="px-6 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition">Settings</button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Press & Newsroom</h3>
                <div className="flex gap-4">
                  <button onClick={handleAiBlog} disabled={isGenerating === 'blog'} className="flex items-center gap-2 px-8 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition shadow-sm">
                    {isGenerating === 'blog' ? <Sparkles size={16} className="animate-spin"/> : <Newspaper size={16} />} AI Draft
                  </button>
                  <button onClick={() => onUpdate({ blogPosts: [{ id: `b-${Date.now()}`, title: 'New Media Update', excerpt: 'Brief intro...', content: 'Full report...', author: 'Admin', date: new Date().toLocaleDateString() }, ...config.blogPosts] })} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition">
                    <Plus size={16} /> New Article
                  </button>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {config.blogPosts.map(post => (
                  <div key={post.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row gap-8 items-center group relative">
                    <button 
                      onClick={() => onUpdate({ blogPosts: config.blogPosts.filter(b => b.id !== post.id) })}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="w-full md:w-32 h-32 rounded-[1.5rem] bg-slate-50 shrink-0 overflow-hidden relative">
                       {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={32}/></div>}
                    </div>
                    <div className="flex-1">
                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{post.date} &bull; {post.author}</span>
                       <input 
                         type="text" 
                         value={post.title} 
                         onChange={(e) => onUpdate({ blogPosts: config.blogPosts.map(b => b.id === post.id ? {...b, title: e.target.value} : b) })}
                         className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 focus:ring-0 outline-none mb-3" 
                       />
                       <textarea 
                         value={post.excerpt} 
                         onChange={(e) => onUpdate({ blogPosts: config.blogPosts.map(b => b.id === post.id ? {...b, excerpt: e.target.value} : b) })}
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] font-medium text-slate-500 resize-none h-16 outline-none focus:ring-2 focus:ring-indigo-500"
                         placeholder="Article excerpt..."
                       />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl p-20 animate-in fade-in duration-500">
             <div className="max-w-4xl mx-auto text-center">
                <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner ring-1 ring-emerald-100">
                   <ShieldCheck size={56} />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-6 uppercase tracking-tighter">S18A Compliance Engine</h3>
                <p className="text-slate-400 font-medium text-xl mb-16 italic leading-relaxed max-w-2xl mx-auto">
                   Automated Section 18A PDF generation is live. All financial flows are mapped to tax-compliant beneficiary records and donor receipts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                   <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner">
                      <h4 className="font-black text-slate-400 mb-6 uppercase text-[10px] tracking-[0.3em]">Protocol Configuration</h4>
                      <div className="space-y-6">
                         <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <span className="text-sm font-bold text-slate-500">Auto-Dispatch Threshold</span>
                            <span className="font-black text-slate-900">$20.00</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Identity Verification</span>
                            <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">Enforced</span>
                         </div>
                      </div>
                   </div>
                   <div className="p-10 bg-indigo-600 text-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] flex flex-col justify-between">
                      <div>
                        <h4 className="font-black mb-4 uppercase text-[10px] tracking-[0.3em] opacity-80">Audit Export</h4>
                        <p className="text-base font-medium mb-8 opacity-90 leading-relaxed">Archive all financial receipts and KYC records for the current fiscal period.</p>
                      </div>
                      <button className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition shadow-2xl active:scale-95">Batch Export Repository</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, trend, icon }: { label: string; value: string; trend?: string; icon: React.ReactNode }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 hover:-translate-y-2 transition duration-500 group">
    <div className="flex justify-between items-start mb-8">
      <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition duration-500">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 }) : icon}
      </div>
      {trend && (
        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 border border-emerald-100 shadow-sm">
          <TrendingUp size={14} /> {trend}
        </span>
      )}
    </div>
    <span className="block text-5xl font-black text-slate-900 tracking-tighter mb-2">{value}</span>
    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{label}</span>
  </div>
);

export default Dashboard;
