export class ApiResponse {
  result: object | null;
  status: string;
  msg: string;

  constructor(result: object | null, status: string, msg: string) {
    this.result = result;
    this.status = status;
    this.msg = msg;
  }
}
