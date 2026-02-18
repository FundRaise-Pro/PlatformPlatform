
import React, { useState } from 'react';
import { FundraiserConfig, DonationTier, BeneficiaryStory, FundraiserEvent, BlogPost } from '../types';
import { 
  Heart, ShieldCheck, CheckCircle2, 
  Download, QrCode, Calendar, MapPin, BookOpen, ChevronRight,
  Award, Star, ArrowRight, User
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { Input } from './Input';
import { Label } from './Label';
import { Progress, ProgressTrack, ProgressIndicator } from './Progress';
import { cn } from '../utils';

interface PreviewProps {
  config: FundraiserConfig;
  onDonate?: (amount: number, name: string, tierId?: string) => void;
}

const Preview: React.FC<PreviewProps> = ({ config, onDonate }) => {
  const [step, setStep] = useState<'landing' | 'donate' | 'stories' | 'events' | 'blog' | 'partners' | 'success'>('landing');
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(null);
  const [donorName, setDonorName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const progressPercent = Math.min(100, (config.raised / config.goal) * 100);

  const handleStartDonate = (tier?: DonationTier) => {
    if (tier) setSelectedTier(tier);
    setStep('donate');
  };

  const handleFinalizeDonation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onDonate?.(selectedTier?.amount || 25, donorName || 'Anonymous', selectedTier?.id);
      setIsProcessing(false);
      setStep('success');
    }, 2000);
  };

  const renderNav = () => (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-10 py-5 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStep('landing')}>
        <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition duration-500">
           <Heart size={24} fill="currentColor" />
        </div>
        <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">{config.tenantName}</span>
      </div>
      <div className="flex items-center gap-8">
        <button onClick={() => setStep('stories')} className={cn("text-[10px] font-black uppercase tracking-widest transition", step === 'stories' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900')}>Stories</button>
        <button onClick={() => setStep('partners')} className={cn("text-[10px] font-black uppercase tracking-widest transition", step === 'partners' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900')}>Partners</button>
        <button onClick={() => setStep('blog')} className={cn("text-[10px] font-black uppercase tracking-widest transition", step === 'blog' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900')}>Media</button>
        <button onClick={() => setStep('events')} className={cn("text-[10px] font-black uppercase tracking-widest transition", step === 'events' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900')}>Events</button>
        <Button 
          onClick={() => handleStartDonate()}
          style={{ backgroundColor: config.primaryColor }}
          className="rounded-full px-8 text-[10px] uppercase font-black tracking-widest h-[var(--control-height)] active:bg-primary/70 cursor-pointer shadow-xl hover:-translate-y-0.5 transition"
        >
          {config.terminology.donation}
        </Button>
      </div>
    </nav>
  );

  if (step === 'success') {
    return (
      <div className="flex-1 h-full bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700 overflow-y-auto">
        <div className="size-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <CheckCircle2 size={56} className="animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Impact Logged</h2>
        <p className="text-slate-500 mb-10 max-w-lg font-medium italic">
          Your {config.terminology.donation.toLowerCase()} is being put to work immediately.
        </p>
        <Card className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 mb-10 text-left overflow-hidden shadow-lg">
           <Badge className="mb-4 bg-white border border-indigo-50 text-indigo-500 hover:bg-white">Tax Verified</Badge>
           <h3 className="text-xl font-black text-slate-900 mb-6">Section 18A Certificate</h3>
           <Button className="w-full h-14 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition shadow-sm active:bg-accent cursor-pointer">
              <Download size={16} className="inline mr-2" /> Get PDF Receipt
           </Button>
        </Card>
        <Button 
          variant="link" 
          onClick={() => setStep('landing')} 
          className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] hover:text-indigo-600 transition hover:no-underline active:bg-transparent cursor-pointer h-auto p-0"
        >
          Back to Hub
        </Button>
      </div>
    );
  }

  // Sub-pages
  if (step === 'stories') {
    return (
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
        {renderNav()}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/30">
           <div className="max-w-[75rem] mx-auto">
              <header className="mb-24 text-center">
                 <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">Community Stories</h2>
                 <p className="text-slate-400 text-xl font-medium max-w-[40rem] mx-auto italic">Real impact across 12 countries, powered by individual contributors.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {config.beneficiaryStories.map(story => (
                  <Card key={story.id} className="group overflow-hidden rounded-[3rem] border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white">
                    <div className="aspect-[16/10] overflow-hidden relative">
                       <img src={story.image} alt={story.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                       <div className="absolute top-6 left-6">
                         <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-0 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Impact Story</Badge>
                       </div>
                    </div>
                    <div className="p-10">
                       <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{story.name}</h3>
                       <p className="text-slate-500 font-medium mb-8 line-clamp-2">{story.bio}</p>
                       <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                          <Button variant="link" className="h-auto p-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:gap-3 transition-all hover:no-underline active:bg-transparent cursor-pointer">Read Full Story <ArrowRight size={14} /></Button>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">5 min read</span>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'events') {
    return (
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
        {renderNav()}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/10">
           <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Engagement Calendar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {config.events.map(event => (
                  <Card key={event.id} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl flex flex-col hover:border-indigo-400 transition group">
                     <div className="size-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner shrink-0">
                        <Calendar size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{event.title}</h3>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                        <MapPin size={14} className="text-rose-400" /> {event.venue}
                     </p>
                     <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center">
                        <div className="text-slate-900 font-black text-xl tracking-tighter">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        <Button className="h-[var(--control-height-sm)] px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:bg-primary/70 cursor-pointer">Register</Button>
                     </div>
                  </Card>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'blog') {
    return (
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
        {renderNav()}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/20">
           <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Media Hub</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 {config.blogPosts.map(post => (
                    <Card key={post.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 items-center group overflow-hidden">
                       <div className="size-48 rounded-[2.5rem] overflow-hidden shrink-0 shadow-lg bg-slate-100">
                          <img src={post.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 font-black tracking-widest uppercase" alt={post.title} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{post.date} &bull; {post.author}</span>
                          <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition truncate">{post.title}</h3>
                          <p className="text-slate-500 text-xs font-medium italic mb-6 line-clamp-2">"{post.excerpt}"</p>
                          <Button variant="link" className="h-auto p-0 flex items-center gap-2 text-slate-900 font-black text-[9px] uppercase tracking-[0.2em] border-b-2 border-slate-100 rounded-none hover:border-indigo-600 transition hover:no-underline active:bg-transparent cursor-pointer">
                             Read Article <ArrowRight size={14} />
                          </Button>
                       </div>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'partners') {
    return (
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
        {renderNav()}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
           <div className="max-w-[75rem] mx-auto">
              <header className="mb-24 text-center">
                 <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">Strategic Partners</h2>
                 <p className="text-slate-400 text-xl font-medium max-w-[40rem] mx-auto italic">Verified NPO compliance and high-impact CSR monitoring.</p>
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
                {config.partnerTiers.map(tier => (
                  <Card key={tier.id} className="p-12 bg-slate-50 rounded-[3rem] border-2 border-transparent hover:border-indigo-600 transition group shadow-lg">
                    <Award size={48} style={{ color: tier.color }} className="mb-8" />
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{tier.name}</h3>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter mb-10">${tier.minCommitment.toLocaleString()}+</p>
                    <div className="space-y-4 mb-12">
                       {tier.benefits.map((benefit, i) => (
                         <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                           <Star size={14} className="text-indigo-400" /> {benefit}
                         </div>
                       ))}
                    </div>
                    <Button className="w-full h-14 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 transition shadow-xl active:bg-primary/70 cursor-pointer">Inquire Partnership</Button>
                  </Card>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'donate') {
    return (
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
        {renderNav()}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/30">
          <div className="max-w-[40rem] mx-auto">
            <h2 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Your Contribution</h2>
            <Card className="p-8 rounded-[3rem] shadow-2xl border-slate-100 bg-white">
              <div className="mb-10">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Select Amount</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {config.donationTiers.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={cn(
                        "p-6 rounded-2xl border-2 transition-all text-left group",
                        selectedTier?.id === tier.id 
                          ? "border-indigo-600 bg-indigo-50" 
                          : "border-slate-100 hover:border-indigo-200"
                      )}
                    >
                      <span className={cn(
                        "block text-xl font-black tracking-tighter mb-1",
                        selectedTier?.id === tier.id ? "text-indigo-600" : "text-slate-900"
                      )}>${tier.amount}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{tier.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <Label htmlFor="donor-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Full Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-5" />
                  <Input 
                    id="donor-name"
                    placeholder="E.g. John Doe"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-indigo-600 focus:ring-0 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <Button 
                onClick={handleFinalizeDonation}
                disabled={isProcessing}
                style={{ backgroundColor: config.primaryColor }}
                className="w-full h-16 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-xl hover:-translate-y-0.5 transition active:bg-primary/70 cursor-pointer disabled:opacity-50 disabled:translate-y-0"
              >
                {isProcessing ? 'Verifying Gateway...' : `Initialize ${config.terminology.donation}`}
              </Button>
              
              <p className="mt-6 text-[9px] font-bold text-slate-300 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-emerald-400" /> Secure SSL Encryption &bull; PCI Compliant
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'landing') {
    return (
      <div className="flex-1 h-full flex flex-col bg-white overflow-hidden">
        {renderNav()}
        <div className="flex-1 overflow-y-auto custom-scrollbar selection:bg-indigo-100">
          <header className="relative pt-24 pb-32 px-10 max-w-7xl mx-auto flex flex-col items-center text-center">
             <Badge className="px-5 py-2 bg-indigo-50 border-indigo-100 text-indigo-600 mb-12 tracking-[0.3em] font-black hover:bg-indigo-50">Active {config.terminology.campaign}</Badge>
             <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-10 leading-[1.05] tracking-tighter max-w-5xl">{config.title}</h1>
             <p className="text-xl md:text-3xl text-slate-400 max-w-4xl mb-24 font-medium italic leading-relaxed">"{config.subtitle}"</p>
             <div className="w-full rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2)] aspect-video mb-24 bg-slate-100 relative group border-4 border-white">
                <img src={config.heroImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
             </div>
             <Card className="w-full max-w-5xl bg-white border-slate-100 shadow-[0_80px_120px_-30px_rgba(0,0,0,0.15)] rounded-[4rem] p-12 md:p-20 -mt-56 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-12">
                   <div className="text-center md:text-left">
                      <span className="block text-7xl font-black text-slate-900 tracking-tighter animate-pulse mb-2">${config.raised.toLocaleString()}</span>
                      <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Total Impact Proceeds</span>
                   </div>
                   <div className="md:text-right">
                      <span style={{ color: config.primaryColor }} className="block text-5xl font-black tracking-tighter">{progressPercent.toFixed(0)}%</span>
                      <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Goal Verification</span>
                   </div>
                </div>
                <Progress value={progressPercent} className="h-8 mb-20 shadow-inner ring-1 ring-slate-100 overflow-hidden">
                   <ProgressTrack className="bg-slate-50">
                      <ProgressIndicator 
                        style={{ backgroundColor: config.primaryColor }} 
                        className="transition-all duration-2000 ease-out shadow-lg" 
                      />
                   </ProgressTrack>
                </Progress>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-slate-50 pt-16">
                   <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{config.donations.length}</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{config.terminology.donor}s Joined</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter mb-2">100%</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">S18A Compliant</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{config.partners.length}</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sponsors Active</span>
                   </div>
                </div>
             </Card>
          </header>

          {/* AS REQUESTED: Stories placed ABOVE Partners */}
          <section className="bg-slate-50/50 py-32 px-10">
             <div className="max-w-6xl mx-auto flex flex-col items-center">
                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 mb-4 px-4 py-1 hover:bg-indigo-100 transition tracking-[0.3em]">The Impact</Badge>
                <h2 className="text-4xl font-black text-slate-900 mb-20 uppercase tracking-widest">Lives Impacted</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-20">
                  {config.beneficiaryStories.slice(0, 2).map(story => (
                    <Card key={story.id} className="rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row gap-10 items-center border border-slate-100 group hover:border-indigo-400 transition cursor-pointer bg-white overflow-hidden">
                       <img src={story.image} className="size-32 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition duration-1000 shadow-lg" alt={story.name} />
                       <div className="text-center lg:text-left">
                          <h4 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{story.name}</h4>
                          <p className="text-slate-500 font-medium italic leading-relaxed line-clamp-3">"{story.bio}"</p>
                       </div>
                    </Card>
                  ))}
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setStep('stories')} 
                  className="flex items-center gap-3 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] group transition hover:no-underline active:bg-transparent cursor-pointer h-auto p-0"
                >
                   Explore All Stories <ChevronRight size={18} className="group-hover:translate-x-2 transition" />
                </Button>
             </div>
          </section>

          <section className="py-32 px-10 border-y border-slate-100 bg-white">
             <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">Strategic Partners</h2>
                <p className="text-slate-400 text-lg font-medium mb-20 max-w-2xl mx-auto italic">Corporate entities leading the change in local sustainability.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                   {config.partners.slice(0, 4).map(p => (
                     <Card key={p.id} className="p-12 bg-slate-50 border border-slate-100 rounded-[3rem] flex flex-col items-center shadow-lg grayscale hover:grayscale-0 transition duration-700 overflow-hidden">
                        <img src={p.logo} className="h-10 w-auto mb-6 opacity-80" alt={p.name} />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p.name}</span>
                     </Card>
                   ))}
                </div>
                <Button onClick={() => setStep('partners')} className="mt-20 px-10 h-14 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl active:bg-primary/70 cursor-pointer">Join the Ecosystem</Button>
             </div>
          </section>

          {/* Media Hub Section */}
          <section className="py-32 px-10 bg-slate-900 text-white relative overflow-hidden">
             <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                   <div className="max-w-xl">
                      <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] block mb-4 italic">Press & Updates</span>
                      <h2 className="text-5xl font-black leading-tight tracking-tighter">Media Hub.</h2>
                   </div>
                   <Button onClick={() => setStep('blog')} className="px-8 h-12 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition active:bg-accent cursor-pointer">Explore Updates</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   {config.blogPosts.slice(0, 3).map(post => (
                      <Card key={post.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition group cursor-pointer overflow-hidden">
                         <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-2xl bg-slate-800">
                            <img src={post.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={post.title} />
                         </div>
                         <h4 className="text-xl font-black mb-3 tracking-tight text-white leading-tight">{post.title}</h4>
                         <p className="text-slate-400 text-xs font-medium italic line-clamp-2">"{post.excerpt}"</p>
                      </Card>
                   ))}
                </div>
             </div>
          </section>

          {/* Event Section */}
          <section className="py-32 px-10 bg-white">
             <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-black text-slate-900 mb-20 uppercase tracking-widest">Field Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                   {config.events.slice(0, 2).map(event => (
                      <Card key={event.id} className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 flex justify-between items-center text-left hover:border-indigo-500 transition cursor-pointer group shadow-lg overflow-hidden">
                         <div className="flex items-center gap-8 min-w-0">
                            <div className="size-16 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-black shadow-inner shrink-0">
                               <span className="text-xs uppercase leading-none">{new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                               <span className="text-2xl tracking-tighter">{new Date(event.date).toLocaleDateString(undefined, { day: 'numeric' })}</span>
                            </div>
                            <div className="min-w-0">
                               <h4 className="text-2xl font-black text-slate-900 mb-1 truncate leading-tight">{event.title}</h4>
                               <p className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 truncate"><MapPin size={12} /> {event.venue}</p>
                            </div>
                         </div>
                         <div className="size-14 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm shrink-0">
                            <ArrowRight size={24} />
                         </div>
                      </Card>
                   ))}
                </div>
                <Button 
                   variant="link"
                   onClick={() => setStep('events')} 
                   className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] hover:text-indigo-600 transition underline underline-offset-8 decoration-indigo-200 hover:no-underline active:bg-transparent cursor-pointer h-auto p-0"
                >
                  Full Calendar Protocol
                </Button>
             </div>
          </section>

          <footer className="bg-slate-50 py-32 px-10 text-center border-t border-slate-100">
             <div className="w-16 h-16 bg-slate-200 rounded-3xl mx-auto mb-10 flex items-center justify-center text-slate-400 grayscale opacity-50">
                <Heart size={32} />
             </div>
             <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
                &copy; 2024 {config.tenantName} &bull; BUILT WITH FUNDRAISE PRO
             </p>
             <p className="text-[9px] text-slate-200 font-bold uppercase tracking-[0.2em]">Tenant ID: {config.id}</p>
          </footer>
        </div>
      </div>
    );
  }

  return null;
};

export default Preview;
