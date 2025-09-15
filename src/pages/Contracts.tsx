import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Calendar, User, Edit2, Eye, RefreshCw, Download, Trash2, Shield, Upload } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { ContractForm } from "@/components/ContractForm";
import { ContractDetailsDialog } from "@/components/ContractDetailsDialog";
import { ContractExportDialog } from "@/components/ContractExportDialog";
import { ContractRenewalDialog } from "@/components/ContractRenewalDialog";
import { BackupDialog } from "@/components/BackupDialog";
import { ImportDialog } from "@/components/ImportDialog";
import { PasswordDialog } from "@/components/PasswordDialog";
import { useToast } from "@/components/ui/use-toast";

export default function Contracts() {
  const { contracts, properties, clients, currency, updateContract, deleteContract } = useApp();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; contract: any } | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'expiring') {
      setFilterType('expiring');
      toast({
        title: "العقود على وشك الانتهاء",
        description: "تم عرض العقود التي تنتهي خلال 30 يوم",
      });
    }
  }, [searchParams, toast]);

  const currencySymbols = {
    SAR: "ر.س",
    USD: "$", 
    EUR: "€",
    AED: "د.إ"
  };

  const getPropertyName = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "عقار غير موجود";
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "عميل غير موجود";
  };

  const filteredContracts = contracts.filter(contract => {
    const propertyName = getPropertyName(contract.propertyId);
    const clientName = getClientName(contract.clientId);
    const matchesSearch = propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'expiring') {
      const endDate = new Date(contract.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesFilter = diffDays <= 30 && diffDays > 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  const getPaymentScheduleLabel = (schedule: string) => {
    switch(schedule) {
      case "monthly": return "شهري";
      case "quarterly": return "ربع سنوي";
      case "semi_annual": return "نصف سنوي";
      case "annually": return "سنوي";
      default: return schedule;
    }
  };

  const handleEdit = (contract: any) => {
    setPendingAction({ type: 'edit', contract });
    setShowPasswordDialog(true);
  };

  const handleView = (contract: any) => {
    setSelectedContract(contract);
    setIsEditMode(false);
  };

  const handleRenew = (contract: any) => {
    setSelectedContract(contract);
    setShowRenewalDialog(true);
  };

  const handleDelete = (contract: any) => {
    setPendingAction({ type: 'delete', contract });
    setShowPasswordDialog(true);
  };

  const handlePasswordConfirm = () => {
    if (pendingAction?.type === 'edit') {
      setSelectedContract(pendingAction.contract);
      setIsEditMode(true);
      toast({
        title: "تم التأكيد",
        description: "يمكنك الآن تعديل العقد",
      });
    } else if (pendingAction?.type === 'delete') {
      deleteContract(pendingAction.contract.id);
      toast({
        title: "تم الحذف",
        description: "تم حذف العقد بنجاح",
      });
    }
    setPendingAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">العقود</h1>
          <p className="text-muted-foreground">إدارة عقود الإيجار والبيع</p>
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
          <ContractForm />
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في العقود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">جميع العقود</option>
              <option value="expiring">على وشك الانتهاء</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="shadow-soft hover:shadow-elegant transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {getPropertyName(contract.propertyId)}
                  </CardTitle>
                  <div className="mt-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {getPaymentScheduleLabel(contract.paymentSchedule)}
                    </Badge>
                  </div>
                </div>
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {getClientName(contract.clientId)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {contract.startDate} - {contract.endDate}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleView(contract)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  عرض
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(contract)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  تعديل
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRenew(contract)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  تجديد
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(contract)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد عقود مطابقة للبحث</p>
        </div>
      )}

      {/* Contract Details/Edit Dialog */}
      {selectedContract && (
        <>
          {isEditMode ? (
            <ContractForm 
              contract={selectedContract} 
              isEdit={true}
              onClose={() => {
                setSelectedContract(null);
                setIsEditMode(false);
              }}
            />
          ) : (
            <ContractDetailsDialog 
              contract={selectedContract}
              onClose={() => setSelectedContract(null)}
            />
          )}
        </>
      )}

      {/* Export Dialog */}
      <ContractExportDialog 
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />

      {/* Backup Dialog */}
      <BackupDialog 
        open={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        section="contracts"
      />

      {/* Import Dialog */}
      <ImportDialog 
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        section="contracts"
      />

      {/* Renewal Dialog */}
      {selectedContract && (
        <ContractRenewalDialog 
          contract={selectedContract}
          open={showRenewalDialog}
          onClose={() => {
            setShowRenewalDialog(false);
            setSelectedContract(null);
          }}
        />
      )}

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