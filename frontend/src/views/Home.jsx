import { motion } from "framer-motion";
import { useEffect } from "react";
import Navbar from '../components/Navbar'
import Hero from '../sections/Hero';
import Courts from '../sections/Courts';
import PriceList from '../sections/PriceList';

import { backgroundPositions } from "../backgroundPositions";
import useScrollSection from "../useScrollSection";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";

function Home() {
  const sectionIds = ["Hero", "Reserve", "Courts", "PriceList", "Contact"];
  const currentSection = useScrollSection(sectionIds);

  const { topBlob, bottomBlob } = backgroundPositions[currentSection] || backgroundPositions.Hero;

  useEffect(() => {
    const hero = document.getElementById("Navbar");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="relative bg-white overflow-hidden min-h-screen font-['Poppins',sans-serif]">
      <motion.div
        className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
        animate={topBlob}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      <motion.div
        className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
        animate={bottomBlob}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      
      <ReserveMenuProvider>
        <div id="Navbar"><Navbar /></div>
        <div id="Hero"><Hero /></div>
        <div id="Courts"><Courts /></div>
        <div id="PriceList"><PriceList /></div>
      </ReserveMenuProvider>
    </div>
  );
}

export default Home;