import httpMocks from "node-mocks-http";
import { jest } from "@jest/globals";

// Mock data
const newOrder = {
  shippingInfo: {
    address: "123 Test Street",
    city: "Test City",
    phoneNo: "1234567890",
    zipCode: "12345",
    country: "Test Country",
  },
  orderItems: [
    {
      name: "Test Product",
      quantity: 2,
      image: "https://example.com/product.jpg",
      price: 99.99,
      product: "5d5ecb5a6e598605f06cb945",
    },
  ],
  paymentMethod: "COD",
  itemsPrice: 199.98,
  taxAmount: 20.0,
  shippingAmount: 10.0,
  totalAmount: 229.98,
};

const allOrders = [
  {
    _id: "5d5ecb5a6e598605f06cb001",
    ...newOrder,
    orderStatus: "Processing",
    user: "5d5ecb5a6e598605f06cb999",
  },
  {
    _id: "5d5ecb5a6e598605f06cb002",
    shippingInfo: {
      address: "456 Another Street",
      city: "Another City",
      phoneNo: "0987654321",
      zipCode: "54321",
      country: "Another Country",
    },
    orderItems: [
      {
        name: "Another Product",
        quantity: 1,
        image: "https://example.com/product2.jpg",
        price: 149.99,
        product: "5d5ecb5a6e598605f06cb946",
      },
    ],
    paymentMethod: "Card",
    itemsPrice: 149.99,
    taxAmount: 15.0,
    shippingAmount: 10.0,
    totalAmount: 174.99,
    orderStatus: "Shipped",
    user: "5d5ecb5a6e598605f06cb998",
  },
];

// Mock Order model
const Order = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

// Mock Product model
const Product = {
  findById: jest.fn(),
};

// Mock the modules before importing controller
jest.unstable_mockModule("../../../models/order.js", () => ({
  default: Order,
}));

jest.unstable_mockModule("../../../models/product.js", () => ({
  default: Product,
}));

jest.unstable_mockModule("../../../middlewares/catchAsyncErrors.js", () => ({
  default: (fn) => fn,
}));

jest.unstable_mockModule("../../../utils/errorHandler.js", () => ({
  default: class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

// Import controller after mocks
const {
  newOrder: createOrder,
  getOrderDetails,
  myOrders,
  allOrders: getAllOrders,
  updateOrder,
  deleteOrder,
} = await import("../../../controllers/orderControllers.js");

let req, res, next;
const orderId = "5d5ecb5a6e598605f06cb001";
const userId = "5d5ecb5a6e598605f06cb999";

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
  jest.clearAllMocks();
});

// ==================== newOrder Tests ====================
describe("OrderController.newOrder", () => {
  beforeEach(() => {
    req.body = newOrder;
    req.user = { _id: userId };
  });

  it("should have a createOrder function", () => {
    expect(typeof createOrder).toBe("function");
  });

  it("should call Order.create", async () => {
    Order.create.mockResolvedValue({ ...newOrder, _id: orderId, user: userId });
    await createOrder(req, res, next);
    expect(Order.create).toHaveBeenCalled();
  });

  it("should return 200 status code", async () => {
    const createdOrder = { ...newOrder, _id: orderId, user: userId };
    Order.create.mockResolvedValue(createdOrder);
    await createOrder(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should return the created order in response", async () => {
    const createdOrder = { ...newOrder, _id: orderId, user: userId };
    Order.create.mockResolvedValue(createdOrder);
    await createOrder(req, res, next);
    expect(res._getJSONData().order).toStrictEqual(createdOrder);
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Error creating order" };
    Order.create.mockRejectedValue(errorMessage);
    try {
      await createOrder(req, res, next);
    } catch (err) {
      expect(err).toEqual(errorMessage);
    }
  });
});

// ==================== getOrderDetails Tests ====================
describe("OrderController.getOrderDetails", () => {
  it("should have a getOrderDetails function", () => {
    expect(typeof getOrderDetails).toBe("function");
  });

  it("should call Order.findById with route parameters", async () => {
    req.params.id = orderId;
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(allOrders[0]),
    });
    await getOrderDetails(req, res, next);
    expect(Order.findById).toHaveBeenCalledWith(orderId);
  });

  it("should return 200 and json body", async () => {
    req.params.id = orderId;
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(allOrders[0]),
    });
    await getOrderDetails(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().order).toStrictEqual(allOrders[0]);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should handle 404 when order not found", async () => {
    req.params.id = orderId;
    Order.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });
    await getOrderDetails(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    req.params.id = orderId;
    const errorMessage = { message: "Error finding order" };
    Order.findById.mockReturnValue({
      populate: jest.fn().mockRejectedValue(errorMessage),
    });
    try {
      await getOrderDetails(req, res, next);
    } catch (err) {
      expect(err).toEqual(errorMessage);
    }
  });
});

