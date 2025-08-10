import { throttle as lodashThrottle } from 'lodash';
import { AnyFunction } from '../types/common';

/**
 *
 * @param delay
 */
export function throttle<T extends Object>(delay: number) {
  return function (_target: T, _key: string, descriptor: PropertyDescriptor) {
    let lastTime = 0;
    let timer: number;

    const originalValue = descriptor.value as AnyFunction;

    descriptor.value = lodashThrottle(originalValue, delay);

    return descriptor;
  };
}
