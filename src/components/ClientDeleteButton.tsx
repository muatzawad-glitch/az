import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Client } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface ClientDeleteButtonProps {
  client: Client;
}

export function ClientDeleteButton({ client }: ClientDeleteButtonProps) {
  const { deleteClient } = useApp();
  const { toast } = useToast();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");

  const handlePasswordSubmit = () => {
    if (password === "Admin@123$") {
      deleteClient(client.id);
      setShowPasswordDialog(false);
      setPassword("");
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

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setShowPasswordDialog(true)}
        className="px-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              يرجى إدخال كلمة المرور لتأكيد حذف العميل "{client.name}"
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