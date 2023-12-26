export class Response {
  status: string;
  message: string;
  timestamp: Date;

  constructor(status: string, message: string) {
    this.status = status;
    this.message = message;
    this.timestamp = new Date();
  }
}

export class AuthResponse extends Response {
  sessionToken: string;

  constructor(status: string, message: string, sessionToken: string) {
    super(status, message);
    this.sessionToken = sessionToken;
  }
}
