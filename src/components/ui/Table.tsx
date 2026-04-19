import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ children, className, ...rest }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full text-sm", className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
      {children}
    </thead>
  );
}

export function TH({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={clsx("px-4 py-3 font-semibold border-b border-ink-300/40", className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-ink-300/30">{children}</tbody>;
}

export function TR({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx("transition-colors hover:bg-surface-muted/60", className)}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={clsx("px-4 py-3 align-middle text-ink-700", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}
