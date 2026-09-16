export const ABAR_HERO_SRC = '/images/a-bar.webp'

export default function HeroPack({ className = '' }) {
  return (
    <img
      src={ABAR_HERO_SRC}
      alt="BeGood A-Bar in its finished 10 cm by 8 cm wrapper"
      width="1200"
      height="790"
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className={`absolute inset-0 z-10 h-full w-full object-contain p-[4%] drop-shadow-[0_30px_24px_rgba(45,32,25,.2)] ${className}`}
    />
  )
}

