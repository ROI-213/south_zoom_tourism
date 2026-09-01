import { useState, useEffect } from "react";
import { Maximize2, MapPin, X, Camera, ChevronRight } from "lucide-react";
import { gallerySection } from "@/content/site";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

// Original Images Fallback
import destHampi from "@/assets/destinations/dest_hampi_1786683714278.jpg";
import destGokarna from "@/assets/destinations/dest_gokarna_1786683734925.jpg";
import destJogFalls from "@/assets/destinations/dest_jog_falls_1786683754955.jpg";
import destBadami from "@/assets/destinations/dest_badami_1786683832864.jpg";
import destMysuru from "@/assets/destinations/dest-mysuru-new.jpg";
import destCoorg from "@/assets/destinations/dest-coorg.jpg";
import destBengaluru from "@/assets/destinations/dest-bengaluru-new.jpg";
import destMunnar from "@/assets/destinations/dest-munnar-new.png";
import destAlleppey from "@/assets/destinations/dest-alleppey-new.png";
import destKodaikanal from "@/assets/destinations/dest-kodai-new.png";
import destGoa from "@/assets/destinations/dest-goa.jpg";
import destMadurai from "@/assets/destinations/dest-madurai-new.png";
import destOoty from "@/assets/destinations/dest-ooty-new.png";
import destChennai from "@/assets/destinations/dest-chennai.jpg";
import destPondicherry from "@/assets/destinations/dest-pondy-new.png";
import destTirupati from "@/assets/destinations/dest-tirupati-new.png";

type GalleryItem = { id: string; image: string; title: string; location: string; alt: string; span: string };

const defaultStateGalleries: Record<string, GalleryItem[]> = {
  "Karnataka": [
    { id: "ka1", image: destHampi, title: "Golden Hour at Hampi", location: "Hampi Ruins", alt: "Stone chariot in Hampi at sunset", span: "col-span-1 md:col-span-2 md:row-span-2" },
    { id: "ka2", image: destGokarna, title: "Pristine Om Beach", location: "Gokarna Coast", alt: "Aerial view of Om beach", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "ka3", image: destMysuru, title: "Royal Heritage", location: "Mysuru Palace", alt: "Illuminated Mysore Palace at night", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "ka4", image: destJogFalls, title: "Majestic Cascades", location: "Jog Falls", alt: "Jog Falls plunging down the cliff", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "ka5", image: destBadami, title: "Ancient Rock Cuts", location: "Badami Caves", alt: "Badami cave temples by the lake", span: "col-span-1 md:col-span-1 md:row-span-1" },
  ],
  "Kerala": [
    { id: "kl1", image: destMunnar, title: "Tea Gardens", location: "Munnar", alt: "Munnar tea estates", span: "col-span-1 md:col-span-2 md:row-span-2" },
    { id: "kl2", image: destAlleppey, title: "Backwaters Cruise", location: "Alleppey", alt: "Alleppey backwaters", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "kl3", image: destKodaikanal, title: "Wayanad Hills", location: "Wayanad", alt: "Wayanad landscape", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "kl4", image: destGoa, title: "Kovalam Beach", location: "Kovalam", alt: "Kovalam beach", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "kl5", image: destCoorg, title: "Thekkady Wildlife", location: "Thekkady", alt: "Thekkady forest", span: "col-span-1 md:col-span-1 md:row-span-1" },
  ],
  "Tamil Nadu": [
    { id: "tn1", image: destMadurai, title: "Meenakshi Temple", location: "Madurai", alt: "Meenakshi temple", span: "col-span-1 md:col-span-2 md:row-span-2" },
    { id: "tn2", image: destOoty, title: "Nilgiri Railways", location: "Ooty", alt: "Ooty train", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "tn3", image: destChennai, title: "Marina Beach", location: "Chennai", alt: "Chennai beach", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "tn4", image: destKodaikanal, title: "Kodai Lake", location: "Kodaikanal", alt: "Kodaikanal lake", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "tn5", image: destPondicherry, title: "French Quarter", location: "Pondicherry", alt: "Pondicherry streets", span: "col-span-1 md:col-span-1 md:row-span-1" },
  ],
  "Andhra Pradesh": [
    { id: "ap1", image: destTirupati, title: "Tirumala Temple", location: "Tirupati", alt: "Tirupati temple", span: "col-span-1 md:col-span-2 md:row-span-2" },
    { id: "ap2", image: destGoa, title: "RK Beach", location: "Visakhapatnam", alt: "RK Beach", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "ap3", image: destMunnar, title: "Araku Valley", location: "Araku", alt: "Araku Valley", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "ap4", image: destHampi, title: "Borra Caves", location: "Visakhapatnam", alt: "Borra caves", span: "col-span-1 md:col-span-1 md:row-span-1" },
    { id: "ap5", image: destChennai, title: "Amaravathi", location: "Guntur", alt: "Amaravathi", span: "col-span-1 md:col-span-1 md:row-span-1" },
  ],
};

const lightStates = new Set(["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh"]);
const bgClasses: Record<string, string> = {
  "Karnataka": "bg-amber-50 text-slate-900",
  "Kerala": "bg-amber-50 text-slate-900",
  "Tamil Nadu": "bg-amber-50 text-slate-900",
  "Andhra Pradesh": "bg-amber-50 text-slate-900",
};
const defaultBg = "bg-amber-50 text-slate-900";

