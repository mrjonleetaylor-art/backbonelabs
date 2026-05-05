import { EMAIL_HREF } from "@/lib/contact"

export default function Footer() {
  return (
    <footer className="bg-[#0C1410] border-t border-white/[0.06] py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="font-serif font-bold text-base text-cream">
            Backbone<span className="text-accent"> Labs</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={EMAIL_HREF}
              className="font-sans text-muted/60 hover:text-muted transition-colors text-xs"
            >
              hello@backbonelabs.com.au
            </a>
            <a href="/privacy" className="font-sans text-muted/60 hover:text-muted transition-colors text-xs">
              Privacy Policy
            </a>
          </div>
          <p className="font-sans text-muted/40 text-xs">© {new Date().getFullYear()} Backbone Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
