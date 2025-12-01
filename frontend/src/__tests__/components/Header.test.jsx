import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Header from "../../components/layout/Header";

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock the API hooks
jest.mock("../../redux/api/userApi", () => ({
  useGetMeQuery: () => ({ isLoading: false }),
}));

jest.mock("../../redux/api/authApi", () => ({
  useLazyLogoutQuery: () => [jest.fn(), {}],
}));

// Helper function to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }) => ({
        ...state,
        ...initialState.auth,
      }),
      cart: (state = { cartItems: [] }) => ({
        ...state,
        ...initialState.cart,
      }),
    },
    preloadedState: initialState,
  });
};

// Helper function to render with providers
const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Logo and Navigation", () => {
    it("should render the ShopIT logo", () => {
      renderWithProviders(<Header />);
      
      const logo = screen.getByAltText("ShopIT Logo");
      expect(logo).toBeInTheDocument();
    });

    it("should have a link to home page", () => {
      renderWithProviders(<Header />);
      
      const homeLink = screen.getByRole("link", { name: /shopit logo/i });
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Cart Display", () => {
    it("should display cart with 0 items when cart is empty", () => {
      renderWithProviders(<Header />, {
        auth: { user: null },
        cart: { cartItems: [] },
      });
      
      expect(screen.getByText("Cart")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should display correct number of cart items", () => {
      const cartItems = [
        { product: "1", name: "Product 1", quantity: 1 },
        { product: "2", name: "Product 2", quantity: 2 },
      ];
      
      renderWithProviders(<Header />, {
        auth: { user: null },
        cart: { cartItems },
      });
      
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should have a link to cart page", () => {
      renderWithProviders(<Header />);
      
      const cartLink = screen.getByRole("link", { name: /cart/i });
      expect(cartLink).toHaveAttribute("href", "/cart");
    });
  });

  describe("User Authentication", () => {
    it("should display Login button when user is not authenticated", () => {
      renderWithProviders(<Header />, {
        auth: { user: null },
        cart: { cartItems: [] },
      });
      
      expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    it("should display user name when authenticated", () => {
      const user = { name: "John Doe", email: "john@example.com" };
      
      renderWithProviders(<Header />, {
        auth: { user, isAuthenticated: true },
        cart: { cartItems: [] },
      });
      
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should display user avatar when authenticated with avatar", () => {
      const user = {
        name: "John Doe",
        avatar: { url: "https://example.com/avatar.jpg" },
      };
      
      renderWithProviders(<Header />, {
        auth: { user, isAuthenticated: true },
        cart: { cartItems: [] },
      });
      
      const avatar = screen.getByAltText("User Avatar");
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("should display default avatar when user has no avatar", () => {
      const user = { name: "John Doe" };
      
      renderWithProviders(<Header />, {
        auth: { user, isAuthenticated: true },
        cart: { cartItems: [] },
      });
      
      const avatar = screen.getByAltText("User Avatar");
      expect(avatar).toHaveAttribute("src", "/images/default_avatar.jpg");
    });
  });

  describe("User Dropdown Menu", () => {
    it("should show dropdown menu items for regular user", () => {
      const user = { name: "John Doe", role: "user" };
      
      renderWithProviders(<Header />, {
        auth: { user, isAuthenticated: true },
        cart: { cartItems: [] },
      });
      
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("should show Dashboard link for admin user", () => {
      const user = { name: "Admin", role: "admin" };
      
      renderWithProviders(<Header />, {
        auth: { user, isAuthenticated: true },
        cart: { cartItems: [] },
      });
      
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should not show Dashboard link for regular user", () => {
      const user = { name: "User", role: "user" };
      
      renderWithProviders(<Header />, {
        auth: { user, isAuthenticated: true },
        cart: { cartItems: [] },
      });
      
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });
  });
});
