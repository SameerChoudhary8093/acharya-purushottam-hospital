import useInView from "../hooks/useInView";

export default function RevealImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  delay = 0,
  loading = "lazy",
}) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`reveal-item reveal-media min-w-0 max-w-full overflow-hidden ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      <img src={src} alt={alt} className={imgClassName} loading={loading} />
    </div>
  );
}
