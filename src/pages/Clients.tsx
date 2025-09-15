import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, User, Phone, Download, Shield, Upload } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { ClientForm } from "@/components/ClientForm";
import { ClientDetailsDialog } from "@/components/ClientDetailsDialog";
import { ClientExportDialog } from "@/components/ClientExportDialog";
import { BackupDialog } from "@/components/BackupDialog";
import { ImportDialog } from "@/components/ImportDialog";
import { useToast } from "@/hooks/use-toast";

export default function Clients() {
  const { clients, properties, deleteClient } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    switch(type) {
      case "tenant": return <Badge className="bg-primary/10 text-primary border-primary/20">مستأجر</Badge>;
      case "owner": return <Badge className="bg-accent/10 text-accent border-accent/20">مالك</Badge>;
      case "buyer": return <Badge className="bg-success/10 text-success border-success/20">مشتري</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const handlePasswordSubmit = () => {
    if (password === "Admin@123$" && selectedClientId) {
      deleteClient(selectedClientId);
      setShowPasswordDialog(false);
      setPassword("");
      setSelectedClientId(null);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف العميل بنجاح",
      });
    } else {
      toast({
        title: "خطأ",
        description: "كلمة مرور خاطئة", 
        variant: "destructive",
      });
    }
  };

  const getPropertyNames = (propertyIds: number[]) => {
    return propertyIds.map(id => {
      const property = properties.find(p => p.id === id);
      return property ? property.name : `عقار ${id}`;
    }).join("، ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">العملاء</h1>
          <p className="text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
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
          <ClientForm />
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في العملاء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="shadow-soft hover:shadow-elegant transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {client.name}
                  </CardTitle>
                  <div className="mt-2">
                    {getTypeBadge(client.type)}
                  </div>
                </div>
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {client.phone}
              </div>
              
              {client.properties.length > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground">العقارات</p>
                  <p className="font-medium text-primary">{getPropertyNames(client.properties)}</p>
                </div>
              )}
              
               <div className="flex gap-2 pt-3 border-t">
                 <ClientDetailsDialog 
                   client={client} 
                   trigger={
                     <Button variant="outline" size="sm" className="px-3 text-xs">
                       عرض
                     </Button>
                   }
                 />
                 <ClientDetailsDialog 
                   client={client} 
                   isEdit={true}
                   trigger={
                     <Button variant="outline" size="sm" className="px-3 text-xs">
                       تعديل
                     </Button>
                   }
                 />
                 <Button 
                   variant="destructive" 
                   size="sm" 
                   onClick={() => {
                     setSelectedClientId(client.id);
                     setShowPasswordDialog(true);
                   }}
                   className="px-3 text-xs"
                 >
                   حذف
                 </Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد عملاء مطابقين للبحث</p>
        </div>
      )}

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              يرجى إدخال كلمة المرور لتأكيد حذف العميل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePasswordSubmit} variant="destructive" className="flex-1">
                تأكيد الحذف
              </Button>
              <Button variant="outline" onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
                setSelectedClientId(null);
              }}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ClientExportDialog 
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />

      {/* Backup Dialog */}
      <BackupDialog 
        open={showBackupDialog}
        onClose={() => setShowBackupDialog(false)}
        section="clients"
      />

      {/* Import Dialog */}
      <ImportDialog 
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        section="clients"
      />
    </div>
  );
}