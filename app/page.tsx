"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";

// Constants
const ANIMATION_DELAY = 50;
const SCROLL_THRESHOLD = 300;
const OBSERVER_OPTIONS = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

type Activity = {
  activity: string;
  time?: string | null;
  cost?: string | null;
  note?: string | null;
};

type Day = {
  day: string;
  location: string;
  schedule: Activity[];
};

const itinerary = [
  {
    day: "Day 1 (Sun, 1 Mar)",
    location: "Osaka",
    schedule: [
      { time: "01:30", activity: "Flight SIN → KIX", cost: null, icon: "✈️", note: "Overnight Scoot flight – bring neck pillow and download shows 🎧" },
      { time: "08:35", activity: "Arrive Kansai Airport → Nankai Airport Express to Namba (52 min)", cost: "¥970", icon: "🚆", note: "Buy ICOCA card here for trains; signage is in English." },
      { time: "15:00", activity: "Check-in karaksa hotel Osaka Namba", cost: null, icon: "🏨", note: "Leave luggage first if room not ready." },
      { time: "16:00", activity: "Kuromon Market → Namba Yasaka Shrine", cost: null, icon: "⛩️", note: "Try takoyaki, fresh seafood skewers; lion-head shrine is unique." },
      { time: "18:00", activity: "Shinsaibashi-Suji Shopping Street", cost: null, icon: "🛍️", note: "Good for souvenirs; Don Quijote nearby." },
      { time: "19:00", activity: "Dotonbori dinner / OTOT", cost: null, icon: "🍜", note: "Famous for Glico sign; try okonomiyaki or ramen." },
      { time: "21:30", activity: "Return hotel & rest", cost: null, icon: "•", note: "Recharge for USJ tomorrow." },
    ]
  },
  {
    day: "Day 2 (Mon, 2 Mar)",
    location: "Osaka",
    schedule: [
      { time: "08:00", activity: "Breakfast, head to JR station", cost: null, icon: "🍜", note: "Convenience store breakfast is quick & cheap." },
      { time: "09:00", activity: "Train to USJ (~35 min)", cost: "¥390", icon: "🚆", note: "Take JR Yumesaki Line; follow the crowds." },
      { time: "09:30 – 19:00", activity: "Universal Studios Japan", cost: null, icon: "🎢", note: "Enter early; head straight to Nintendo World. Express Pass recommended." },
      { time: "19:30", activity: "Optional Tsutenkaku Tower / Shinsekai", cost: null, icon: "•", note: "Retro Osaka vibes, good for night stroll if not too tired." },
      { time: "21:30", activity: "Back to hotel", cost: null, icon: "🏨", note: "Rest – tomorrow is Cup Noodles Museum + shopping." },
    ]
  },
  {
    day: "Day 3 (Tue, 3 Mar)",
    location: "Osaka",
    schedule: [
      { time: "09:00", activity: "Train to Ikeda (~40 min)", cost: null, icon: "🚆", note: "Cup Noodles Museum is near Ikeda Station." },
      { time: "10:00", activity: "Cup Noodles Museum Osaka Ikeda", cost: null, icon: "🍜", note: "DIY cup noodles – fun souvenir." },
      { time: "12:30", activity: "Lunch", cost: null, icon: "🍜", note: "Try local ramen nearby." },
      { time: "13:30", activity: "Optional: Tsurumi Ryokuchi Park / Sakuya Konohana Kan", cost: null, icon: "⛩️", note: "Nice if weather is good, else skip." },
      { time: "16:00", activity: "Free shopping (OTOT) Dotonbori/Shinsaibashi", cost: null, icon: "🛍️", note: "Great time to buy snacks & souvenirs." },
      { time: "21:30", activity: "Back hotel", cost: null, icon: "🏨", note: "Pack & prepare for Kyoto transfer tomorrow." },
    ]
  },
  {
    day: "Day 4 (Wed, 4 Mar)",
    location: "Osaka → Kyoto",
    schedule: [
      { time: "09:00", activity: "Last walk Namba", cost: null, icon: "🛍️", note: "Grab last-minute souvenirs." },
      { time: "11:00", activity: "Check out → JR Special Rapid Osaka → Kyoto (~1 hr)", cost: "¥1,100", icon: "🚆", note: "JR pass can be used here." },
      { time: "15:00", activity: "Check-in Hotel Keihan Kyoto Ekiminami", cost: null, icon: "🏨", note: "Hotel near Kyoto Station for easy access." },
      { time: "15:30", activity: "Fushimi Inari Taisha", cost: null, icon: "⛩️", note: "Famous red torii gates. Can climb halfway only." },
      { time: "17:30", activity: "Arashiyama (Bamboo Forest, Kimono Forest, Monkey Park, Jōjakkō-ji Temple)", cost: null, icon: "⛩️", note: "Best around sunset for photos." },
      { time: "19:30", activity: "Dinner Kyoto Tower Sando Food Hall", cost: null, icon: "🍜", note: "Variety of stalls under Kyoto Tower." },
      { time: "21:00", activity: "Back hotel", cost: null, icon: "🏨", note: "Rest well – early Shinkansen tomorrow." },
    ]
  },
  {
    day: "Day 5 (Thu, 5 Mar)",
    location: "Kyoto → Fujikawaguchiko",
    schedule: [
      { time: "07:30", activity: "Morning walk / last shopping Kyoto Station (Yodobashi, Avanti, Porta)", cost: null, icon: "🛍️", note: "Good time for Kyoto souvenirs." },
      { time: "10:30", activity: "Return hotel, check out by 11:00", cost: null, icon: "🏨", note: "Pack light for Shinkansen ride." },
      { time: "11:30", activity: "Shinkansen Kyoto → Mishima (~2 hr)", cost: "¥9,000", icon: "🚆", note: "Reserve seats on Hikari line." },
      { time: "14:00", activity: "Mishima → Kawaguchiko bus (~1 hr 40 min)", cost: "¥2,600", icon: "🚌", note: "Scenic bus ride with Mt Fuji views." },
      { time: "16:00", activity: "Check-in Fujikawaguchiko Resort Hotel", cost: null, icon: "🏨", note: "Ryokan-style stay, includes onsen." },
      { time: "16:30", activity: "Short walk by Lake Kawaguchi (sunset view)", cost: null, icon: "⛩️", note: "Beautiful view of Mt Fuji if clear sky." },
      { time: "18:30", activity: "Dinner + onsen", cost: null, icon: "🍜", note: "Multi-course kaiseki dinner, relax in onsen." },
      { time: "20:30", activity: "Rest at hotel", cost: null, icon: "•", note: "Sleep early for sightseeing tomorrow." },
    ]
  },
  {
    day: "Day 6 (Fri, 6 Mar)",
    location: "Fujikawaguchiko",
    schedule: [
      { time: "08:00", activity: "Sightseeing bus (day pass)", cost: "¥1,500", icon: "🚌", note: "Covers all Kawaguchiko sightseeing loops." },
      { time: "08:30", activity: "Lake Kawaguchi cruise / ropeway", cost: null, icon: "🎢", note: "Ropeway gives great Mt Fuji backdrop for photos." },
      { time: "11:00", activity: "Chureito Pagoda (optional)", cost: null, icon: "⛩️", note: "Best spot for Fuji + pagoda shots; some stairs to climb." },
      { time: "13:00", activity: "Lunch", cost: null, icon: "🍜", note: "Try houtou noodles (local specialty)." },
      { time: "14:00", activity: "Fuji-Q Highland OR continue lake sightseeing", cost: null, icon: "🎢", note: "Choose thrill rides or relaxing lakeside walk." },
      { time: "18:00", activity: "Dinner + onsen", cost: null, icon: "♨️", note: "Hotel dinner, soak in onsen." },
      { time: "20:30", activity: "Back hotel", cost: null, icon: "🏨", note: "Rest and prepare to head Tokyo tomorrow." },
    ]
  },
  {
    day: "Day 7 (Sat, 7 Mar)",
    location: "Fuji → Tokyo",
    schedule: [
      { time: "08:00", activity: "Morning walk near Kawaguchiko Lake / Oishi Park", cost: null, icon: "⛩️", note: "Calm morning Fuji view." },
      { time: "10:00", activity: "Hotel check out", cost: null, icon: "🏨", note: "Settle bills, leave early to catch bus." },
      { time: "10:30", activity: "Bus Kawaguchiko → Tokyo (Shinjuku/Akihabara, ~2.5 hr)", cost: "¥2,000", icon: "🚌", note: "Book tickets in advance, can be crowded." },
      { time: "13:30", activity: "Arrive Shinjuku/Akihabara → JR Chuo Line if needed (~20 min)", cost: "¥210", icon: "🚆", note: "Transfer if hotel nearer Akiba." },
      { time: "15:00", activity: "Check-in Hotaku HOTEL Akihabara", cost: null, icon: "🏨", note: "Small business hotel in Akiba." },
      { time: "16:00", activity: "Light explore Akihabara (OTOT)", cost: null, icon: "🛍️", note: "Figure shops, arcades, maid cafes." },
      { time: "21:30", activity: "Back hotel", cost: null, icon: "•", note: "Rest – tomorrow is full Akiba day." },
    ]
  },
  {
    day: "Day 8 (Sun, 8 Mar)",
    location: "Tokyo (Akihabara)",
    schedule: [
      { time: "09:30", activity: "Explore Radio Kaikan, AmiAmi, Lashinbang, Yellow Submarine", cost: null, icon: "🛍️", note: "Otaku shopping heaven – figures, cards, retro games." },
      { time: "12:30", activity: "Lunch in Akihabara", cost: null, icon: "🍜", note: "Try maid café if curious, or tonkatsu/ramen spots." },
      { time: "13:30", activity: "Continue shopping / OTOT", cost: null, icon: "🛍️", note: "Animate, Surugaya, Super Potato (retro games)." },
      { time: "18:30", activity: "Dinner nearby", cost: null, icon: "🍜", note: "Plenty of izakayas & ramen shops in Akiba." },
      { time: "20:30", activity: "Back hotel", cost: null, icon: "🏨", note: "Prepare for Shibuya adventure tomorrow." },
    ]
  },
  {
    day: "Day 9 (Mon, 9 Mar)",
    location: "Tokyo (Shibuya + Harajuku)",
    schedule: [
      { time: "09:00", activity: "Train to Shibuya (~28 min)", cost: "¥210", icon: "🚆", note: "JR Yamanote Line from Akihabara." },
      { time: "09:30", activity: "Shibuya Crossing, Mag's Park Rooftop, Shibuya 109", cost: null, icon: "🛍️", note: "Iconic crossing + trendy shopping." },
      { time: "12:30", activity: "Lunch in Shibuya", cost: null, icon: "🍜", note: "Plenty of izakayas and ramen chains." },
      { time: "14:00", activity: "Walk to Harajuku (Takeshita Street, Meiji Shrine)", cost: null, icon: "⛩️", note: "Street fashion + traditional shrine." },
      { time: "18:00", activity: "Dinner Harajuku/Shinjuku", cost: null, icon: "🍜", note: "Try gyukatsu Motomura (famous beef cutlet)." },
      { time: "20:00", activity: "Optional Shinjuku nightlife", cost: null, icon: "🎢", note: "Golden Gai bars or Omoide Yokocho." },
      { time: "22:30", activity: "Back hotel", cost: null, icon: "🏨", note: "Rest after busy day." },
    ]
  },
  {
    day: "Day 10 (Tue, 10 Mar)",
    location: "Tokyo (Asakusa)",
    schedule: [
      { time: "09:00", activity: "Train to Asakusa (~15–20 min)", cost: null, icon: "🚆", note: "Direct via Ginza Line." },
      { time: "09:30", activity: "Kaminarimon → Nakamise shopping → Senso-ji Temple", cost: null, icon: "⛩️", note: "One of Tokyo's most famous temples." },
      { time: "12:30", activity: "Lunch at Asakusa", cost: null, icon: "🍜", note: "Try tempura or melonpan snacks." },
      { time: "14:00", activity: "Optional Tokyo Skytree", cost: null, icon: "🎢", note: "Observation deck with skyline view." },
      { time: "17:00", activity: "Return Akihabara, OTOT shopping", cost: null, icon: "🛍️", note: "Catch up on card/figure shopping." },
      { time: "21:00", activity: "Back hotel", cost: null, icon: "🏨", note: "Relax after walking day." },
    ]
  },
  {
    day: "Day 11 (Wed, 11 Mar)",
    location: "Tokyo (Tokyo Dome)",
    schedule: [
      { time: "09:30", activity: "Train Akihabara → Suidobashi (~7 min)", cost: "¥170", icon: "🚆", note: "Quick JR ride." },
      { time: "10:00", activity: "Tokyo Dome City", cost: null, icon: "🎢", note: "Mini theme park + shopping mall." },
      { time: "11:00", activity: "Baseball Hall of Fame (optional, ~1 hr)", cost: null, icon: "🎢", note: "For sports/history fans." },
      { time: "12:30", activity: "Lunch Dome area", cost: null, icon: "🍜", note: "Plenty of casual restaurants around." },
      { time: "14:00", activity: "Korakuen Hall / Dome shopping", cost: null, icon: "🛍️", note: "Wrestling hall & shops." },
      { time: "18:00", activity: "Dinner Tokyo Ramen Street (Tokyo Station nearby)", cost: null, icon: "🍜", note: "Famous ramen alley inside Tokyo Station." },
      { time: "20:30", activity: "Back hotel", cost: null, icon: "🏨", note: "Good rest day." },
    ]
  },
  {
    day: "Day 12 (Thu, 12 Mar)",
    location: "Tokyo (Gotokuji Temple / Setagaya)",
    schedule: [
      { time: "09:00", activity: "Train Akihabara → Gotokuji (~40 min)", cost: "¥400", icon: "🚆", note: "Known as the Lucky Cat temple." },
      { time: "10:00", activity: "Gotokuji (Maneki-neko temple)", cost: null, icon: "⛩️", note: "Thousands of beckoning cat statues." },
      { time: "12:30", activity: "Lunch Setagaya area", cost: null, icon: "🍜", note: "Local cafes, quieter vibe." },
      { time: "14:00", activity: "Local shrines walk (Setagaya Hachimangu, Shōin Shrine)", cost: null, icon: "⛩️", note: "Less touristy, more peaceful." },
      { time: "16:00", activity: "Return Akiba", cost: null, icon: "🚆", note: "Relaxing afternoon." },
      { time: "18:30", activity: "Dinner, OTOT", cost: null, icon: "🍜", note: "Free choice of izakaya or ramen shop." },
      { time: "20:30", activity: "Back hotel", cost: null, icon: "🏨", note: "Prepare for Yokohama tomorrow." },
    ]
  },
  {
    day: "Day 13 (Fri, 13 Mar)",
    location: "Yokohama (Minato Mirai)",
    schedule: [
      { time: "08:30", activity: "Train Akiba → Yokohama (~1 hr)", cost: "¥570", icon: "🚆", note: "JR or Tokyu line option." },
      { time: "09:30", activity: "Cosmo World (Ferris wheel, arcades)", cost: null, icon: "🎢", note: "Great for rides + photos." },
      { time: "11:00", activity: "Red Brick Warehouse shopping", cost: null, icon: "🛍️", note: "Trendy shops + bayfront." },
      { time: "12:30", activity: "Lunch in Minato Mirai", cost: null, icon: "🍜", note: "Plenty of seaside dining." },
      { time: "14:00", activity: "Osanbashi Pier / waterfront walk", cost: null, icon: "⛩️", note: "Best open view of Yokohama Bay." },
      { time: "15:30", activity: "Optional: Shin-Yokohama Ramen Museum (~20 min train)", cost: null, icon: "🍜", note: "Try regional ramen styles in themed building." },
      { time: "17:30", activity: "Return Tokyo", cost: null, icon: "🚆", note: "Evening back to Akiba." },
      { time: "19:00", activity: "Dinner in Shinjuku or Akiba", cost: null, icon: "🍜", note: "Nightlife if energy left." },
      { time: "22:00", activity: "Back hotel", cost: null, icon: "🏨", note: "Rest after day trip." },
    ]
  },
  {
    day: "Day 14 (Sat, 14 Mar)",
    location: "Tokyo (Ghibli Museum)",
    schedule: [
      { time: "08:30", activity: "Train Akiba → Mitaka (~40 min)", cost: "¥400", icon: "🚆", note: "Book advance tickets for Ghibli." },
      { time: "09:30", activity: "Ghibli Museum", cost: null, icon: "🎢", note: "Photography not allowed inside, enjoy atmosphere." },
      { time: "12:30", activity: "Lunch in Kichijoji", cost: null, icon: "🍜", note: "Nice shopping town with cozy cafes." },
      { time: "14:00", activity: "Inokashira Park + shopping in Kichijoji", cost: null, icon: "⛩️", note: "Relax at lake, street performers on weekends." },
      { time: "17:00", activity: "Return Akiba", cost: null, icon: "🚆", note: "Evening free." },
      { time: "19:00", activity: "Dinner", cost: null, icon: "🍜", note: "Could try wagyu yakiniku or sushi." },
      { time: "21:00", activity: "Back hotel", cost: null, icon: "🏨", note: "Pack small items ahead." },
    ]
  },
  {
    day: "Day 15 (Sun, 15 Mar)",
    location: "Tokyo (Free Day)",
    schedule: [
      { time: "Flexible", activity: "TeamLab Planets / Odaiba OR Ginza shopping OR Ikebukuro", cost: null, icon: "🎢", note: "Pick depending on mood & weather." },
      { time: "12:30", activity: "Lunch", cost: null, icon: "🍜", note: "Choose near chosen district." },
      { time: "18:30", activity: "Dinner + pack luggage", cost: null, icon: "🍜", note: "Final Japan dinner – izakaya or sushi." },
      { time: "21:00", activity: "Back hotel early", cost: null, icon: "🏨", note: "Pack up for flight." },
    ]
  },
  {
    day: "Day 16 (Mon, 16 Mar)",
    location: "Tokyo → Singapore",
    schedule: [
      { time: "09:00", activity: "Last-minute shopping near Akiba", cost: null, icon: "🛍️", note: "Animate or Donki quick run." },
      { time: "11:00", activity: "Check out hotel", cost: null, icon: "🏨", note: "Leave bags at reception if needed." },
      { time: "11:30", activity: "JR Akiba → Hamamatsucho (18 min)", cost: "¥170", icon: "🚆", note: "JR Yamanote Line." },
      { time: "12:00", activity: "Tokyo Monorail → Haneda (20 min)", cost: "¥500", icon: "🚆", note: "Check-in at least 2 hrs before flight." },
      { time: "16:40", activity: "Flight HND → SIN", cost: null, icon: "✈️", note: "Evening Scoot flight back home." },
    ]
  },
];

