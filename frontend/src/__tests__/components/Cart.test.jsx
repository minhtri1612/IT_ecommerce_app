import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../../redux/features/cartSlice";
import Cart from "../../components/cart/Cart";

// Suppress console.log during tests
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalLog;
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Helper function to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    preloadedState: {
      cart: {
        cartItems: [],
        shippingInfo: {},
        ...initialState,
      },
    },
  });
};

// Helper function to render with providers
const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe("Cart Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("Empty Cart", () => {
    it("should display empty cart message when no items", () => {
      renderWithProviders(<Cart />);
      
      expect(screen.getByText("Your Cart is Empty")).toBeInTheDocument();
    });

    it("should not display order summary when cart is empty", () => {
      renderWithProviders(<Cart />);
      
      expect(screen.queryByText("Order Summary")).not.toBeInTheDocument();
    });
  });

  describe("Cart with Items", () => {
    const cartItems = [
      {
        product: "1",
        name: "Test Product",
        price: 99.99,
        quantity: 2,
        image: "https://example.com/product.jpg",
        stock: 10,
      },
    ];

    it("should display cart items count", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText(/1 items/)).toBeInTheDocument();
    });

    it("should display product name", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should display product price", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText("$99.99")).toBeInTheDocument();
    });

    it("should display product quantity", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Order Summary", () => {
    const cartItems = [
      {
        product: "1",
        name: "Product 1",
        price: 100,
        quantity: 2,
        stock: 10,
      },
      {
        product: "2",
        name: "Product 2",
        price: 50,
        quantity: 1,
        stock: 5,
      },
    ];

    it("should display Order Summary heading", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    it("should calculate total units correctly", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      // 2 + 1 = 3 units
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("should calculate total price correctly", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      // (100 * 2) + (50 * 1) = 250
      expect(screen.getByText("$250.00")).toBeInTheDocument();
    });

    it("should have a checkout button", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByRole("button", { name: /check out/i })).toBeInTheDocument();
    });
  });

  describe("Quantity Controls", () => {
    const cartItems = [
      {
        product: "1",
        name: "Test Product",
        price: 99.99,
        quantity: 5,
        stock: 10,
      },
    ];

    it("should have increase button", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    it("should have decrease button", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("should have control buttons", () => {
      renderWithProviders(<Cart />, { cartItems });
      
      // Look for all buttons - there should be +, -, and checkout
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Multiple Items", () => {
    const multipleItems = [
      {
        product: "1",
        name: "Product One",
        price: 100,
        quantity: 1,
        stock: 10,
      },
      {
        product: "2",
        name: "Product Two",
        price: 200,
        quantity: 2,
        stock: 5,
      },
      {
        product: "3",
        name: "Product Three",
        price: 50,
        quantity: 3,
        stock: 20,
      },
    ];

    it("should display all cart items", () => {
      renderWithProviders(<Cart />, { cartItems: multipleItems });
      
      expect(screen.getByText("Product One")).toBeInTheDocument();
      expect(screen.getByText("Product Two")).toBeInTheDocument();
      expect(screen.getByText("Product Three")).toBeInTheDocument();
    });

    it("should show correct items count", () => {
      renderWithProviders(<Cart />, { cartItems: multipleItems });
      
      expect(screen.getByText(/3 items/)).toBeInTheDocument();
    });
  });
});
