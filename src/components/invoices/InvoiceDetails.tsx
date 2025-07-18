import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Download, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  DollarSign,
  Building,
  Tag,
  FileIcon
} from 'lucide-react'
import { Invoice } from '@/types/invoice'
import { useInvoices } from '@/hooks/useInvoices'
import { toast } from 'sonner'

interface InvoiceDetailsProps {
  invoice: Invoice
  onEdit?: () => void
  onClose?: () => void
}

export function InvoiceDetails({ invoice, onEdit, onClose }: InvoiceDetailsProps) {
  const { updateInvoice } = useInvoices()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="default" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateInvoice(invoice.id, { status: newStatus as any })
      toast.success('Invoice status updated')
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDownload = () => {
    if (invoice.fileUrl) {
      window.open(invoice.fileUrl, '_blank')
    } else {
      toast.error('No file available for download')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {invoice.invoiceNumber || invoice.id}
          </h2>
          <p className="text-muted-foreground">
            Created on {formatDate(invoice.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(invoice.status)}
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {invoice.fileUrl && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    Vendor
                  </div>
                  <p className="font-medium">{invoice.vendorName}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    Amount
                  </div>
                  <p className="font-medium text-lg">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    Category
                  </div>
                  <Badge variant="outline">{invoice.category}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Invoice Date
                  </div>
                  <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                </div>
                
                {invoice.dueDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </div>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  </div>
                )}
                
                {invoice.paymentDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4" />
                      Payment Date
                    </div>
                    <p className="font-medium">{formatDate(invoice.paymentDate)}</p>
                  </div>
                )}
              </div>
              
              {invoice.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{invoice.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Extracted Text */}
          {invoice.extractedText && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
                <CardDescription>
                  Text extracted from the uploaded invoice file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {invoice.extractedText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoice.status === 'pending' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusChange('approved')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Invoice
                </Button>
              )}
              
              {(invoice.status === 'approved' || invoice.status === 'pending') && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleStatusChange('paid')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
              
              {invoice.status !== 'rejected' && (
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => handleStatusChange('rejected')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Reject Invoice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* File Information */}
          {invoice.fileName && (
            <Card>
              <CardHeader>
                <CardTitle>Attached File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileIcon className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{invoice.fileName}</p>
                    {invoice.fileSize && (
                      <p className="text-sm text-muted-foreground">
                        {(invoice.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
                {invoice.fileUrl && (
                  <Button 
                    className="w-full mt-3" 
                    variant="outline" 
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Invoice Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                </div>
                
                {invoice.status === 'approved' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Invoice Approved</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
                
                {invoice.status === 'paid' && invoice.paymentDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Payment Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.paymentDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}