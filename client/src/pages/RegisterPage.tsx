import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const authIMG =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1782738748/authIMG_cxmbxq.png";
const blackLogo =
  "https://res.cloudinary.com/di68k4zba/image/upload/v1782738747/black_logo_ksisgr.png";

const RegisterPage: React.FC = () => {
  const { register, user } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const success = await register(
      formData.name,
      formData.email,
      formData.password,
    );

    if (success) {
      return navigate("/");
    }

    setIsSubmitting(false);
  };

  // Config for each field including which icon to use
  const fields: {
    label: string;
    name: keyof typeof formData;
    type: string;
    placeHolder: string;
    icon: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
  }[] = [
    {
      label: "Full Name",
      name: "name",
      type: "text",
      placeHolder: "Samuel Ikeyina",
      icon: <FiUser className="text-black/30 text-base" />,
    },

    {
      label: "Email Address",
      name: "email",
      type: "email",
      placeHolder: "samuelikeyina@gmail.com",
      icon: <FiMail className="text-black/30 text-base" />,
    },

    {
      label: "Password",
      name: "password",
      type: showPassword ? "text" : "password",
      placeHolder: "Min 8 characters",
      icon: <FiLock className="text-black/30 text-base" />,
      rightIcon: showPassword ? (
        <FiEyeOff className="text-black/30 text-base" />
      ) : (
        <FiEye className="text-black/30 text-base" />
      ),
      onRightIconClick: () => setShowPassword((prev) => !prev),
    },

    {
      label: "Confirm Password",
      name: "confirmPassword",
      type: showConfirmPassword ? "text" : "password",
      placeHolder: "Repeat your password",
      icon: <FiLock className="text-black/30 text-base" />,
      rightIcon: showConfirmPassword ? (
        <FiEyeOff className="text-black/30 text-base" />
      ) : (
        <FiEye className="text-black/30 text-base" />
      ),
      onRightIconClick: () => setShowConfirmPassword((prev) => !prev),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] grid grid-cols-2">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-116.75">
          <div className="flex items-center justify-center mb-16">
            <Link to="/">
              <img src={blackLogo} alt="" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-0">
            <h1 className="font-bold text-[28px] tracking-[-3%] text-black mb-2">
              Hear Everything. Miss Nothing.
            </h1>
            <p className="text-sm text-black/50 mb-8 md:text-[18px]">
              Create your account and step into a world of pure sound.
            </p>

            <form
              action=""
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              {fields.map(
                ({
                  label,
                  name,
                  type,
                  placeHolder,
                  icon,
                  rightIcon,
                  onRightIconClick,
                }) => {
                  return (
                    <div key={name} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={name}
                          className={`text-xs font-bold ${errors[name] ? "text-red-500" : "text-black"}`}
                        >
                          {label}
                        </label>
                        {errors[name] && (
                          <span className="text-xs text-red-500">
                            {errors[name]}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-3 w-full border rounded-lg px-6 py-4 transition-colors focus-within:border-[#D87D4A ${errors[name] ? "border-red-500" : "border-[#CFCFCF]"}]`}
                      >
                        {icon}
                        <input
                          id={name}
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          placeholder={placeHolder}
                          className="flex-1 text-sm font-bold text-black placeholder:text-black/40 outline-none bg-transparent"
                        />

                        {rightIcon && (
                          <button
                            type="button"
                            onClick={onRightIconClick}
                            className="text-black/30 hover:text-[#D87D4A] transition-colors"
                            tabIndex={-1}
                          >
                            {rightIcon}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                },
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#D87D4A] text-white font-bold text-[13px] tracking-[1px] uppercase 
           px-8 py-4 hover:bg-[#FBAF85] transition-colors duration-200 cursor-pointer w-full text-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-black/50 mt-6">
              Already tuned in?{" "}
              <Link
                to="/login"
                className="text-[#D87D4A] font-bold hover:text-[#FBAF85] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-black/50 hover:text-[#D87D4A] transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* ================================ */}

      <div className="hidden md:flex justify-end">
        <img src={authIMG} alt="" />
      </div>
    </div>
  );
};

export default RegisterPage;
