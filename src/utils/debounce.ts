// eslint-disable-next-line import/prefer-default-export
export const debounce = <
  Fn extends (...args: Parameters<Fn>) => ReturnType<Fn>
>(
  func: Fn,
  delay: number
): ((...args: Parameters<Fn>) => Promise<ReturnType<Fn>>) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<Fn>): Promise<ReturnType<Fn>> => {
    return new Promise((res) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => res(func(...args)), delay);
    });
  };
};
