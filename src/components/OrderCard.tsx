"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tag, MapPin, Maximize2, Navigation, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import "./shimmer.css"; // We'll create this file separately

// You should replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 12.970270, // Bangalore, India
  lng: 77.641252
};

// Add minimized map style options for cleaner display
const cleanMapOptions = {
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  zoomControl: false,
  disableDefaultUI: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.confirm-location-button {
  position: relative;
  z-index: 1;
}

.confirm-location-button::before {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  z-index: -1;
  border-radius: 9999px;
  background: linear-gradient(
    90deg, 
    rgba(45, 81, 81, 0.8), 
    rgba(114, 157, 104, 0.9), 
    rgba(213, 122, 131, 0.9), 
    rgba(114, 157, 104, 0.9), 
    rgba(45, 81, 81, 0.8)
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

.confirm-location-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #211b17;
  border-radius: 9999px;
  z-index: -1;
}
`;

const OrderCard = () => {
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [confirmedLocation, setConfirmedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isZipCodeErrorModalOpen, setIsZipCodeErrorModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Form validation errors
  const [addressError, setAddressError] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Item price
  const itemPrice = 599;
  const totalPrice = (itemPrice * quantity).toFixed(2);
  
  // Maximum quantity allowed
  const MAX_QUANTITY = 6;

  // Allowed zip codes
  const allowedZipCodes = ['560038', '560075', '560017', '560093', '560008', '560071'];

  // Validation functions
  const validateAddress = (value: string): boolean => {
    if (!value.trim()) {
      setAddressError('Address is required');
      return false;
    }
    
    if (value.length > 499) {
      setAddressError('Address must be less than 500 characters');
      return false;
    }
    
    setAddressError('');
    return true;
  };

  const validateZipCode = (value: string): boolean => {
    if (!value.trim()) {
      setZipCodeError('Zip code is required');
      return false;
    }
    
    const zipRegex = /^\d{6}$/;
    if (!zipRegex.test(value)) {
      setZipCodeError('Zip code must be a 6-digit number');
      return false;
    }
    
    setZipCodeError('');
    return true;
  };

  const validatePhone = (value: string): boolean => {
    if (!value.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError('Please enter a valid 10-digit Indian phone number');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  // Handle input changes with validation
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    if (addressError) validateAddress(value);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^\d*$/.test(value)) {
      setZipCode(value);
      if (zipCodeError) validateZipCode(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^\d*$/.test(value)) {
      setPhone(value);
      if (phoneError) validatePhone(value);
    }
  };

  // Check if zip code is valid
  const isValidZipCode = (zipCode: string) => {
    return allowedZipCodes.includes(zipCode);
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Initialize autocomplete service when map is loaded
  useEffect(() => {
    if (isLoaded && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // Initialize places service when map is loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !placesService.current) {
      placesService.current = new window.google.maps.places.PlacesService(mapRef.current);
    }
  }, [isLoaded, mapRef.current]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 2 && autocompleteService.current && mapRef.current) {
      // Create location circle for bias
      const center = mapRef.current.getCenter();
      const locationBias = new google.maps.LatLng(
        center?.lat() || selectedLocation.lat,
        center?.lng() || selectedLocation.lng
      );

      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          locationBias: locationBias,
          // We can also add bounds to restrict to the current map view
          locationRestriction: mapRef.current.getBounds() || undefined
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchResults(predictions);
            setShowResults(true);
          } else {
            setSearchResults([]);
          }
        }
      );
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle place selection
  const handlePlaceSelect = (placeId: string) => {
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
            const newLocation = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            
            setSelectedLocation(newLocation);
            
            if (place.formatted_address) {
              setAddress(place.formatted_address);
            }
            
            if (mapRef.current) {
              mapRef.current.panTo(newLocation);
              mapRef.current.setZoom(16);
            }
            
            setShowResults(false);
            setSearchQuery(place.formatted_address || '');
          }
        }
      );
    }
  };

  const detectUserLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      // Explicitly request permission by calling getCurrentPosition
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          
          // Center the map on the new location
          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude });
          }
          
          setIsLocating(false);
          toast({
            title: "Location detected",
            description: "We've found your location successfully.",
            className: "bg-[#f9f4ee] border border-[#f9f4ee] text-gray-800",
          });
        },
        (error) => {
          // console.error("Error getting location:", error);
          setIsLocating(false);
          toast({
            variant: "destructive",
            title: "Location detection failed",
            description: "Please set your location manually on the map. Or enable location permission in your browser.",
            className: "bg-[#f9f4ee] border border-[#f9f4ee] text-gray-800",
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please set your location manually.",
        className: "bg-[#f9f4ee] border border-[#f9f4ee] text-gray-800",
      });
    }
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setSelectedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    }
  }, []);

  const openMapModal = () => {
    setIsMapModalOpen(true);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to confirm selected location
  const confirmLocation = () => {
    setConfirmedLocation(selectedLocation);
    setIsMapModalOpen(false);
  };

  // Function to handle confirm address button click
  const handleConfirmAddressClick = () => {
    // Reset all error states
    setAddressError('');
    setZipCodeError('');
    setPhoneError('');
    
    // Validate all fields
    const isAddressValid = validateAddress(address);
    const isZipCodeValid = validateZipCode(zipCode);
    const isPhoneValid = validatePhone(phone);
    
    // If any validation fails, stop the process
    if (!isAddressValid || !isZipCodeValid || !isPhoneValid) {
      return;
    }
    
    // Check if location is confirmed
    if (!confirmedLocation) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Please confirm your location on the map.",
        className: "bg-[#f9f4ee] border border-[#f9f4ee] text-gray-800",
      });
      return;
    }
    
    // Check if zip code is in the allowed list - only at this point after validation
    if (!isValidZipCode(zipCode)) {
      setIsZipCodeErrorModalOpen(true);
      return;
    }
    
    // All validation passed, proceed with order
    proceedWithOrder();
  };

  // Function to proceed with the order
  const proceedWithOrder = () => {
    // Close the modal
    setIsConfirmModalOpen(false);
    
    // Show success toast
    toast({
      title: "Redirecting to payment",
      description: "Please complete your payment to confirm your order.",
      className: "bg-[#f9f4ee] border border-[#f9f4ee] text-gray-800",
    });
    
    // Get the payment URL from environment variable
    const paymentBaseUrl = process.env.NEXT_PUBLIC_PAYMENT_URL || "https://checkout.dodopayments.com/buy";
    const productId = process.env.NEXT_PUBLIC_PRODUCT_ID || "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    
    // Build the redirect URL with parameters
    const redirectUrl = new URL(`${paymentBaseUrl}/${productId}`);
    
    // Add query parameters
    redirectUrl.searchParams.append('quantity', quantity.toString());
    redirectUrl.searchParams.append('redirect_url', `${baseUrl}`);
    redirectUrl.searchParams.append('fullName', 'Ramen Guy');
    redirectUrl.searchParams.append('country', 'IN');
    redirectUrl.searchParams.append('city', 'Bangalore');
    redirectUrl.searchParams.append('addressLine', address);
    redirectUrl.searchParams.append('state', 'KA');
    redirectUrl.searchParams.append('zipCode', zipCode);
    redirectUrl.searchParams.append('phone_number', phone);
    redirectUrl.searchParams.append('metadata_phone', phone);
    redirectUrl.searchParams.append('disableFullName', 'True');
    redirectUrl.searchParams.append('disableFirstName', 'True');
    redirectUrl.searchParams.append('disableLastName', 'True');
    redirectUrl.searchParams.append('disableCountry', 'True');
    redirectUrl.searchParams.append('disableAddressLine', 'True');
    redirectUrl.searchParams.append('disableCity', 'True');
    redirectUrl.searchParams.append('disableState', 'True');
    redirectUrl.searchParams.append('disableZipCode', 'True');
    
    // Redirect to payment page
    window.location.href = redirectUrl.toString();
  };

  return (
    <div id="orderCard" className="flex flex-col relative">
      <Card className="bg-[#2D5151] text-white p-6 pb-16 rounded-3xl border-none shadow-lg z-0" 
        style={{ boxShadow: '12px 20px 30px rgba(0, 0, 0, 0.35), -4px -6px 15px rgba(255, 255, 255, 0.1)' }}>
        <h1 className="text-2xl font-bold leading-tight text-[#fffdfa]">
          Yaaay ! <br /> 
          Let's Ramen ♨
        </h1>
      </Card>
      
      <Card id="orderCardTop" className="bg-[rgba(249,244,238,255)] rounded-3xl border-none shadow-lg relative z-10 -mt-14"
        style={{ boxShadow: '15px 25px 35px rgba(0, 0, 0, 0.3), -5px -8px 15px rgba(255, 255, 255, 0.15)' }}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="text-[#2D5151]" size={18} />
              <span className="text-base font-medium text-[#2D5151]">Your order</span>
            </div>
          </div>
          
          <div className="pt-3 space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <button 
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-[#385e67] text-white hover:opacity-90 disabled:opacity-50 font-medium text-lg shadow-md"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                
                <div className="mx-3 px-5 py-1.5 bg-[#fffdfa] rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] text-center flex items-center justify-between min-w-[170px] border border-[#f0eae4]">
                  <span className="text-gray-700 font-medium">{quantity} × Tori Paitan Ramen</span>
                  <span className="text-sm text-gray-500 ml-2">₹{itemPrice}</span>
                </div>
                
                <button 
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-[#385e67] text-white hover:opacity-90 disabled:opacity-50 font-medium text-lg shadow-md"
                  onClick={() => setQuantity(prev => Math.min(MAX_QUANTITY, prev + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="space-y-2">
                <p className="font-medium text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-[#2D5151]" />
                  Delivery Address
                </p>
                
                <div className="space-y-2">
                  <div>
                    <Input 
                      id="address"
                      placeholder="Enter your street address" 
                      value={address}
                      onChange={handleAddressChange}
                      className={`border-gray-300 focus:border-[#2D5151] focus:ring-[#2D5151] rounded-full bg-[#fffdfa] placeholder:text-[#ab8871] text-[#673f34] h-9 ${addressError ? 'border-red-500' : ''}`}
                      maxLength={499}
                    />
                    {addressError && (
                      <p className="text-red-500 text-xs mt-1 ml-3">{addressError}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <Input 
                        id="zipcode"
                        placeholder="Zip code" 
                        value={zipCode}
                        onChange={handleZipCodeChange}
                        className={`border-gray-300 focus:border-[#2D5151] focus:ring-[#2D5151] rounded-full bg-[#fffdfa] placeholder:text-[#ab8871] text-[#673f34] h-9 ${zipCodeError ? 'border-red-500' : ''}`}
                        maxLength={6}
                      />
                      {zipCodeError && (
                        <p className="text-red-500 text-xs mt-1 ml-3">{zipCodeError}</p>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Input 
                        id="phone"
                        placeholder="Enter your phone number" 
                        value={phone}
                        onChange={handlePhoneChange}
                        className={`border-gray-300 focus:border-[#2D5151] focus:ring-[#2D5151] rounded-full bg-[#fffdfa] placeholder:text-[#ab8871] text-[#673f34] h-9 ${phoneError ? 'border-red-500' : ''}`}
                        maxLength={10}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-xs mt-1 ml-3">{phoneError}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">Select your location on map</p>
                    {confirmedLocation && (
                      <p className="text-sm font-bold text-[#265c55]">Location Added</p>
                    )}
                  </div>
                  <div className={`bg-gray-200 rounded-lg w-full h-[150px] overflow-hidden relative ${confirmedLocation ? 'border-2 border-[#265c55]' : ''}`}>
                    {loadError && (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-red-500 text-sm">Error loading Google Maps</p>
                      </div>
                    )}
                    
                    {!isLoaded ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Loading map...</p>
                      </div>
                    ) : (
                      <>
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={selectedLocation}
                          zoom={15}
                          onClick={onMapClick}
                          onLoad={onLoad}
                          options={cleanMapOptions}
                        >
                          <Marker position={selectedLocation} />
                        </GoogleMap>
                        
                        {/* Transparent overlay to open map modal */}
                        <div 
                          className="absolute inset-0 bg-transparent cursor-pointer z-20"
                          onClick={openMapModal}
                          aria-label="Open map in fullscreen"
                        />
                        
                        {/* Map controls overlay */}
                        <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              detectUserLocation();
                            }}
                            disabled={isLocating}
                            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Detect my location"
                          >
                            <Navigation size={18} className="text-[#2D5151]" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2.5 border-t border-gray-200">
              <p className="font-medium text-gray-700">Total</p>
              <p className="font-bold text-xl">₹{totalPrice}</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                className="bg-[#729d68] hover:bg-[#5A8B6E] text-white rounded-full px-6 py-1.5 h-10 font-medium"
                onClick={handleConfirmAddressClick}
              >
                Confirm Address
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Fullscreen Map Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[90vw] h-[90vh] p-0 overflow-hidden border-none rounded-lg shadow-xl">
          <VisuallyHidden>
            <DialogTitle>Select Your Delivery Location</DialogTitle>
          </VisuallyHidden>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md">
            <div className="relative" ref={searchInputRef}>
              <div className="flex items-center relative">
                <Input
                  type="text"
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 bg-[#fffdfa] shadow-md focus:ring-2 focus:ring-[#6A9B7E] focus:border-[#6A9B7E] placeholder:text-[#ab8871] text-[#673f34]"
                />
                <Search className="absolute left-3 text-gray-500" size={18} />
              </div>
              
              {/* Search results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[101] max-h-[50vh] overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.place_id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handlePlaceSelect(result.place_id)}
                    >
                      <p className="text-sm font-medium">{result.structured_formatting.main_text}</p>
                      <p className="text-xs text-gray-500">{result.structured_formatting.secondary_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="relative w-full h-full">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedLocation}
                zoom={15}
                onClick={onMapClick}
                onLoad={onLoad}
                options={{
                  fullscreenControl: false,
                  streetViewControl: true,
                  mapTypeControl: true,
                  zoomControl: true,
                }}
              >
                <Marker position={selectedLocation} />
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p>Loading map...</p>
              </div>
            )}
            
            {/* Modal map controls */}
            <div className="absolute bottom-5 left-5 z-10">
              <button 
                onClick={detectUserLocation}
                disabled={isLocating}
                className="bg-white rounded-full p-3 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Detect my location"
              >
                <Navigation size={24} className="text-[#2D5151]" />
              </button>
            </div>
            
            {/* Close button */}
            <div className="absolute top-16 right-5 z-10">
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                aria-label="Close map"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Confirm location button */}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10">
              <Button 
                onClick={confirmLocation}
                className="shimmer-button bg-[#211b17] hover:bg-[#3a302b] text-white px-8 py-2 rounded-full shadow-md font-bold"
              >
                Confirm This Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-[#f9f4ee] border-none rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2D5151]">Confirm Your Order</DialogTitle>
            <DialogDescription className="text-[#673f34]">
              Please review your delivery details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-inner border border-[#e9d1c2]">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={18} className="text-[#2D5151]" />
                <h3 className="font-bold text-[#2D5151]">Delivery Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                <div>
                  <p className="text-[#673f34] text-sm font-medium">Address:</p>
                  <p className="text-[#673f34] text-sm">{address}</p>
                </div>
                {zipCode && (
                  <div>
                    <p className="text-[#673f34] text-sm font-medium">Zip:</p>
                    <p className="text-[#673f34] text-sm">{zipCode}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#673f34] text-sm font-medium">Phone:</p>
                  <p className="text-[#673f34] text-sm">{phone}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-inner border border-[#e9d1c2]">
              <h3 className="font-bold text-[#2D5151] mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#e9d1c2] shadow-md">
                    <img 
                      src="/images/ramen_og_circle.png" 
                      alt="Ramen bowl"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[#673f34] font-medium">Tori Paitan Ramen</span>
                    <div className="flex items-center mt-1">
                      <div className="w-6 h-6 bg-[#709b66] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{quantity}</span>
                      </div>
                      <span className="text-[#673f34] text-sm ml-2">× ₹{itemPrice}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-[#2D5151]">₹{totalPrice}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:space-x-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmModalOpen(false)}
              className="border-[#2D5151] text-[#2D5151] hover:bg-[#2D5151] hover:text-white rounded-full"
            >
              Edit Order
            </Button>
            <Button 
              className="bg-[#D57A83] hover:bg-[#c06a73] text-white rounded-full flex items-center gap-2"
              onClick={proceedWithOrder}
            >
              <Check size={16} />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zip Code Error Modal */}
      <Dialog open={isZipCodeErrorModalOpen} onOpenChange={setIsZipCodeErrorModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-[#f9f4ee] border-none rounded-xl shadow-xl">
          <DialogHeader>
            <div className="text-center mb-2">
              <span className="text-3xl inline-block text-[#673f34]">(˶╥︿╥)</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-[#D57A83] text-center">
              We're Sorry
            </DialogTitle>
            <DialogDescription className="text-[#673f34] text-base mt-2">
              Extremely sorry but we are only available in <span className="font-bold text-[#2D5151]">Indiranagar and adjoining areas</span>, we can't service your area.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              className="bg-[#2D5151] hover:bg-[#1a3535] text-white rounded-full"
              onClick={() => setIsZipCodeErrorModalOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderCard;
