export interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Input = ({ placeholder, value, onChange }: InputProps) => {
  return {
    placeholder,
    value,
    onChange,
    type: 'input'
  };
};
