export interface RegisterUIProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  errorText: string | null;
  handleSubmit: (e: React.FormEvent) => void;
}
