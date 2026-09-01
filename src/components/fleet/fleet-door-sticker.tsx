/**
 * FleetDoorSticker
 *
 * An absolutely-positioned CSS-only sticker that simulates the "South Zoom
 * Tourism" door decal seen on real KA yellow-board vehicles.
 *
 * Place this inside any `relative` image wrapper and it will render as an
 * overlay in the lower-centre area of the image — where the car door sits.
 *
 * Props:
 *  size  – "sm"  for compact fleet-section cards (home page)
 *          "md"  for fleet-listing VehicleCard (default)
 *          "lg"  for the big hero image on the vehicle detail page
 */

export type DoorStickerSize = "sm" | "md" | "lg";

const sizeMap: Record<
  DoorStickerSize,
  {
    wrapper: string;
    logo: string;
    line1: string;
    line2: string;
    tagline: string;
    dot: string;
  }
> = {
  sm: {
    wrapper:
      "bottom-[18%] left-1/2 -translate-x-1/2 px-2 py-1 gap-[3px] rounded-md min-w-[80px]",
    logo: "text-[7px] tracking-[0.22em]",
    line1: "text-[8px] leading-tight",
    line2: "text-[8px] leading-tight",
    tagline: "text-[5.5px] tracking-[0.18em] mt-[2px]",
    dot: "w-[3px] h-[3px]",
  },
  md: {
    wrapper:
      "bottom-[16%] left-1/2 -translate-x-1/2 px-3 py-1.5 gap-1 rounded-lg min-w-[110px]",
    logo: "text-[9px] tracking-[0.22em]",
    line1: "text-[11px] leading-tight",
    line2: "text-[11px] leading-tight",
    tagline: "text-[7px] tracking-[0.18em] mt-0.5",
    dot: "w-1 h-1",
  },
  lg: {
    wrapper:
      "bottom-[14%] left-1/2 -translate-x-1/2 px-5 py-2.5 gap-1.5 rounded-xl min-w-[160px]",
    logo: "text-[11px] tracking-[0.24em]",
    line1: "text-[16px] leading-tight",
    line2: "text-[16px] leading-tight",
    tagline: "text-[9px] tracking-[0.2em] mt-1",
    dot: "w-1.5 h-1.5",
  },
};

export function FleetDoorSticker({ size = "md" }: { size?: DoorStickerSize }) {
  const s = sizeMap[size];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${s.wrapper} flex flex-col items-center border border-[#D4A72C]/60 shadow-[0_2px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[2px] select-none`}
      style={{
        background:
          "linear-gradient(160deg, rgba(7,26,43,0.92) 0%, rgba(16,47,73,0.95) 100%)",
      }}
    >
      {/* Gold top accent line */}
      <span
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-lg"
        style={{
          background: "linear-gradient(90deg, transparent, #D4A72C, transparent)",
        }}
      />

      {/* SZT monogram */}
      <span className={`${s.logo} font-bold text-[#D4A72C]`}>SZT</span>

      {/* Divider dots */}
      <span className="flex items-center gap-1">
        <span className={`${s.dot} rounded-full bg-[#D4A72C]/50`} />
        <span
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #D4A72C80, transparent)",
            width: "32px",
          }}
        />
        <span className={`${s.dot} rounded-full bg-[#D4A72C]/50`} />
      </span>

      {/* Brand name */}
      <span className={`${s.line1} font-extrabold text-white tracking-wide text-center`}>
        SOUTH ZOOM
      </span>
      <span className={`${s.line2} font-extrabold text-[#D4A72C] tracking-wide text-center`}>
        TOURISM
      </span>

      {/* Tagline */}
      <span className={`${s.tagline} text-white/55 uppercase tracking-widest text-center`}>
        KA · Verified Fleet
      </span>

      {/* Gold bottom accent line */}
      <span
        className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-lg"
        style={{
          background: "linear-gradient(90deg, transparent, #D4A72C60, transparent)",
        }}
      />
    </div>
  );
}