// ==================== myOrders Tests ====================
describe("OrderController.myOrders", () => {
  beforeEach(() => {
    req.user = { _id: userId };
  });

  it("should have a myOrders function", () => {
    expect(typeof myOrders).toBe("function");
  });

  it("should call Order.find with user id", async () => {
    Order.find.mockResolvedValue(allOrders);
    await myOrders(req, res, next);
    expect(Order.find).toHaveBeenCalledWith({ user: userId });
  });

  it("should return 200 and all user orders", async () => {
    Order.find.mockResolvedValue(allOrders);
    await myOrders(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().orders).toStrictEqual(allOrders);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should return empty array if no orders", async () => {
    Order.find.mockResolvedValue([]);
    await myOrders(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().orders).toStrictEqual([]);
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Error finding orders" };
    Order.find.mockRejectedValue(errorMessage);
    try {
      await myOrders(req, res, next);
    } catch (err) {
      expect(err).toEqual(errorMessage);
    }
  });
});

// ==================== allOrders Tests (Admin) ====================
describe("OrderController.allOrders", () => {
  it("should have an allOrders function", () => {
    expect(typeof getAllOrders).toBe("function");
  });

  it("should call Order.find", async () => {
    Order.find.mockResolvedValue(allOrders);
    await getAllOrders(req, res, next);
    expect(Order.find).toHaveBeenCalled();
  });

  it("should return 200 and all orders", async () => {
    Order.find.mockResolvedValue(allOrders);
    await getAllOrders(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().orders).toStrictEqual(allOrders);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Error finding all orders" };
    Order.find.mockRejectedValue(errorMessage);
    try {
      await getAllOrders(req, res, next);
    } catch (err) {
      expect(err).toEqual(errorMessage);
    }
  });
});

// ==================== updateOrder Tests (Admin) ====================
describe("OrderController.updateOrder", () => {
  const mockOrder = {
    _id: orderId,
    orderStatus: "Processing",
    orderItems: [
      { product: "5d5ecb5a6e598605f06cb945", quantity: 2 },
    ],
    save: jest.fn().mockResolvedValue(true),
  };

  const mockProduct = {
    _id: "5d5ecb5a6e598605f06cb945",
    stock: 10,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    req.params.id = orderId;
    req.body = { status: "Shipped" };
  });

  it("should have an updateOrder function", () => {
    expect(typeof updateOrder).toBe("function");
  });

  it("should call Order.findById", async () => {
    Order.findById.mockResolvedValue(mockOrder);
    Product.findById.mockResolvedValue(mockProduct);
    await updateOrder(req, res, next);
    expect(Order.findById).toHaveBeenCalledWith(orderId);
  });

  it("should return 200 on successful update", async () => {
    Order.findById.mockResolvedValue({ ...mockOrder });
    Product.findById.mockResolvedValue({ ...mockProduct });
    await updateOrder(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().success).toBe(true);
  });

  it("should handle 404 when order not found", async () => {
    Order.findById.mockResolvedValue(null);
    await updateOrder(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should not update already delivered order", async () => {
    const deliveredOrder = { ...mockOrder, orderStatus: "Delivered" };
    Order.findById.mockResolvedValue(deliveredOrder);
    await updateOrder(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Error updating order" };
    Order.findById.mockRejectedValue(errorMessage);
    try {
      await updateOrder(req, res, next);
    } catch (err) {
      expect(err).toEqual(errorMessage);
    }
  });
});

// ==================== deleteOrder Tests (Admin) ====================
describe("OrderController.deleteOrder", () => {
  const mockOrder = {
    _id: orderId,
    deleteOne: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    req.params.id = orderId;
  });

  it("should have a deleteOrder function", () => {
    expect(typeof deleteOrder).toBe("function");
  });

  it("should call Order.findById", async () => {
    Order.findById.mockResolvedValue(mockOrder);
    await deleteOrder(req, res, next);
    expect(Order.findById).toHaveBeenCalledWith(orderId);
  });

  it("should return 200 on successful deletion", async () => {
    Order.findById.mockResolvedValue(mockOrder);
    await deleteOrder(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().success).toBe(true);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should call deleteOne on the order", async () => {
    Order.findById.mockResolvedValue(mockOrder);
    await deleteOrder(req, res, next);
    expect(mockOrder.deleteOne).toHaveBeenCalled();
  });

  it("should handle 404 when order not found", async () => {
    Order.findById.mockResolvedValue(null);
    await deleteOrder(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should handle errors", async () => {
    const errorMessage = { message: "Error deleting order" };
    Order.findById.mockRejectedValue(errorMessage);
    try {
      await deleteOrder(req, res, next);
    } catch (err) {
      expect(err).toEqual(errorMessage);
    }
  });
});
