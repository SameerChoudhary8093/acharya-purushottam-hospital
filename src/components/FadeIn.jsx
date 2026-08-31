import useInView from "../hooks/useInView";

const VARIANTS = {
  up: "translate-y-10",
  left: "translate-x-6",
  right: "-translate-x-6",
  zoom: "scale-[0.96]",
};

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  variant = "up",
  duration = 800,
}) {
  const [ref, visible] = useInView();
  const hiddenMove = VARIANTS[variant] || VARIANTS.up;

  return (
    <div
      ref={ref}
      className={`reveal-item min-w-0 transition-[opacity,transform] ease-[cubic-bezier(0.215,0.61,0.355,1)] ${
        visible ? "is-visible translate-x-0 translate-y-0 scale-100 opacity-100" : `opacity-0 ${hiddenMove}`
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
