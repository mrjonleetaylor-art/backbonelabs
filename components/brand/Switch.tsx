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
 * Toggle switch (track + knob), as used by the settings rows. A real
 * role="switch" button, so it is focusable and operable with Enter/Space.
 * The off/soon track colours are the comp's physical greys.
 */
export default function Switch({ checked, onChange, label, disabled = false, className }: SwitchProps) {
  const track = disabled
    ? "bg-[#E4DFD4] cursor-not-allowed"
    : checked
      ? "bg-signal"
      : "bg-[#D2CCBF]"
  const knobPos = checked && !disabled ? "left-[19px]" : "left-[2px]"
  const knobColor = disabled ? "bg-[#F6F4EF]" : "bg-white"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        "relative inline-block h-[25px] w-[42px] flex-none rounded-full shadow-[inset_0_1px_3px_rgba(10,20,34,0.25)] transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        track,
        className ?? "",
      ].join(" ")}
    >
      <span
        className={`absolute top-[2px] h-[21px] w-[21px] rounded-full ${knobColor} ${knobPos} shadow-[0_1px_2px_rgba(10,20,34,0.1),0_2px_5px_rgba(10,20,34,0.28)] transition-[left] duration-200`}
        style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
      />
    </button>
  )
}
