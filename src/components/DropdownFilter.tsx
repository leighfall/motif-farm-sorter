import type { MotifSourceType, sourceTypeFilterType } from '../data/types'
import './DropdownFilter.less'

interface DropdownFilterProps {
  options: sourceTypeFilterType[];
  activeFilter: MotifSourceType | 'all';
  onChange: (sourceType: MotifSourceType | 'all') => void;
  disabled?: boolean;
}

export function DropdownFilter({ options, activeFilter, onChange, disabled }: DropdownFilterProps) {
  return (
    <select
      className="dropdown-filter"
      value={activeFilter}
      onChange={(event) => onChange(event.target.value as MotifSourceType | 'all')}
      disabled={disabled}
    >
      <option value="all">All Sources</option>
      {options.map((option) => (
        <option key={option.id} value={option.type}>
          {option.displayName}
        </option>
      ))}
    </select>
  )
}
