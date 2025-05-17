import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../utils/api";
import {showToastMessage} from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({id, size}, {rejectWithValue, dispatch}) => {
    try {
      console.log("response startt");
      const response = await api.post("/cart", {productId: id, size, qty: 1});
      console.log("cart response", response);
      if (response.status !== 200) throw new Error(response.error);
      dispatch(
        showToastMessage({
          message: "카트에 아이템이 추가 됐습니다",
          status: "success",
        })
      );
      return response.data.cartItemQty; //todo
    } catch (error) {
      dispatch(
        showToastMessage({
          message: "카트에 아이템 추가 실패",
          status: "error",
        })
      );
      return rejectWithValue(error.error);
    }
  }
);

export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, {rejectWithValue, dispatch}) => {
    try {
      const response = await api.get("/cart");
      if (response.status !== 200) throw new Error(response.error);
      console.log("cart list responsee", response);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, {rejectWithValue, dispatch}) => {
    try{
      const response = await api.delete(`/cart/${id}`)
      console.log("delete responsee",response);
      if(response.status!==200) throw new Error(response.error);

    }catch(error){
      return rejectWithValue(error.error)
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({id, value}, {rejectWithValue}) => {}
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, {rejectWithValue, dispatch}) => {}
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartList = action.payload;
        state.totalPrice = action.payload.reduce(
          //order page, cart page 등등에서 totalPrice 값이 필요하기 때문에 여기에서 계산한다.
          (total, item) => total + item.productId.price * item.qty,
          0
        );
      })
      .addCase(getCartList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
export const {initialCart} = cartSlice.actions;
