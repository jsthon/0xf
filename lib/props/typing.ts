import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export const plainTypingProps: Partial<
  InputHTMLAttributes<HTMLInputElement> &
    TextareaHTMLAttributes<HTMLTextAreaElement>
> = {
  spellCheck: false,
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "none",
};
