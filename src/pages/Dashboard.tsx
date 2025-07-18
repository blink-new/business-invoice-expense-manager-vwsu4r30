import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  FileText, 
  Clock, 
  TrendingUp, 
  Upload,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useInvoices } from '@/hooks/useInvoices'
import { useMemo } from 'react'

const categoryColors = {
  'Office Supplies': '#2563EB',
  'Software': '#10B981',
  'Travel': '#F59E0B',
  'Marketing': '#EF4444',
  'Utilities': '#8B5CF6',
  'Professional Services': '#06B6D4',
  'Equipment': '#84CC16',
  'Other': '#6B7280'
}

export function Dashboard() {
  const { invoices, getInvoiceStats } = useInvoices()
  const stats = getInvoiceStats()

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentDate = new Date()
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1)
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate)
        return invoiceDate.getMonth() === monthDate.getMonth() && 
               invoiceDate.getFullYear() === monthDate.getFullYear()
      })
      
      return {
        month,
        invoices: monthInvoices.length,
        amount: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
      }
    })
  }, [invoices])

  // Calculate category data
  const categoryData = useMemo(() => {
    const categoryTotals = invoices.reduce((acc, invoice) => {
      acc[invoice.category] = (acc[invoice.category] || 0) + invoice.amount
    }, {} as Record<string, number>)

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        amount: value,
        color: categoryColors[name as keyof typeof categoryColors] || '#6B7280'
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5 categories
  }, [invoices])

  // Recent invoices
  const recentInvoices = useMemo(() => {
    return invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [invoices])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Eye className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'overdue':
        return <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const calculateAvgProcessingTime = () => {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.paymentDate)
    if (paidInvoices.length === 0) return '0 days'
    
    const totalDays = paidInvoices.reduce((sum, inv) => {
      const created = new Date(inv.createdAt)
      const paid = new Date(inv.paymentDate!)
      const diffTime = Math.abs(paid.getTime() - created.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return sum + diffDays
    }, 0)
    
    const avgDays = Math.round(totalDays / paidInvoices.length * 10) / 10
    return `${avgDays} days`
  }

  const calculateMonthlySavings = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const currentMonthInvoices = invoices.filter(inv => {
      const date = new Date(inv.invoiceDate)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    
    const lastMonthInvoices = invoices.filter(inv => {
      const date = new Date(inv.invoiceDate)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    })
    
    const currentTotal = currentMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const lastTotal = lastMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    
    return Math.max(0, lastTotal - currentTotal)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business finances.
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.count}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.total.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAvgProcessingTime()}</div>
            <p className="text-xs text-muted-foreground">
              From upload to payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateMonthlySavings().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Compared to last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              Invoice trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'invoices' ? `${value} invoices` : `$${Number(value).toLocaleString()}`,
                    name === 'invoices' ? 'Invoices' : 'Amount'
                  ]}
                />
                <Bar dataKey="invoices" fill="#2563EB" name="invoices" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>
              Breakdown of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value}% ($${props.payload.amount.toLocaleString()})`,
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No invoice data yet</p>
                  <p className="text-sm">Upload your first invoice to see analytics</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Latest invoices requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber || invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.vendorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(invoice.status)}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No invoices yet</p>
                <p className="text-sm mb-4">Upload your first invoice to get started</p>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Invoice
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}