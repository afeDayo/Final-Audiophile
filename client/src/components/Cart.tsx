import React from "react";
import { useStore } from "../context/StoreContext";
import "../App.css";
import { ImPlus, ImMinus } from "react-icons/im";
import { Link } from "react-router-dom";

const Cart: React.FC = () => {
  const {
    cart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    calculateTotals,
  } = useStore();

  // Dont render anything if the cart is closed
  if (!isCartOpen) {
    return null;
  }

  const totals = calculateTotals();

  // Total number of items (sum of quantities, not unique products)
  const totalItemCount = cart.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);

  return (
    // Semi-transparent overlay - clicking outside closes the cart
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={() => {
        return setIsCartOpen(false);
      }} // clck overlay to close
    >
      {/* Cart panel - stop click propagation so clicking inside doesnt close */}
      <div
        className="w-[90%] max-w-94.25 mx-2 mt-22.5 md:mt-25 md:mr-[3.5%] lg:mr-41.25 bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-[fadeIn_0.4s_ease-in]"
        onClick={(event) => {
          return event.stopPropagation();
        }}
      >
        {/* Cart header */}
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg tracking-[1px] uppercase">
            Cart ({totalItemCount})
          </h4>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-black/50 hover:text-[#D87D4A] transition-colors underline"
            >
              Remove all
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Your cart is empty</p>
              <p className="text-gray-400 text-xs mt-1">
                Add some products to get started!
              </p>
            </div>
          ) : (
            cart.map((item) => {
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  {/* Product image + name + price */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-[#F1F1F1] rounded-xl flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-contain"
                        // lazy load images that are below the fold
                        loading="lazy"
                      />
                    </div>

                    <div>
                      {/* Shorten long product names for display */}{" "}
                      <h5 className="font-bold text-sm text-black">
                        {item.name.split(" ").slice(0, 2).join(" ")}
                      </h5>
                      <p className="font-bold text-xs text-black/50">
                        ₦ {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity control */}

                  <div className="flex items-center w-20 h-8 bg-[#F1F1F1] rounded-sm">
                    <button
                      className="flex-1 flex items-center justify-center text-black/25 hover:text-[#D87D4A] transition-colors h-full"
                      onClick={() => {
                        return updateQuantity(item._id, item.quantity - 1);
                      }}
                      aria-label="Decrease quantity"
                    >
                      <ImMinus className="text-[8px]" />
                    </button>

                    <span className="font-bold text-xs text-black w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      className="flex-1 flex items-center justify-center text-black/25 hover:text-[#D87D4A] transition-colors h-full"
                      onClick={() => {
                        return updateQuantity(item._id, item.quantity + 1);
                      }}
                      aria-label="Increase quantity"
                    >
                      <ImPlus className="text-[8px]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals + Checkout button - only show if cart has items */}
        {cart.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/50 uppercase font-medium">
                Total
              </span>
              <span className="font-bold text-lg">
                ₦ {totals.subtotal.toLocaleString()}
              </span>
            </div>

            <Link to="/checkout" className="w-full">
              <button
                className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase 
           px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer w-full text-center"
                onClick={() => {
                  return setIsCartOpen(false);
                }}
              >
                Checkout
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
