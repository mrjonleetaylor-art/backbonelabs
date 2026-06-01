"use client"

type SwitchProps = {
  checked: boolean
  onChange?: (next: boolean) => void
  /** Accessible label describing what the switch controls. */
  label: string
  /** Renders the inert "soon" state and removes it from the tab order. */
  disabled?: boolean
  className?: string
}

/**
 * Toggle switch (track + knob), as used by the settings rows.
 * On-state uses ink rather than a bright accent — calmer, more on-brand.
 * role="switch", focusable, operable with Enter/Space.
 */
export default function Switch({ checked, onChange, label, disabled = false, className }: SwitchProps) {
  const track = disabled
    ? "bg-[rgba(10,20,34,0.07)] cursor-not-allowed"
    : checked
      ? "bg-ink"
      : "bg-[rgba(10,20,34,0.18)]"
  const knobPos = checked && !disabled ? "left-[19px]" : "left-[2px]"
  const knobColor = disabled ? "bg-[#F0EDE8]" : "bg-white"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        "relative inline-block h-[25px] w-[42px] flex-none rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        track,
        className ?? "",
      ].join(" ")}
    >
      <span
        className={`absolute top-[2px] h-[21px] w-[21px] rounded-full ${knobColor} ${knobPos} transition-[left] duration-200`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: disabled
            ? "none"
            : checked
              ? "0 1px 3px rgba(10,20,34,0.35), 0 3px 8px rgba(10,20,34,0.2)"
              : "0 1px 2px rgba(10,20,34,0.18), 0 2px 5px rgba(10,20,34,0.12)",
        }}
      />
    </button>
  )
}
