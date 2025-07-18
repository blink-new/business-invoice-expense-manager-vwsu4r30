import { useState, useEffect } from 'react'
import { Invoice, Category, InvoiceFormData } from '@/types/invoice'
import { blink } from '@/blink/client'
import { toast } from 'sonner'

// Default categories
const defaultCategories: Category[] = [
  {
    id: 'cat_office_supplies',
    userId: 'default',
    name: 'Office Supplies',
    description: 'General office supplies and equipment',
    color: '#2563EB',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_software',
    userId: 'default',
    name: 'Software',
    description: 'Software licenses and subscriptions',
    color: '#10B981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_travel',
    userId: 'default',
    name: 'Travel',
    description: 'Business travel and accommodation',
    color: '#F59E0B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_marketing',
    userId: 'default',
    name: 'Marketing',
    description: 'Marketing and advertising expenses',
    color: '#EF4444',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_utilities',
    userId: 'default',
    name: 'Utilities',
    description: 'Utilities and operational costs',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_professional',
    userId: 'default',
    name: 'Professional Services',
    description: 'Legal, accounting, and consulting',
    color: '#06B6D4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_equipment',
    userId: 'default',
    name: 'Equipment',
    description: 'Hardware and equipment purchases',
    color: '#84CC16',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_other',
    userId: 'default',
    name: 'Other',
    description: 'Miscellaneous expenses',
    color: '#6B7280',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadInvoices()
      }
    })
    return unsubscribe
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      // For now, we'll use localStorage until database is available
      const storedInvoices = localStorage.getItem('invoices')
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices))
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const saveInvoices = (updatedInvoices: Invoice[]) => {
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices))
    setInvoices(updatedInvoices)
  }

  const createInvoice = async (data: InvoiceFormData): Promise<Invoice> => {
    try {
      setLoading(true)
      
      let fileUrl = ''
      let fileName = ''
      let fileSize = 0
      let extractedText = ''

      // Upload file if provided
      if (data.file) {
        const uploadResult = await blink.storage.upload(
          data.file,
          `invoices/${user.id}/${Date.now()}-${data.file.name}`,
          { upsert: true }
        )
        fileUrl = uploadResult.publicUrl
        fileName = data.file.name
        fileSize = data.file.size

        // Extract text from uploaded file
        try {
          extractedText = await blink.data.extractFromBlob(data.file)
        } catch (error) {
          console.warn('Failed to extract text from file:', error)
        }
      }

      const invoice: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        vendorName: data.vendorName,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        currency: 'USD',
        status: 'pending',
        category: data.category,
        description: data.description,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        fileUrl,
        fileName,
        fileSize,
        extractedText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedInvoices = [...invoices, invoice]
      saveInvoices(updatedInvoices)
      
      toast.success('Invoice created successfully')
      return invoice
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
    try {
      setLoading(true)
      
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === id 
          ? { ...invoice, ...updates, updatedAt: new Date().toISOString() }
          : invoice
      )
      
      saveInvoices(updatedInvoices)
      
      const updatedInvoice = updatedInvoices.find(inv => inv.id === id)!
      toast.success('Invoice updated successfully')
      return updatedInvoice
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast.error('Failed to update invoice')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      
      const updatedInvoices = invoices.filter(invoice => invoice.id !== id)
      saveInvoices(updatedInvoices)
      
      toast.success('Invoice deleted successfully')
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Failed to delete invoice')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const uploadInvoiceFile = async (file: File): Promise<{ fileUrl: string; extractedText: string }> => {
    try {
      // Upload file
      const uploadResult = await blink.storage.upload(
        file,
        `invoices/${user.id}/${Date.now()}-${file.name}`,
        { upsert: true }
      )

      // Extract text
      let extractedText = ''
      try {
        extractedText = await blink.data.extractFromBlob(file)
      } catch (error) {
        console.warn('Failed to extract text from file:', error)
      }

      return {
        fileUrl: uploadResult.publicUrl,
        extractedText
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const getInvoiceStats = () => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0)
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0)
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0)

    return {
      total: totalAmount,
      pending: pendingAmount,
      paid: paidAmount,
      overdue: overdueAmount,
      count: invoices.length,
      pendingCount: invoices.filter(inv => inv.status === 'pending').length,
      paidCount: invoices.filter(inv => inv.status === 'paid').length,
      overdueCount: invoices.filter(inv => inv.status === 'overdue').length
    }
  }

  return {
    invoices,
    categories,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    uploadInvoiceFile,
    getInvoiceStats,
    loadInvoices
  }
}