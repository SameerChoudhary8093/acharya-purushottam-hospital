import { BedDouble, Building2, GraduationCap, HeartHandshake } from "lucide-react";
import siteContent from "../config/siteContent";

const ICONS = {
  bed: BedDouble,
  building: Building2,
  graduation: GraduationCap,
  heart: HeartHandshake,
};

const CARD = [
  "stat-card stat-card-a",
  "stat-card stat-card-b",
  "stat-card stat-card-c",
  "stat-card stat-card-d",
];

export default function Stats() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {siteContent.stats.map((stat, index) => {
          const Icon = ICONS[stat.icon] || Building2;
          return (
            <li key={stat.id} className={CARD[index] || CARD[0]}>
              <span className="stat-orb" aria-hidden="true" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="relative mt-4 block text-2xl font-black tracking-tight sm:text-3xl">
                {stat.value}
              </span>
              <span className="relative mt-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] sm:text-xs">
                {stat.label}
              </span>
              <span className="relative mt-2 block text-xs leading-snug opacity-80 sm:text-[13px]">
                {stat.description}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
