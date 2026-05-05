import FadeIn from "@/components/FadeIn"

export default function SocialProof() {
  return (
    <section className="bg-secondary border-t border-white/[0.06] py-20 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <FadeIn>
          <svg
            className="w-8 h-8 mx-auto mb-7"
            viewBox="0 0 48 48"
            aria-hidden="true"
            fill="currentColor"
            style={{ color: "#D4823A", opacity: 0.3 }}
          >
            <path d="M14 6C7.373 6 2 11.373 2 18v2c0 8.837 7.163 16 16 16h2V22h-8c0-4.418 3.582-8 8-8V6h-6zm22 0c-6.627 0-12 5.373-12 12v2c0 8.837 7.163 16 16 16h2V22h-8c0-4.418 3.582-8 8-8V6h-6z" />
          </svg>
          <blockquote className="font-serif text-xl md:text-2xl text-cream font-medium leading-[1.45] mb-8 tracking-[-0.01em]">
            &ldquo;We were missing 3&ndash;4 calls a day during our busiest periods. Thomas now answers
            every one of them. Last month alone he took 47 orders we never would have
            captured.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sage/30 border border-sage/20 flex items-center justify-center text-cream font-serif font-bold text-sm select-none">
              S
            </div>
            <div className="text-left">
              <p className="font-sans font-semibold text-cream text-sm">Sheena D.</p>
              <p className="font-sans text-muted text-xs">Florist · Melbourne, VIC</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
