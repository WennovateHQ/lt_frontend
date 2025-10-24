export interface CanadianCity {
  name: string
  province: string
  provinceCode: string
  population?: number
}

export const canadianProvinces = [
  { name: 'Alberta', code: 'AB' },
  { name: 'British Columbia', code: 'BC' },
  { name: 'Manitoba', code: 'MB' },
  { name: 'New Brunswick', code: 'NB' },
  { name: 'Newfoundland and Labrador', code: 'NL' },
  { name: 'Northwest Territories', code: 'NT' },
  { name: 'Nova Scotia', code: 'NS' },
  { name: 'Nunavut', code: 'NU' },
  { name: 'Ontario', code: 'ON' },
  { name: 'Prince Edward Island', code: 'PE' },
  { name: 'Quebec', code: 'QC' },
  { name: 'Saskatchewan', code: 'SK' },
  { name: 'Yukon', code: 'YT' }
]

export const canadianCities: CanadianCity[] = [
  // Alberta
  { name: 'Calgary', province: 'Alberta', provinceCode: 'AB', population: 1336000 },
  { name: 'Edmonton', province: 'Alberta', provinceCode: 'AB', population: 1010899 },
  { name: 'Red Deer', province: 'Alberta', provinceCode: 'AB', population: 100418 },
  { name: 'Lethbridge', province: 'Alberta', provinceCode: 'AB', population: 98406 },
  { name: 'St. Albert', province: 'Alberta', provinceCode: 'AB', population: 66082 },
  { name: 'Medicine Hat', province: 'Alberta', provinceCode: 'AB', population: 63260 },
  { name: 'Grande Prairie', province: 'Alberta', provinceCode: 'AB', population: 63166 },
  { name: 'Airdrie', province: 'Alberta', provinceCode: 'AB', population: 61581 },
  { name: 'Spruce Grove', province: 'Alberta', provinceCode: 'AB', population: 34066 },
  { name: 'Okotoks', province: 'Alberta', provinceCode: 'AB', population: 28881 },

  // British Columbia
  { name: 'Vancouver', province: 'British Columbia', provinceCode: 'BC', population: 675218 },
  { name: 'Surrey', province: 'British Columbia', provinceCode: 'BC', population: 568322 },
  { name: 'Burnaby', province: 'British Columbia', provinceCode: 'BC', population: 249125 },
  { name: 'Richmond', province: 'British Columbia', provinceCode: 'BC', population: 209937 },
  { name: 'Abbotsford', province: 'British Columbia', provinceCode: 'BC', population: 153524 },
  { name: 'Coquitlam', province: 'British Columbia', provinceCode: 'BC', population: 148625 },
  { name: 'Kelowna', province: 'British Columbia', provinceCode: 'BC', population: 144576 },
  { name: 'Victoria', province: 'British Columbia', provinceCode: 'BC', population: 91867 },
  { name: 'Saanich', province: 'British Columbia', provinceCode: 'BC', population: 117735 },
  { name: 'Delta', province: 'British Columbia', provinceCode: 'BC', population: 108455 },
  { name: 'Kamloops', province: 'British Columbia', provinceCode: 'BC', population: 97385 },
  { name: 'Langley', province: 'British Columbia', provinceCode: 'BC', population: 132603 },
  { name: 'White Rock', province: 'British Columbia', provinceCode: 'BC', population: 21939 },
  { name: 'North Vancouver', province: 'British Columbia', provinceCode: 'BC', population: 85935 },
  { name: 'West Vancouver', province: 'British Columbia', provinceCode: 'BC', population: 42473 },
  { name: 'Prince George', province: 'British Columbia', provinceCode: 'BC', population: 76708 },
  { name: 'Nanaimo', province: 'British Columbia', provinceCode: 'BC', population: 90504 },

  // Manitoba
  { name: 'Winnipeg', province: 'Manitoba', provinceCode: 'MB', population: 749534 },
  { name: 'Brandon', province: 'Manitoba', provinceCode: 'MB', population: 51313 },
  { name: 'Steinbach', province: 'Manitoba', provinceCode: 'MB', population: 17806 },
  { name: 'Thompson', province: 'Manitoba', provinceCode: 'MB', population: 13678 },
  { name: 'Portage la Prairie', province: 'Manitoba', provinceCode: 'MB', population: 13304 },

  // New Brunswick
  { name: 'Saint John', province: 'New Brunswick', provinceCode: 'NB', population: 67575 },
  { name: 'Moncton', province: 'New Brunswick', provinceCode: 'NB', population: 79470 },
  { name: 'Fredericton', province: 'New Brunswick', provinceCode: 'NB', population: 63116 },
  { name: 'Dieppe', province: 'New Brunswick', provinceCode: 'NB', population: 28114 },

  // Newfoundland and Labrador
  { name: 'St. Johns', province: 'Newfoundland and Labrador', provinceCode: 'NL', population: 114434 },
  { name: 'Mount Pearl', province: 'Newfoundland and Labrador', provinceCode: 'NL', population: 22957 },
  { name: 'Corner Brook', province: 'Newfoundland and Labrador', provinceCode: 'NL', population: 19806 },
  { name: 'Conception Bay South', province: 'Newfoundland and Labrador', provinceCode: 'NL', population: 26199 },

  // Northwest Territories
  { name: 'Yellowknife', province: 'Northwest Territories', provinceCode: 'NT', population: 20340 },
  { name: 'Hay River', province: 'Northwest Territories', provinceCode: 'NT', population: 3528 },
  { name: 'Inuvik', province: 'Northwest Territories', provinceCode: 'NT', population: 3243 },

  // Nova Scotia
  { name: 'Halifax', province: 'Nova Scotia', provinceCode: 'NS', population: 439819 },
  { name: 'Sydney', province: 'Nova Scotia', provinceCode: 'NS', population: 29312 },
  { name: 'Dartmouth', province: 'Nova Scotia', provinceCode: 'NS', population: 101343 },
  { name: 'Truro', province: 'Nova Scotia', provinceCode: 'NS', population: 12261 },
  { name: 'New Glasgow', province: 'Nova Scotia', provinceCode: 'NS', population: 9075 },

  // Nunavut
  { name: 'Iqaluit', province: 'Nunavut', provinceCode: 'NU', population: 7740 },
  { name: 'Rankin Inlet', province: 'Nunavut', provinceCode: 'NU', population: 2842 },
  { name: 'Arviat', province: 'Nunavut', provinceCode: 'NU', population: 2657 },

  // Ontario
  { name: 'Toronto', province: 'Ontario', provinceCode: 'ON', population: 2794356 },
  { name: 'Ottawa', province: 'Ontario', provinceCode: 'ON', population: 1017449 },
  { name: 'Mississauga', province: 'Ontario', provinceCode: 'ON', population: 717961 },
  { name: 'Brampton', province: 'Ontario', provinceCode: 'ON', population: 656480 },
  { name: 'Hamilton', province: 'Ontario', provinceCode: 'ON', population: 569353 },
  { name: 'London', province: 'Ontario', provinceCode: 'ON', population: 422324 },
  { name: 'Markham', province: 'Ontario', provinceCode: 'ON', population: 338503 },
  { name: 'Vaughan', province: 'Ontario', provinceCode: 'ON', population: 323103 },
  { name: 'Kitchener', province: 'Ontario', provinceCode: 'ON', population: 256885 },
  { name: 'Windsor', province: 'Ontario', provinceCode: 'ON', population: 229660 },
  { name: 'Richmond Hill', province: 'Ontario', provinceCode: 'ON', population: 202022 },
  { name: 'Oakville', province: 'Ontario', provinceCode: 'ON', population: 213759 },
  { name: 'Burlington', province: 'Ontario', provinceCode: 'ON', population: 186948 },
  { name: 'Oshawa', province: 'Ontario', provinceCode: 'ON', population: 175383 },
  { name: 'Barrie', province: 'Ontario', provinceCode: 'ON', population: 156362 },
  { name: 'Sudbury', province: 'Ontario', provinceCode: 'ON', population: 166004 },
  { name: 'Kingston', province: 'Ontario', provinceCode: 'ON', population: 132485 },
  { name: 'Guelph', province: 'Ontario', provinceCode: 'ON', population: 131794 },
  { name: 'Cambridge', province: 'Ontario', provinceCode: 'ON', population: 138479 },
  { name: 'Whitby', province: 'Ontario', provinceCode: 'ON', population: 138501 },
  { name: 'Thunder Bay', province: 'Ontario', provinceCode: 'ON', population: 121621 },
  { name: 'Waterloo', province: 'Ontario', provinceCode: 'ON', population: 104986 },
  { name: 'Brantford', province: 'Ontario', provinceCode: 'ON', population: 104688 },
  { name: 'St. Catharines', province: 'Ontario', provinceCode: 'ON', population: 140370 },
  { name: 'Niagara Falls', province: 'Ontario', provinceCode: 'ON', population: 88071 },
  { name: 'Peterborough', province: 'Ontario', provinceCode: 'ON', population: 83651 },
  { name: 'Sarnia', province: 'Ontario', provinceCode: 'ON', population: 72047 },

  // Prince Edward Island
  { name: 'Charlottetown', province: 'Prince Edward Island', provinceCode: 'PE', population: 38809 },
  { name: 'Summerside', province: 'Prince Edward Island', provinceCode: 'PE', population: 16001 },
  { name: 'Stratford', province: 'Prince Edward Island', provinceCode: 'PE', population: 10064 },

  // Quebec
  { name: 'Montreal', province: 'Quebec', provinceCode: 'QC', population: 1762949 },
  { name: 'Quebec City', province: 'Quebec', provinceCode: 'QC', population: 542298 },
  { name: 'Laval', province: 'Quebec', provinceCode: 'QC', population: 438366 },
  { name: 'Gatineau', province: 'Quebec', provinceCode: 'QC', population: 281392 },
  { name: 'Longueuil', province: 'Quebec', provinceCode: 'QC', population: 254483 },
  { name: 'Sherbrooke', province: 'Quebec', provinceCode: 'QC', population: 172950 },
  { name: 'Saguenay', province: 'Quebec', provinceCode: 'QC', population: 144746 },
  { name: 'Levis', province: 'Quebec', provinceCode: 'QC', population: 149683 },
  { name: 'Trois-Rivières', province: 'Quebec', provinceCode: 'QC', population: 139163 },
  { name: 'Terrebonne', province: 'Quebec', provinceCode: 'QC', population: 119944 },
  { name: 'Saint-Jean-sur-Richelieu', province: 'Quebec', provinceCode: 'QC', population: 99669 },
  { name: 'Repentigny', province: 'Quebec', provinceCode: 'QC', population: 87763 },
  { name: 'Brossard', province: 'Quebec', provinceCode: 'QC', population: 91525 },
  { name: 'Drummondville', province: 'Quebec', provinceCode: 'QC', population: 79264 },
  { name: 'Saint-Jérôme', province: 'Quebec', provinceCode: 'QC', population: 77996 },
  { name: 'Granby', province: 'Quebec', provinceCode: 'QC', population: 66222 },

  // Saskatchewan
  { name: 'Saskatoon', province: 'Saskatchewan', provinceCode: 'SK', population: 317480 },
  { name: 'Regina', province: 'Saskatchewan', provinceCode: 'SK', population: 230828 },
  { name: 'Prince Albert', province: 'Saskatchewan', provinceCode: 'SK', population: 37756 },
  { name: 'Moose Jaw', province: 'Saskatchewan', provinceCode: 'SK', population: 33890 },
  { name: 'Swift Current', province: 'Saskatchewan', provinceCode: 'SK', population: 17094 },

  // Yukon
  { name: 'Whitehorse', province: 'Yukon', provinceCode: 'YT', population: 28201 },
  { name: 'Dawson City', province: 'Yukon', provinceCode: 'YT', population: 1375 },
  { name: 'Watson Lake', province: 'Yukon', provinceCode: 'YT', population: 802 }
]

// Helper functions
export const getCitiesByProvince = (provinceCode: string): CanadianCity[] => {
  return canadianCities.filter(city => city.provinceCode === provinceCode)
}

export const searchCities = (query: string, provinceCode?: string): CanadianCity[] => {
  let cities = provinceCode ? getCitiesByProvince(provinceCode) : canadianCities
  
  if (!query) return cities
  
  const searchTerm = query.toLowerCase()
  return cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm) ||
    city.province.toLowerCase().includes(searchTerm)
  )
}

export const getProvinceByCode = (code: string) => {
  return canadianProvinces.find(province => province.code === code)
}
