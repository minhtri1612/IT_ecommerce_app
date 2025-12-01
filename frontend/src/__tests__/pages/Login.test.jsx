import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Login from "../../components/auth/Login";

// Mock the login mutation
const mockLogin = jest.fn();

jest.mock("../../redux/api/authApi", () => ({
  useLoginMutation: () => [
    mockLogin,
    { isLoading: false, error: null, isSuccess: false },
  ],
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

// Mock MetaData component
jest.mock("../../components/layout/MetaData", () => {
  return function MockMetaData({ title }) {
    return <div data-testid="meta-data">{title}</div>;
  };
});

// Mock react-router-dom navigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

// Helper function to create a mock store
const createMockStore = (isAuthenticated = false) => {
  return configureStore({
    reducer: {
      auth: (state = { isAuthenticated: false }) => ({
        ...state,
        isAuthenticated,
      }),
    },
  });
};

// Helper function to render with providers
const renderWithProviders = (component, isAuthenticated = false) => {
  const store = createMockStore(isAuthenticated);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render login form", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
      });
    });

    it("should render email input field", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    });

    it("should render password input field", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      });
    });

    it("should render login button", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
      });
    });

    it("should render forgot password link", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
      });
    });

    it("should render new user link", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByRole("link", { name: /new user/i })).toBeInTheDocument();
      });
    });

    it("should set page title", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        expect(screen.getByTestId("meta-data")).toHaveTextContent("Login");
      });
    });
  });

  describe("Form Input Elements", () => {
    it("should have password input type as password", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toHaveAttribute("type", "password");
      });
    });

    it("should have email input type as email", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute("type", "email");
      });
    });
  });

  describe("Navigation Links", () => {
    it("should have correct forgot password link", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        const forgotLink = screen.getByRole("link", { name: /forgot password/i });
        expect(forgotLink).toHaveAttribute("href", "/password/forgot");
      });
    });

    it("should have correct register link", async () => {
      renderWithProviders(<Login />);
      
      await waitFor(() => {
        const registerLink = screen.getByRole("link", { name: /new user/i });
        expect(registerLink).toHaveAttribute("href", "/register");
      });
    });
  });
});
