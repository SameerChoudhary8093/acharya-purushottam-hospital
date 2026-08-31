const variants = {
  primary:
    "bg-navy text-white hover:bg-navy-hover border border-navy",
  secondary:
    "bg-white text-navy border border-navy hover:bg-wash",
  inverse:
    "bg-white text-navy border border-white hover:bg-wash",
};

export default function Button({
  as = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const Tag = as;
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wide no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