export default function Home() {
  const [openDays, setOpenDays] = useState<Set<number>>(new Set());
  const [showButton, setShowButton] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [countdown, setCountdown] = useState("");
  const [tripProgress, setTripProgress] = useState(0);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Refs for scroll animations - typed
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Set<Element>>(new Set());

  const tripStart = new Date("2026-03-01T00:00:00");
  const tripEnd = new Date("2026-03-16T23:59:59");

  // Memoized calculations
  const sections = useMemo(() => ({
    Osaka: [0, 3],
    Kyoto: [3, 5],
    Fuji: [5, 7],
    Tokyo: [7, itinerary.length],
  }), []);

  // Enhanced day classification
  const getDayType = useCallback((day: Day) => {
  if (day.day.includes("→")) return "travel";
  if (day.schedule.length <= 3) return "light";

  const highlightKeywords = ["usj", "ghibli", "teamlab", "fuji-q"];
  if (day.schedule.some(item =>
    highlightKeywords.some(keyword =>
      item.activity.toLowerCase().includes(keyword)
    )
  )) return "highlight";

  return "regular";
}, []);

  const getDayIntensity = useCallback((day: Day): "high" | "medium" | "low" => {
  const activityCount = day.schedule.filter(
    (item) =>
      !item.activity.toLowerCase().includes("hotel") &&
      !item.activity.toLowerCase().includes("rest") &&
      !item.activity.toLowerCase().includes("back")
  ).length;

  if (activityCount >= 6) return "high";
  if (activityCount >= 4) return "medium";
  return "low";
}, []);

  const getActivityIcon = useCallback(
  (activity: string): { icon: string; color: string } => {
    const activityLower = activity.toLowerCase();

    if (activityLower.includes("flight")) return { icon: "✈️", color: "flight" };
    if (activityLower.includes("train") || activityLower.includes("jr"))
      return { icon: "🚆", color: "train" };
    if (activityLower.includes("bus")) return { icon: "🚌", color: "bus" };
    if (activityLower.includes("hotel") || activityLower.includes("check-in"))
      return { icon: "🏨", color: "hotel" };
    if (activityLower.includes("shrine") || activityLower.includes("temple"))
      return { icon: "⛩️", color: "shrine" };
    if (activityLower.includes("shopping"))
      return { icon: "🛍️", color: "shopping" };
    if (
      activityLower.includes("lunch") ||
      activityLower.includes("dinner") ||
      activityLower.includes("breakfast")
    )
      return { icon: "🍜", color: "food" };
    if (activityLower.includes("onsen")) return { icon: "♨️", color: "onsen" };
    if (
      activityLower.includes("usj") ||
      activityLower.includes("ghibli") ||
      activityLower.includes("fuji-q") ||
      activityLower.includes("teamlab")
    )
      return { icon: "🎢", color: "attraction" };

    return { icon: "📍", color: "default" };
  },
  []
);

  // Fixed activity summary
  const getActivitySummary = useCallback(
  (
    schedule: Activity[]
  ): { highlights: string[]; moreCount: number } => {
    const filtered = schedule.filter(
      (item) =>
        !item.activity.toLowerCase().includes("hotel") &&
        !item.activity.toLowerCase().includes("back") &&
        !item.activity.toLowerCase().includes("rest")
    );

    const highlights = filtered
      .slice(0, 3)
      .map((item) => getActivityIcon(item.activity).icon);

    const moreCount = Math.max(0, filtered.length - 3);
    return { highlights, moreCount };
  },
  [getActivityIcon]
);


  const matchesSearch = useCallback(
  (text: string = ""): boolean => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return text.toLowerCase().includes(query);
  },
  [search]
);

  // Optimized intersection observer - only run once
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !observedElementsRef.current.has(entry.target)) {
          entry.target.classList.add('revealed');
          observedElementsRef.current.add(entry.target);
        }
      });
    }, OBSERVER_OPTIONS);

    // Observe all scroll reveal elements
    const scrollElements = document.querySelectorAll(`
      .scroll-reveal,
      .scroll-reveal-left,
      .scroll-reveal-right,
      .scroll-reveal-scale
    `);

    scrollElements.forEach(el => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []); // Run only once

  // Optimized scroll handler
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          setScrollProgress((scrollTop / height) * 100);
          setShowButton(scrollTop > SCROLL_THRESHOLD);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Trip countdown and progress with better date handling
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      if (now < tripStart) {
        const diff = tripStart.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setCountdown(`${days} ${days === 1 ? 'day' : 'days'} to go`);
        setTripProgress(0);
      } else if (now > tripEnd) {
        setCountdown("Trip completed");
        setTripProgress(100);
      } else {
        // During trip - calculate which day we're on
        const totalDuration = tripEnd.getTime() - tripStart.getTime();
        const elapsed = now.getTime() - tripStart.getTime();
        const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
        const currentDay = Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1;
        
        // Ensure currentDay doesn't exceed totalDays
        const clampedDay = Math.min(currentDay, totalDays);
        
        setCountdown(`Day ${clampedDay} of ${totalDays}`);
        setTripProgress(Math.min((elapsed / totalDuration) * 100, 100));
      }
    };

    updateCountdown();
    
    // Update every hour, or more frequently if trip is active
    const now = new Date();
    const updateInterval = (now >= tripStart && now <= tripEnd) ? 
      1000 * 60 * 15 : // Every 15 minutes during trip
      1000 * 60 * 60;   // Every hour before/after trip
    
    const interval = setInterval(updateCountdown, updateInterval);
    return () => clearInterval(interval);
  }, [tripStart, tripEnd]);

  // Optimized toggle functions
  const toggleDay = useCallback((idx: number) => {
  setOpenDays((prev) => {
    const newSet = new Set(prev);
    newSet.has(idx) ? newSet.delete(idx) : newSet.add(idx);
    return newSet;
  });
}, []);

  const collapseAll = useCallback(() => setOpenDays(new Set()), []);
  
  const expandAll = useCallback(() => {
    setOpenDays(new Set(Array.from({ length: itinerary.length }, (_, i) => i)));
  }, []);

   const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // adjust for sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback(
  (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  },
  []
);

  // Filtered itinerary based on search
  const filteredItinerary = useMemo(() => {
    if (!search.trim()) return itinerary;
    
    return itinerary.filter(day => 
      matchesSearch(day.day) ||
      matchesSearch(day.location) ||
      day.schedule.some(item =>
        matchesSearch(item.activity) ||
        (item.note && matchesSearch(item.note)) ||
        (item.cost && matchesSearch(item.cost))
      )
    );
  }, [search, matchesSearch]);

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-label="Page scroll progress"
      />

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <Image 
            src="/shiba.png" 
            alt="Shiba Inu mascot for Japan trip" 
            width={120} 
            height={120}
            className="scroll-reveal-scale"
            priority
          />
          <h1 className="scroll-reveal">Japan Trip Itinerary</h1>
          <p className="scroll-reveal">1 – 16 Mar 2026 · Osaka · Kyoto · Fuji · Tokyo</p>

          {/* Trip Progress */}
          <div className="trip-info scroll-reveal">
            <p className="trip-countdown">{countdown}</p>
            <div className="trip-progress" role="progressbar" aria-valuenow={tripProgress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="trip-progress-bar"
                style={{ width: `${tripProgress}%` }}
              />
            </div>
            <div className="trip-progress-label">
              {Math.round(tripProgress)}% of trip completed
            </div>
          </div>

          {/* Search + Navigation */}
          <div className="hero-actions scroll-reveal">
            <input
              type="text"
              placeholder="🔎 Search day or activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search itinerary"
            />
            <div className="nav-inline">
              {Object.keys(sections).map((key) => (
                <button
                  key={key}
                  onClick={() => scrollToSection(key)}
                  onKeyDown={(e) => handleKeyDown(e, () => scrollToSection(key))}
                  aria-label={`Navigate to ${key} section`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar scroll-reveal">
        <div className="expand-controls">
          <button 
            onClick={collapseAll} 
            className="control-button secondary"
            onKeyDown={(e) => handleKeyDown(e, collapseAll)}
            aria-label="Collapse all day cards"
          >
            Collapse All
          </button>
          <button 
            onClick={expandAll} 
            className="control-button secondary"
            onKeyDown={(e) => handleKeyDown(e, expandAll)}
            aria-label="Expand all day cards"
          >
            Expand All
          </button>
        </div>
        
        <div className="legend" role="group" aria-label="Day type legend">
          <span className="legend-item travel">Travel Day</span>
          <span className="legend-item highlight">Major Attraction</span>
          <span className="legend-item light">Light Schedule</span>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        className="dark-toggle-redesigned"
        onClick={() => setDarkMode(!darkMode)}
        onKeyDown={(e) => handleKeyDown(e, () => setDarkMode(!darkMode))}
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        {darkMode ? "🌙" : "☀️"}
      </button>

      {/* Main Content Sections */}
      {Object.entries(sections).map(([region, [start, end]]) => (
        <section key={region} className="region-section">
          <div 
            id={region} 
            className="region-header scroll-reveal"
          >
            <div className="region-title">
              <h2>{region}</h2>
              <span className="region-days">
                {end - start} day{end - start > 1 ? 's' : ''}
              </span>
            </div>
            <div className={`region-accent ${region.toLowerCase()}`}></div>
          </div>
          
          <div className={`days-container ${viewMode}`}>
            {itinerary.slice(start, end).map((day, idx) => {
              const index = idx + start;
              const dayType = getDayType(day);
              const intensity = getDayIntensity(day);
              const summary = getActivitySummary(day.schedule);
              
              // Check if day matches search
              const visible = !search.trim() || 
                matchesSearch(day.day) ||
                matchesSearch(day.location) ||
                day.schedule.some(item =>
                  matchesSearch(item.activity) ||
                  (item.note && matchesSearch(item.note)) ||
                  (item.cost && matchesSearch(item.cost))
                );
              
              if (!visible) return null;

              const isOpen = openDays.has(index);
              const scrollClass = idx % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right';

              return (
                <article
                  key={index}
                  className={`day-card ${dayType} ${intensity} ${scrollClass}`}
                  role="region"
                  aria-labelledby={`day-${index}-title`}
                >
                  <header
                    className="day-card-header"
                    onClick={() => toggleDay(index)}
                    onKeyDown={(e) => handleKeyDown(e, () => toggleDay(index))}
                    aria-expanded={isOpen}
                    aria-controls={`day-content-${index}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="day-info">
                      <div className="day-number" aria-hidden="true">
                        Day {index + 1}
                      </div>
                      <div className="day-title">
                        <h3 id={`day-${index}-title`}>{day.day.split("(")[0].trim()}</h3>
                        <span className="day-location">{day.location}</span>
                      </div>
                    </div>

                    <div className="day-preview">
                      {/* Activity icons preview */}
                      <div className="activity-icons" aria-label="Activity preview">
                        {summary.highlights.map((icon, i) => (
                          <span key={i} className="preview-icon" aria-hidden="true">
                            {icon}
                          </span>
                        ))}
                        {summary.moreCount > 0 && (
                          <span
                            className="more-count"
                            aria-label={`${summary.moreCount} more activities`}
                          >
                            +{summary.moreCount}
                          </span>
                        )}
                      </div>

                      {/* Meta section with activities + intensity badge */}
                      <div className="day-meta">
                        <span className="activity-count">
                          {day.schedule.length} activities
                        </span>

                        {/* Intensity badge */}
                        {getDayIntensity(day) !== "low" && (
                          <span className={`day-intensity ${getDayIntensity(day)}`}>
                            {getDayIntensity(day) === "high" ? "Busy" : "Moderate"}
                          </span>
                        )}

                        <span
                          className={`expand-icon ${isOpen ? "rotated" : ""}`}
                          aria-hidden="true"
                        >
                          ↓
                        </span>
                      </div>
                    </div>
                  </header>

                  <div 
                    id={`day-content-${index}`}
                    className={`day-card-content ${isOpen ? 'open' : ''}`}
                    aria-hidden={!isOpen}
                  >
                    <div className="activities-list">
                      {day.schedule.map((item, i) => {
                        const activityInfo = getActivityIcon(item.activity);
                        
                        return (
                          <div
                            key={i}
                            className={`activity-item ${activityInfo.color} scroll-reveal`}
                            style={{
                              transitionDelay: isOpen ? `${i * ANIMATION_DELAY}ms` : '0ms'
                            }}
                          >
                            <div className="activity-main">
                              <div 
                                className="activity-icon-container"
                                aria-label={`${activityInfo.color} activity`}
                              >
                                <span className="activity-icon" aria-hidden="true">
                                  {activityInfo.icon}
                                </span>
                              </div>
                              
                              <div className="activity-details">
                                <div className="activity-header">
                                  {item.time && (
                                    <span className="activity-time" aria-label={`Time: ${item.time}`}>
                                      {item.time}
                                    </span>
                                  )}
                                  <h4 className="activity-title">{item.activity}</h4>
                                  {item.cost && (
                                    <span className="activity-cost" aria-label={`Cost: ${item.cost}`}>
                                      {item.cost}
                                    </span>
                                  )}
                                </div>
                                
                                {item.note && (
                                  <div className="activity-note" role="note">
                                    <span className="note-icon" aria-hidden="true">💡</span>
                                    <span>{item.note}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* No results message */}
          {search.trim() && filteredItinerary.length === 0 && (
            <div className="no-results scroll-reveal">
              <p>No activities found matching "{search}". Try a different search term.</p>
            </div>
          )}
        </section>
      ))}

      {/* Back to Top */}
      <button
        className={`back-to-top ${showButton ? "" : "hidden"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onKeyDown={(e) => handleKeyDown(e, () => window.scrollTo({ top: 0, behavior: "smooth" }))}
        aria-label="Back to top of page"
      >
        ↑
      </button>

      {/* Footer */}
      <footer className="footer scroll-reveal">
        <p>© 2025 Kevin Tan · Japan Trip Itinerary</p>
        <p className="footer-note">Built with Next.js · Styled with ❤️</p>
      </footer>
    </div>
  );
}