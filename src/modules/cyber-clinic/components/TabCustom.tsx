'use client'

import React, { useMemo, useState } from 'react'

type TabItem = {
  key: string
  label: string
}

type TabCustomProps = {
  tabs: TabItem[]
  activeKey?: string
  initialKey?: string
  onChange?: (key: string) => void
}

export default function TabCustom({ tabs, activeKey, initialKey, onChange }: TabCustomProps) {
  const isControlled = activeKey !== undefined
  const fallbackKey = useMemo(() => tabs[0]?.key ?? '', [tabs])
  const [internalKey, setInternalKey] = useState(initialKey ?? fallbackKey)
  const currentKey = isControlled ? (activeKey ?? '') : internalKey

  if (!tabs.length) return null

  const handleSelect = (key: string) => {
    if (!isControlled) setInternalKey(key)
    onChange?.(key)
  }

  return (
    <div className="cc-tabs" role="tablist" aria-label="Tabs">
      {tabs.map((tab, index) => {
        const isActive = tab.key === currentKey
        const isLast = index === tabs.length - 1
        return (
          <React.Fragment key={tab.key}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`cc-tab${isActive ? ' cc-tab--active' : ''}`}
              onClick={() => handleSelect(tab.key)}
            >
              {tab.label}
            </button>
            {!isLast && (
              <span
                aria-hidden="true"
                style={{
                  width: '1px',
                  alignSelf: 'stretch',
                  backgroundColor: '#CCCCCC33',
                  margin: '0',
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
