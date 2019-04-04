export class User {
  constructor(
    public email: string,
    public password: string,
    public name?: string,
    public firstname?: string,
    public telephone?: string
  ) {}
}
