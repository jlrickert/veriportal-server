export abstract class Model<T, E> {
  private _keys: string[];
  constructor(protected data: T) {}

  getData<K extends keyof T>(key: K): T[K] {
    const value = this.data[key];
    return value;
  }

  abstract toSchema(): E;
}
