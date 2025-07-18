import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/pages/Dashboard'
import { Invoices } from '@/pages/Invoices'
import { blink } from '@/blink/client'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('/')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const handleNavigation = (url: string) => {
    setCurrentPage(url)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case '/':
        return <Dashboard />
      case '/invoices':
        return <Invoices />
      case '/expenses':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">Expense management coming soon...</p>
          </div>
        )
      case '/payments':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">Payment processing coming soon...</p>
          </div>
        )
      case '/categories':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Category management coming soon...</p>
          </div>
        )
      case '/reports':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Financial reports coming soon...</p>
          </div>
        )
      case '/settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Application settings coming soon...</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">InvoiceFlow</h1>
          <p className="text-muted-foreground max-w-md">
            Streamline your business invoice and expense management with our comprehensive platform.
          </p>
          <button 
            onClick={() => blink.auth.login()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar activeItem={currentPage} onItemClick={handleNavigation} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

export default App