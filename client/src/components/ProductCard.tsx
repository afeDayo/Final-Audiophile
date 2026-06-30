// A reusable card component used on category page

import React from "react";
import type { Product } from "../types";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  // Whether to reverse the layout (image on right, text on left)
  reversed?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  reversed = false,
}) => {
  return (
    // Alternating layout: flex-col on mobile, flex-row on desktop
    // "reversed" flips the order so products alternate image position
    <article
      className={`flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-31.25 ${reversed ? "lg:flex-row-reverse" : ""}`}
    >
      <div className="w-full lg:flex-1 bg-[#F1F1F1] rounded-xl flex items-center justify-center h-81.75 md:h-88 lg:h-140">
        <img src={product.image} alt={product.name} />
      </div>

      {/* ---- Product info ---- */}
      <div
        className={`w-full lg:flex-1 flex flex-col items-center gap-6 lg:items-start text-center lg:text-left ${reversed ? "lg:items-start" : ""}`}
      >
        {product.isNew && (
          <p className="text-[14px] tracking-[10px] text-[#D87D4A] uppercase">
            New Product
          </p>
        )}

        {/* Product name */}
        <h2 className="font-bold text-[28px] md:text-[40px] leading-tight tracking-[1.5px] uppercase text-black max-w-70 lg:max-w-none">
          {product.name}
        </h2>

        {/* Product description */}
        <p className="text-[15px] leading-relaxed text-black/50 font-medium max-w-143">
          {product.description}
        </p>

        {/* Price */}
        <p className="font-bold text-[18px] tracking-[1.29px] text-black">
          ₦ {product.price.toLocaleString()}
        </p>

        {/* CTA */}
        <Link to={`/product/${product._id}`}>
          <button className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer">
            See Product
          </button>
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
