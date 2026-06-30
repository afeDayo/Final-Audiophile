// Manages the shopping cart and product state for the entire app
// This contsxt handles"
// 1. Fetching products from API
// 2. Adding/ removing/ uploading cart items
// 3. Cart totals calculation
// 4. Cart open/close state
// 5. Thank you modal state

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartTotals, Order, Product } from "../types";
import api from "../services/api";

// ---- Context Shape ----
// Every value/function this context provides
interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  loading: boolean;

  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => CartTotals;

  // Product helpers
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];

  //  UI state for cart sidebar and order confirmation modal
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isThankYouOpen: boolean;
  setIsThankYouOpen: (open: boolean) => void;
  orderData: Order | null;
  setOrderData: (data: Order | null) => void;
}

// Create the context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ---- StoreProvider ----
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //   Initialize cart from localStorage so it persists across page refreshes
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("audiophile-cart");
    if (savedCart) {
      try {
        return JSON.parse(savedCart) as CartItem[];
      } catch (error) {
        return [];
      }
    }

    return [];
  });

  //   Modal/sidebar visibility states
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<Order | null>(null);

  //   ---- Fetching products on mount -------
  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        // GET /api/products

        console.log("🚀 Fetching products ...");

        const { data } = await api.get<Product[]>("/products");

        console.log("✅ Products fetched successfully:", data);

        setProducts(data);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  //   ---- Sync cart to localStorage ----
  // Runs everyTime cart changes - keeps localStorage in sync
  useEffect(() => {
    localStorage.setItem("audiophile-cart", JSON.stringify(cart));
  }, [cart]);

  //   ---- ADD TO CART -----
  // if item already in cart, increase quantity; otherwise add it
  const addToCart = (product: Product, quantity: number = 1): void => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        // Item already in cart - just increase quantity
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      //   Item not in cart - add it as a new entry
      return [...prevCart, { ...product, quantity }];
    });
  };

  //   ---- REMOVE FROM CART ----
  const removeFromCart = (productId: string): void => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  //   ---- UPDATE QUANTITY ----
  // If quantity reaches 0 or below, remove the item entirely
  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  //   ----- CLEAR CART ----

  const clearCart = (): void => {
    setCart([]);
  };

  //   --- CALCULATE TOTALS ----
  // Returns the financial breakdown of the cart
  const calculateTotals = (): CartTotals => {
    // subtotal = sum of (price * quantity) for all items
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const shipping = cart.length > 0 ? 50 : 0; // Free shipping if cart is empty
    const vat = Math.round(subtotal * 0.075); // 7.5 VAT
    const grandTotal = subtotal + shipping + vat;

    return { subtotal, shipping, vat, grandTotal };
  };

  //   ---- GET PRODUCT BY ID ----
  const getProductById = (id: string): Product | undefined => {
    return products.find((product) => product._id === id);
  };

  //   ---- GET PRODUCTS BY CATEGORY ----
  const getProductsByCategory = (category: string): Product[] => {
    return products.filter((product) => product.category === category);
  };

  //   ---- Provide everything to children ----
  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculateTotals,
        getProductById,
        getProductsByCategory,
        isCartOpen,
        setIsCartOpen,
        isThankYouOpen,
        setIsThankYouOpen,
        orderData,
        setOrderData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

// ---- CUSTOM HOOK FOR THE CONTEXT API ----
// Usage: const {cart, addTocart etc} = useStore()
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within a storeProvider");
  }

  return context;
};

export default StoreContext;
