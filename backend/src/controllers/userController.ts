interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    name: string;
    email: string;
  };
  // ... existing code ...
}
// ... existing code ... 