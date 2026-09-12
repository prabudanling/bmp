'use client'

import {
  Package,
  Cog,
  Fan,
  BatteryCharging,
  Thermometer,
  Wind,
  Wrench,
  Zap,
  Droplets,
  Snowflake,
  Gauge,
  Plug,
  Cable,
  Layers,
  Settings2,
  Filter,
} from 'lucide-react'

const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  package: Package,
  cog: Cog,
  fan: Fan,
  'battery-charging': BatteryCharging,
  thermometer: Thermometer,
  wind: Wind,
  wrench: Wrench,
  zap: Zap,
  droplets: Droplets,
  snowflake: Snowflake,
  gauge: Gauge,
  plug: Plug,
  cable: Cable,
  layers: Layers,
  settings: Settings2,
  filter: Filter,
}

export function CategoryIcon({
  name,
  className,
}: {
  name?: string
  className?: string
}) {
  const Cmp = (name && MAP[name]) || Package
  return <Cmp className={className} />
}

export const CATEGORY_ICON_OPTIONS = Object.keys(MAP)
