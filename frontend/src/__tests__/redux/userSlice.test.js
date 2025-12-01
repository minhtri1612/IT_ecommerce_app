import userReducer, {
  setUser,
  setIsAuthenticated,
  setLoading,
} from "../../redux/features/userSlice";

describe("User Slice", () => {
  describe("Initial State", () => {
    it("should return initial state", () => {
      const initialState = userReducer(undefined, { type: "unknown" });
      
      expect(initialState.user).toBeNull();
      expect(initialState.isAuthenticated).toBe(false);
      expect(initialState.loading).toBe(true);
    });
  });

  describe("setUser", () => {
    it("should set user data", () => {
      const initialState = { user: null, isAuthenticated: false, loading: true };
      const userData = {
        _id: "userId123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      };
      
      const state = userReducer(initialState, setUser(userData));
      
      expect(state.user).toEqual(userData);
    });

    it("should update existing user data", () => {
      const initialState = {
        user: { _id: "userId123", name: "Old Name", email: "old@example.com" },
        isAuthenticated: true,
        loading: false,
      };
      const newUserData = {
        _id: "userId123",
        name: "New Name",
        email: "new@example.com",
      };
      
      const state = userReducer(initialState, setUser(newUserData));
      
      expect(state.user.name).toBe("New Name");
      expect(state.user.email).toBe("new@example.com");
    });

    it("should clear user data when set to null", () => {
      const initialState = {
        user: { _id: "userId123", name: "Test User" },
        isAuthenticated: true,
        loading: false,
      };
      
      const state = userReducer(initialState, setUser(null));
      
      expect(state.user).toBeNull();
    });

    it("should handle user with avatar", () => {
      const initialState = { user: null, isAuthenticated: false, loading: true };
      const userData = {
        _id: "userId123",
        name: "Test User",
        avatar: {
          public_id: "avatar123",
          url: "https://example.com/avatar.jpg",
        },
      };
      
      const state = userReducer(initialState, setUser(userData));
      
      expect(state.user.avatar.url).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("setIsAuthenticated", () => {
    it("should set isAuthenticated to true", () => {
      const initialState = { user: null, isAuthenticated: false, loading: true };
      
      const state = userReducer(initialState, setIsAuthenticated(true));
      
      expect(state.isAuthenticated).toBe(true);
    });

    it("should set isAuthenticated to false", () => {
      const initialState = { user: null, isAuthenticated: true, loading: false };
      
      const state = userReducer(initialState, setIsAuthenticated(false));
      
      expect(state.isAuthenticated).toBe(false);
    });

    it("should not affect other state properties", () => {
      const userData = { _id: "userId123", name: "Test User" };
      const initialState = {
        user: userData,
        isAuthenticated: false,
        loading: false,
      };
      
      const state = userReducer(initialState, setIsAuthenticated(true));
      
      expect(state.user).toEqual(userData);
      expect(state.loading).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("should set loading to true", () => {
      const initialState = { user: null, isAuthenticated: false, loading: false };
      
      const state = userReducer(initialState, setLoading(true));
      
      expect(state.loading).toBe(true);
    });

    it("should set loading to false", () => {
      const initialState = { user: null, isAuthenticated: false, loading: true };
      
      const state = userReducer(initialState, setLoading(false));
      
      expect(state.loading).toBe(false);
    });
  });

  describe("Combined State Updates", () => {
    it("should handle login flow state updates", () => {
      let state = { user: null, isAuthenticated: false, loading: true };
      
      // Simulate login success
      const userData = { _id: "userId123", name: "Test User" };
      state = userReducer(state, setUser(userData));
      state = userReducer(state, setIsAuthenticated(true));
      state = userReducer(state, setLoading(false));
      
      expect(state.user).toEqual(userData);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it("should handle logout flow state updates", () => {
      let state = {
        user: { _id: "userId123", name: "Test User" },
        isAuthenticated: true,
        loading: false,
      };
      
      // Simulate logout
      state = userReducer(state, setUser(null));
      state = userReducer(state, setIsAuthenticated(false));
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("Admin User", () => {
    it("should handle admin user with role", () => {
      const initialState = { user: null, isAuthenticated: false, loading: true };
      const adminUser = {
        _id: "adminId123",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      };
      
      const state = userReducer(initialState, setUser(adminUser));
      
      expect(state.user.role).toBe("admin");
    });
  });
});
