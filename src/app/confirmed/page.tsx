"use client";

import { useSearchParams } from 'next/navigation';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentConfirmation() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const isSuccessful = status === 'succeeded';

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
      
      {/* Light overlay for better readability */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: 'rgba(220,178,183,0.3)'
        }}
      ></div>
      
      <div className="max-w-md w-full bg-white/20 backdrop-blur-lg rounded-lg p-8 text-center shadow-lg relative z-20 border border-white/30">
        {isSuccessful ? (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Confirmed!</h2>
            <p className="text-gray-700 mb-6">
              Thank you for your order. Check your email for more details.
            </p>
            <div className="p-3 rounded-md mt-4 mb-2" style={{ backgroundColor: "#e7d0ae" }}>
              <p style={{ color: "#573c15" }}>
                If you don't see the email in your inbox, please check your spam folder for a message from kanishka@ateulerlabs.com
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
            <p className="text-gray-700 mb-6">
              Sorry, there was an issue processing your payment. Please try again or contact support.
            </p>
          </>
        )}
      </div>
    </div>
  );
} 