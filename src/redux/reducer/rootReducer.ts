import { combineReducers } from "redux";
import authReducers from "./authReducer";
import videoReducer from './videoReducer';

const rootReducer = combineReducers({
  auth: authReducers,
  videos: videoReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;