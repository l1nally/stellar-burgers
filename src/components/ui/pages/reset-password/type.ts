export interface ResetPasswordUIProps {
  password: string;
  setPassword: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
  errorText: string | null;
  handleSubmit: (e: React.FormEvent) => void;
}
