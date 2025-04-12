"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, ExternalLink, ChevronLeft, ChevronRight, Star, MessageSquare } from 'lucide-react';

interface RamenProductCardProps {
  onOrderNow: () => void;
}

interface RamenVariant {
  name: string;
  japaneseName: string;
  description: string;
  detailedDescription?: string;
  nutrition?: {
    volume: string;
    calories: string;
    protein: string;
  };
  images: string[];
  price?: string;
  isVeg: boolean;
}

const RamenProductCard: React.FC<RamenProductCardProps> = ({ onOrderNow }) => {
  const [showJapaneseTitle, setShowJapaneseTitle] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVeg, setIsVeg] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ramenVariants: RamenVariant[] = [
    {
      name: "Tori Paitan Ramen",
      japaneseName: "鶏白湯ラーメン",
      description: "Creamy chicken broth ramen with egg and mushrooms",
      detailedDescription: "A deeply satisfying bowl of Tori Paitan Ramen, featuring a silky, collagen-rich chicken bone broth slow-cooked to perfection. Served with succulent slices of poached chicken breast, a soft-boiled marinated egg, sautéed shiitake mushrooms, and springy ramen noodles. Finished with scallions and a dash of toasted sesame, this 750ml bowl is both comforting and protein-packed.",
      nutrition: {
        volume: "750ml",
        calories: "700–800 kcal",
        protein: "50–55g",
      },
      images: [
        "/images/ramen_og_circle.webp",
        "/images/chicken_ramen_2.jpg",
        "/images/chicken_ramen_3.jpg"
      ],
      isVeg: false
    },
    {
      name: "Miso Veg Ramen",
      japaneseName: "味噌野菜ラーメン",
      description: "Rich miso broth with seasonal vegetables and tofu",
      detailedDescription: "A soul-warming bowl of Miso Veg Ramen, built on a deeply savory miso-based broth layered with umami. This comforting 750ml bowl features golden corn kernels, pan-seared tofu cubes, sautéed mushrooms, and springy ramen noodles. Finished with fresh scallions and toasted sesame seeds, it's a plant-powered delight that's both nourishing and satisfying.",
      nutrition: {
        volume: "750ml",
        calories: "600–700 kcal",
        protein: "30–35g",
      },
      images: [
        "/images/veg_ramen_3.jpg",
        "/images/veg_ramen_2.jpg",
        "/images/veg_ramen_circle.png"
      ],
      isVeg: true
    }
  ];

  const currentVariant = ramenVariants.find(variant => variant.isVeg === isVeg) || ramenVariants[0];
  
  // Function to navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === currentVariant.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Function to navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? currentVariant.images.length - 1 : prevIndex - 1
    );
  };
  
  // Reset image index when changing variants
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [isVeg]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.getElementById('ramen-dropdown-container');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setCurrentImageIndex(0);
      }
    }

    // Add event listener only when dropdown is open
    if (currentImageIndex !== 0) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentImageIndex]);

  return (
    <Card className="bg-[#709b66] text-white p-6 rounded-3xl border-none shadow-lg flex flex-col h-full"
      style={{ boxShadow: '20px 30px 45px rgba(0, 0, 0, 0.35), -8px -10px 25px rgba(255, 255, 255, 0.15)' }}>
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        
        
        {/* Simple two-button toggle */}
        <div className="flex rounded-xl overflow-hidden border-2 border-white shadow-md w-full md:w-auto justify-center">
          <button 
            onClick={() => setIsVeg(false)}
            className={`flex items-center gap-1 px-4 md:px-3 py-2 md:py-1.5 text-sm transition-colors duration-300 whitespace-nowrap flex-1 md:flex-initial justify-center ${
              !isVeg 
                ? 'bg-red-600 text-white font-bold' 
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            <span role="img" aria-label="Non-Vegetarian" className="text-sm">🍗</span>
            <span>Chicken</span>
          </button>
          
          <button 
            onClick={() => setIsVeg(true)}
            className={`flex items-center gap-1 px-4 md:px-3 py-2 md:py-1.5 text-sm transition-colors duration-300 whitespace-nowrap flex-1 md:flex-initial justify-center ${
              isVeg 
                ? 'bg-green-600 text-white font-bold' 
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            <span role="img" aria-label="Vegetarian" className="text-sm">🥦</span>
            <span>Veg</span>
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        {/* Image carousel with navigation arrows */}
        <div className="relative mb-8">
          {/* Left arrow */}
          <button 
            onClick={prevImage}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border border-gray-200"
            style={{ transform: 'translate(-50%, -50%)' }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
          </button>
          
          {/* Ramen image */}
          <div 
            className="w-56 h-56 bg-white rounded-full overflow-hidden relative cursor-pointer touch-manipulation"
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
              src={currentVariant.images[currentImageIndex]}
              alt={currentVariant.name} 
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>
          
          {/* Right arrow */}
          <button 
            onClick={nextImage}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border border-gray-200"
            style={{ transform: 'translate(50%, -50%)' }}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
          </button>
          
          {/* Image indicator dots */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {currentVariant.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentImageIndex === index 
                    ? 'bg-white w-4' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="relative min-h-[4rem] mb-4 w-full">
          <div className="flex justify-center items-center h-full relative">
            {/* English Title */}
            <h2 
              className="text-3xl font-bold absolute w-full text-center transition-all duration-500 ease-in-out"
              style={{
                opacity: showJapaneseTitle ? 0 : (isTransitioning ? 0 : 1),
                transform: showJapaneseTitle ? 'translateY(-10px)' : (isTransitioning ? 'translateY(-10px)' : 'translateY(0)'),
                pointerEvents: 'none'
              }}
            >
              {currentVariant.name}
            </h2>
            
            {/* Japanese Title */}
            <h2 
              className="text-3xl font-bold absolute w-full text-center transition-all duration-500 ease-in-out"
              style={{
                opacity: showJapaneseTitle ? (isTransitioning ? 0 : 1) : 0,
                transform: showJapaneseTitle ? (isTransitioning ? 'translateY(-10px)' : 'translateY(0)') : 'translateY(10px)',
                pointerEvents: 'none'
              }}
            >
              {currentVariant.japaneseName}
            </h2>
          </div>
        </div>
        
        <p className="text-lg opacity-80 mb-4 max-w-md mx-auto">{currentVariant.description}</p>
        
        {/* Nutrition information */}
        {currentVariant.nutrition && (
          <div className="mb-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
            <div className="flex gap-4 text-sm text-white justify-center">
              <div className="flex flex-col items-center">
                <span className="font-bold">Volume</span>
                <span>{currentVariant.nutrition.volume}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold">Calories</span>
                <span>{currentVariant.nutrition.calories}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold">Protein</span>
                <span>{currentVariant.nutrition.protein}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Detailed description (collapsible) */}
        {currentVariant.detailedDescription && (
          <div className="mb-6 text-sm text-white/90 max-w-md mx-auto">
            <p>{currentVariant.detailedDescription}</p>
          </div>
        )}
        
        {/* Testimonial Card */}
        <div className="mb-6 w-full px-3 md:px-0 max-w-md mx-auto">
          <a 
            href="https://www.reddit.com/r/indiranagar/comments/1jsypx1/ramenguy_appreciation_post/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-lg transform hover:scale-[1.02] hover:shadow-xl group">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white/60 flex-shrink-0">
                  <img 
                    src="/images/reddit-avatar.jpeg" 
                    alt="Reddit User" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://www.redditstatic.com/avatars/avatar_default_15_FF4500.png";
                    }}
                  />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="font-bold text-white text-sm md:text-base truncate mr-1">Ramen Guy Appreciation Post</h3>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 text-white/60 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <p className="text-white/80 text-xs flex flex-wrap items-center gap-1">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                      <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                    </span>
                    <span className="ml-1 md:ml-2 flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      r/indiranagar
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="text-left text-xs md:text-sm italic text-white/90 mb-2 md:mb-3">
                "Hands down the most authentic ramen experience I've had in the city. The broth is rich, flavorful, and perfectly balanced. A hidden gem that deserves all the praise!"
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <span className="bg-white/20 text-white/90 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Authentic</span>
                  <span className="bg-white/20 text-white/90 text-[10px] md:text-xs px-2 py-0.5 rounded-full">Worth it</span>
                </div>
                <span className="text-white/60 text-[10px] md:text-xs">2 days ago</span>
              </div>
            </div>
          </a>
        </div>
        
        <Button 
          onClick={handleOrderNowClick}
          className="bg-[rgba(213,122,131,255)] hover:bg-[rgba(112,155,102,0.9)] border-2 border-white rounded-full px-8 py-5 text-xl"
        >
          Order now
        </Button>
      </div>

      <style jsx>{`
        @keyframes steam {
          0% { opacity: 0.8; transform: translateY(0) scale(0.8); }
          50% { opacity: 0.5; transform: translateY(-5px) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(1.2); }
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${isVeg ? '4CAF50' : 'D32F2F'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.8rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
          transition: all 0.3s ease;
        }
        select:focus {
          outline: none;
          box-shadow: 0 0 0 3px ${isVeg ? 'rgba(76, 175, 80, 0.3)' : 'rgba(211, 47, 47, 0.3)'};
        }
        select option {
          padding: 10px;
          font-weight: 500;
        }
      `}</style>
    </Card>
  );
};

export default RamenProductCard;
