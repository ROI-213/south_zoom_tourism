export function AboutHeading({
  heading,
  subheading,
  align = "center",
}: {
  heading: string;
  subheading?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "mx-auto mb-10 max-w-2xl text-center" : "mb-10 max-w-2xl"}>
      <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {heading}
      </h2>
      {subheading ? (
        <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">{subheading}</p>
      ) : null}
    </div>
  );
}
