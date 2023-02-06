import type { AxiosRequestConfig } from 'axios';

type Status = number | '(canceled)';

/**
 * @description 请求回调方法
 */
interface CallbackFn<T> {
  (response: T, status: Status, config: AxiosRequestConfig<T>): void;
}

/**
 * @description 基于axios的参数
 */
export interface Options<R = any, D = any> extends AxiosRequestConfig<D> {
  /**
   * 判断是否是业务成功
   */
  isSuccess?: (response: R) => boolean;
  /**
   * 是否显示"加载中"模态框
   */
  showSpin?: boolean;
  /**
   * content-type 会基于类型做options.data的转换
   */
  contentType?: 'JSON' | 'FORM_URLENCODED' | 'FORM_DATA';
  /**
   * spin mask 挂载的组件
   */
  getContainer?: () => HTMLElement;
  /**
   * 是否不做重复请求控制
   */
  ignoreCancel?: boolean;
}

/**
 * @description 请求拓展参数
 */
export interface Params<R = any, D = any> {
  /**
   * 请求成功回调
   */
  onSuccess?: CallbackFn<R> | false;
  /**
   * 请求失败回调
   */
  onFail?: CallbackFn<R> | false;
  /**
   * 请求参数，和options.data相同。可用于GET或者POST
   */
  extraData?: D;
}

/**
 * @description 标准的返回体结构
 */
export interface Result<T = any> {
  /**
   * 接口是否返回成功(业务成功)
   */
  success: boolean;
  /**
   * HTTP返回码
   */
  status: Status;
  /**
   * 接口返回体
   */
  data?: T;
}

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * @description:  contentType
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}
