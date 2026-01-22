export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Security Rules denied the following request:
    Operation: ${context.operation}
    Path: ${context.path}
    ${context.requestResourceData ? `Data: ${JSON.stringify(context.requestResourceData, null, 2)}` : ''}`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is to make the error object more readable in the console
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  public toString(): string {
    return this.message;
  }
}
