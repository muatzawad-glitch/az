import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Home, 
  FileText, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CalendarX
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { properties, contracts, payments, maintenanceRequests, currency } = useApp();
  const navigate = useNavigate();
  
  const currencySymbols = {
    SAR: "ر.س",
    USD: "$", 
    EUR: "€",
    AED: "د.إ"
  };
  
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, prop) => sum + prop.totalUnits, 0);
  const availableUnits = properties.reduce((sum, prop) => sum + prop.availableUnits, 0);
  const rentedUnits = properties.reduce((sum, prop) => sum + prop.rentedUnits, 0);
  const totalContracts = contracts.length;
  
  // حساب الإيراد الشهري الحقيقي من العقود
  const monthlyRevenue = contracts.reduce((sum, contract) => {
    if (contract.paymentSchedule === "monthly") {
      return sum + contract.monthlyRent;
    } else if (contract.paymentSchedule === "quarterly") {
      return sum + (contract.monthlyRent / 3);
    } else if (contract.paymentSchedule === "annually") {
      return sum + (contract.monthlyRent / 12);
    }
    return sum + contract.monthlyRent;
  }, 0);
  
  // حساب العقود على وشك الانتهاء (خلال 30 يوم)
  const upcomingExpirations = contracts.filter(contract => {
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;
  
  // حساب المدفوعات المستحقة
  const pendingPayments = payments.filter(payment => payment.status === "pending");
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على إدارة العقارات</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي العقارات"
          value={totalProperties.toString()}
          icon={Building2}
          change={`${totalUnits} وحدة إجمالية`}
          changeType="positive"
        />
        <StatCard
          title="الوحدات المتاحة"
          value={availableUnits.toString()}
          icon={Home}
          change={`من ${totalUnits} وحدة`}
          changeType="positive"
        />
        <StatCard
          title="عقود على وشك الانتهاء"
          value={upcomingExpirations.toString()}
          icon={CalendarX}
          change="تحتاج متابعة"
          changeType={upcomingExpirations > 0 ? "negative" : "positive"}
        />
        <StatCard
          title="الإيراد الشهري"
          value={`${Math.round(monthlyRevenue).toLocaleString()} ${currencySymbols[currency as keyof typeof currencySymbols]}`}
          icon={CreditCard}
          change={`من ${totalContracts} عقد`}
          changeType="positive"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              النشاط الحديث
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contracts.slice(-3).reverse().map((contract, index) => {
              const property = properties.find(p => p.id === contract.propertyId);
              return (
                <div key={contract.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">عقد إيجار جديد</p>
                    <p className="text-xs text-muted-foreground">
                      {property?.name} - {contract.monthlyRent.toLocaleString()} {currencySymbols[currency as keyof typeof currencySymbols]}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {payments.filter(p => p.status === "paid").slice(-2).map((payment) => (
              <div key={payment.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">دفعة مستلمة</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.amount.toLocaleString()} {currencySymbols[currency as keyof typeof currencySymbols]} - {payment.paidDate}
                  </p>
                </div>
              </div>
            ))}
            
            {maintenanceRequests.slice(-1).map((request) => {
              const property = properties.find(p => p.id === request.propertyId);
              return (
                <div key={request.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">طلب صيانة جديد</p>
                    <p className="text-xs text-muted-foreground">{property?.name} - {request.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              التنبيهات والمهام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* العقود على وشك الانتهاء */}
            {upcomingExpirations > 0 && (
              <div 
                className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg cursor-pointer hover:bg-warning/20 transition-colors"
                onClick={() => navigate('/contracts?filter=expiring')}
              >
                <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">عقود على وشك الانتهاء</p>
                  <p className="text-xs text-muted-foreground">
                    {upcomingExpirations} عقد ينتهي خلال 30 يوم
                  </p>
                </div>
              </div>
            )}
            
            {/* المدفوعات المعلقة */}
            {pendingPayments.length > 0 && (
              <div 
                className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => navigate('/payments?filter=pending')}
              >
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">دفعات معلقة</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingPayments.length} دفعة بإجمالي {pendingAmount.toLocaleString()} {currencySymbols[currency as keyof typeof currencySymbols]}
                  </p>
                </div>
              </div>
            )}
            
            {/* طلبات الصيانة المعلقة */}
            {maintenanceRequests.filter(r => r.status === "pending").slice(0, 1).map((request) => {
              const property = properties.find(p => p.id === request.propertyId);
              
              return (
                <div key={request.id} className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">طلب صيانة جديد</p>
                    <p className="text-xs text-muted-foreground">{property?.name} - {request.description}</p>
                  </div>
                </div>
              );
            })}
            
            {/* رسالة في حالة عدم وجود تنبيهات */}
            {upcomingExpirations === 0 && pendingPayments.length === 0 && maintenanceRequests.filter(r => r.status === "pending").length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">لا توجد تنبيهات حالياً</p>
                <p className="text-xs text-muted-foreground">جميع الأمور تسير بشكل طبيعي</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}