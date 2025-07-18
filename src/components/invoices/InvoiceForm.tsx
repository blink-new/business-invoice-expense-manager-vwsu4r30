import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Save, X } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { InvoiceFormData } from '@/types/invoice'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceUploadZone } from './InvoiceUploadZone'

interface InvoiceFormProps {
  onSubmit?: (invoice: any) => void
  onCancel?: () => void
  initialData?: Partial<InvoiceFormData>
}

export function InvoiceForm({ onSubmit, onCancel, initialData }: InvoiceFormProps) {
  const { categories, createInvoice, loading } = useInvoices()
  const [formData, setFormData] = useState<InvoiceFormData>({
    vendorName: initialData?.vendorName || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    amount: initialData?.amount || 0,
    category: initialData?.category || '',
    description: initialData?.description || '',
    invoiceDate: initialData?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    file: undefined
  })
  
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(
    initialData?.invoiceDate ? new Date(initialData.invoiceDate) : new Date()
  )
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  )
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('')
  const [extractedText, setExtractedText] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const invoice = await createInvoice({
        ...formData,
        invoiceDate: invoiceDate?.toISOString().split('T')[0] || formData.invoiceDate,
        dueDate: dueDate?.toISOString().split('T')[0] || formData.dueDate
      })
      
      if (onSubmit) {
        onSubmit(invoice)
      }
      
      // Reset form
      setFormData({
        vendorName: '',
        invoiceNumber: '',
        amount: 0,
        category: '',
        description: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        file: undefined
      })
      setInvoiceDate(new Date())
      setDueDate(undefined)
      setUploadedFileUrl('')
      setExtractedText('')
      
    } catch (error) {
      console.error('Failed to create invoice:', error)
    }
  }

  const handleUploadComplete = (fileUrl: string, text: string) => {
    setUploadedFileUrl(fileUrl)
    setExtractedText(text)
    
    // Try to extract information from the text
    if (text) {
      // Simple extraction logic - can be enhanced with AI
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
      
      // Look for amount patterns
      const amountMatch = text.match(/\$?([0-9,]+\.?[0-9]*)/g)
      if (amountMatch && amountMatch.length > 0) {
        const amounts = amountMatch.map(a => parseFloat(a.replace(/[$,]/g, ''))).filter(a => a > 0)
        if (amounts.length > 0) {
          setFormData(prev => ({ ...prev, amount: Math.max(...amounts) }))
        }
      }
      
      // Look for vendor name (usually in the first few lines)
      if (lines.length > 0 && !formData.vendorName) {
        setFormData(prev => ({ ...prev, vendorName: lines[0] }))
      }
      
      // Look for invoice number
      const invoiceMatch = text.match(/(?:invoice|inv)\s*#?\s*([a-zA-Z0-9-]+)/i)
      if (invoiceMatch && !formData.invoiceNumber) {
        setFormData(prev => ({ ...prev, invoiceNumber: invoiceMatch[1] }))
      }
    }
  }

  return (
    <div className="space-y-6">
      <InvoiceUploadZone onUploadComplete={handleUploadComplete} />
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Enter the invoice information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="Enter invoice number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !invoiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoiceDate}
                      onSelect={setInvoiceDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter invoice description"
                rows={3}
              />
            </div>

            {extractedText && (
              <div className="space-y-2">
                <Label>Extracted Text</Label>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="bg-muted"
                  rows={4}
                  placeholder="No text extracted from uploaded file"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}