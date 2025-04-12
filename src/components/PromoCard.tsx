"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Twitter, Linkedin, ChevronDown, ChevronUp } from 'lucide-react';

const PromoCard = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="bg-[#E08080] text-white p-6 rounded-3xl border-none shadow-lg overflow-hidden"
      style={{ boxShadow: '18px 25px 35px rgba(0, 0, 0, 0.28), -6px -8px 20px rgba(255, 255, 255, 0.12)' }}>
      
      {/* Header with avatar and title */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-lg flex-shrink-0">
          <img 
            src="/images/parth-avatar.png" 
            alt="Parth - The Ramen Guy" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://ui-avatars.com/api/?name=Ramen+Guy&background=E08080&color=fff&size=128";
            }}
          />
        </div>
        
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold mb-1">Meet the Ramen Guy</h3>
          <p className="text-white/80 text-sm md:text-base mb-2">Food for the Soul — Nourishing ramen, crafted with <span className="text-xl">♥</span></p>
          
          {/* Social links */}
          <div className="flex justify-center md:justify-start gap-3 mt-1">
            <a 
              href="https://www.linkedin.com/in/parth-r-8662ba111/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-300"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com/Peace012Roy"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors duration-300"
              aria-label="Twitter Profile"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Story section - collapsible */}
      <div className="relative">
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[500px]' : 'max-h-[80px]'}`}>
          <div className="text-sm md:text-base text-white/90 space-y-3 leading-relaxed">
            <p>I'm a corporate guy in Bangalore. Burnt out, over-scheduled, and running on instant noodles.</p>
            
            <p>Cooking used to be my escape. But somewhere between Zoom calls and late-night decks, I lost that joy.</p>
            
            <p>Then came ramen. Anime nostalgia, garlic at 2 a.m., broth simmering quietly while the world slept, it brought me back to myself.</p>
            
            <p>Now I cook in Indiranagar. Not as a chef, but as someone trying to feel human again.</p>
            
            <p>If you're nearby and tired too, I've got a bowl for you.</p>
            
            <p className="font-medium">Not free. But real.</p>
          </div>
        </div>
        
        {/* Gradient overlay when collapsed */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#E08080] to-transparent pointer-events-none transition-opacity duration-300 ${
            expanded ? 'opacity-0' : 'opacity-100'
          }`}
        />
        
        {/* Expand/collapse button - positioned below the gradient */}
        <div className="relative z-10 mt-2">
          <button 
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center justify-center w-full gap-1 text-sm font-medium py-1 px-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors duration-300"
          >
            <span>{expanded ? "Show less" : "Read my story"}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PromoCard;
