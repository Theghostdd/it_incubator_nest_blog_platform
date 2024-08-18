export class UserTestModel {
  private readonly login: string;
  private readonly email: string;
  private readonly password: string;
  constructor() {
    this.login = 'user1';
    this.email = 'user1@example.com';
    this.password = 'myPassword';
  }

  getUserCreateModel() {
    return {
      login: this.login,
      email: this.email,
      password: this.password,
    };
  }
}
