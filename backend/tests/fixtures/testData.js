import mongoose from "mongoose";

// Test user data
export const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  role: "user",
};

export const testAdmin = {
  name: "Test Admin",
  email: "admin@example.com",
  password: "admin123456",
  role: "admin",
};

// Test product data
export const testProduct = {
  name: "Test Product",
  price: 99.99,
  description: "This is a test product description",
  ratings: 4.5,
  images: [
    {
      public_id: "test_image_1",
      url: "https://example.com/image1.jpg",
    },
  ],
  category: "Electronics",
  seller: "Test Seller",
  stock: 10,
  numOfReviews: 0,
  reviews: [],
  user: new mongoose.Types.ObjectId(),
};

export const testProducts = [
  {
    name: "Laptop Pro",
    price: 1299.99,
    description: "High-performance laptop",
    category: "Laptops",
    seller: "Tech Store",
    stock: 5,
    user: new mongoose.Types.ObjectId(),
    images: [{ public_id: "laptop_1", url: "https://example.com/laptop.jpg" }],
  },
  {
    name: "Wireless Headphones",
    price: 199.99,
    description: "Noise-canceling headphones",
    category: "Headphones",
    seller: "Audio Shop",
    stock: 20,
    user: new mongoose.Types.ObjectId(),
    images: [{ public_id: "headphones_1", url: "https://example.com/headphones.jpg" }],
  },
  {
    name: "Digital Camera",
    price: 599.99,
    description: "Professional digital camera",
    category: "Cameras",
    seller: "Photo World",
    stock: 8,
    user: new mongoose.Types.ObjectId(),
    images: [{ public_id: "camera_1", url: "https://example.com/camera.jpg" }],
  },
];

// Test order data
export const testShippingInfo = {
  address: "123 Test Street",
  city: "Test City",
  phoneNo: "1234567890",
  zipCode: "12345",
  country: "Test Country",
};

export const testOrderItems = [
  {
    name: "Test Product",
    quantity: 2,
    image: "https://example.com/image.jpg",
    price: "99.99",
    product: new mongoose.Types.ObjectId(),
  },
];

export const testOrder = {
  shippingInfo: testShippingInfo,
  orderItems: testOrderItems,
  paymentMethod: "COD",
  paymentInfo: {
    id: "test_payment_id",
    status: "succeeded",
  },
  itemsPrice: 199.98,
  taxAmount: 20.00,
  shippingAmount: 10.00,
  totalAmount: 229.98,
  user: new mongoose.Types.ObjectId(),
};

// Test review data
export const testReview = {
  rating: 5,
  comment: "Great product!",
  productId: new mongoose.Types.ObjectId(),
};

export default {
  testUser,
  testAdmin,
  testProduct,
  testProducts,
  testShippingInfo,
  testOrderItems,
  testOrder,
  testReview,
};
