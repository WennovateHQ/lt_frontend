'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  contractTemplates, 
  getTemplatesByJurisdiction, 
  getTemplatesByType,
  type ContractTemplate 
} from '@/lib/data/contract-templates'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface ContractTemplateSelectorProps {
  onTemplateSelect: (template: ContractTemplate) => void
  projectType?: 'hourly' | 'fixed' | 'milestone'
  jurisdiction?: 'BC' | 'AB' | 'ON' | 'QC'
}

export function ContractTemplateSelector({ 
  onTemplateSelect, 
  projectType, 
  jurisdiction = 'BC' 
}: ContractTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'hourly' | 'fixed' | 'milestone'>('all')

  // Filter templates based on criteria
  const getFilteredTemplates = () => {
    let templates = contractTemplates

    // Filter by jurisdiction
    templates = getTemplatesByJurisdiction(jurisdiction)

    // Filter by type if specified
    if (filterType !== 'all' && (filterType === 'fixed' || filterType === 'hourly')) {
      templates = getTemplatesByType(filterType)
    }

    return templates
  }

  const filteredTemplates = getFilteredTemplates()

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template.id)
    onTemplateSelect(template)
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'hourly':
        return <ClockIcon className="h-6 w-6 text-blue-600" />
      case 'fixed':
        return <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
      case 'milestone':
        return <CheckCircleIcon className="h-6 w-6 text-purple-600" />
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hourly':
        return 'bg-blue-100 text-blue-800'
      case 'fixed':
        return 'bg-green-100 text-green-800'
      case 'milestone':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Select Contract Template</h2>
        <p className="text-gray-600 mt-1">
          Choose a contract template that matches your project type and requirements
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'hourly', 'fixed', 'milestone'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize ${
                filterType === type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {type === 'all' ? 'All Templates' : `${type} Contracts`}
            </button>
          ))}
        </nav>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 border-blue-500' 
                : 'hover:border-gray-400'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getTemplateIcon(template.type)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={`mt-1 ${getTypeColor(template.type)}`}>
                      {template.type}
                    </Badge>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{template.description}</p>
              
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Jurisdiction</h4>
                  <p className="text-sm text-gray-600">{template.jurisdiction}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Required Fields</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.requiredFields.slice(0, 3).map((field, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Badge>
                    ))}
                    {template.requiredFields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.requiredFields.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {template.defaultMilestones && template.defaultMilestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Default Milestones</h4>
                    <p className="text-sm text-gray-600">
                      {template.defaultMilestones.length} milestone template included
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button 
                  className="w-full" 
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                >
                  {selectedTemplate === template.id ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      Select Template
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Preview */}
      {selectedTemplate && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Template Selected</h4>
                <p className="text-sm text-blue-800 mt-1">
                  You've selected the {filteredTemplates.find(t => t.id === selectedTemplate)?.name}. 
                  This template includes all necessary legal clauses for {jurisdiction} jurisdiction 
                  and is optimized for {filteredTemplates.find(t => t.id === selectedTemplate)?.type} projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Templates Message */}
      {filteredTemplates.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
            <p className="text-gray-600">
              No contract templates match your current filter criteria. 
              Try selecting a different type or jurisdiction.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
