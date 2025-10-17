import * as React from "react"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min?: number
  max?: number
  step?: number
  value?: number
  onValueChange?: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      onValueChange?.(newValue)
      onChange?.(e)
    }

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 ${className || ''}`}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
