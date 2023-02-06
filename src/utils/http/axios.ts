import Progress from '@/utils/progress';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import download from 'downloadjs';
import { cloneDeep } from 'lodash-es';
import { compile, parse } from 'path-to-regexp';
import qs from 'qs';
import { AxiosCanceler } from './axiosCancel';
import type { Options, Params, Result } from './types';
import { ContentTypeEnum, RequestEnum } from './types';

export class Requex<T = any> {
  private axiosInstance: AxiosInstance;
  private readonly options: Options;
  private readonly params?: Params;
  private readonly progress: Progress;

  constructor(options: Options<T>, params?: Params<T>, customizeInstance?: (instance: AxiosInstance) => void) {
    this.options = options;
    this.params = params;
    this.axiosInstance = axios.create(options);
    this.progress = new Progress(options.getContainer);
    this.setupInterceptors();
    if (typeof customizeInstance === 'function') {
      customizeInstance(this.axiosInstance);
    }
  }

  /**
   * @description 添加默认的interceptors, 比如cancel
   */
  setupInterceptors() {
    const axiosCanceler = new AxiosCanceler();

    this.axiosInstance.interceptors.request.use((config) => {
      if (
        !this.options.ignoreCancel &&
        !(config as InternalAxiosRequestConfig<any> & { ignoreCancel: boolean }).ignoreCancel
      ) {
        axiosCanceler.addPending(config);
      }

      return config;
    });

    this.axiosInstance.interceptors.response.use((res) => {
      if (res) {
        axiosCanceler.removePending(res.config);
      }
      return res;
    });
  }

  /**
   * @description URL转换逻辑，包括模板替换
   */
  private transformURL(options: Options) {
    let url = options.url || '';
    let data = options.data;
    let domain = '';

    const urlMatch = url?.match(/[a-zA-z]+:\/\/[^/]*/);

    if (urlMatch) {
      [domain] = urlMatch;
      url = url?.slice(domain.length);
    }

    const match = parse(url);
    url = compile(url)(data);
    // only replace pattern when matched
    if (match.length > 1) {
      const cloneData = cloneDeep(data);
      match.forEach((item) => {
        if (item instanceof Object && item.name in cloneData) {
          delete cloneData[item.name];
        }
      });
      data = cloneData;
    }
    url = domain + url;

    options.url = url;
    options.data = data;
  }

  /**
   * @description Data转换逻辑
   */
  private transformData(options: Options) {
    const headers = options.headers;

    if (options.contentType === 'FORM_DATA' && options.method?.toLocaleUpperCase() !== RequestEnum.GET) {
      const formData = new window.FormData();

      if (options.data) {
        Object.keys(options.data).forEach((key) => {
          const value = options.data![key];
          if (Array.isArray(value)) {
            value.forEach((item) => {
              formData.append(key, item);
            });
            return;
          }

          formData.append(key, value);
        });
      }

      options.data = formData;
      options.method = RequestEnum.POST;
    } else if (
      options.contentType === 'FORM_URLENCODED' &&
      Reflect.has(options, 'data') &&
      options.method?.toUpperCase() !== RequestEnum.GET
    ) {
      options.data = qs.stringify(options.data, { arrayFormat: 'brackets' });
      headers!['content-type'] = ContentTypeEnum.FORM_URLENCODED;
    } else if (Reflect.has(options, 'data') && options.method?.toUpperCase() === 'GET') {
      options.params = options.data;
      delete options.data;
    }
  }

  /**
   * @description 请求后流程
   */
  private afterResponse<R = T>(res: AxiosResponse<R>, options: Options): Result<R> {
    const { data, status } = res;

    const isAttachment: boolean = res.headers['content-disposition']?.indexOf('attachment') >= 0;

    const contentType = res.headers?.['Content-Type'] || res.headers?.['content-type'];

    const isHtml: boolean = contentType?.indexOf('text/html') >= 0;

    const ret: Result<R> = {
      success: false,
      data,
      status,
    };

    if (!data) {
      (ret.success = true), (ret.status = status);

      return ret;
    }

    /**
     * 返回文件下载
     */
    if (isAttachment) {
      const filename = decodeURIComponent(res.headers['content-disposition']?.split('filename=')[1]);
      download(data as any, filename, contentType);

      ret.success = true;
      return ret;
    }

    /**
     * 返回页面
     */
    if (isHtml) {
      ret.success = true;
      ret.data = undefined;
      return ret;
    }

    /**
     * 使用外部判断逻辑判断success
     */
    if (typeof options.isSuccess === 'function') {
      const success = options.isSuccess(data);
      ret.success = success;
    }

    return ret;
  }

  /**
   * @description 发送请求
   */
  async request<D = any, R = T>(opts: Options<R, D>, pars?: Params<R, D>): Promise<Result<R>> {
    const options = Object.assign({}, cloneDeep(this.options), cloneDeep(opts));
    const params = Object.assign({}, cloneDeep(this.params), cloneDeep(pars));

    options.data = options.data || params.extraData;

    this.transformURL(options);
    this.transformData(options);

    const stop = options.showSpin ? this.progress.start() : undefined;

    try {
      const response = await this.axiosInstance.request<R, AxiosResponse<R>, D>(options);

      const ret = this.afterResponse<R>(response, options);

      if (ret.success) {
        if (typeof params.onSuccess === 'function') {
          params?.onSuccess(ret.data, ret.status, options);
        }
        return Promise.resolve(ret);
      } else if (!ret.success) {
        if (typeof params.onFail === 'function') {
          params?.onFail(ret.data, ret.status, options);
        }
        return Promise.reject(ret);
      }

      return Promise.reject(ret);
    } catch (e) {
      if (e instanceof axios.Cancel) {
        const status = '(canceled)';

        if (typeof params.onFail === 'function') {
          params?.onFail({}, status, options);
        }

        return Promise.reject({
          success: false,
          status,
        });
      }

      if (axios.isAxiosError(e)) {
        // rewrite error message from axios in here
        const { response } = e as AxiosError<R>;

        if (!response) {
          throw e;
        }

        if (typeof params?.onFail === 'function') {
          params?.onFail(response.data, response.status, options);
        }

        return Promise.reject({
          success: false,
          data: response.data,
          status: response.status,
        });
      }

      throw e;
    } finally {
      if (typeof stop === 'function') {
        stop();
      }
    }
  }
}
