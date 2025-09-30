import { configureStore, Action } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import authReducer from "./authSlice";
import globalReducer from "./globalSlice";
import syncReducer from "./syncSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    sync: syncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
