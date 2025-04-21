export interface ForgotPasswordUIProps {
  email: string;
  setEmail: (value: string) => void;
  errorText: string | null;
  handleSubmit: (e: React.FormEvent) => void;
}
