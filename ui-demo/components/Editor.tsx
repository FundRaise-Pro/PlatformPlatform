
import React, { useState } from 'react';
import { FundraiserConfig, Terminology } from '../types';
import { Settings2, Type, Palette, LayoutTemplate, Image as ImageIcon, Globe, MousePointer2 } from 'lucide-react';

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

      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'hero', label: 'Hero', icon: <ImageIcon size={12}/> },
          { id: 'terminology', label: 'Labels', icon: <Type size={12}/> },
          { id: 'design', label: 'Visuals', icon: <Palette size={12}/> },
          { id: 'navigation', label: 'Layout', icon: <LayoutTemplate size={12}/> }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-2 text-[9px] font-black uppercase tracking-widest transition whitespace-nowrap flex flex-col items-center gap-1 ${activeTab === tab.id ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campaign Title</label>
              <input 
                type="text" 
                value={config.title} 
                onChange={(e) => updateConfig({ title: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subtitle Narrative</label>
              <textarea 
                rows={3} 
                value={config.subtitle} 
                onChange={(e) => updateConfig({ subtitle: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Asset (URL)</label>
              <input 
                type="text" 
                value={config.heroImage} 
                onChange={(e) => updateConfig({ heroImage: e.target.value })} 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
          </div>
        )}

        {activeTab === 'terminology' && (
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-slate-400 italic mb-4">Customize the vocabulary used across the donor experience.</p>
            {[
              { key: 'donation', label: 'CTA Label (e.g. Donate)' },
              { key: 'donor', label: 'Member Type (e.g. Supporter)' },
              { key: 'campaign', label: 'Project Term (e.g. Mission)' },
              { key: 'goal', label: 'Target Term (e.g. Milestone)' },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</label>
                <input 
                  type="text" 
                  value={config.terminology[item.key as keyof Terminology]} 
                  onChange={(e) => updateTerminology(item.key as keyof Terminology, e.target.value)} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Brand Accent Color</label>
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
            <div className="pt-6 border-t border-slate-100">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Site Font Family</label>
               <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
                  <option>Inter (Modern Sans)</option>
                  <option>Playfair Display (Elegant Serif)</option>
                  <option>Roboto Mono (Technical)</option>
               </select>
            </div>
          </div>
        )}

        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Section Visibility</label>
            {[
              { label: 'Impact Stories', icon: <Globe size={14}/> },
              { id: 'partners', label: 'Partner Logos', icon: <MousePointer2 size={14}/> },
              { id: 'media', label: 'Media Hub', icon: <Settings2 size={14}/> },
              { id: 'events', label: 'Field Events', icon: <LayoutTemplate size={14}/> }
            ].map((section) => (
              <div key={section.label} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{section.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{section.label}</span>
                </div>
                <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-slate-50 border-t border-slate-200">
        <p className="text-[9px] text-slate-400 font-bold text-center mb-4 italic uppercase">Visual changes apply instantly to preview</p>
        <button className="w-full bg-slate-900 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xl hover:bg-black active:scale-95 uppercase tracking-widest text-[11px]">
          Publish UI Updates
        </button>
      </div>
    </div>
  );
};

export default Editor;
