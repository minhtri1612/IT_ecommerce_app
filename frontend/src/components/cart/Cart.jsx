import React from "react";
import MetaData from "../layout/MetaData";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem } from "../../redux/features/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  console.log("Current cart items:", cartItems);

  const increaseQty = (item, quantity) => {
    console.log("Increase clicked:", { item, quantity, stock: item?.stock });
    const newQty = quantity + 1;

    // Only restrict if we have valid stock info and it's exceeded
    if (item?.stock && newQty > item.stock) {
      console.log("Blocked by stock limit:", newQty, "vs", item.stock);
      return;
    }

    // Set a reasonable maximum
    if (newQty > 99) {
      console.log("Blocked by max limit");
      return;
    }

    console.log("Setting new quantity:", newQty);
    setItemToCart(item, newQty);
  };

  const decreaseQty = (item, quantity) => {
    console.log("Decrease clicked:", { item, quantity });
    const newQty = quantity - 1;

    if (newQty <= 0) {
      console.log("Blocked by min limit");
      return;
    }

    console.log("Setting new quantity:", newQty);
    setItemToCart(item, newQty);
  };

  const setItemToCart = (item, newQty) => {
    const cartItem = {
      product: item?.product,
      name: item?.name,
      price: item?.price,
      image: item?.image,
      stock: item?.stock,
      quantity: newQty,
    };

    console.log("Dispatching cart item:", cartItem);
    dispatch(setCartItem(cartItem));
  };

  const removeCartItemHandler = (id) => {
    dispatch(removeCartItem(id));
  };

  const checkoutHandler = () => {
    navigate("/shipping");
  };

  return (
    <>
      <MetaData title={"Your Cart"} />
      {cartItems?.length === 0 ? (
        <h2 className="mt-5">Your Cart is Empty</h2>
      ) : (
        <>
          <h2 className="mt-5">
            Your Cart: <b>{cartItems?.length} items</b>
          </h2>

          <div className="row d-flex justify-content-between">
            <div className="col-12 col-lg-8">
              {cartItems?.map((item, index) => (
                <div key={item?.product || index}>
                  <hr />
                  <div className="cart-item" data-key={`product-${item?.product}`}>
                    <div className="row">
                      <div className="col-4 col-lg-3">
                        <img
                          src={item?.image}
                          alt="Laptop"
                          height="90"
                          width="115"
                        />
                      </div>
                      <div className="col-5 col-lg-3">
                        <Link to={`/products/${item?.product}`}>
                          {" "}
                          {item?.name}{" "}
                        </Link>
                      </div>
                      <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                        <p id="card_item_price">${item?.price}</p>
                      </div>
                      <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                        <div className="d-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("MINUS BUTTON CLICKED!");
                              decreaseQty(item, item.quantity);
                            }}
                            style={{
                              width: '35px',
                              height: '35px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            -
                          </button>
                          <span
                            style={{
                              minWidth: '50px',
                              textAlign: 'center',
                              padding: '0 10px',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            {item?.quantity || 1}
                          </span>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("PLUS BUTTON CLICKED!");
                              increaseQty(item, item.quantity);
                            }}
                            style={{
                              width: '35px',
                              height: '35px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                        <i
                          id="delete_cart_item"
                          className="fa fa-trash btn btn-danger"
                          onClick={() => removeCartItemHandler(item?.product)}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            <div className="col-12 col-lg-3 my-4">
              <div id="order_summary">
                <h4>Order Summary</h4>
                <hr />
                <p>
                  Units:{" "}
                  <span className="order-summary-values">
                    {cartItems?.reduce((acc, item) => acc + item?.quantity, 0)}{" "}
                    (Units)
                  </span>
                </p>
                <p>
                  Est. total:{" "}
                  <span className="order-summary-values">
                    $
                    {cartItems
                      ?.reduce(
                        (acc, item) => acc + item?.quantity * item.price,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
                <hr />
                <button
                  id="checkout_btn"
                  className="btn btn-primary w-100"
                  onClick={checkoutHandler}
                >
                  Check out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
