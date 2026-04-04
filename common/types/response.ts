export type TApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type TApiError = {
  success: false;
  message: string;
  statusCode?: number;
};
