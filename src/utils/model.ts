export abstract class Model<T, E> {
  constructor(protected data: T) {}

  protected getData<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  abstract toGqlSchema(): E;
}
