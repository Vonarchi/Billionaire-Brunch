export function Monogram({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      // Portraits are member-supplied URLs, so they are not run through the image optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img className="logo-img" src={imageUrl} alt="" />
    );
  }
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span className="monogram" aria-hidden="true">
      {letters}
    </span>
  );
}
