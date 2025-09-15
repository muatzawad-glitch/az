import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { 
  Building2, 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  Wrench,
  Menu,
  Globe,
  Palette,
  DollarSign
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { currency, setCurrency, theme, setTheme, language, setLanguage } = useApp();

  const navigationItems = [
    {
      name: "لوحة التحكم",
      href: "/",
      icon: Home,
    },
    {
      name: "العقارات",
      href: "/properties",
      icon: Building2,
    },
    {
      name: "العملاء",
      href: "/clients",
      icon: Users,
    },
    {
      name: "العقود",
      href: "/contracts",
      icon: FileText,
    },
    {
      name: "المدفوعات",
      href: "/payments",
      icon: CreditCard,
    },
    {
      name: "الصيانة",
      href: "/maintenance",
      icon: Wrench,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border shadow-soft">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">DIG لإدارة العقارات</h1>
              <p className="text-xs text-muted-foreground">إدارة متكاملة</p>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6 border-b border-border pb-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">اللغة</span>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-16 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">العملة</span>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">درهم (افتراضي)</SelectItem>
                    <SelectItem value="SAR">ريال سعودي</SelectItem>
                    <SelectItem value="OMR">ريال عماني</SelectItem>
                    <SelectItem value="QAR">ريال قطري</SelectItem>
                    <SelectItem value="USD">دولار أمريكي</SelectItem>
                    <SelectItem value="EUR">يورو</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">المظهر</span>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-16 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">طبيعي</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-right",
                      isActive ? "bg-gradient-primary shadow-soft" : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}