import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Plus,
  ArrowLeft
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { InvoiceTable } from '@/components/invoices/InvoiceTable'
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails'
import { useInvoices } from '@/hooks/useInvoices'
import { Invoice } from '@/types/invoice'

type ViewMode = 'list' | 'create' | 'details' | 'edit'

export function Invoices() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  const { invoices, loading, getInvoiceStats } = useInvoices()
  const stats = getInvoiceStats()

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewMode('details')
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewMode('edit')
  }

  const handleCreateInvoice = () => {
    setViewMode('create')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedInvoice(null)
  }

  const handleInvoiceCreated = () => {
    setViewMode('list')
    setShowCreateDialog(false)
  }

  const renderHeader = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
              <p className="text-muted-foreground">
                Add a new invoice to your system
              </p>
            </div>
          </div>
        )
      case 'details':
        return (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
              <p className="text-muted-foreground">
                View and manage invoice information
              </p>
            </div>
          </div>
        )
      case 'edit':
        return (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
              <p className="text-muted-foreground">
                Update invoice information
              </p>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-muted-foreground">
                Manage and track all your supplier invoices
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Quick Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Upload and create a new invoice entry
                    </DialogDescription>
                  </DialogHeader>
                  <InvoiceForm 
                    onSubmit={handleInvoiceCreated}
                    onCancel={() => setShowCreateDialog(false)}
                  />
                </DialogContent>
              </Dialog>
              <Button className="gap-2" onClick={handleCreateInvoice}>
                <Upload className="h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>
        )
    }
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <InvoiceForm 
            onSubmit={handleInvoiceCreated}
            onCancel={handleBackToList}
          />
        )
      case 'details':
        return selectedInvoice ? (
          <InvoiceDetails 
            invoice={selectedInvoice}
            onEdit={() => handleEditInvoice(selectedInvoice)}
            onClose={handleBackToList}
          />
        ) : null
      case 'edit':
        return selectedInvoice ? (
          <InvoiceForm 
            initialData={{
              vendorName: selectedInvoice.vendorName,
              invoiceNumber: selectedInvoice.invoiceNumber,
              amount: selectedInvoice.amount,
              category: selectedInvoice.category,
              description: selectedInvoice.description,
              invoiceDate: selectedInvoice.invoiceDate,
              dueDate: selectedInvoice.dueDate
            }}
            onSubmit={handleInvoiceCreated}
            onCancel={handleBackToList}
          />
        ) : null
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.count}</div>
                  <p className="text-xs text-muted-foreground">
                    Total amount: ${stats.total.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Amount: ${stats.pending.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.paidCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Amount: ${stats.paid.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overdueCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Amount: ${stats.overdue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>
                  Manage your invoice collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading invoices...</p>
                    </div>
                  </div>
                ) : (
                  <InvoiceTable 
                    invoices={invoices}
                    onViewInvoice={handleViewInvoice}
                    onEditInvoice={handleEditInvoice}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderContent()}
    </div>
  )
}