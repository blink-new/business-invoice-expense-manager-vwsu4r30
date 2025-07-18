import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  CreditCard, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Building2
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Invoices',
    url: '/invoices',
    icon: FileText,
  },
  {
    title: 'Expenses',
    url: '/expenses',
    icon: Receipt,
  },
  {
    title: 'Payments',
    url: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Categories',
    url: '/categories',
    icon: FolderOpen,
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

interface AppSidebarProps {
  activeItem: string
  onItemClick: (url: string) => void
}

export function AppSidebar({ activeItem, onItemClick }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">InvoiceFlow</h2>
            <p className="text-sm text-muted-foreground">Business Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onItemClick(item.url)}
                    isActive={activeItem === item.url}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}