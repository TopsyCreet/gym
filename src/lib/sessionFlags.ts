const flags = new Set<string>();

export const sessionFlag = {
  check: (key: string): boolean => flags.has(key),
  set:   (key: string): void    => { flags.add(key); },
};
