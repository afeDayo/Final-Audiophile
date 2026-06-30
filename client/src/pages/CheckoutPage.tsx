import React, { useEffect, useState } from "react";
import type { CheckoutFormData, FormErrors, Order } from "../types";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import ThankYou from "../components/ThankYou";

interface FieldProps {
  label: string;
  name: keyof CheckoutFormData;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

const Field: React.FC<FieldProps> = ({
  label,
  name,
  value,
  error,
  onChange,
  placeholder,
  type = "text",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className={`text-xs font-bold tracking-[-0.21px] ${error ? "text-red-500" : "text-black"}`}
        >
          {label}
        </label>
        {error && (
          <span className="text-xs text-red-500 font-medium">{error}</span>
        )}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-6 py-4 text-sm font-bold text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#D87D4A] ${error ? "border-red-500" : "border-[#CFCFCF]"}`}
      />
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const {
    cart,
    calculateTotals,
    setOrderData,
    setIsThankYouOpen,
    isThankYouOpen,
  } = useStore();

  const { user } = useAuth();
  const navigate = useNavigate();
  const totals = calculateTotals();

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    city: "",
    country: "",
    paymentMethod: "e-Money",
    eMoneyNumber: "",
    eMoneyPIN: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !isThankYouOpen) {
      navigate("/");
    }
  }, [cart, navigate, isThankYouOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormData((prev) => {
      return { ...prev, [name]: value };
    });

    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => {
        return {
          ...prev,
          [name]: "",
        };
      });
    }
  };

  // Validate all fields and return true if form is valid
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    //  Only validate e-money fields if that payment method is selected
    if (formData.paymentMethod === "e-Money") {
      if (!formData.eMoneyNumber.trim()) {
        newErrors.eMoneyNumber = "e-Money number is required";
      }

      if (!formData.eMoneyPIN.trim()) {
        newErrors.eMoneyPIN = "e-Money PIN is required";
      }
    }

    setErrors(newErrors);
    // Form is valid if there are no error messages
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // POST /api/orders
      const { data: order } = await api.post<Order>("/orders", {
        customerInfo: formData,
        cartItems: cart,
        orderSummary: totals,
      });

      // Store the order data in context for the ThankYou modal
      setOrderData(order);
      setIsThankYouOpen(true);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, shipping, vat, grandTotal } = totals;

  return (
    <div className="bg-[#F1F1F1] min-h-screen animate-[fadeIn_0.4s_ease-in]">
      <div className="px-6 sm:px-[clamp(1rem,11.40vw,200px)] py-8 md:py-14 lg:py-20">
        <Link
          to="/"
          className="text-sm font-medium text-black/50 hover:text-[#D87D4A] transition-colors block mb-8 md:mb-12"
        >
          ← Go Back
        </Link>

        <form action="" onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ===== LEFT: Form ==== */}
            <div className="w-full lg:flex-1 bg-white rounded-xl p-6 md:p-8 lg:p-12">
              <h1 className="font-bold text-[28px] md:text-[32px] tracking-[1.14px] uppercase text-black mb-10 md:mb-12">
                Checkout
              </h1>

              {/* ----- Billing Details -----*/}
              <section>
                <h2 className="text-xs font-bold tracking-[0.93px] text-[#D87D4A] uppercase mb-6">
                  Billing Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field
                    label="Name"
                    name="name"
                    value={formData.name}
                    error={errors.name}
                    onChange={handleChange}
                    placeholder="Tennie Agboola"
                  />
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    error={errors.email}
                    onChange={handleChange}
                    placeholder="tenniegboola@gmail.com"
                  />
                  <Field
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    error={errors.phone}
                    onChange={handleChange}
                    placeholder="+234 813 905 9378"
                  />
                </div>
              </section>

              {/* ---- Shipping Info ---- */}
              <section className="mt-10 md:mt-12">
                <h2 className="text-xs font-bold tracking-[0.93px] text-[#D87D4A] uppercase mb-6">
                  Shipping Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Field
                      label="Address"
                      name="address"
                      value={formData.address}
                      error={errors.address}
                      onChange={handleChange}
                      placeholder="1, Folagoro, Shomolu, Lagos"
                    />
                  </div>
                  <Field
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    error={errors.zipCode}
                    onChange={handleChange}
                    placeholder="100001"
                  />
                  <Field
                    label="City"
                    name="city"
                    value={formData.city}
                    error={errors.city}
                    onChange={handleChange}
                    placeholder="Lagos"
                  />
                  <Field
                    label="Country"
                    name="country"
                    value={formData.country}
                    error={errors.country}
                    onChange={handleChange}
                    placeholder="Nigeria"
                  />
                </div>
              </section>

              {/* --- Payment Details ---- */}
              <section className="mt-10 md:mt-12">
                <h2 className="text-xs font-bold tracking-[0.93px] text-[#D87D4A] uppercase mb-6">
                  Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment method label */}
                  <div>
                    <p className="text-xs font-bold tracking-[-0.21px] text-black mb-4">
                      Payment Method
                    </p>

                    {/* e-Money radio */}
                    <label
                      htmlFor=""
                      className={`flex items-center gap-4 border rounded-lg px-6 py-4 cursor-pointer transition-colors ${formData.paymentMethod === "e-Money" ? "border-[#D87D4A]" : "border-[#CFCFCF]"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="e-Money"
                        checked={formData.paymentMethod === "e-Money"}
                        onChange={handleChange}
                        className="accent-[#D87D4A]"
                      />
                      <span className="text-sm font-bold text-black">
                        Card Payment
                      </span>
                    </label>

                    {/* Cash on Delivery radio */}
                    <label
                      htmlFor=""
                      className={`flex items-center gap-4 border rounded-lg px-6 py-4 cursor-pointer transition-colors ${formData.paymentMethod === "Cash on Delivery" ? "border-[#D87D4A]" : "border-[#CFCFCF]"} `}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={formData.paymentMethod === "Cash on Delivery"}
                        onChange={handleChange}
                        className="accent-[#D87D4A]"
                      />
                      <span className="text-sm font-bold text-black">
                        Cash on Delivery
                      </span>
                    </label>
                  </div>

                  {/* e-Money fields - only visible when e-Money is selected */}
                  {formData.paymentMethod === "e-Money" && (
                    <>
                      <div /> {/* Spacer - keeps the 2-col grid aligned */}
                      <Field
                        label="Card Number"
                        name="eMoneyNumber"
                        value={formData.eMoneyNumber}
                        error={errors.eMoneyNumber}
                        onChange={handleChange}
                        placeholder="234536543"
                      />
                      <Field
                        label="Card PIN"
                        name="eMoneyPIN"
                        value={formData.eMoneyPIN}
                        error={errors.eMoneyPIN}
                        onChange={handleChange}
                        placeholder="6891"
                      />
                    </>
                  )}

                  {/* Cash on Delivery notice */}
                  {formData.paymentMethod === "Cash on Delivery" && (
                    <div className="md:col-span-2 flex items-start gap-6 mt-2">
                      <span className="text-3xl">💵</span>
                      <p className="text-[15px] leading-relaxed text-black/50 font-medium">
                        The 'Cash on Delivery' option enables you to pay in cash
                        when our delivery courier arrives at your residence.
                        Just make sure your address is correct so that your
                        order will not be cancelled.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ==== RIGHT: Order Summary ==== */}
            <div className="w-full lg:w-87.5 bg-white rounded-xl p-6 md:p-8 flex flex-col gap-8">
              <h2 className="font-bold text-[18px] tracking-[1.29px] uppercase text-black">
                Summary
              </h2>

              {/* Cart items list */}
              <div className="flex flex-col gap-6 max-h-[40vh] overflow-y-auto">
                {cart.map((item) => {
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#F1F1F1] rounded-xl flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-black">
                            {item.name.split(" ").slice(0, 2).join(" ")}
                          </p>
                          <p className="font-bold text-sm text-black">
                            ₦ {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-black/50">
                        x{item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2">
                {[
                  { label: "Total", value: subtotal },
                  { label: "Shipping", value: shipping },
                  { label: "VAT (Include)", value: vat },
                ].map(({ label, value }) => {
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-black/50 uppercase font-medium">
                        {label}
                      </span>

                      <span className="font-bold text-[15px] text-black">
                        ₦ {value.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between mt-2 pt-2">
                  <span className="text-sm text-black/50 uppercase font-medium">
                    Grand Total
                  </span>
                  <span className="font-bold text-[18px] text-[#D87D4A]">
                    ₦ {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase 
           px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Continue & Pay"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ThankYou />
    </div>
  );
};

export default CheckoutPage;
