export class StatusError extends Error {
  constructor(
    readonly status: number,
    message?: string,
  ) {
    super(message);
  }
}
