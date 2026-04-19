import clsx from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  secondary:
    "bg-surface text-ink-900 ring-1 ring-ink-300 hover:bg-surface-muted disabled:text-ink-400",
  ghost:
    "bg-transparent text-ink-700 hover:bg-surface-muted disabled:text-ink-400",
  danger:
    "bg-surface text-tile-pink-icon ring-1 ring-tile-pink-bg hover:bg-tile-pink-bg/60",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

interface ButtonAsButton
  extends BaseProps,
    ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}
interface ButtonAsLink extends BaseProps {
  href: string;
  download?: boolean | string;
  target?: string;
  rel?: string;
  children?: ReactNode;
  className?: string;
}
type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    iconLeft,
    iconRight,
    className,
    children,
  } = props;

  const classes = clsx(
    "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {iconLeft}
      {children}
      {iconRight}
    </>
  );

  if ("href" in props && props.href) {
    const { href, download, target, rel } = props;
    return (
      <Link href={href} className={classes} download={download} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  const { variant: _v, size: _s, iconLeft: _il, iconRight: _ir, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
