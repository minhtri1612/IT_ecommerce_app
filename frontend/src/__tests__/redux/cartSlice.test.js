import cartReducer, {
  setCartItem,
  removeCartItem,
  clearCart,
  saveShippingInfo,
} from "../../redux/features/cartSlice";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Cart Slice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("Initial State", () => {
    it("should return initial state with empty cart", () => {
      const initialState = cartReducer(undefined, { type: "unknown" });
      
      expect(initialState.cartItems).toEqual([]);
      expect(initialState.shippingInfo).toEqual({});
    });
  });

  describe("setCartItem", () => {
    it("should add new item to cart", () => {
      const initialState = { cartItems: [], shippingInfo: {} };
      const newItem = {
        product: "1",
        name: "Test Product",
        price: 99.99,
        quantity: 1,
      };
      
      const state = cartReducer(initialState, setCartItem(newItem));
      
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0]).toEqual(newItem);
    });

    it("should update existing item quantity", () => {
      const existingItem = {
        product: "1",
        name: "Test Product",
        price: 99.99,
        quantity: 1,
      };
      const initialState = { cartItems: [existingItem], shippingInfo: {} };
      const updatedItem = { ...existingItem, quantity: 3 };
      
      const state = cartReducer(initialState, setCartItem(updatedItem));
      
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].quantity).toBe(3);
    });

    it("should save cart to localStorage", () => {
      const initialState = { cartItems: [], shippingInfo: {} };
      const newItem = {
        product: "1",
        name: "Test Product",
        price: 99.99,
        quantity: 1,
      };
      
      cartReducer(initialState, setCartItem(newItem));
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "cartItems",
        expect.any(String)
      );
    });

    it("should add multiple different items", () => {
      let state = { cartItems: [], shippingInfo: {} };
      
      const item1 = { product: "1", name: "Product 1", price: 50, quantity: 1 };
      const item2 = { product: "2", name: "Product 2", price: 75, quantity: 2 };
      
      state = cartReducer(state, setCartItem(item1));
      state = cartReducer(state, setCartItem(item2));
      
      expect(state.cartItems).toHaveLength(2);
    });
  });

  describe("removeCartItem", () => {
    it("should remove item from cart by product id", () => {
      const initialState = {
        cartItems: [
          { product: "1", name: "Product 1", price: 50, quantity: 1 },
          { product: "2", name: "Product 2", price: 75, quantity: 2 },
        ],
        shippingInfo: {},
      };
      
      const state = cartReducer(initialState, removeCartItem("1"));
      
      expect(state.cartItems).toHaveLength(1);
      expect(state.cartItems[0].product).toBe("2");
    });

    it("should update localStorage after removing item", () => {
      const initialState = {
        cartItems: [{ product: "1", name: "Product 1", price: 50, quantity: 1 }],
        shippingInfo: {},
      };
      
      cartReducer(initialState, removeCartItem("1"));
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "cartItems",
        expect.any(String)
      );
    });

    it("should handle removing non-existent item", () => {
      const initialState = {
        cartItems: [{ product: "1", name: "Product 1", price: 50, quantity: 1 }],
        shippingInfo: {},
      };
      
      const state = cartReducer(initialState, removeCartItem("999"));
      
      expect(state.cartItems).toHaveLength(1);
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", () => {
      const initialState = {
        cartItems: [
          { product: "1", name: "Product 1", price: 50, quantity: 1 },
          { product: "2", name: "Product 2", price: 75, quantity: 2 },
        ],
        shippingInfo: {},
      };
      
      const state = cartReducer(initialState, clearCart());
      
      expect(state.cartItems).toHaveLength(0);
    });

    it("should remove cartItems from localStorage", () => {
      const initialState = {
        cartItems: [{ product: "1", name: "Product 1", price: 50, quantity: 1 }],
        shippingInfo: {},
      };
      
      cartReducer(initialState, clearCart());
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("cartItems");
    });
  });

  describe("saveShippingInfo", () => {
    it("should save shipping info", () => {
      const initialState = { cartItems: [], shippingInfo: {} };
      const shippingInfo = {
        address: "123 Test Street",
        city: "Test City",
        postalCode: "12345",
        country: "Test Country",
      };
      
      const state = cartReducer(initialState, saveShippingInfo(shippingInfo));
      
      expect(state.shippingInfo).toEqual(shippingInfo);
    });

    it("should save shipping info to localStorage", () => {
      const initialState = { cartItems: [], shippingInfo: {} };
      const shippingInfo = {
        address: "123 Test Street",
        city: "Test City",
      };
      
      cartReducer(initialState, saveShippingInfo(shippingInfo));
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "shippingInfo",
        JSON.stringify(shippingInfo)
      );
    });

    it("should update existing shipping info", () => {
      const initialState = {
        cartItems: [],
        shippingInfo: { address: "Old Address" },
      };
      const newShippingInfo = { address: "New Address", city: "New City" };
      
      const state = cartReducer(initialState, saveShippingInfo(newShippingInfo));
      
      expect(state.shippingInfo).toEqual(newShippingInfo);
    });
  });

  describe("Cart Calculations", () => {
    it("should maintain cart state independently from shipping info", () => {
      let state = { cartItems: [], shippingInfo: {} };
      
      const item = { product: "1", name: "Product", price: 100, quantity: 2 };
      state = cartReducer(state, setCartItem(item));
      
      const shippingInfo = { address: "Test Address" };
      state = cartReducer(state, saveShippingInfo(shippingInfo));
      
      expect(state.cartItems).toHaveLength(1);
      expect(state.shippingInfo.address).toBe("Test Address");
    });
  });
});
