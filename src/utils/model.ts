export abstract class Model<T, E> {
  private _keys: string[];
  constructor(protected data: T) {}

  async getData<K extends keyof T>(key: K): Promise<T[K]> {
    const value = this.data[key];
    return Promise.resolve(value);
  }

  abstract async toGqlSchema(): Promise<E>;
}
