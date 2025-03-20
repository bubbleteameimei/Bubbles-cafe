import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Castle, TreePine, Skull, MapPin, Tally4, Waves } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define map location types
type LocationType = 'castle' | 'forest' | 'dungeon' | 'village' | 'ritual' | 'cliff';

// Map location data structure
interface MapLocation {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: LocationType;
  connectedTo: string[];
  sceneId: string;
}

interface GameMapProps {
  visitedScenes: Set<string>;
  currentScene: string;
  onClose: () => void;
  onNavigate: (sceneId: string) => void;
}

export function GameMap({ visitedScenes, currentScene, onClose, onNavigate }: GameMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  
  // Hard-coded map locations
  const mapLocations: MapLocation[] = [
    {
      id: 'castle',
      name: 'Shadowspire Castle',
      position: { x: 50, y: 30 },
      type: 'castle',
      connectedTo: ['forest', 'village'],
      sceneId: 'castle_main'
    },
    {
      id: 'forest',
      name: 'Mistwood Forest',
      position: { x: 25, y: 50 },
      type: 'forest',
      connectedTo: ['castle', 'dungeon'],
      sceneId: 'forest_entrance'
    },
    {
      id: 'dungeon',
      name: 'Crypts of Despair',
      position: { x: 30, y: 70 },
      type: 'dungeon',
      connectedTo: ['forest'],
      sceneId: 'dungeon_entrance'
    },
    {
      id: 'village',
      name: 'Hollow\'s End',
      position: { x: 70, y: 45 },
      type: 'village',
      connectedTo: ['castle', 'ritual', 'cliff'],
      sceneId: 'village_square'
    },
    {
      id: 'ritual',
      name: 'Circle of Binding',
      position: { x: 75, y: 65 },
      type: 'ritual',
      connectedTo: ['village'],
      sceneId: 'ritual_grounds'
    },
    {
      id: 'cliff',
      name: 'Moonfall Cliffs',
      position: { x: 85, y: 20 },
      type: 'cliff',
      connectedTo: ['village'],
      sceneId: 'cliff_edge'
    }
  ];
  
  // Function to check if a location is accessible based on visited scenes
  const isLocationAccessible = (locationId: string): boolean => {
    const location = mapLocations.find(loc => loc.id === locationId);
    if (!location) return false;
    
    // If we've already visited this scene, it's accessible
    if (visitedScenes.has(location.sceneId)) {
      return true;
    }
    
    // If any connected location has been visited, this location is accessible
    return location.connectedTo.some(connectedId => {
      const connectedLocation = mapLocations.find(loc => loc.id === connectedId);
      return connectedLocation && visitedScenes.has(connectedLocation.sceneId);
    });
  };
  
  // Function to get the current location based on current scene
  const getCurrentLocation = (): MapLocation | undefined => {
    return mapLocations.find(location => {
      // Simplified check - in a real game we would have a more robust scene-to-location mapping
      return currentScene.includes(location.id);
    });
  };
  
  // Get locations that have been discovered (visited or adjacent to visited)
  const discoveredLocations = mapLocations.filter(location => 
    visitedScenes.has(location.sceneId) || 
    location.connectedTo.some(connectedId => {
      const connectedLocation = mapLocations.find(loc => loc.id === connectedId);
      return connectedLocation && visitedScenes.has(connectedLocation.sceneId);
    })
  );
  
  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'castle':
        return <Castle className="h-6 w-6" />;
      case 'forest':
        return <TreePine className="h-6 w-6" />;
      case 'dungeon':
        return <Skull className="h-6 w-6" />;
      case 'village':
        return <MapPin className="h-6 w-6" />;
      case 'ritual':
        return <Tally4 className="h-6 w-6" />;
      case 'cliff':
        return <Waves className="h-6 w-6" />;
    }
  };
  
  const getLocationColor = (location: MapLocation) => {
    // Current location
    const currentLoc = getCurrentLocation();
    if (currentLoc && currentLoc.id === location.id) {
      return 'text-amber-400 border-amber-400 bg-amber-950';
    }
    
    // Accessible but not current
    if (isLocationAccessible(location.id)) {
      return 'text-amber-200 border-amber-800/50 bg-amber-950/30 hover:bg-amber-950/50';
    }
    
    // Not accessible
    return 'text-gray-600 border-gray-800 bg-gray-950/30';
  };
  
  const handleLocationClick = (location: MapLocation) => {
    if (isLocationAccessible(location.id)) {
      setSelectedLocation(location);
    }
  };
  
  const handleTravelClick = () => {
    if (selectedLocation) {
      onNavigate(selectedLocation.sceneId);
      onClose();
    }
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-black border-amber-900/50 p-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-amber-50">Map of Eden's Hollow</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="map-container relative w-full h-[400px] bg-gray-950 border border-amber-900/20 rounded-md mb-4">
            {/* Map background */}
            <div className="absolute inset-0 bg-[url('/images/eden-map-bg.jpg')] bg-cover bg-center opacity-30"></div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {discoveredLocations.map(location => (
                location.connectedTo.map(connectedId => {
                  const connectedLocation = mapLocations.find(loc => loc.id === connectedId);
                  if (connectedLocation && discoveredLocations.some(loc => loc.id === connectedId)) {
                    return (
                      <line 
                        key={`${location.id}-${connectedId}`}
                        x1={location.position.x} 
                        y1={location.position.y} 
                        x2={connectedLocation.position.x} 
                        y2={connectedLocation.position.y}
                        stroke={
                          isLocationAccessible(location.id) && isLocationAccessible(connectedId)
                            ? '#b45309' 
                            : '#1f2937'
                        }
                        strokeWidth="1"
                        strokeDasharray={
                          isLocationAccessible(location.id) && isLocationAccessible(connectedId)
                            ? '' 
                            : '3,3'
                        }
                      />
                    );
                  }
                  return null;
                })
              ))}
            </svg>
            
            {/* Location markers */}
            {discoveredLocations.map(location => (
              <div 
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 border rounded-full cursor-pointer transition-all ${getLocationColor(location)}`}
                style={{ 
                  left: `${location.position.x}%`, 
                  top: `${location.position.y}%`,
                }}
                onClick={() => handleLocationClick(location)}
              >
                {getLocationIcon(location.type)}
                
                {/* Name tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {location.name}
                </div>
              </div>
            ))}
          </div>
          
          {selectedLocation ? (
            <div className="p-3 border border-amber-900/30 rounded-md bg-amber-950/10">
              <h3 className="text-lg font-medium text-amber-50 mb-1">{selectedLocation.name}</h3>
              <p className="text-gray-400 text-sm mb-3">
                {(() => {
                  switch (selectedLocation.type) {
                    case 'castle':
                      return 'A foreboding fortress shrouded in dark magic and forgotten memories.';
                    case 'forest':
                      return 'Ancient trees conceal secrets and whisper warnings to those who wander.';
                    case 'dungeon':
                      return 'Deep beneath the earth, ancient rituals still echo through cursed chambers.';
                    case 'village':
                      return 'Once thriving, now haunted by the desperate souls who refused to flee.';
                    case 'ritual':
                      return 'Where the veil between worlds grows thin and old powers stir.';
                    case 'cliff':
                      return 'Overlooking the churning sea, legends say those who leap may find another world.';
                    default:
                      return 'A mysterious location within Eden\'s Hollow.';
                  }
                })()}
              </p>
              
              {getCurrentLocation()?.id !== selectedLocation.id && (
                <Button
                  variant="outline"
                  className="border-amber-900/50 hover:bg-amber-900/20 w-full"
                  onClick={handleTravelClick}
                >
                  Travel to {selectedLocation.name}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Select a location to view details</p>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}