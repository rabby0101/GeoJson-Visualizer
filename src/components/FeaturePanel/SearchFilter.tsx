import { useState } from 'react'
import { useGeoJSONStore } from '@/store/geojson-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { getUniquePropertyNames, getUniqueGeometryTypes } from '@/lib/utils/filter-helpers'
import { Feature } from 'geojson'

interface SearchFilterProps {
  features: Feature[]
}

export function SearchFilter({ features }: SearchFilterProps) {
  const { filterCriteria, setFilterCriteria, resetFilters } = useGeoJSONStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [propertyFilter, setPropertyFilter] = useState({
    property: '',
    operator: 'equals' as const,
    value: '',
  })

  const geometryTypes = getUniqueGeometryTypes(features)
  const propertyNames = getUniquePropertyNames(features)

  const handleSearchChange = (value: string) => {
    setFilterCriteria({ searchText: value })
  }

  const handleGeometryTypeToggle = (type: string, checked: boolean) => {
    const updated = checked
      ? [...filterCriteria.geometryTypes, type]
      : filterCriteria.geometryTypes.filter((t) => t !== type)
    setFilterCriteria({ geometryTypes: updated })
  }

  const handleAddPropertyFilter = () => {
    if (propertyFilter.property && propertyFilter.value) {
      setFilterCriteria({
        propertyFilters: [
          ...filterCriteria.propertyFilters,
          {
            property: propertyFilter.property,
            operator: propertyFilter.operator,
            value: propertyFilter.value,
          },
        ],
      })
      setPropertyFilter({
        property: '',
        operator: 'equals',
        value: '',
      })
    }
  }

  const handleRemovePropertyFilter = (index: number) => {
    setFilterCriteria({
      propertyFilters: filterCriteria.propertyFilters.filter((_, i) => i !== index),
    })
  }

  const hasActiveFilters =
    filterCriteria.searchText !== '' ||
    filterCriteria.geometryTypes.length > 0 ||
    filterCriteria.propertyFilters.length > 0

  return (
    <div className="space-y-4 p-4 border-b border-gray-200 bg-white">
      {/* Search Input */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Features
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search in properties..."
            value={filterCriteria.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-8"
          />
          {filterCriteria.searchText && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-2">
          {/* Geometry Type Filter */}
          {geometryTypes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Geometry Types</Label>
              <div className="space-y-1.5">
                {geometryTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`geom-${type}`}
                      checked={filterCriteria.geometryTypes.includes(type)}
                      onCheckedChange={(checked) => handleGeometryTypeToggle(type, checked)}
                    />
                    <label
                      htmlFor={`geom-${type}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Filter */}
          {propertyNames.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">Property Filters</Label>

              {/* Active Filters */}
              {filterCriteria.propertyFilters.length > 0 && (
                <div className="space-y-1 mb-2">
                  {filterCriteria.propertyFilters.map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-xs"
                    >
                      <span className="text-blue-900">
                        <span className="font-medium">{filter.property}</span>{' '}
                        <span className="text-blue-600">{filter.operator}</span>{' '}
                        <span className="font-medium">"{filter.value}"</span>
                      </span>
                      <button
                        onClick={() => handleRemovePropertyFilter(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Filter */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select
                    value={propertyFilter.property}
                    onChange={(e) =>
                      setPropertyFilter({ ...propertyFilter, property: e.target.value })
                    }
                  >
                    <option value="">Select property</option>
                    {propertyNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-3">
                  <Select
                    value={propertyFilter.operator}
                    onChange={(e) =>
                      setPropertyFilter({
                        ...propertyFilter,
                        operator: e.target.value as any,
                      })
                    }
                  >
                    <option value="equals">=</option>
                    <option value="contains">contains</option>
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Input
                    type="text"
                    placeholder="Value"
                    value={propertyFilter.value}
                    onChange={(e) =>
                      setPropertyFilter({ ...propertyFilter, value: e.target.value })
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPropertyFilter()
                      }
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddPropertyFilter}
                disabled={!propertyFilter.property || !propertyFilter.value}
                className="w-full text-xs"
                variant="outline"
              >
                Add Filter
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Reset All Filters
        </Button>
      )}
    </div>
  )
}