export function GalleryPreview() {
  const [stateGalleries, setStateGalleries] = useState<Record<string, GalleryItem[]>>(defaultStateGalleries);
  const states = Object.keys(stateGalleries);
  const [activeState, setActiveState] = useState(states[0] || "Karnataka");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    async function loadLiveGallery() {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .eq("active", true)
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const grouped: Record<string, GalleryItem[]> = { ...defaultStateGalleries };
          data.forEach((item, index) => {
            const cat = item.category || "Karnataka";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({
              id: item.id,
              image: item.image_url,
              title: item.alt_text || "South India Sightseeing",
              location: cat,
              alt: item.alt_text || "South Zoom Tour Photo",
              span: index === 0 ? "col-span-1 md:col-span-2 md:row-span-2" : "col-span-1 md:col-span-1 md:row-span-1",
            });
          });
          setStateGalleries(grouped);
        }
      } catch (err) {
        console.error("Using static gallery fallback", err);
      }
    }
    loadLiveGallery();
  }, []);

  const sectionBg = bgClasses[activeState] || defaultBg;
  const isLight = lightStates.has(activeState);

  // Auto rotate states
  useEffect(() => {
    const timer = setInterval(() => {
      if (!selectedImage && states.length > 0) {
        handleStateChange(states[(states.indexOf(activeState) + 1) % states.length]);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [activeState, selectedImage, states]);

  const handleStateChange = (state: string) => {
    if (state === activeState) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveState(state);
      setIsAnimating(false);
    }, 300);
  };

  if (!gallerySection.meta.visible) return null;
  const currentImages = stateGalleries[activeState] || [];

  return (
    <section
      id="gallery"
      className={`relative overflow-hidden py-16 sm:py-24 ${sectionBg}`}
    >
      {/* Decorative Elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-amber-900/20 to-transparent" />
      <div className="pointer-events-none absolute right-10 top-20 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col mb-10">
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${isLight ? "text-slate-900" : "text-white"}`}>
            India Through <span className="text-amber-500">Our Lens</span>
          </h2>
          <p className={`text-lg max-w-2xl ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Immerse yourself in the vibrant heritage, untouched nature, and timeless architecture of India. 
          </p>
        </div>

        {/* State Selection Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8">
          {states.map((state) => (
            <button
              key={state}
              onClick={() => handleStateChange(state)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                activeState === state
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:text-amber-600 shadow-sm"
              }`}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Mobile View */}
        <div className={`md:hidden flex flex-col gap-2.5 transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
          <div className="grid grid-cols-2 gap-2.5">
            {currentImages.slice(0, 2).map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedImage(g)}
                className="group relative h-[160px] overflow-hidden rounded-xl cursor-pointer shadow-md ring-1 ring-slate-200"
              >
                <img
                  src={g.image}
                  alt={g.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-2.5">
                  <p className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{g.location}</span>
                  </p>
                  <h3 className="text-xs font-bold text-white leading-tight truncate">
                    {g.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {currentImages.slice(2, 5).map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedImage(g)}
                className="group relative h-[130px] overflow-hidden rounded-xl cursor-pointer shadow-md ring-1 ring-slate-200"
              >
                <img
                  src={g.image}
                  alt={g.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-2">
                  <p className="mb-0.5 flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400 truncate">
                    <MapPin className="h-2 w-2 shrink-0" />
                    <span className="truncate">{g.location}</span>
                  </p>
                  <h3 className="text-[11px] font-bold text-white leading-tight truncate">
                    {g.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Bento Grid */}
        <div className={`hidden md:grid md:grid-cols-4 gap-3 md:gap-4 auto-rows-[250px] transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
          {currentImages.map((g) => (
            <div
              key={g.id}
              onClick={() => setSelectedImage(g)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${g.span} shadow-md hover:shadow-2xl transition-all duration-500 ring-1 ${isLight ? "ring-slate-200 hover:ring-amber-400" : "ring-white/10 hover:ring-amber-500/50"} z-10 hover:z-20`}
            >
              <img
                src={g.image}
                alt={g.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-500 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 border border-white/20">
                <Maximize2 className="h-4 w-4" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 transition-all duration-500 group-hover:translate-y-0">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {g.location}
                </p>
                <h3 className="text-2xl font-bold text-white shadow-sm leading-tight">
                  {g.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-5xl border-none bg-slate-950/95 p-0 text-white overflow-hidden shadow-2xl backdrop-blur-xl">
            <DialogTitle className="sr-only">
              {selectedImage?.title ?? "Gallery Preview"}
            </DialogTitle>
            <div className="relative flex flex-col items-center justify-center min-h-[50vh]">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:scale-105"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
              {selectedImage ? (
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full bg-black/50">
                     <img
                       src={selectedImage.image}
                       alt={selectedImage.alt}
                       className="max-h-[85vh] w-full object-contain"
                     />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-8 pt-20 flex justify-between items-end">
                    <div>
                      <h4 className="text-3xl font-black text-white">{selectedImage.title}</h4>
                      <p className="mt-2 text-slate-300 flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-amber-500" /> {selectedImage.location}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-slate-400 font-medium">
                       <Camera className="h-5 w-5" />
                       {activeState} Gallery
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
