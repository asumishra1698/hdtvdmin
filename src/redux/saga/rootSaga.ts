import { all, fork } from "redux-saga/effects";
import authSaga from "./authSaga";
import videoSaga from './videoSaga';


export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(videoSaga),
  ]);
}