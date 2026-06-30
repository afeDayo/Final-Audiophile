import React, { useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { LuShoppingCart } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { MdChevronRight } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FiSettings, FiLogOut, FiShoppingBag } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import "../App.css";

const navLogo =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780492580/Desktop_navlogo_ml3fse.png";

const headphonemobileDropdown =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780497166/mobile_dropdown_headset_tleqfs.png";

const speakermobileDropdown =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780497167/mobile_dropdown_speaker_hdoylk.png";

const earphonemobileDropDown =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780497166/mobile_dropdown_earphone_dzt7ic.png";

const Navbar: React.FC = () => {
  const { setIsCartOpen, cart } = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile menu (hamburger) open state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  //  User avatar dropdown open state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Ref for the dropdown - used to close it when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Total items in cart (sum of all quantities)
  const cartItemCount = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  // close dropdown when clicking anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  // Handle logout click
  const handleLogout = (): void => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  // Navigation links - shared between desktop and mobile
  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/headphones", label: "HEADPHONES" },
    { to: "/speakers", label: "SPEAKERS" },
    { to: "/earphones", label: "EARPHONES" },
  ];
  return (
    <nav className="bg-[#101010]">
      <div className="pt-4 md:pt-6.25 w-full px-6 sm:px-[clamp(1rem,11.40vw,200px)]">
        <div className="flex items-center justify-between pb-8 pt-3 md:pt-0 md:pb-6.25">
          {/* ---- Mobile: Hamburger Button ---- */}
          <button
            className="lg:hidden text-white text-2xl shrink-0"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? <IoClose /> : <GiHamburgerMenu />}
          </button>

          {/* ---- Logo ----- */}
          <Link to="/" className="shrink-0 mx-auto lg:mx-0">
            <img src={navLogo} alt="" className="md:w-full w-30" />
          </Link>

          {/* ---- Desktop Navigation Links ---- */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-[32.5px]">
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[16px] font-bold text-white tracking-[2px] hover:text-[#D87D4A] transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          {/* ---- Right Side: Cart + Auth ----- */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => {
                return setIsCartOpen(true);
              }}
              className="relative text-white hover:text-[#D87D4A] transition-colors flex items-center gap-2"
              aria-label="Open cart"
            >
              <LuShoppingCart className="text-[22px]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D87D4A] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="text-[16px] font-bold text-white tracking-[1px] hover:text-[#D87D4A] transition-colors uppercase hidden md:inline-block">
                CART
              </span>
            </button>

            {/* --- Auth Section --- */}
            {user ? (
              // ---- Logged In: Avatar + Dropdown
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => {
                    return setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center gap-2 text-white hover:text-[#D87D4A] transition-colors"
                >
                  {/* Avatar: show image or initials fallback */}
                  <div className="w-8 h-8 rounded-full bg-[#D87D4A] flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <MdKeyboardArrowDown
                    className={`text-sm transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-white rounded-lg shadow-xl py-2 z-50 animate-[fadeIn_0.4s_ease-in]">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-sm text-black">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Admin link - only shown to admins */}
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => {
                          return setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-[#D87D4A] hover:text-white transition-colors"
                      >
                        <MdDashboard className="text-base" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => {
                        return setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiSettings className="text-base" />
                      Profile Settings
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => {
                        return setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiShoppingBag className="text-base" />
                      My Orders
                    </Link>

                    <hr className="my-1 border-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-base text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <FiLogOut className="text-base" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-[16px] font-bold text-white tracking-[1px] hover:text-[#D87D4A] transition-colors uppercase lg:py-2.5 lg:px-5 border border-[#FFFFFF]"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-[16px] font-bold text-white tracking-[1px] hover:text-[#FBAF85] transition-colors uppercase lg:py-2.5 lg:px-5 bg-[#D87D4A]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* mobile dropdown */}
        {isMenuOpen && (
          <div
            className="py-8 px-0 absolute top-22 left-0 right-0 bg-white rounded-b-xl shadow-2xl z-50 animate-[slideDown_0.3s_ease-out] lg:hidden"
            style={{
              ["--tw-keyframes-slidedown" as string]: `from {opacity: 0; transform: translateY(-10px);} to {opacity: 1; transform: translateY(0);}`,
            }}
          >
            <div className="px-6 md:px-10 lg:px-12 xl:px-[5.5%]">
              {/* Category cards */}
              <div className="flex flex-col md:flex-row gap-14 pt-10">
                {[
                  {
                    to: "/headphones",
                    label: "HEADPHONES",
                    img: headphonemobileDropdown,
                  },
                  {
                    to: "/speakers",
                    label: "SPEAKERS",
                    img: speakermobileDropdown,
                  },
                  {
                    to: "/earphones",
                    label: "EARPHONES",
                    img: earphonemobileDropDown,
                  },
                ].map((cat) => {
                  return (
                    <Link
                      key={cat.to}
                      to={cat.to}
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 bg-[#F1F1F1] rounded-lg relative h-41.25 pt-22.5 pb-5 group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex justify-center">
                        <img src={cat.img} alt="" />
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <h4 className="text-[15px] font-bold tracking-[1px] text-black">
                          {cat.label}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-black/50 group-hover:text-[#D87D4A] uppercase">
                            Shop
                          </span>
                          <MdChevronRight className="text-[#D87D4A]" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Auth links in mobile menu */}

              <div className="mt-8 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D87D4A] flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => {
                          return setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-[#D87D4A]"
                      >
                        <MdDashboard />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => {
                        return setIsMenuOpen(false);
                      }}
                      className="text-sm font-bold text-black/70"
                    >
                      ⚙️ Profile Settings
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => {
                        return setIsMenuOpen(false);
                      }}
                      className="text-sm font-bold text-black/70"
                    >
                      📦 My Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-sm font-bold text-red-500 text-left"
                    >
                      🔙 Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Link
                      to="/login"
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 text-center py-3 border-2 border-black font-bold text-[13px] uppercase tracking-[1px]"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 text-center py-3 border-2 border-black font-bold text-[13px] uppercase tracking-[1px]"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
