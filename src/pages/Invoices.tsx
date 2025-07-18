import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const invoices = [
  { 
    id: 'INV-001', 
    vendor: 'Acme Corporation', 
    amount: 2450.00, 
    status: 'pending', 
    date: '2024-01-15',
    dueDate: '2024-02-15',
    category: 'Office Supplies',
    description: 'Monthly office supplies order'
  },
  { 
    id: 'INV-002', 
    vendor: 'Tech Solutions Ltd', 
    amount: 1200.00, 
    status: 'approved', 
    date: '2024-01-14',
    dueDate: '2024-02-14',
    category: 'Software',
    description: 'Software licensing renewal'
  },
  { 
    id: 'INV-003', 
    vendor: 'Office Depot', 
    amount: 350.00, 
    status: 'paid', 
    date: '2024-01-13',
    dueDate: '2024-02-13',
    category: 'Office Supplies',
    description: 'Printer supplies and paper'
  },
  { 
    id: 'INV-004', 
    vendor: 'Cloud Services Inc', 
    amount: 890.00, 
    status: 'pending', 
    date: '2024-01-12',
    dueDate: '2024-02-12',
    category: 'Software',
    description: 'Monthly cloud hosting'
  },
  { 
    id: 'INV-005', 
    vendor: 'Marketing Agency', 
    amount: 3200.00, 
    status: 'overdue', 
    date: '2024-01-10',
    dueDate: '2024-01-25',
    category: 'Marketing',
    description: 'Q1 marketing campaign'
  },
]

export function Invoices() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

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
            <Eye className="w-3 h-3 mr-1" />
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
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all your supplier invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Invoice Manually</DialogTitle>
                <DialogDescription>
                  Enter invoice details manually if you don't have a digital copy to upload.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">Manual entry form would go here...</p>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Invoice
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Upload</CardTitle>
          <CardDescription>
            Drag and drop your invoice files here or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here to upload</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, PNG, JPG files up to 10MB
            </p>
            <Button variant="outline">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {selectedStatus === 'all' ? 'All' : selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('approved')}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('paid')}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('overdue')}>
                  Overdue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{invoice.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}