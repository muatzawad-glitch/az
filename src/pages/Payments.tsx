import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CreditCard, Calendar, DollarSign, Eye, Edit2, CheckCircle, Download, Shield, Upload } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { PaymentDetailsDialog } from "@/components/PaymentDetailsDialog";
import { PaymentExportDialog } from "@/components/PaymentExportDialog";
import { BackupDialog } from "@/components/BackupDialog";
import { ImportDialog } from "@/components/ImportDialog";
import { PasswordDialog } from "@/components/PasswordDialog";
import { useToast } from "@/components/ui/use-toast";

export default function Payments() {
  const { payments, contracts, clients, currency, confirmPayment, updatePayment } = useApp();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; payment: any } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'pending') {
      setFilterStatus('pending');
      toast({
        title: "المدفوعات المعلقة",
        description: "تم عرض المدفوعات المعلقة فقط",
      });
    }
  }, [searchParams, toast]);

  const currencySymbols = {
    SAR: "ر.س",
    USD: "$", 
    EUR: "€",
    AED: "د.إ"
  };

  const getClientName = (contractId: number) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return "عقد غير موجود";
    const client = clients.find(c => c.id === contract.clientId);
    return client ? client.name : "عميل غير موجود";
  };

  const filteredPayments = payments.filter(payment => {
    const clientName = getClientName(payment.contractId);
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid": return <Badge className="bg-success/10 text-success border-success/20">مدفوع</Badge>;
      case "pending": return <Badge className="bg-warning/10 text-warning border-warning/20">معلق</Badge>;
      case "overdue": return <Badge className="bg-destructive/10 text-destructive border-destructive/20">متأخر</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch(method) {
      case "cash": return "نقدي";
      case "cheque": return "شيك";
      case "bank_transfer": return "حوالة بنكية";
      case "card": return "بطاقة ائتمان";
      default: return method;
    }
  };

  const handleView = (payment: any) => {
    setSelectedPayment(payment);
  };

  const handleEdit = (payment: any) => {
    setPendingAction({ type: 'edit', payment });
    setShowPasswordDialog(true);
  };

  const handleConfirmPayment = (payment: any) => {
    setPendingAction({ type: 'confirm', payment });
    setShowPasswordDialog(true);
  };

  const handlePasswordConfirm = () => {
    if (pendingAction?.type === 'confirm') {
      confirmPayment(pendingAction.payment.id);
      toast({
        title: "تم التأكيد",
        description: "تم تأكيد الدفع بنجاح",
      });
    } else if (pendingAction?.type === 'edit') {
      // سيتم إضافة وظيفة التعديل لاحقاً
      toast({
        title: "تعديل الدفعة",
        description: "سيتم إضافة وظيفة التعديل قريباً",
      });
    }
    setPendingAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المدفوعات</h1>
          <p className="text-muted-foreground">إدارة مدفوعات الإيجارات</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowExportDialog(true)}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-1" />
            تصدير
          </Button>
          <Button 
            onClick={() => setShowBackupDialog(true)}
            variant="outline"
          >
            <Shield className="h-4 w-4 mr-1" />
            نسخ احتياطي
          </Button>
          <Button 
            onClick={() => setShowImportDialog(true)}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-1" />
            استيراد
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المدفوعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">جميع المدفوعات</option>
              <option value="pending">معلق</option>
              <option value="paid">مدفوع</option>
              <option value="overdue">متأخر</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="shadow-soft hover:shadow-elegant transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {getClientName(payment.contractId)}
                  </CardTitle>
                  <div className="mt-2">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium text-lg text-primary">
                  {payment.amount.toLocaleString()} {currencySymbols[currency as keyof typeof currencySymbols]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                تاريخ الاستحقاق: {payment.dueDate}
              </div>
              {payment.paidDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  تاريخ الدفع: {payment.paidDate}
                </div>
              )}
              <div className="text-sm">
                <p className="text-muted-foreground">طريقة الدفع</p>
                <p className="font-medium">{getPaymentMethodLabel(payment.paymentMethod)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleView(payment)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  عرض
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(payment)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  تعديل
                </Button>
                {payment.status === "pending" && (
                  <Button 
                    size="sm" 
                    className="col-span-2 bg-gradient-success"
                    onClick={() => handleConfirmPayment(payment)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    تأكيد الدفع
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد مدفوعات مطابقة للبحث</p>
        </div>
      )}

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <PaymentDetailsDialog 
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {/* Export Dialog */}
      <PaymentExportDialog 
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />

      {/* Backup Dialog */}
      <BackupDialog 
        open={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        section="payments"
      />

      {/* Import Dialog */}
      <ImportDialog 
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        section="payments"
      />

      {/* Password Dialog */}
      <PasswordDialog 
        open={showPasswordDialog}
        onClose={() => {
          setShowPasswordDialog(false);
          setPendingAction(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="تأكيد كلمة المرور"
        description="يرجى إدخال كلمة المرور للمتابعة"
      />
    </div>
  );
}