"use client";

import React from 'react';
import OrderCard from '@/components/OrderCard';
import RamenProductCard from '@/components/RamenProductCard';
import PromoCard from '@/components/PromoCard';
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  // Empty function for the onOrderNow prop - no action needed now
  const handleOrderNow = () => {};

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative"
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background image as absolute positioned div */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/images/background.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Light pink overlay for better readability */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: 'rgba(220,178,183,0.3)' // Light pink with 20% opacity
        }}
      ></div>
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-20">
        {/* Reorder components for mobile - RamenProductCard first */}
        <div className="lg:hidden mb-6">
          <RamenProductCard onOrderNow={handleOrderNow} />
        </div>
        
        <div className="space-y-6">
          {/* OrderCard comes first on mobile */}
          <OrderCard />
          
          {/* PromoCard comes last on mobile */}
          <PromoCard />
        </div>
        
        {/* Show RamenProductCard in its original position on desktop */}
        <div className="hidden lg:block">
          <RamenProductCard onOrderNow={handleOrderNow} />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
