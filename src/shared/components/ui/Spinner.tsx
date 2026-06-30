import { ImSpinner2 } from "react-icons/im";

export function Spinner({ white }: { white?: boolean }) {
  return (
    <ImSpinner2
      size={16}
      className={`animate-spin ${white ? "text-white" : "text-zinc-500"}`}
    />
  );
}
