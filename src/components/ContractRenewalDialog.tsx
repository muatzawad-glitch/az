import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/use-toast";

interface ContractRenewalDialogProps {
  contract: any;
  open: boolean;
  onClose: () => void;
}

export function ContractRenewalDialog({ contract, open, onClose }: ContractRenewalDialogProps) {
  const { renewContract } = useApp();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const handleRenewalConfirm = () => {
    if (!newEndDate) {
      toast({
        title: "خطأ",
        description: "يجب إدخال تاريخ النهاية الجديد",
        variant: "destructive",
      });
      return;
    }
    setShowPasswordField(true);
  };

  const handleRenewal = () => {
    if (password !== "Admin@123$") {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير صحيحة",
        variant: "destructive",
      });
      return;
    }

    try {
      renewContract(contract.id, newEndDate);
      toast({
        title: "تم بنجاح",
        description: "تم تجديد العقد بنجاح",
      });
      onClose();
      setPassword("");
      setNewEndDate("");
      setShowPasswordField(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تجديد العقد",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onClose();
    setPassword("");
    setNewEndDate("");
    setShowPasswordField(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            تجديد العقد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showPasswordField ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-sm">هل أنت متأكد من رغبتك في تجديد هذا العقد؟</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newEndDate">تاريخ النهاية الجديد</Label>
                <Input
                  id="newEndDate"
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  min={contract.endDate}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRenewalConfirm} className="flex-1">
                  تأكيد التجديد
                </Button>
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  إلغاء
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
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
                <Button onClick={handleRenewal} className="flex-1">
                  تجديد العقد
                </Button>
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  إلغاء
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}