
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

import { Button } from './Button';
import { Badge } from './Badge';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from './Card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableRow, 
  TableHead, 
  TableCell 
} from './Table';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from './Tabs';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Label } from './Label';
import { Switch } from './Switch';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from './Select';
import { cn } from '../utils';

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

  const stats = {
    totalRaised: config.raised,
    totalDonors: config.donations.length || 1, // Avoid division by zero
  };

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
          <Button variant="outline" className="px-5 py-2.5 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest shadow-sm">
            <Download size={14} /> Audit Trail
          </Button>
          <Button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-black transition uppercase tracking-widest active:scale-95">
            <Plus size={14} /> Provision Record
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-white border-b border-slate-200 px-8 flex overflow-x-auto no-scrollbar shrink-0 h-auto p-0 border-none">
          {[
            { id: 'overview', label: 'Stats', icon: <TrendingUp size={16} /> },
            { id: 'stories', label: 'Stories', icon: <Heart size={16} /> },
            { id: 'donations', label: 'Ledger', icon: <DollarSign size={16} /> },
            { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
            { id: 'blogs', label: 'News', icon: <BookOpen size={16} /> },
            { id: 'certificates', label: 'Reports', icon: <ShieldCheck size={16} /> },
            { id: 'settings', label: 'Configs', icon: <Settings size={16} /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative shrink-0 data-[state=active]:text-indigo-600 text-slate-400 hover:text-slate-600 shadow-none rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 custom-scrollbar">
          <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 focus-visible:outline-none">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Raised', value: `$${stats.totalRaised.toLocaleString()}`, trend: '+12.5%', icon: <DollarSign size={20} />, color: 'bg-indigo-500' },
                { label: 'Total Donors', value: stats.totalDonors.toLocaleString(), trend: '+8.2%', icon: <Users size={20} />, color: 'bg-emerald-500' },
                { label: 'Avg Donation', value: `$${Math.round(stats.totalRaised / stats.totalDonors)}`, trend: '+2.4%', icon: <TrendingUp size={20} />, color: 'bg-amber-500' },
                { label: 'Click Rate', value: '3.2%', trend: '-1.1%', icon: <MousePointer2 size={20} />, color: 'bg-rose-500' },
              ].map((stat, i) => (
                <Card key={i} className="p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-transform group-hover:scale-110",
                      stat.color.replace('bg-', 'bg-').replace('-500', '-500/10'),
                      stat.color.replace('bg-', 'text-')
                    )}>
                      {stat.icon}
                    </div>
                    <Badge 
                      variant={stat.trend.startsWith('+') ? 'default' : 'destructive'} 
                      className={cn(
                        "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium inline-flex items-center justify-center w-fit",
                        stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      )}
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 rounded-3xl border border-slate-200 shadow-sm">
                <CardHeader className="p-0 flex flex-row justify-between items-center mb-8">
                  <div>
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Donation Velocity</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">7-Day Transaction Volume</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="px-3 py-1.5 h-auto text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition border-none">DAILY</Button>
                    <Button className="px-3 py-1.5 h-auto text-[10px] font-bold bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100">WEEKLY</Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 h-[19rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="donations" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="p-8 rounded-3xl border border-slate-200 shadow-sm">
                <CardHeader className="p-0 flex flex-row justify-between items-center mb-8">
                  <div>
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Reach Analysis</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Visitor Impact</CardDescription>
                  </div>
                  <Button variant="outline" className="px-4 py-2 h-auto text-[10px] font-black uppercase tracking-widest border-slate-200">
                    Full Export <ChevronRight size={14} />
                  </Button>
                </CardHeader>
                <CardContent className="p-0 h-[19rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorVisits2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stories" className="mt-0 space-y-8 animate-in fade-in duration-500 focus-visible:outline-none">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Impact Narratives</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect donors with ground-level impact.</p>
              </div>
              <Button 
                onClick={() => onUpdate({ beneficiaryStories: [{ id: `s-${Date.now()}`, name: 'Subject Name', bio: 'Describe impact context...', goal: 1000, raised: 0, image: 'https://picsum.photos/400/400' }, ...config.beneficiaryStories] })}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition"
              >
                <Plus size={16} /> Add Story
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.beneficiaryStories.map(story => (
                <Card key={story.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl group relative overflow-visible">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdate({ beneficiaryStories: config.beneficiaryStories.filter(s => s.id !== story.id) })}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 h-auto w-auto"
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="flex items-center gap-6 mb-6">
                    <img src={story.image} alt={story.name} className="size-20 rounded-[1.5rem] object-cover" />
                    <Input 
                      type="text" 
                      value={story.name} 
                      onChange={(e) => onUpdate({ beneficiaryStories: config.beneficiaryStories.map(s => s.id === story.id ? {...s, name: e.target.value} : s) })}
                      className="flex-1 bg-transparent border-none p-0 text-xl font-black text-slate-900 focus-visible:ring-0 shadow-none h-auto" 
                    />
                  </div>
                  <Textarea 
                    value={story.bio} 
                    onChange={(e) => onUpdate({ beneficiaryStories: config.beneficiaryStories.map(s => s.id === story.id ? {...s, bio: e.target.value} : s) })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs italic font-medium text-slate-500 resize-none h-24 mb-6 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    placeholder="Impact narrative..."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</Label>
                      <span className="text-sm font-black text-slate-900">${story.goal}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Raised</Label>
                      <span className="text-sm font-black text-slate-900">${story.raised}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="donations" className="mt-0 space-y-8 animate-in fade-in duration-500 focus-visible:outline-none">
            <Card className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 gap-4">
                <div className="relative group w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                  <Input 
                    type="text" 
                    placeholder="Search by donor name..." 
                    className="pl-12 pr-4 h-14 bg-white border-slate-200 rounded-xl text-sm font-medium w-full shadow-sm focus-visible:ring-4 focus-visible:ring-indigo-500/10 transition" 
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2 px-6 py-3 h-auto bg-white border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shrink-0">
                  <Download size={16} /> Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ledger Ref</TableHead>
                    <TableHead className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</TableHead>
                    <TableHead className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gift Value</TableHead>
                    <TableHead className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</TableHead>
                    <TableHead className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.donations.map(tx => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/50 transition border-slate-100">
                      <TableCell className="px-10 py-8 font-mono text-[10px] font-black text-slate-300 uppercase">{tx.id}</TableCell>
                      <TableCell className="px-10 py-8 font-black text-slate-900">{tx.donorName}</TableCell>
                      <TableCell className="px-10 py-8 font-black text-indigo-600 text-lg">${tx.amount}</TableCell>
                      <TableCell className="px-10 py-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell className="px-10 py-8 text-right">
                        {tx.certificateGenerated ? (
                          <Badge variant="secondary" className="text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-50">Verified</Badge>
                        ) : (
                          <Button variant="link" className="text-indigo-600 font-black text-[10px] uppercase underline tracking-widest p-0 h-auto">Issue PDF</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-0 space-y-10 animate-in fade-in duration-500 focus-visible:outline-none">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Engagement Protocol</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global strategy for donor engagement events.</p>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={handleAiEvent} 
                  disabled={isGenerating === 'event'} 
                  className="flex items-center gap-2 px-8 py-3 h-auto bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition shadow-sm"
                >
                  {isGenerating === 'event' ? <Sparkles size={16} className="animate-spin"/> : <Wand2 size={16} />} AI Generate
                </Button>
                <Button 
                  onClick={() => onUpdate({ events: [{ id: `e-${Date.now()}`, title: 'New Gala Event', date: new Date().toISOString().split('T')[0], venue: 'Main Hall', linkedCampaignId: config.id }, ...config.events] })} 
                  className="flex items-center gap-2 px-8 py-3 h-auto bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition"
                >
                  <Plus size={16} /> Create Event
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.events.map(event => (
                <Card key={event.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl flex flex-col group relative overflow-visible">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdate({ events: config.events.filter(e => e.id !== event.id) })}
                    className="absolute top-8 right-8 p-2 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 h-auto w-auto"
                  >
                    <Trash2 size={20} />
                  </Button>
                  <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem] w-fit mb-8 shadow-inner">
                    <Calendar size={32} />
                  </div>
                  <Input 
                    type="text" 
                    value={event.title} 
                    onChange={(e) => onUpdate({ events: config.events.map(ev => ev.id === event.id ? {...ev, title: e.target.value} : ev) })}
                    className="text-2xl font-black text-slate-900 mb-2 tracking-tight bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto" 
                  />
                  <div className="flex items-center gap-2 text-rose-400 mb-10">
                    <MapPin size={14} />
                    <Input 
                      type="text" 
                      value={event.venue} 
                      onChange={(e) => onUpdate({ events: config.events.map(ev => ev.id === event.id ? {...ev, venue: e.target.value} : ev) })}
                      className="bg-transparent border-none p-0 text-[10px] text-slate-400 font-black uppercase tracking-widest focus-visible:ring-0 shadow-none h-auto w-full" 
                    />
                  </div>
                  <div className="mt-auto flex justify-between items-center pt-8 border-t border-slate-50">
                    <Input 
                      type="date" 
                      value={event.date.split('T')[0]} 
                      onChange={(e) => onUpdate({ events: config.events.map(ev => ev.id === event.id ? {...ev, date: e.target.value} : ev) })}
                      className="bg-transparent border-none p-0 text-sm font-black text-slate-900 focus-visible:ring-0 shadow-none w-auto h-auto" 
                    />
                    <Button variant="ghost" className="px-6 py-2 h-auto bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition">Settings</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blogs" className="mt-0 space-y-10 animate-in fade-in duration-500 focus-visible:outline-none">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Press & Newsroom</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage your organization's public narrative.</p>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={handleAiBlog} 
                  disabled={isGenerating === 'blog'} 
                  className="flex items-center gap-2 px-8 py-3 h-auto bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition shadow-sm"
                >
                  {isGenerating === 'blog' ? <Sparkles size={16} className="animate-spin"/> : <Newspaper size={16} />} AI Draft
                </Button>
                <Button 
                  onClick={() => onUpdate({ blogPosts: [{ id: `b-${Date.now()}`, title: 'New Media Update', excerpt: 'Brief intro...', content: 'Full report...', author: 'Admin', date: new Date().toLocaleDateString() }, ...config.blogPosts] })} 
                  className="flex items-center gap-2 px-8 py-3 h-auto bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition"
                >
                  <Plus size={16} /> New Article
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {config.blogPosts.map(post => (
                <Card key={post.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row gap-8 items-center group relative overflow-visible">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdate({ blogPosts: config.blogPosts.filter(b => b.id !== post.id) })}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 h-auto w-auto"
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="w-full md:w-32 h-32 rounded-[1.5rem] bg-slate-50 shrink-0 overflow-hidden relative">
                    {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={32}/></div>}
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{post.date} &bull; {post.author}</span>
                    <Input 
                      type="text" 
                      value={post.title} 
                      onChange={(e) => onUpdate({ blogPosts: config.blogPosts.map(b => b.id === post.id ? {...b, title: e.target.value} : b) })}
                      className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 focus-visible:ring-0 shadow-none mb-3 h-auto" 
                    />
                    <Textarea 
                      value={post.excerpt} 
                      onChange={(e) => onUpdate({ blogPosts: config.blogPosts.map(b => b.id === post.id ? {...b, excerpt: e.target.value} : b) })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] font-medium text-slate-500 resize-none h-16 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      placeholder="Article excerpt..."
                    />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="mt-0 animate-in fade-in duration-500 focus-visible:outline-none">
            <Card className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl p-20">
              <div className="max-w-4xl mx-auto text-center">
                <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner ring-1 ring-emerald-100 border border-emerald-100">
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
                        <Badge variant="secondary" className="text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-50">Enforced</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-10 bg-indigo-600 text-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] flex flex-col justify-between">
                    <div>
                      <h4 className="font-black mb-4 uppercase text-[10px] tracking-[0.3em] opacity-80">Audit Export</h4>
                      <p className="text-base font-medium mb-8 opacity-90 leading-relaxed">Archive all financial receipts and KYC records for the current fiscal period.</p>
                    </div>
                    <Button variant="ghost" className="w-full py-5 h-auto bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition shadow-2xl active:scale-95">Batch Export Repository</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-0 space-y-8 animate-in fade-in duration-500 focus-visible:outline-none">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Platform Configuration</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adjust your fundraiser's global parameters.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                <Label htmlFor="campaign-active" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol Active</Label>
                <Switch 
                  id="campaign-active"
                  checked={config.active} 
                  onCheckedChange={(checked) => onUpdate({ active: checked })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <CardHeader className="p-0 mb-8 pb-6 border-b border-slate-50">
                  <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Identity & Branding</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core organizational identification.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization Name</Label>
                    <Input 
                      value={config.tenantName} 
                      onChange={(e) => onUpdate({ tenantName: e.target.value })}
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-indigo-500/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Header</Label>
                    <Input 
                      value={config.title} 
                      onChange={(e) => onUpdate({ title: e.target.value })}
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-indigo-500/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Color</Label>
                      <div className="flex gap-3">
                        <div className="size-12 rounded-xl border border-slate-200 shrink-0 shadow-inner" style={{ backgroundColor: config.primaryColor }} />
                        <Input 
                          value={config.primaryColor} 
                          onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                          className="h-12 bg-slate-50 border-slate-200 rounded-xl font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tier Profile</Label>
                      <Select 
                        value={config.subscriptionPlan} 
                        onValueChange={(v: any) => onUpdate({ subscriptionPlan: v })}
                      >
                        <SelectTrigger className="h-12 w-full bg-slate-50 border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                          <SelectItem value="Starter" className="text-xs font-bold uppercase tracking-widest">Starter</SelectItem>
                          <SelectItem value="Pro" className="text-xs font-bold uppercase tracking-widest text-indigo-600">Pro</SelectItem>
                          <SelectItem value="Enterprise" className="text-xs font-bold uppercase tracking-widest text-emerald-600">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <CardHeader className="p-0 mb-8 pb-6 border-b border-slate-50">
                  <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Economic Directives</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial goals and terminology mapping.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Fundraising Goal ($)</Label>
                    <Input 
                      type="number"
                      value={config.goal} 
                      onChange={(e) => onUpdate({ goal: Number(e.target.value) })}
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl font-black text-lg focus-visible:ring-indigo-500/10"
                    />
                  </div>
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Semantic Overrides</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Transaction Label</Label>
                        <Input 
                          value={config.terminology.donation} 
                          onChange={(e) => onUpdate({ terminology: { ...config.terminology, donation: e.target.value } })}
                          className="h-10 bg-slate-50 border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Contributor Label</Label>
                        <Input 
                          value={config.terminology.donor} 
                          onChange={(e) => onUpdate({ terminology: { ...config.terminology, donor: e.target.value } })}
                          className="h-10 bg-slate-50 border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-0 mt-8">
                  <Button variant="outline" className="w-full py-4 h-auto rounded-xl border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition">
                    Reset to Factory Defaults
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;
