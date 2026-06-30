// ============================================================
// pages/ProductDetailPage.tsx
// Shows full details for a single product.
// URL: /product/:id
//
// Sections:
// 1. Back button
// 2. Product image + name + description + quantity + add to cart
// 3. Features text
// 4. In the Box list
// 5. Photo gallery (3 images)
// 6. "You May Also Like" section
// 7. Category navigation cards
// 8. Man/Best Gear section
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ImPlus, ImMinus } from "react-icons/im";
import { useStore } from "../context/StoreContext";
import type { Product } from "../types";
import CategoryCard from "../components/CategoryCard";
import Man from "../components/Man";
import RollerLoader from "../components/RollerLoader";
import toast from "react-hot-toast";

// Category card images
const categoryIMGone =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780583283/categoryIMG-1_tn8aqw.png";

const categoryIMGtwo =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780583283/categoryIMG-2_rvyyxc.png";

const categoryIMGthree =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1780583283/categoryIMG-3_lg4mxh.png";

// Maps each product name to the 3 products shown as "You May Also Like"
const youMayAlsoLikeMap: Record<string, string[]> = {
  "XX99 Mark II Headphones": [
    "XX99 Mark I Headphones",
    "XX59 Headphones",
    "ZX9 Speaker",
  ],
  "XX99 Mark I Headphones": [
    "XX99 Mark II Headphones",
    "XX59 Headphones",
    "ZX9 Speaker",
  ],
  "XX59 Headphones": [
    "XX99 Mark II Headphones",
    "XX99 Mark I Headphones",
    "ZX9 Speaker",
  ],
  "ZX9 Speaker": ["ZX7 Speaker", "XX99 Mark I Headphones", "XX59 Headphones"],
  "ZX7 Speaker": ["ZX9 Speaker", "XX99 Mark I Headphones", "XX59 Headphones"],
  "YX1 Wireless Earphones": [
    "XX99 Mark I Headphones",
    "XX59 Headphones",
    "ZX9 Speaker",
  ],
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, addToCart, products, loading } = useStore();

  // The product we're viewing
  const [product, setProduct] = useState<Product | null>(null);

  // How many units the user wants to buy
  const [quantity, setQuantity] = useState<number>(1);

  // Find the product when the ID or products list changes
  useEffect(() => {
    if (id && products.length > 0) {
      const found = getProductById(id);
      // If product not found, set explicitly to undefined so we can show error
      setProduct(found ?? null);
    }
  }, [id, products, getProductById]);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return <RollerLoader />;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FAFAFA]">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase 
           px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Handle quantity controls
  const increaseQty = (): void => setQuantity((q) => q + 1);
  const decreaseQty = (): void => setQuantity((q) => Math.max(1, q - 1));

  // Handle add to cart
  const handleAddToCart = (): void => {
    addToCart(product, quantity);
    toast.success(
      `${product.name.split(" ").slice(0, 2).join(" ")} added to cart!`,
    );
    setQuantity(1); // Reset quantity after adding
  };

  // Build "You May Also Like" products list
  const alsoLikeNames = youMayAlsoLikeMap[product.name] || [];
  const alsoLikeProducts = alsoLikeNames
    .map((name) => products.find((p) => p.name === name))
    .filter((p): p is Product => p !== undefined); // TypeScript type guard to remove undefined

  // Split features text into paragraphs at double newlines
  const featureParagraphs = product.features
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#FAFAFA] animate-[fadeIn_0.4s_ease-in]">
      {/* ---- Back button ---- */}
      <div className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] pt-6 md:pt-8 lg:pt-20">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-black/50 hover:text-[#D87D4A] transition-colors"
        >
          ← Go Back
        </button>
      </div>

      {/* ---- Product Main Section ---- */}
      <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-6 md:mt-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-31.25">
          {/* Product image */}
          <div className="w-full lg:flex-1 bg-[#F1F1F1] rounded-xl flex items-center justify-center h-81.75 md:h-120 lg:h-140">
            <img
              src={product.image}
              alt={product.name}
              className="w-43 md:w-60 lg:w-85 xl:w-100 object-contain"
              // High priority — above the fold
              fetchPriority="high"
            />
          </div>

          {/* Product info */}
          <div className="w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            {/* New badge */}
            {product.isNew && (
              <p className="text-[14px] tracking-[10px] text-[#D87D4A] uppercase">
                New Product
              </p>
            )}

            {/* Product name */}
            <h1 className="font-bold text-[28px] md:text-[40px] leading-tight tracking-[1.5px] uppercase text-black max-w-70 lg:max-w-111.5">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-[15px] leading-relaxed text-black/50 font-medium max-w-111.25">
              {product.description}
            </p>

            {/* Price */}
            <p className="font-bold text-[18px] tracking-[1.29px] text-black">
              ₦ {product.price.toLocaleString()}
            </p>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center h-12 w-30 bg-[#F1F1F1]">
                <button
                  onClick={decreaseQty}
                  className="flex-1 flex items-center justify-center h-full text-black/25 hover:text-[#D87D4A] transition-colors font-bold text-sm"
                  aria-label="Decrease quantity"
                >
                  <ImMinus className="text-[10px]" />
                </button>
                <span className="font-bold text-[13px] tracking-[1px] text-black w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQty}
                  className="flex-1 flex items-center justify-center h-full text-black/25 hover:text-[#D87D4A] transition-colors font-bold text-sm"
                  aria-label="Increase quantity"
                >
                  <ImPlus className="text-[10px]" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase 
           px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer h-12"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features + In the Box ---- */}
      <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-20 md:mt-28 lg:mt-40">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-31.25">
          {/* Features */}
          <div className="lg:flex-3">
            <h3 className="font-bold text-[24px] md:text-[32px] tracking-[1.14px] uppercase text-black mb-8">
              Features
            </h3>
            <div className="flex flex-col gap-6 text-start">
              {featureParagraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-relaxed text-black/50 font-medium"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* In the Box */}
          <div className="lg:flex-2">
            <h3 className="font-bold text-[24px] md:text-[32px] tracking-[1.14px] uppercase text-black mb-8">
              In The Box
            </h3>
            <ul className="flex flex-col gap-2">
              {product.inTheBox.map((boxItem, i) => (
                <li key={i} className="flex items-center gap-6">
                  {/* Quantity in orange */}
                  <span className="font-bold text-[15px] text-[#D87D4A] w-6 shrink-0">
                    {boxItem.quantity}x
                  </span>
                  {/* Item name */}
                  <span className="text-[15px] text-black/50 font-medium">
                    {boxItem.item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Gallery ---- */}
      {product.gallery.length > 0 && (
        <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-20 md:mt-28 lg:mt-40">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 md:gap-6 lg:gap-8">
            {/* Left column: 2 stacked images */}
            <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
              {product.gallery.slice(0, 2).map((imgUrl, i) => (
                <div
                  key={i}
                  className="w-full rounded-xl overflow-hidden bg-[#F1F1F1] h-43.5 md:h-full flex-1"
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} gallery ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Right column: 1 large image */}
            {product.gallery[2] && (
              <div className="rounded-xl overflow-hidden bg-[#F1F1F1] h-92 md:h-full">
                <img
                  src={product.gallery[2]}
                  alt={`${product.name} gallery 3`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---- You May Also Like ---- */}
      {alsoLikeProducts.length > 0 && (
        <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-20 md:mt-28 lg:mt-40">
          <h3 className="font-bold text-[24px] md:text-[32px] tracking-[1.14px] uppercase text-black text-center mb-12 lg:mb-16">
            You May Also Like
          </h3>
          <div className="flex flex-col md:flex-row gap-8 md:gap-4 lg:gap-8">
            {alsoLikeProducts.map((related) => (
              <div
                key={related._id}
                className="flex-1 flex flex-col items-center gap-8 text-center"
              >
                {/* Related product image */}
                <div className="w-full bg-[#F1F1F1] rounded-xl flex items-center justify-center h-30 md:h-79.5">
                  <img
                    src={related.image}
                    alt={related.name}
                    className="w-24 md:w-48 lg:w-52 object-contain"
                    loading="lazy"
                  />
                </div>
                <h4 className="font-bold text-[24px] tracking-[1.71px] uppercase text-black">
                  {related.name}
                </h4>
                <Link to={`/product/${related._id}`}>
                  <button
                    className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase 
           px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer"
                  >
                    See Product
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Category Cards ---- */}
      <section className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] mt-24 md:mt-32 lg:mt-40">
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

      {/* ---- Best Gear section ---- */}
      <Man />
    </div>
  );
};

export default ProductDetailPage;
