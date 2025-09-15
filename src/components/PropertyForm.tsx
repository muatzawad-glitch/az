import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";

export function PropertyForm() {
  const { addProperty, currency } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    floors: "1",
    totalUnits: "",
    price: "",
    status: "available",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.location || !formData.totalUnits || !formData.price) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const totalUnits = Math.max(0, parseInt(formData.totalUnits, 10) || 0);
    const floors = Math.max(1, parseInt(formData.floors, 10) || 1);
    const price = Math.max(0, parseFloat(formData.price) || 0);

    addProperty({
      name: formData.name,
      type: formData.type,
      location: formData.location,
      floors,
      totalUnits,
      rentedUnits: 0,
      availableUnits: totalUnits,
      price,
      currency,
      status: formData.status,
    });

    toast({ title: "تم بنجاح", description: "تم إضافة العقار بنجاح" });

    setFormData({ name: "", type: "", location: "", floors: "1", totalUnits: "", price: "", status: "available" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          إضافة عقار جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            إضافة عقار جديد
          </DialogTitle>
          <DialogDescription>أدخل تفاصيل العقار ثم اضغط حفظ.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم العقار *</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">النوع *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                  <SelectItem value="industrial">صناعي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="rented">مؤجر</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="location">الموقع *</Label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="floors">عدد الطوابق</Label>
              <Input id="floors" type="number" min="1" value={formData.floors} onChange={(e) => setFormData((p) => ({ ...p, floors: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="totalUnits">إجمالي الوحدات *</Label>
              <Input id="totalUnits" type="number" min="0" value={formData.totalUnits} onChange={(e) => setFormData((p) => ({ ...p, totalUnits: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="price">السعر (بالـ {currency}) *</Label>
              <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-gradient-primary">حفظ</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
