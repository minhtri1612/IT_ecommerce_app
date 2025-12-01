import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import Order from "../../models/order.js";
import Product from "../../models/product.js";
import User from "../../models/user.js";
import { setupTestDB, teardownTestDB, clearDatabase } from "../setup.js";
import { testOrder, testShippingInfo, testOrderItems, testProduct, testUser, testAdmin } from "../fixtures/testData.js";

describe("Orders Integration Tests", () => {
  let app;
  let userId;
  let adminId;
  let productId;

  beforeAll(async () => {
    await setupTestDB();
    
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    
    // Middleware to simulate authenticated user
    app.use((req, res, next) => {
      req.user = { _id: userId };
      next();
    });
    
    // POST /api/v1/orders/new - Create new order
    app.post("/api/v1/orders/new", async (req, res) => {
      try {
        const {
          orderItems,
          shippingInfo,
          itemsPrice,
          taxAmount,
          shippingAmount,
          totalAmount,
          paymentMethod,
          paymentInfo,
        } = req.body;

        const order = await Order.create({
          orderItems,
          shippingInfo,
          itemsPrice,
          taxAmount,
          shippingAmount,
          totalAmount,
          paymentMethod,
          paymentInfo,
          user: req.user._id,
        });

        res.status(201).json({ order });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
    
    // GET /api/v1/me/orders - Get user's orders
    app.get("/api/v1/me/orders", async (req, res) => {
      try {
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json({ orders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    
    // GET /api/v1/orders/:id - Get order details
    app.get("/api/v1/orders/:id", async (req, res) => {
      try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        
        if (!order) {
          return res.status(404).json({ message: "No Order found with this ID" });
        }
        
        res.status(200).json({ order });
      } catch (error) {
        if (error.name === "CastError") {
          return res.status(404).json({ message: "No Order found with this ID" });
        }
        res.status(500).json({ message: error.message });
      }
    });
    
    // GET /api/v1/admin/orders - Get all orders (Admin)
    app.get("/api/v1/admin/orders", async (req, res) => {
      try {
        const orders = await Order.find();
        res.status(200).json({ orders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    
    // PUT /api/v1/admin/orders/:id - Update order (Admin)
    app.put("/api/v1/admin/orders/:id", async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
          return res.status(404).json({ message: "No Order found with this ID" });
        }
        
        if (order.orderStatus === "Delivered") {
          return res.status(400).json({ message: "You have already delivered this order" });
        }
        
        // Update product stock
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock = product.stock - item.quantity;
            await product.save({ validateBeforeSave: false });
          }
        }
        
        order.orderStatus = req.body.status;
        order.deliveredAt = Date.now();
        await order.save();
        
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    
    // DELETE /api/v1/admin/orders/:id - Delete order (Admin)
    app.delete("/api/v1/admin/orders/:id", async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
          return res.status(404).json({ message: "No Order found with this ID" });
        }
        
        await order.deleteOne();
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    const user = await User.create(testUser);
    userId = user._id;
    
    const admin = await User.create(testAdmin);
    adminId = admin._id;
    
    const product = await Product.create({ ...testProduct, user: userId });
    productId = product._id;
  });

  describe("POST /api/v1/orders/new", () => {
    it("should create a new order", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };

      const res = await request(app)
        .post("/api/v1/orders/new")
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.paymentMethod).toBe("COD");
      expect(res.body.order.totalAmount).toBe(115);
    });

    it("should set default orderStatus to Processing", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };

      const res = await request(app)
        .post("/api/v1/orders/new")
        .send(orderData);

      expect(res.body.order.orderStatus).toBe("Processing");
    });

    it("should return error for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/orders/new")
        .send({
          shippingInfo: testShippingInfo,
          // Missing other required fields
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/me/orders", () => {
    beforeEach(async () => {
      // Create orders for the user
      await Order.create({
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      });
    });

    it("should return user's orders", async () => {
      const res = await request(app).get("/api/v1/me/orders");

      expect(res.statusCode).toBe(200);
      expect(res.body.orders).toBeDefined();
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBe(1);
    });

    it("should return empty array if no orders", async () => {
      await Order.deleteMany({ user: userId });

      const res = await request(app).get("/api/v1/me/orders");

      expect(res.statusCode).toBe(200);
      expect(res.body.orders).toEqual([]);
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      });
      orderId = order._id.toString();
    });

    it("should return order details", async () => {
      const res = await request(app).get(`/api/v1/orders/${orderId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.order).toBeDefined();
      expect(res.body.order.totalAmount).toBe(115);
    });

    it("should return 404 for non-existent order", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/api/v1/orders/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("No Order found with this ID");
    });
  });

  describe("GET /api/v1/admin/orders", () => {
    beforeEach(async () => {
      // Create multiple orders
      await Order.create({
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      });
      await Order.create({
        shippingInfo: testShippingInfo,
        user: adminId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "Card",
        itemsPrice: 200,
        taxAmount: 20,
        shippingAmount: 10,
        totalAmount: 230,
      });
    });

    it("should return all orders", async () => {
      const res = await request(app).get("/api/v1/admin/orders");

      expect(res.statusCode).toBe(200);
      expect(res.body.orders).toBeDefined();
      expect(res.body.orders.length).toBe(2);
    });
  });

  describe("PUT /api/v1/admin/orders/:id", () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      });
      orderId = order._id.toString();
    });

    it("should update order status", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/orders/${orderId}`)
        .send({ status: "Shipped" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedOrder = await Order.findById(orderId);
      expect(updatedOrder.orderStatus).toBe("Shipped");
    });

    it("should not update already delivered order", async () => {
      await Order.findByIdAndUpdate(orderId, { orderStatus: "Delivered" });

      const res = await request(app)
        .put(`/api/v1/admin/orders/${orderId}`)
        .send({ status: "Shipped" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("You have already delivered this order");
    });

    it("should return 404 for non-existent order", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .put(`/api/v1/admin/orders/${fakeId}`)
        .send({ status: "Shipped" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/admin/orders/:id", () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      });
      orderId = order._id.toString();
    });

    it("should delete order", async () => {
      const res = await request(app).delete(`/api/v1/admin/orders/${orderId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedOrder = await Order.findById(orderId);
      expect(deletedOrder).toBeNull();
    });

    it("should return 404 for non-existent order", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).delete(`/api/v1/admin/orders/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
