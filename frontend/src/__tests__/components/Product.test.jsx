import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProductItem from "../../components/product/ProductItem";

// Mock react-star-ratings
jest.mock("react-star-ratings", () => {
  return function MockStarRatings({ rating, name }) {
    return <div data-testid="star-ratings" data-rating={rating}>{rating} stars</div>;
  };
});

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ProductItem Component", () => {
  const mockProduct = {
    _id: "product123",
    name: "Test Product",
    price: 99.99,
    ratings: 4.5,
    numOfReviews: 10,
    images: [{ url: "https://example.com/product.jpg" }],
  };

  describe("Product Display", () => {
    it("should render product name", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render product price", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      expect(screen.getByText("$99.99")).toBeInTheDocument();
    });

    it("should render product image", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      const image = screen.getByAltText("Test Product");
      expect(image).toHaveAttribute("src", "https://example.com/product.jpg");
    });

    it("should render default image when product has no images", () => {
      const productWithoutImage = { ...mockProduct, images: [] };
      
      renderWithRouter(<ProductItem product={productWithoutImage} columnSize={3} />);
      
      const image = screen.getByAltText("Test Product");
      expect(image).toHaveAttribute("src", "/images/default_product.png");
    });

    it("should render star ratings", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      const starRatings = screen.getByTestId("star-ratings");
      expect(starRatings).toHaveAttribute("data-rating", "4.5");
    });

    it("should render number of reviews", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      expect(screen.getByText("(10)")).toBeInTheDocument();
    });
  });

  describe("Product Links", () => {
    it("should have a link to product details page", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      const productLink = screen.getByRole("link", { name: "Test Product" });
      expect(productLink).toHaveAttribute("href", "/product/product123");
    });

    it("should have a View Details button with correct link", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      const viewDetailsBtn = screen.getByRole("link", { name: /view details/i });
      expect(viewDetailsBtn).toHaveAttribute("href", "/product/product123");
    });
  });

  describe("Column Size", () => {
    it("should render with columnSize 4", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={4} />);
      
      // Verify the component renders properly with columnSize 4
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should render with columnSize 3", () => {
      renderWithRouter(<ProductItem product={mockProduct} columnSize={3} />);
      
      // Verify the component renders properly with columnSize 3
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle product with undefined ratings", () => {
      const productWithoutRating = { ...mockProduct, ratings: undefined };
      
      renderWithRouter(<ProductItem product={productWithoutRating} columnSize={3} />);
      
      // Should not throw error
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should handle product with zero reviews", () => {
      const productWithZeroReviews = { ...mockProduct, numOfReviews: 0 };
      
      renderWithRouter(<ProductItem product={productWithZeroReviews} columnSize={3} />);
      
      expect(screen.getByText("(0)")).toBeInTheDocument();
    });
  });
});
