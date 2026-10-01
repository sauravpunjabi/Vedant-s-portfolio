"use client";

export function ConfirmButton({ message, ...props }: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} onClick={(e) => !confirm(message) && e.preventDefault()} />;
}
