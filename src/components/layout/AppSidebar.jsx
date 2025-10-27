import { ShoppingCart, Package, Warehouse, Users, FileText, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Kasir', url: '/cashier', icon: ShoppingCart },
  { title: 'Produk', url: '/products', icon: Package },
  { title: 'Inventory', url: '/inventory', icon: Warehouse },
  { title: 'Pelanggan', url: '/customers', icon: Users },
  { title: 'Laporan', url: '/reports', icon: FileText },
  { title: 'Pengaturan', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'hover:bg-accent/50'
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
