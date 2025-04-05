"use client";

import React from 'react';
import { Card } from '@/components/ui/card';

const PromoCard = () => {
  return (
    <Card className="bg-[#E08080] text-white p-6 rounded-3xl border-none shadow-lg"
      style={{ boxShadow: '18px 25px 35px rgba(0, 0, 0, 0.28), -6px -8px 20px rgba(255, 255, 255, 0.12)' }}>
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-[#F4BE98] rounded-full overflow-hidden flex items-center justify-center">
            {/* Bunny image representation */}
            <div className="w-16 h-16 bg-[#F0A060] rounded-full relative">
              {/* Bunny ears */}
              <div className="absolute -top-5 left-2 w-3 h-8 bg-[#F4BE98] rounded-full transform rotate-[-15deg]"></div>
              <div className="absolute -top-5 right-2 w-3 h-8 bg-[#F4BE98] rounded-full transform rotate-[15deg]"></div>
              
              {/* Bunny face */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Eyes */}
                <div className="absolute top-[35%] left-[30%] w-1.5 h-1.5 bg-[#4A796E] rounded-full"></div>
                <div className="absolute top-[35%] right-[30%] w-1.5 h-1.5 bg-[#4A796E] rounded-full"></div>
                
                {/* Nose */}
                <div className="absolute top-[45%] left-[47%] w-2 h-1.5 bg-[#E08060] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-1">Food for the Soul</h3>
            <p className="text-white/80">Nourishing ramen, crafted with <span className="text-xl">♥</span></p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PromoCard;
