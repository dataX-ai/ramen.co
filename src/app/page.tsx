"use client";

import React, { useEffect, useState } from 'react';
import OrderCard from '@/components/OrderCard';
import RamenProductCard from '@/components/RamenProductCard';
import PromoCard from '@/components/PromoCard';
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  // Empty function for the onOrderNow prop - no action needed now
  const handleOrderNow = () => {};
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkOpeningHours = () => {
      // Check if NEXT_PUBLIC_IS_CLOSED environment variable exists
      let isClosed = false;
      // Get current time in IST
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      
      const hours = istTime.getHours();
      // Open from 11am to 11pm
      isClosed = hours < 11 || hours > 23;

      if (process.env.NEXT_PUBLIC_IS_CLOSED != null) {
        isClosed = true;
      }

      if (process.env.NEXT_PUBLIC_IS_OPEN != null) {
        isClosed = false;
      }

      setIsOpen(!isClosed);
    };

    checkOpeningHours();
    // Check every minute
    const interval = setInterval(checkOpeningHours, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
      
      {isOpen ? (
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
      ) : (
        <div className="max-w-md w-full bg-white/20 backdrop-blur-lg rounded-lg p-8 text-center shadow-lg relative z-20 border border-white/30">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">We are closed now!</h2>
          <p className="text-gray-700 mb-2">Our hours of operation are:</p>
          <p className="text-gray-700 font-medium mb-6">11:00 AM - 11:00 PM IST</p>
          <p className="text-gray-700">Thank you for visiting!</p>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}
