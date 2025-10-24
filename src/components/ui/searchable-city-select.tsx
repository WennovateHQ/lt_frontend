'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { canadianProvinces, canadianCities, searchCities, type CanadianCity } from '@/data/canadian-locations'

interface SearchableCitySelectProps {
  value?: string
  onChange: (city: string, province: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SearchableCitySelect({
  value = '',
  onChange,
  placeholder = 'Search for a city...',
  className = '',
  disabled = false
}: SearchableCitySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [filteredCities, setFilteredCities] = useState<CanadianCity[]>(canadianCities)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter cities based on search query and selected province
  useEffect(() => {
    const cities = searchCities(searchQuery, selectedProvince)
    setFilteredCities(cities.slice(0, 50)) // Limit to 50 results for performance
    setHighlightedIndex(-1)
  }, [searchQuery, selectedProvince])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
          handleCitySelect(filteredCities[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleCitySelect = (city: CanadianCity) => {
    onChange(city.name, city.province)
    setSearchQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleProvinceFilter = (provinceCode: string) => {
    setSelectedProvince(provinceCode === selectedProvince ? '' : provinceCode)
  }

  const clearSelection = () => {
    onChange('', '')
    setSearchQuery('')
    setSelectedProvince('')
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : value}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${disabled ? 'bg-gray-50' : 'bg-white'}
          `}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && !disabled && (
            <button
              onClick={clearSelection}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-gray-600"
            type="button"
            disabled={disabled}
          >
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Province Filter */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="text-xs font-medium text-gray-700 mb-2">Filter by Province:</div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedProvince('')}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  selectedProvince === '' 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {canadianProvinces.map((province) => (
                <button
                  key={province.code}
                  onClick={() => handleProvinceFilter(province.code)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedProvince === province.code 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {province.code}
                </button>
              ))}
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No cities found matching your search
              </div>
            ) : (
              <div className="py-1">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.provinceCode}`}
                    onClick={() => handleCitySelect(city)}
                    className={`
                      w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                      ${index === highlightedIndex ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.province}</div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {city.provinceCode}
                      </div>
                    </div>
                    {city.population && (
                      <div className="text-xs text-gray-400 mt-1">
                        Population: {city.population.toLocaleString()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredCities.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
              {filteredCities.length} cities shown
              {selectedProvince && ` in ${canadianProvinces.find(p => p.code === selectedProvince)?.name}`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
