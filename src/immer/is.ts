export const isObject = (val: any) =>
  Object.prototype.toString.call(val) === '[object Object]';

export const isArray = (val: any) =>
  Object.prototype.toString.call(val) === '[object Array]';

export const isFunction = (val: any) =>
  Object.prototype.toString.call(val) === '[object Function]';
