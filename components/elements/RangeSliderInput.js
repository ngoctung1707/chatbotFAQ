'use client'
import { useState } from 'react'

export default function RangeSliderInput() {
    const [value, setValue] = useState(25000)

    const handleChange = e => {
        setValue(Math.ceil(e.target.value / 5) * 5)
    }
    return (
        <>
            <div className="range-top">
                <p>Limits of balance:</p>
                <span>$<strong id="rangeValue">{value}</strong></span>
            </div>
            <input
                type="range"
                min="1"
                max="50000"
                value={value}
                className="range"
                onChange={e => handleChange(e)}
            />
        </ >
    )
}