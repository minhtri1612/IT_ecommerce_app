import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Home from "../../components/Home";

// Mock the API hook
const mockUseGetProductsQuery = jest.fn();
jest.mock("../../redux/api/productsApi", () => ({
  useGetProductsQuery: (...args) => mockUseGetProductsQuery(...args),
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

// Mock child components
jest.mock("../../components/layout/MetaData", () => {
  return function MockMetaData({ title }) {
    return <div data-testid="meta-data">{title}</div>;
  };
});

jest.mock("../../components/layout/Loader", () => {
  return function MockLoader() {
    return <div data-testid="loader">Loading...</div>;
  };
});

jest.mock("../../components/layout/Filters", () => {
  return function MockFilters() {
    return <div data-testid="filters">Filters</div>;
  };
});

jest.mock("../../components/layout/CustomPagination", () => {
  return function MockPagination() {
    return <div data-testid="pagination">Pagination</div>;
  };
});

jest.mock("../../components/product/ProductItem", () => {
  return function MockProductItem({ product }) {
    return <div data-testid="product-item">{product.name}</div>;
  };
});

// Helper function to create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = {}) => state,
      cart: (state = { cartItems: [] }) => state,
    },
  });
};

// Helper function to render with providers
const renderWithProviders = (component) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show loader when loading", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: true,
        data: null,
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });
  });

  describe("Products Display", () => {
    const mockProducts = [
      { _id: "1", name: "Product 1", price: 99.99 },
      { _id: "2", name: "Product 2", price: 149.99 },
    ];

    it("should display products when loaded", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: false,
        data: {
          products: mockProducts,
          resPerPage: 4,
          filteredProductsCount: 2,
        },
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("should display Latest Products heading when no keyword", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: false,
        data: {
          products: mockProducts,
          resPerPage: 4,
          filteredProductsCount: 2,
        },
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(screen.getByText("Latest Products")).toBeInTheDocument();
    });

    it("should display pagination component", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: false,
        data: {
          products: mockProducts,
          resPerPage: 4,
          filteredProductsCount: 2,
        },
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    it("should set page title", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: false,
        data: {
          products: mockProducts,
          resPerPage: 4,
          filteredProductsCount: 2,
        },
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(screen.getByTestId("meta-data")).toHaveTextContent("Buy Best Products Online");
    });
  });

  describe("Empty Products", () => {
    it("should handle empty products array", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: false,
        data: {
          products: [],
          resPerPage: 4,
          filteredProductsCount: 0,
        },
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(screen.getByText("Latest Products")).toBeInTheDocument();
      expect(screen.queryByTestId("product-item")).not.toBeInTheDocument();
    });
  });

  describe("API Parameters", () => {
    it("should call useGetProductsQuery with default params", () => {
      mockUseGetProductsQuery.mockReturnValue({
        isLoading: false,
        data: {
          products: [],
          resPerPage: 4,
          filteredProductsCount: 0,
        },
        error: null,
        isError: false,
      });

      renderWithProviders(<Home />);
      
      expect(mockUseGetProductsQuery).toHaveBeenCalled();
    });
  });
});
