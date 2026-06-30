import React from "react";
import HeroSection from "../components/HeroSection";
import CategoryCard from "../components/CategoryCard";
import { Link } from "react-router-dom";
import Man from "../components/Man";
import { useStore } from "../context/StoreContext";
import RollerLoader from "../components/RollerLoader";

const categoryIMGone =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780583283/categoryIMG-1_tn8aqw.png";

const categoryIMGtwo =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780583283/categoryIMG-2_rvyyxc.png";

const categoryIMGthree =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780583283/categoryIMG-3_lg4mxh.png";

const HomeZX9 =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780585225/HomePAGE_ZX9_aeuzng.png";

const zx7DesktopHome =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780914401/ZX7DesktopHome_azdmyq.png";

const zx7MobileHome =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780914401/ZX7MobileHOME_iwa75x.png";

const yx1EarphonesHome =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780915755/YX1_EARPHONEHOME_hs4sg6.png";

const HomePage: React.FC = () => {
  const { getProductsByCategory, loading } = useStore();

  // Show full-page loader while products are being fetched from API
  if (loading) {
    return <RollerLoader />;
  }

  // Get products by category for the featured sections
  const speakers = getProductsByCategory("speakers");
  const earphones = getProductsByCategory("earphones");

  // Find the specific featured products by name
  const zx9Speaker = speakers.find((speaker) => {
    return speaker.name.includes("ZX9");
  });
  const zx7Speaker = speakers.find((speaker) => {
    return speaker.name.includes("ZX7");
  });
  const yx1Earphones = earphones.find((earphone) => {
    return earphone.name.includes("YX1");
  });

  return (
    <div className="bg-[#FAFAFA] relative">
      {/* ============ HERO SECTION =========== */}
      <HeroSection />

      {/* ======== CATEGORY NAVIGATION CARDS ======== */}
      <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-12 md:mt-20 lg:mt-30">
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-4 lg:gap-8 pt-12 md:pt-0 mt-6 md:mt-14">
          <CategoryCard
            to="/headphones"
            label="HEADPHONES"
            image={categoryIMGone}
            className="mt-8 md:mt-12"
          />

          <CategoryCard
            to="/speakers"
            label="SPEAKERS"
            image={categoryIMGtwo}
            className="mt-8 md:mt-12"
          />

          <CategoryCard
            to="/earphones"
            label="EARPHONES"
            image={categoryIMGthree}
            className="mt-8 md:mt-12"
          />
        </div>
      </section>

      {/* ============= ZX9 SPEAKER FEATURE =============*/}

      {zx9Speaker && (
        <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-24 md:mt-32 lg:mt-40">
          <div className="bg-[#D87D4A] flex flex-col lg:flex-row items-end px-6 md:px-12 lg:px-29.25 pt-14 md:pt-16 lg:pt-0 gap-8 lg:justify-between rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-100 h-100 rounded-full border-2 border-white" />
              <div className="absolute -top-20 -left-20 w-100 h-100 rounded-full border-2 border-white" />
            </div>

            <div>
              <img src={HomeZX9} alt="ZX9 Speaker" loading="lazy" />
            </div>

            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 max-w-87.25 pb-14 md:pb-16 lg:pb-24">
              <h2 className="font-bold text-[36px] md:text-[56px] leading-tight tracking-[2px] uppercase text-white">
                {zx9Speaker.name}
              </h2>
              <p className="text-[15px] leading-relaxed text-white/75">
                Upgrade to premium speakers that are phenomenally built to
                deliver truly remarkable sound.
              </p>
              <Link to={`/product/${zx9Speaker._id}`}>
                <button className="mt-2 bg-black text-white font-bold text-[13px] tracking-[1px] uppercase px-8 py-4 hover:bg-[#4C4C4C] transition-colors duration-200 cursor-pointer">
                  See Product
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============= ZX7 SPEAKER FEATURE =============*/}
      {zx7Speaker && (
        <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-6 md:mt-8 lg:mt-12">
          <div className="relative rounded-xl overflow-hidden min-h-80 flex items-center">
            <img
              src={zx7MobileHome}
              alt=""
              className="absolute inset-0 w-full h-full md:hidden"
              loading="lazy"
            />
            <img
              src={zx7DesktopHome}
              alt=""
              className="absolute inset-0 w-full h-full hidden md:block"
              loading="lazy"
            />

            <div className=" relative z-10 ml-6 md:ml-16 lg:ml-24 flex flex-col gap-8 text-start">
              <h2 className="font-bold text-[28px] tracking-[2px] uppercase text-black">
                {zx7Speaker.name}
              </h2>
              <Link to={`/product/${zx7Speaker._id}`}>
                <button className="border border-black text-black font-bold text-[13px] tracking-[1px] uppercase px-8 py-4 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer">
                  See Product
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============= YX1 EARPHONE FEATURE =============*/}
      {yx1Earphones && (
        <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-6 md:mt-8 lg:mt-12">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-3">
            <div className="rounded-xl overflow-hidden">
              <img
                src={yx1EarphonesHome}
                alt=""
                className="h-50 w-full md:h-80"
                loading="lazy"
              />
            </div>

            <div className="bg-[#F1F1F1] rounded-xl flex items-center h-50 md:h-auto">
              <div className="ml-6 md:ml-10 lg:ml-24 flex flex-col gap-8 text-start">
                <h2 className="font-bold text-[28px] tracking-[2px] uppercase text-black">
                  {yx1Earphones.name}
                </h2>
                <Link to={`/product/${yx1Earphones._id}`}>
                  <button className="border border-black text-black font-bold text-[13px] tracking-[1px] uppercase px-8 py-4 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer">
                    See Product
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======= MAN ========= */}

      <Man />
    </div>
  );
};

export default HomePage;
