import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password,navigate }, { rejectWithValue }) => {
    try{
      const response = await api.post("/auth/login",{email,password});
      //성공
      //LoginPage
      console.log("responseeee",response.data);
      sessionStorage.setItem("token",response.data.token);

      return response.data;
    }catch(error){
      //실패
      //실패 시 생긴 에러값을 reducer에 저장
      return rejectWithValue(error.error)
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {
    try{
      const response = await api.post("/auth/google",{token})
      // if(response.status!==200) throw new Error(response.error); //만약 response응답값이 200번대가 아니라면, axios api에서 자동으로 catch(error) 함수로 전달한다.
      sessionStorage.setItem("token",response.data.token);
      return response.data.user;
    }catch(error){
      return rejectWithValue(error.error)
    }
  }
);

export const logout = () => (dispatch) => {
  dispatch(deleteUserData());
  sessionStorage.removeItem("token")
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try{
      const response = await api.post("/user",{email,name,password});
      //성공
      // 1. 성공 토스트 메세지 보여주기
      dispatch(showToastMessage({message:"회원가입을 성공했습니다!",status:"success"}))
      // 2. 로그인 페이지로 리다이렉트
      navigate('/login');

      return response.data.data;
    }catch(error){
      //실패
      //1. 실패 토스트 메세지를 보여준다
      dispatch(showToastMessage({message:"회원가입에 실패했습니다.",status:"error"}))
      //2. 에러값을 저장한다.
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try{
      //api.js에서 token값을 헤더에 자동으로 붙이기 때문에 토큰을 불러올 필요X
      const response = await api.get("/user/me")
      console.log("token responsee",response)
      return response.data;
    }catch(error){
      return rejectWithValue(error.error);
    }
    
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
    deleteUserData: (state)=>{
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending,(state)=>{
      state.loading=true;
    })
    .addCase(registerUser.fulfilled,(state)=>{
      state.loading=false;
      state.registrationError=null;
    })
    .addCase(registerUser.rejected,(state,action)=>{
      state.registrationError=action.payload;
    })
    .addCase(loginWithEmail.pending,(state)=>{
      state.loading=true;
    })
    .addCase(loginWithEmail.fulfilled,(state,action)=>{
      state.loading=false;
      state.user=action.payload.user;
      state.loginError=null;
    })
    .addCase(loginWithEmail.rejected,(state,action)=>{
      state.loginError=action.payload;
    })
    //토큰으로 로그인하는 과정은 로딩 스피너 보여주기X->불필요함
    .addCase(loginWithToken.fulfilled,(state,action)=>{
      state.user=action.payload.user;
    })
    .addCase(loginWithGoogle.pending,(state,action)=>{
      state.loading=true;
    })
    .addCase(loginWithGoogle.fulfilled,(state,action)=>{
      state.loading=false;
      state.user = action.payload;
      state.loginError=null;
    })
    .addCase(loginWithGoogle.rejected,(state,action)=>{
      state.loading=false;
      state.loginError=action.payload;
    })
  },
});
export const { clearErrors,deleteUserData } = userSlice.actions;
export default userSlice.reducer;
