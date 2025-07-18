export interface Invoice {
  id: string
  userId: string
  vendorName: string
  invoiceNumber?: string
  amount: number
  currency: string
  status: 'pending' | 'approved' | 'paid' | 'overdue' | 'rejected'
  category: string
  description: string
  invoiceDate: string
  dueDate?: string
  paymentDate?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  extractedText?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceFormData {
  vendorName: string
  invoiceNumber?: string
  amount: number
  category: string
  description: string
  invoiceDate: string
  dueDate?: string
  file?: File
}