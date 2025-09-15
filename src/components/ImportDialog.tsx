import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  section: string;
}

export function ImportDialog({ open, onClose, section }: ImportDialogProps) {
  const { addProperty, addClient, addContract } = useApp();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSectionTitle = (section: string) => {
    switch(section) {
      case "properties": return "العقارات";
      case "clients": return "العملاء";
      case "contracts": return "العقود";
      case "payments": return "المدفوعات";
      case "maintenance": return "الصيانة";
      default: return "البيانات";
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processExcelFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        processImportData(jsonData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast({
          title: "خطأ في معالجة الملف",
          description: "تأكد من صحة تنسيق الملف",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const processJsonFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        if (jsonData.properties) {
          processImportData(jsonData.properties, "properties");
        }
        if (jsonData.clients) {
          processImportData(jsonData.clients, "clients");
        }
        if (jsonData.contracts) {
          processImportData(jsonData.contracts, "contracts");
        }
        
        toast({
          title: "تم الاستيراد بنجاح",
          description: "تم استيراد البيانات من النسخة الاحتياطية",
        });
      } catch (error) {
        console.error("Error processing JSON file:", error);
        toast({
          title: "خطأ في معالجة الملف",
          description: "تأكد من صحة تنسيق ملف JSON",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  };

  const processImportData = (data: any[], targetSection = section) => {
    let importCount = 0;
    
    data.forEach((item: any) => {
      try {
        switch(targetSection) {
          case "properties":
            addProperty({
              name: item["اسم العقار"] || item.name || "",
              location: item["الموقع"] || item.location || "",
              type: item["النوع"] || item.type || "residential",
              status: item["الحالة"] || item.status || "available",
              totalUnits: parseInt(item["إجمالي الوحدات"] || item.totalUnits || "1"),
              availableUnits: parseInt(item["الوحدات المتاحة"] || item.availableUnits || "1"),
              rentedUnits: 0,
              floors: 1,
              price: 0,
              currency: "SAR"
            });
            importCount++;
            break;
            
          case "clients":
            addClient({
              name: item["اسم العميل"] || item.name || "",
              email: item["البريد الإلكتروني"] || item.email || "",
              phone: item["رقم الهاتف"] || item.phone || "",
              type: item["النوع"] || item.type || "tenant",
              address: "",
              idNumber: "",
              nationality: "",
              properties: []
            });
            importCount++;
            break;
            
          default:
            console.log(`Import for ${targetSection} not implemented yet`);
        }
      } catch (error) {
        console.error(`Error importing item:`, error);
      }
    });
    
    toast({
      title: "تم الاستيراد",
      description: `تم استيراد ${importCount} عنصر بنجاح`,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      processExcelFile(file);
    } else if (fileExtension === 'json') {
      processJsonFile(file);
    } else {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار ملف Excel أو JSON",
        variant: "destructive",
      });
    }
    
    // إعادة تعيين قيمة الإدخال
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            استيراد البيانات - {getSectionTitle(section)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">خيارات الاستيراد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleFileSelect}
                disabled={isProcessing}
                className="w-full justify-start"
                variant="outline"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {isProcessing ? "جاري المعالجة..." : "اختيار ملف Excel أو JSON"}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">تنبيه هام</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>تأكد من صحة تنسيق البيانات في الملف</li>
                  <li>الاستيراد سيضيف البيانات الجديدة فقط</li>
                  <li>لن يتم حذف البيانات الموجودة</li>
                  <li>انسخ بياناتك احتياطياً قبل الاستيراد</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}