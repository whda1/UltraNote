import { configureStore } from "@reduxjs/toolkit";
import configReducer from "../features/configSlice"

export default configureStore({
  reducer: {
    config:configReducer
  },
});
