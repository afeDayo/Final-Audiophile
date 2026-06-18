import React from "react";
import { Link } from "react-router-dom";
import { ImFacebook2 } from "react-icons/im";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const footerLogo =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780492580/Desktop_navlogo_ml3fse.png";
const footerLogoMobile =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780569710/audiophile_2_evfs3d.png";

const Footer: React.FC = () => {
  const footerLinks = [
    { to: "/", label: "HOME" },
    { to: "/headphones", label: "HEADPHONES" },
    { to: "/speakers", label: "SPEAKERS" },
    { to: "/earphones", label: "EARPHONES" },
  ];

  return (
    <footer className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] bg-[#101010] pb-6 md:pb-15 pt-12 md:pt-18.75 relative">
      <div className="absolute top-0 left-[35%] right-[35%] md:left-10 lg:left-[11.5%] xl:left-[8%] h-1 w-25.25 bg-[#D87D4A]" />
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">
        <Link to="/">
          <img src={footerLogo} alt="" className="hidden md:inline-block" />
          <img src={footerLogoMobile} alt="" className="md:hidden" />
        </Link>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6 lg:gap-[32.5px]">
          {footerLinks.map((link) => {
            return (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13px] font-bold text-white tracking-[2px] hover:text-[#D87D4A] transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-6 md:mt-8 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-center md:text-start font-medium text-[15px] leading-relaxed text-white/50 w-full lg:w-135">
          Audiophile is an all in one stop to fulfill your audio needs. We're a
          small team of music lovers and sound specialists who are devoted to
          helping you get the most out of personal audio. Come and visit our
          demo facility — we're open 7 days a week.
        </p>

        <div className="items-center gap-4 hidden lg:flex">
          <ImFacebook2 className="text-white text-2xl cursor-pointer hover:text-[#D87D4A] transition-colors" />
          <FaTwitter className="text-white text-2xl cursor-pointer hover:text-[#D87D4A] transition-colors" />
          <FaInstagram className="text-white text-2xl cursor-pointer hover:text-[#D87D4A] transition-colors" />
        </div>
      </div>

      <div className="mt-10 md:mt-14 flex flex-col-reverse items-center gap-8 md:flex-row md:justify-between">
        <div className="items-center gap-4 lg:hidden flex">
          <ImFacebook2 className="text-white text-2xl cursor-pointer hover:text-[#D87D4A] transition-colors" />
          <FaTwitter className="text-white text-2xl cursor-pointer hover:text-[#D87D4A] transition-colors" />
          <FaInstagram className="text-white text-2xl cursor-pointer hover:text-[#D87D4A] transition-colors" />
        </div>
        <p className="font-medium text-sm text-white/50">
          Copyright {new Date().getFullYear()}. All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
