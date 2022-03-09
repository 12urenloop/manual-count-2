declare interface BasePostResponse {
  code: number;
  message: string;
}
declare interface BasePostResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
