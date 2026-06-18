// Handles all order operations:
// - createOrder (anyone)
// - getUserOrders (logged-in user sees their own orders)
// - getOrderById (user sees their order, admin sees any)
// - getAllOrders (admin only)
// - updateOrderStatus (admin only)
// - getDashboardStats (admin only)

import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../types/indexServer";
import Order from "../models/Order";

// --- CREATE ORDER ---
// POST /api/orders
// Anyone (logged in or guest) can place an order
export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { customerInfo, cartItems, orderSummary } = req.body;

    // validate required data is present
    if (!customerInfo || !cartItems || !orderSummary) {
      res.status(400).json({
        message:
          "Missing required fields: customerInfo, cartItems, or orderSummary",
      });
      return;
    }

    // validate cart is not empty
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ message: "Cart must have at least one item" });
      return;
    }

    // validate each cart item has the required fields
    for (const item of cartItems) {
      if (
        !item._id ||
        !item.name ||
        item.price === undefined ||
        !item.quantity
      ) {
        res
          .status(400)
          .json({ message: "Invalid cart item - missing required fields" });
        return;
      }
    }

    // Build the order document
    const orderData: any = {
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        zipCode: customerInfo.zipCode,
        city: customerInfo.city,
        country: customerInfo.country,
        paymentMethod: customerInfo.paymentMethod,
        eMoneyNumber: customerInfo.eMoneyNumber || "",
        eMoneyPIN: customerInfo.eMoneyPIN || "",
      },
      cartItems: cartItems.map((item: any) => ({
        // Create a valid ObjectId for the productId
        productId: mongoose.Types.ObjectId.isValid(item._id)
          ? new mongoose.Types.ObjectId(item._id)
          : new mongoose.Types.ObjectId(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      orderSummary: {
        subtotal: orderSummary.subtotal,
        shipping: orderSummary.shipping,
        vat: orderSummary.vat,
        grandTotal: orderSummary.grandTotal,
      },
    };

    // if the request came from a logged-in user, attach their ID to the order
    // this lets users view their order history later
    const authReq = req as AuthRequest;
    if (authReq.user) {
      orderData.userId = authReq.user._id;
    }

    const order = new Order(orderData);
    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error: any) {
    console.error("Create order error:", error);

    // Handle mongodb duplicate key error (rare but possible for orderId)

    if (error.code === 11000) {
      res.status(500).json({ message: "Order ID conflict - please try again" });
      return;
    }

    res.status(500).json({
      message: "Server error creating order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ----- GET USERS ORDERS -----
// GET /api/orders/my-orders
// Returns all orders belonging to the logged-in user
export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Find orders where userId matches the logged-in user,s ID
    const orders = await Order.find({ userId: req.user!._id }).sort({
      createdAt: -1,
    }); // Newest order comes first

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching your orders" });
  }
};

// ---- GET ORDER BY ID ----
// GET /api/orders/:id
export const getOrderById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Security check: non-admin users can only view their own orders
    if (
      !req.user?.isAdmin &&
      order.userId?.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ message: "Not authorized to view this order" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching order" });
  }
};

// ----ADMIN: GET ALL ORDERS ----
// GET /api/admin/orders
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }); // newest orders comes first
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// ---- ADMIN: UPDATE ORDER STATUS ----
// PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;

    // Validate the status value
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid order status" });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error updating order status" });
  }
};

// ---- ADMIN: GET DASHBOARD STATS ----
// GET /api/admin/stats
// Returns aggregate data for the admin dashboard
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Run multiple database queries in parallel using Promise.all
    // This is faster than running them one by one
    const [
      totalOrders, // Total number of orders
      totalUsers, // Total number of users
      revenueResult, // Sum of all order grand total
      pendingOrders, // Orders not yet fulfilled
      recentOrders, // Last 5 orders for dashboard preview
    ] = await Promise.all([
      Order.countDocuments(),
      // We need to import User here - do it inline
      (await import("../models/User")).default.countDocuments(),

      // Mongodb aggregration: sum up all grandtotals values
      Order.aggregate([
        {
          $group: {
            _id: null, // Group all document together.
            total: { $sum: "$orderSummary.grandTotal" }, // Sum the grandtotal field
          },
        },
      ]),

      Order.countDocuments({ status: "pending" }),

      Order.find({}).sort({ createdAt: -1 }).limit(5),
    ]);

    // Monthly revenue for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        // only include orders from the past 6 months
        $match: { createdAt: { $gte: sixMonthsAgo } },
      },

      {
        // Group by year and month
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$orderSummary.grandTotal" },
          count: { $sum: 1 }, // count of orders that month
        },
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }, // sort oldest to newest revenue
    ]);

    res.status(200).json({
      totalOrders,
      totalUsers,
      totalRevenue: revenueResult[0]?.total || 0, // Default to 0 if no orders
      pendingOrders,
      recentOrders,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Dashboard stat error:", error);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
};
