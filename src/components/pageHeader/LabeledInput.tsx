import React from "react";

type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  type?: "text" | "email";
};

const LabeledInput: React.FC<LabeledInputProps> = ({ label, value, onChange, compact = false, type = "text" }) => {
  const paddingClass = compact ? "py-2" : "py-2.5";
  return (
    <label className="block text-sm text-gray-500">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 w-full rounded-2xl border border-gray-200 px-4 ${paddingClass} text-gray-900 focus:border-indigo-500 focus:outline-none`}
      />
    </label>
  );
};

export default LabeledInput;
