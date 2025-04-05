"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

interface RamenProductCardProps {
  onOrderNow: () => void;
}

const RamenProductCard: React.FC<RamenProductCardProps> = ({ onOrderNow }) => {
  // Add state for title animation
  const [showJapaneseTitle, setShowJapaneseTitle] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Title animation effect
  useEffect(() => {
    const animateTitles = () => {
      // Fade out current title
      setIsTransitioning(true);
      
      // After fade out completes, switch to Japanese and fade in
      setTimeout(() => {
        setShowJapaneseTitle(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50); // Small delay to ensure state is updated before animation starts
        
        // After 3 seconds, fade out Japanese title
        setTimeout(() => {
          setIsTransitioning(true);
          
          // After fade out completes, switch back to English and fade in
          setTimeout(() => {
            setShowJapaneseTitle(false);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 50); // Small delay to ensure state is updated before animation starts
          }, 500); // Fade transition duration
        }, 3000); // Japanese title display duration
      }, 500); // Fade transition duration
    };

    // Start animation cycle immediately for testing
    animateTitles();
      
    // Set interval to repeat the animation cycle
    const intervalId = setInterval(() => {
      animateTitles();
    }, 9000); // 5s English + 3s Japanese + 1s for transitions
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle mouse hover for desktop
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    element.style.transform = 'translateY(-15px) scale(1.05)';
    element.style.boxShadow = '35px 35px 70px rgba(0, 0, 0, 0.45), -10px -15px 25px rgba(255, 255, 255, 0.3)';
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    element.style.transform = 'translateZ(0)';
    element.style.boxShadow = '30px 30px 60px rgba(0, 0, 0, 0.5), -8px -12px 20px rgba(255, 255, 255, 0.25)';
  };
  
  // Simple pop up and down animation for mobile touch with equal timing
  const handleTap = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const element = e.currentTarget;
    
    // Use a consistent timing curve for both animations
    element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Pop up
    element.style.transform = 'translateY(-15px) scale(1.05)';
    element.style.boxShadow = '35px 35px 70px rgba(0, 0, 0, 0.45), -10px -15px 25px rgba(255, 255, 255, 0.3)';
    
    // Pop back down after delay
    setTimeout(() => {
      // Ensure the same transition timing for the pop-down
      element.style.transform = 'translateZ(0)';
      element.style.boxShadow = '30px 30px 60px rgba(0, 0, 0, 0.5), -8px -12px 20px rgba(255, 255, 255, 0.25)';
    }, 450);
  };

  // Custom handler for Order Now button
  const handleOrderNowClick = () => {
    // Remove call to onOrderNow to prevent modal popup
    
    // Check if it's a mobile device
    if (window.innerWidth < 1024) { // lg breakpoint in Tailwind is 1024px
      // For mobile devices, scroll to the OrderCard
      const orderCardElement = document.getElementById('orderCard');
      if (orderCardElement) {
        // Start scrolling with smooth behavior
        orderCardElement.scrollIntoView({ behavior: 'smooth' });
        
        // Wait for scroll to complete before animating
        // A typical smooth scroll takes about 500ms, so we'll wait longer to be safe
        setTimeout(() => {
          // Add a pop animation to the OrderCard only after scrolling completes
          const orderCardTopElement = document.getElementById('orderCardTop');
          if (orderCardTopElement) {
            orderCardTopElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            orderCardTopElement.style.transform = 'translateY(-10px) scale(1.03)';
            orderCardTopElement.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
            
            setTimeout(() => {
              orderCardTopElement.style.transform = '';
              orderCardTopElement.style.boxShadow = '';
            }, 600);
          }
        }, 800); // Increased delay to allow scrolling to complete
      }
    } else {
      // For desktop, animate the OrderCard
      const orderCardTopElement = document.getElementById('orderCardTop');
      if (orderCardTopElement) {
        // Add highlight border
        orderCardTopElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        orderCardTopElement.style.transform = 'translateY(-10px) scale(1.03)';
        orderCardTopElement.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        orderCardTopElement.style.border = '2px solid #e9d1c2';
        
        // Remove highlight after animation
        setTimeout(() => {
          orderCardTopElement.style.transform = '';
          orderCardTopElement.style.boxShadow = '';
          setTimeout(() => {
            orderCardTopElement.style.border = '';
          }, 300);
        }, 600);
      }
    }
  };

  return (
    <Card className="bg-[#709b66] text-white p-6 rounded-3xl border-none shadow-lg flex flex-col h-full"
      style={{ boxShadow: '20px 30px 45px rgba(0, 0, 0, 0.35), -8px -10px 25px rgba(255, 255, 255, 0.15)' }}>
      <div className="flex justify-end mb-4">
          <img src="/icons/non_veg.png" alt="Non-Vegetarian" className="w-5 h-5" />
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div 
          className="w-64 h-64 bg-white rounded-full overflow-hidden mb-8 relative cursor-pointer touch-manipulation"
          style={{
            boxShadow: '30px 30px 60px rgba(0, 0, 0, 0.5), -8px -12px 20px rgba(255, 255, 255, 0.25)',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: 'translateZ(0)',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTap}
        >
          <img
            src="/images/ramen_og_circle.png"
            alt="Ramen bowl" 
            className="w-full h-full object-cover"
            draggable="false"
          />
        </div>
        
        <div className="relative min-h-[4rem] mb-4 w-full">
          <div className="flex justify-center items-center h-full relative">
            {/* English Title */}
            <h2 
              className="text-4xl font-bold absolute w-full text-center transition-all duration-500 ease-in-out"
              style={{
                opacity: showJapaneseTitle ? 0 : (isTransitioning ? 0 : 1),
                transform: showJapaneseTitle ? 'translateY(-10px)' : (isTransitioning ? 'translateY(-10px)' : 'translateY(0)'),
                pointerEvents: 'none'
              }}
            >
              Tori Paitan Ramen
            </h2>
            
            {/* Japanese Title */}
            <h2 
              className="text-4xl font-bold absolute w-full text-center transition-all duration-500 ease-in-out"
              style={{
                opacity: showJapaneseTitle ? (isTransitioning ? 0 : 1) : 0,
                transform: showJapaneseTitle ? (isTransitioning ? 'translateY(-10px)' : 'translateY(0)') : 'translateY(10px)',
                pointerEvents: 'none'
              }}
            >
              鶏白湯ラーメン
            </h2>
          </div>
        </div>
        
        <p className="text-xl opacity-80 mb-8">Creamy chicken broth ramen with egg and mushrooms</p>
        
        <Button 
          onClick={handleOrderNowClick}
          className="bg-[rgba(213,122,131,255)] hover:bg-[rgba(112,155,102,0.9)] border-2 border-white rounded-full px-8 py-6 text-xl"
        >
          Order now
        </Button>
      </div>
    </Card>
  );
};

export default RamenProductCard;
