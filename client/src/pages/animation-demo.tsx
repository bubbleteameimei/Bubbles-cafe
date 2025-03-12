import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import NightModeWrapper from "../components/NightModeWrapper";
import Modal, { useModal } from "../components/ui/modal";
import MistDivider from "../components/ui/MistDivider";
import MistEffect from "../components/effects/MistEffect";
import FloatingParticles from "../components/effects/FloatingParticles";
import HorrorParticles from "../components/effects/HorrorParticles";
import SearchBar from "../components/SearchBar";

const AnimationDemoPage = () => {
  const [nightMode, setNightMode] = useState(false);
  const [particleType, setParticleType] = useState<"dust" | "fog" | "embers" | "paper" | "snow" | "blood">("dust");
  const [horrorType, setHorrorType] = useState<"ghost" | "blood" | "ash" | "flies" | "fog">("ash");
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
  const [mistIntensity, setMistIntensity] = useState<"light" | "medium" | "heavy">("medium");
  const { isOpen, openModal, closeModal } = useModal();

  // Mock data for the search bar
  const { data: posts } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      // This would be a real API call in production
      return [
        { id: 1, title: "The Haunting", excerpt: "A ghost story about..." },
        { id: 2, title: "Midnight Terror", excerpt: "When the clock strikes..." },
        { id: 3, title: "Shadows in the Attic", excerpt: "The family never..." },
      ];
    },
  });

  return (
    <NightModeWrapper forceNightMode={nightMode}>
      <div className="min-h-screen p-8 relative overflow-hidden">
        {/* Top controls */}
        <div className="relative z-10 mb-10 flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight">Animation Effects Demo</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant={nightMode ? "default" : "outline"} 
              onClick={() => setNightMode(!nightMode)}
            >
              {nightMode ? "Disable" : "Enable"} Night Mode
            </Button>
            
            <Button variant="outline" onClick={openModal}>
              Open Modal Demo
            </Button>
          </div>

          <SearchBar showIcon animate className="w-full max-w-md" />
        </div>

        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <FloatingParticles 
            type={particleType} 
            density={intensity} 
            className="opacity-70"
          />
        </div>

        <MistDivider className="my-8" variant="accent" />

        <Tabs defaultValue="particles" className="relative z-10">
          <TabsList className="mb-4">
            <TabsTrigger value="particles">Floating Particles</TabsTrigger>
            <TabsTrigger value="horror">Horror Particles</TabsTrigger>
            <TabsTrigger value="mist">Mist Effects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="particles" className="space-y-6">
            <div className="p-6 bg-background/80 backdrop-blur rounded-lg border relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">Floating Particles Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="type">Particle Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {["dust", "fog", "embers", "paper", "snow", "blood"].map((type) => (
                      <Button
                        key={type}
                        variant={particleType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setParticleType(type as any)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="intensity">Particle Intensity</Label>
                  <div className="flex flex-wrap gap-2">
                    {["low", "medium", "high"].map((level) => (
                      <Button
                        key={level}
                        variant={intensity === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIntensity(level as any)}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="horror" className="space-y-6">
            <div className="p-6 bg-background/80 backdrop-blur rounded-lg border relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">Horror Particles Settings</h2>
              
              <div className="space-y-4">
                <Label htmlFor="horror-type">Horror Type</Label>
                <div className="flex flex-wrap gap-2">
                  {["ghost", "blood", "ash", "flies", "fog"].map((type) => (
                    <Button
                      key={type}
                      variant={horrorType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHorrorType(type as any)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8 relative h-48 border rounded-md overflow-hidden">
                <HorrorParticles 
                  type={horrorType}
                  intensity={intensity}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xl font-bold text-white bg-black/30 backdrop-blur-sm p-3 rounded">
                    {horrorType.toUpperCase()} Effect
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mist" className="space-y-6">
            <div className="p-6 bg-background/80 backdrop-blur rounded-lg border relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">Mist Effect Settings</h2>
              
              <div className="space-y-4">
                <Label htmlFor="mist-intensity">Mist Intensity</Label>
                <div className="flex flex-wrap gap-2">
                  {["light", "medium", "heavy"].map((level) => (
                    <Button
                      key={level}
                      variant={mistIntensity === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMistIntensity(level as any)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8 relative h-48 border rounded-md overflow-hidden">
                <MistEffect 
                  intensity={mistIntensity}
                  color={nightMode ? "rgba(15, 10, 15, 0.7)" : "rgba(40, 30, 40, 0.5)"}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xl font-bold text-white bg-black/30 backdrop-blur-sm p-3 rounded">
                    {mistIntensity.toUpperCase()} Mist Effect
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <MistDivider className="my-8" />

        <div className="mt-12 text-center">
          <motion.div 
            className="inline-block"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <h2 className="text-2xl font-bold">Interactive Horror Fiction Platform</h2>
          </motion.div>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            This demo showcases the visual effects available for the horror story platform. 
            These effects can be combined to create immersive atmospheres that enhance the reading experience.
          </p>
        </div>

        {/* Modal demo */}
        <Modal isOpen={isOpen} onClose={closeModal} title="Horror Effect Demo">
          <div className="relative overflow-hidden rounded-md h-64">
            <HorrorParticles type="ghost" className="z-10" />
            <MistEffect intensity="medium" className="z-0" />
            
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Layered Effects</h3>
                <p className="text-sm opacity-80 mb-4">
                  Effects can be combined and layered to create unique atmospheres
                </p>
                <Button variant="outline" onClick={closeModal}>
                  Close Demo
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </NightModeWrapper>
  );
};

export default AnimationDemoPage;