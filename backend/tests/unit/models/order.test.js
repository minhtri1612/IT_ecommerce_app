import mongoose from "mongoose";
import Order from "../../../models/order.js";
import User from "../../../models/user.js";
import Product from "../../../models/product.js";
import { setupTestDB, teardownTestDB, clearDatabase } from "../../setup.js";
import { testOrder, testShippingInfo, testOrderItems, testProduct, testUser } from "../../fixtures/testData.js";

describe("Order Model", () => {
  let userId;
  let productId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const user = await User.create(testUser);
    userId = user._id;
    
    const product = await Product.create({ ...testProduct, user: userId });
    productId = product._id;
  });

  describe("Order Creation", () => {
    it("should create an order successfully with valid data", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      const order = await Order.create(orderData);
      
      expect(order._id).toBeDefined();
      expect(order.paymentMethod).toBe("COD");
      expect(order.totalAmount).toBe(115);
    });

    it("should set default orderStatus to Processing", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      const order = await Order.create(orderData);
      
      expect(order.orderStatus).toBe("Processing");
    });

    it("should automatically set createdAt timestamp", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      const order = await Order.create(orderData);
      
      expect(order.createdAt).toBeDefined();
      expect(order.createdAt instanceof Date).toBe(true);
    });
  });

  describe("Order Validation", () => {
    it("should fail without shippingInfo", async () => {
      const orderData = {
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail without user", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should allow empty orderItems array", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      const order = await Order.create(orderData);
      expect(order.orderItems).toEqual([]);
    });

    it("should fail without paymentMethod", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail with invalid paymentMethod", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "InvalidMethod",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail without totalAmount", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });
  });

  describe("Shipping Info Validation", () => {
    it("should fail without address in shippingInfo", async () => {
      const invalidShippingInfo = { ...testShippingInfo };
      delete invalidShippingInfo.address;
      
      const orderData = {
        shippingInfo: invalidShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail without city in shippingInfo", async () => {
      const invalidShippingInfo = { ...testShippingInfo };
      delete invalidShippingInfo.city;
      
      const orderData = {
        shippingInfo: invalidShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail without phoneNo in shippingInfo", async () => {
      const invalidShippingInfo = { ...testShippingInfo };
      delete invalidShippingInfo.phoneNo;
      
      const orderData = {
        shippingInfo: invalidShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail without zipCode in shippingInfo", async () => {
      const invalidShippingInfo = { ...testShippingInfo };
      delete invalidShippingInfo.zipCode;
      
      const orderData = {
        shippingInfo: invalidShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it("should fail without country in shippingInfo", async () => {
      const invalidShippingInfo = { ...testShippingInfo };
      delete invalidShippingInfo.country;
      
      const orderData = {
        shippingInfo: invalidShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });
  });

  describe("Order Status", () => {
    const validStatuses = ["Processing", "Shipped", "Delivered"];
    
    validStatuses.forEach((status) => {
      it(`should accept status: ${status}`, async () => {
        const orderData = {
          shippingInfo: testShippingInfo,
          user: userId,
          orderItems: [{ ...testOrderItems[0], product: productId }],
          paymentMethod: "COD",
          orderStatus: status,
          itemsPrice: 100,
          taxAmount: 10,
          shippingAmount: 5,
          totalAmount: 115,
        };
        
        const order = await Order.create(orderData);
        
        expect(order.orderStatus).toBe(status);
      });
    });

    it("should fail with invalid status", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "COD",
        orderStatus: "InvalidStatus",
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      await expect(Order.create(orderData)).rejects.toThrow();
    });
  });

  describe("Payment Methods", () => {
    const validPaymentMethods = ["COD", "Card"];
    
    validPaymentMethods.forEach((method) => {
      it(`should accept payment method: ${method}`, async () => {
        const orderData = {
          shippingInfo: testShippingInfo,
          user: userId,
          orderItems: [{ ...testOrderItems[0], product: productId }],
          paymentMethod: method,
          itemsPrice: 100,
          taxAmount: 10,
          shippingAmount: 5,
          totalAmount: 115,
        };
        
        const order = await Order.create(orderData);
        
        expect(order.paymentMethod).toBe(method);
      });
    });
  });

  describe("Payment Info", () => {
    it("should store payment info when provided", async () => {
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [{ ...testOrderItems[0], product: productId }],
        paymentMethod: "Card",
        paymentInfo: {
          id: "pi_123456",
          status: "succeeded",
        },
        itemsPrice: 100,
        taxAmount: 10,
        shippingAmount: 5,
        totalAmount: 115,
      };
      
      const order = await Order.create(orderData);
      
      expect(order.paymentInfo.id).toBe("pi_123456");
      expect(order.paymentInfo.status).toBe("succeeded");
    });
  });

  describe("Order Items", () => {
    it("should store multiple order items", async () => {
      const product2 = await Product.create({
        ...testProduct,
        name: "Second Product",
        user: userId,
      });
      
      const orderData = {
        shippingInfo: testShippingInfo,
        user: userId,
        orderItems: [
          { ...testOrderItems[0], product: productId },
          { ...testOrderItems[0], name: "Second Product", product: product2._id },
        ],
        paymentMethod: "COD",
        itemsPrice: 200,
        taxAmount: 20,
        shippingAmount: 5,
        totalAmount: 225,
      };
      
      const order = await Order.create(orderData);
      
      expect(order.orderItems.length).toBe(2);
    });
  });
});
