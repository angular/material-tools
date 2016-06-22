export interface Resolver {

  resolve(version?: string): Promise<string>;

}