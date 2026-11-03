export class TripRequestError extends Error {
  constructor(status, code, fields = {}) { super(code); this.status = status; this.code = code; this.fields = fields; }
}
