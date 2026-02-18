
import React, { useState } from 'react';
import { FundraiserConfig, Terminology } from '../types';
import { Settings2, Type, Palette, LayoutTemplate, Image as ImageIcon, Globe, MousePointer2, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { Textarea } from './Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Switch } from './Switch';
import { ScrollArea } from './ScrollArea';

interface EditorProps {
  config: FundraiserConfig;
  onChange: (config: FundraiserConfig) => void;
}

const Editor: React.FC<EditorProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'design' | 'terminology' | 'navigation'>('hero');

  const updateConfig = (updates: Partial<FundraiserConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateTerminology = (key: keyof Terminology, value: string) => {
    updateConfig({
      terminology: { ...config.terminology, [key]: value }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-80 lg:w-96 shadow-xl z-20">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
          <Settings2 size={18} className="text-indigo-600" /> UI Customizer
        </h2>
        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">Visual Editor</span>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="flex border-b border-slate-100 bg-transparent h-auto p-0 rounded-none w-full">
          {[
            { id: 'hero', label: 'Hero', icon: <ImageIcon size={12}/> },
            { id: 'terminology', label: 'Labels', icon: <Type size={12}/> },
            { id: 'design', label: 'Visuals', icon: <Palette size={12}/> },
            { id: 'navigation', label: 'Layout', icon: <LayoutTemplate size={12}/> }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id}
              className="flex-1 py-3 px-2 text-[9px] font-black uppercase tracking-widest transition whitespace-nowrap flex flex-col items-center gap-1 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-indigo-50/20 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent text-slate-400"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-8">
            <TabsContent value="hero" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Title</Label>
                  <Input 
                    value={config.title} 
                    onChange={(e) => updateConfig({ title: e.target.value })} 
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle Narrative</Label>
                    <Button variant="ghost" size="xs" className="h-6 text-[9px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1 rounded-full">
                      <Sparkles size={10} /> AI Refine
                    </Button>
                  </div>
                  <Textarea 
                    rows={4} 
                    value={config.subtitle} 
                    onChange={(e) => updateConfig({ subtitle: e.target.value })} 
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 min-h-[100px] resize-none leading-relaxed text-xs" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Asset (URL)</Label>
                  <Input 
                    value={config.heroImage} 
                    onChange={(e) => updateConfig({ heroImage: e.target.value })} 
                    className="bg-slate-50/50 border-slate-200 font-mono text-[10px] focus-visible:ring-indigo-500" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terminology" className="space-y-6 mt-0">
              <p className="text-[10px] font-bold text-slate-400 italic">Customize the vocabulary used across the donor experience.</p>
              <div className="space-y-4">
                {[
                  { key: 'donation', label: 'CTA Label (e.g. Donate)' },
                  { key: 'donor', label: 'Member Type (e.g. Supporter)' },
                  { key: 'campaign', label: 'Project Term (e.g. Mission)' },
                  { key: 'goal', label: 'Target Term (e.g. Milestone)' },
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</Label>
                    <Input 
                      value={config.terminology[item.key as keyof Terminology]} 
                      onChange={(e) => updateTerminology(item.key as keyof Terminology, e.target.value)} 
                      className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 h-9"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-6 mt-0">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Accent Color</Label>
                <div className="grid grid-cols-5 gap-3">
                  {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#141414', '#7c3aed', '#059669', '#dc2626'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => updateConfig({ primaryColor: color })} 
                      style={{ backgroundColor: color }} 
                      className={`aspect-square rounded-xl border-2 transition-all ${config.primaryColor === color ? 'border-slate-800 scale-110 shadow-lg ring-2 ring-slate-100' : 'border-transparent'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Font Family</Label>
                <Select defaultValue="inter">
                  <SelectTrigger className="bg-slate-50/50 border-slate-200 text-xs font-bold h-10">
                    <SelectValue placeholder="Select Font" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="inter" className="text-xs font-bold">Inter (Modern Sans)</SelectItem>
                    <SelectItem value="playfair" className="text-xs font-bold font-serif">Playfair Display (Serif)</SelectItem>
                    <SelectItem value="mono" className="text-xs font-bold font-mono">Roboto Mono (Technical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="navigation" className="space-y-6 mt-0">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Visibility</Label>
              <div className="space-y-3">
                {[
                  { id: 'impact', label: 'Impact Stories', icon: <Globe size={14}/> },
                  { id: 'partners', label: 'Partner Logos', icon: <MousePointer2 size={14}/> },
                  { id: 'media', label: 'Media Hub', icon: <Settings2 size={14}/> },
                  { id: 'events', label: 'Field Events', icon: <LayoutTemplate size={14}/> }
                ].map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{section.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{section.label}</span>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <div className="p-5 bg-slate-50 border-t border-slate-200">
        <p className="text-[9px] text-slate-400 font-bold text-center mb-4 italic uppercase">Visual changes apply instantly to preview</p>
        <Button className="w-full bg-slate-900 text-white font-black py-6 rounded-xl transition flex items-center justify-center gap-2 shadow-xl hover:bg-black active:scale-95 uppercase tracking-widest text-[11px] h-auto">
          Publish UI Updates
        </Button>
      </div>
    </div>
  );
};

export default Editor;
