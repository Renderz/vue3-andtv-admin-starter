/**
 * 后台标准返回格式
 */
declare type RequexResponse<T extends Record<string, any> = Record<string, any>> =
  | {
      data?: T;
      respDesc?: string;
      errorMsg?: string;
      success?: boolean;
    }
  | undefined;
