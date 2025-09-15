import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Property } from "@/contexts/AppContext";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Layers, Users, Hash, DollarSign } from "lucide-react";

interface PropertyDetailsDialogProps {
  property: Property;
  trigger: React.ReactNode;
  isEdit?: boolean;
}

export function PropertyDetailsDialog({ property, trigger, isEdit = false }: PropertyDetailsDialogProps) {
  const { updateProperty, currency } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(property);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<"edit" | "delete" | null>(null);

  const currencySymbols = {
    AED: "د.إ",
    SAR: "ر.س",
    USD: "$", 
    EUR: "€",
    OMR: "ر.ع",
    QAR: "ر.ق"
  };

  const handlePasswordSubmit = () => {
    if (password === "Admin@123$") {
      if (action === "edit") {
        setShowPasswordDialog(false);
        setPassword("");
        handleSave();
      }
    } else {
      alert("كلمة مرور خاطئة");
    }
  };

  const handleSave = () => {
    updateProperty(property.id, formData);
    setIsOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "available": return <Badge className="bg-success/10 text-success border-success/20">متاح</Badge>;
      case "rented": return <Badge className="bg-warning/10 text-warning border-warning/20">مؤجر</Badge>;
      case "maintenance": return <Badge className="bg-destructive/10 text-destructive border-destructive/20">صيانة</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case "residential": return "سكني";
      case "commercial": return "تجاري";
      case "industrial": return "صناعي";
      default: return type;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "تعديل العقار" : "تفاصيل العقار"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "قم بتعديل معلومات العقار" : "عرض تفاصيل العقار"}
            </DialogDescription>
          </DialogHeader>

          {!isEdit ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">اسم العقار</p>
                      <p className="font-medium">{property.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع</p>
                      <p className="font-medium">{property.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">عدد الطوابق</p>
                      <p className="font-medium">{property.floors}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الوحدات</p>
                      <p className="font-medium">{property.totalUnits}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">الوحدات المتاحة</p>
                      <p className="font-medium text-success">{property.availableUnits}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">السعر من</p>
                      <p className="font-medium">{property.price.toLocaleString()} {currencySymbols[currency as keyof typeof currencySymbols]}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  {getStatusBadge(property.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">النوع</p>
                  <Badge variant="outline">{getTypeBadge(property.type)}</Badge>
                </div>
              </div>

              <div className="flex justify-center pt-4 border-t">
                <Button 
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="px-8"
                >
                  إنهاء
                </Button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم العقار</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="floors">عدد الطوابق</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={formData.floors}
                    onChange={(e) => setFormData({...formData, floors: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="totalUnits">إجمالي الوحدات</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData({...formData, totalUnits: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="price">السعر</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
                  setAction("edit");
                  setShowPasswordDialog(true);
                }} className="flex-1">
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الهوية</DialogTitle>
            <DialogDescription>
              يرجى إدخال كلمة المرور للمتابعة
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
              <Button onClick={handlePasswordSubmit} className="flex-1">
                تأكيد
              </Button>
              <Button variant="outline" onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
                setAction(null);
              }}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}