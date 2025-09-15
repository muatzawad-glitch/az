import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";

interface ContractFormProps {
    contract?: any;
    isEdit?: boolean;
    onClose?: () => void;
}

export function ContractForm({ contract = null, isEdit = false, onClose }: ContractFormProps) {
    const { properties, clients, addContract, updateContract, currency, updateProperty } = useApp();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: "",
        clientId: "",
        unitNumber: "",
        startDate: "",
        endDate: "",
        monthlyRent: "",
        paymentMethod: "",
        paymentSchedule: "",
        numberOfPayments: "",
        checkDates: "",
        paymentDates: ""
    });

    useEffect(() => {
        if (contract && isEdit) {
            setFormData({
                propertyId: contract.propertyId.toString(),
                clientId: contract.clientId.toString(),
                unitNumber: contract.unitNumber || "",
                startDate: contract.startDate,
                endDate: contract.endDate,
                monthlyRent: contract.monthlyRent.toString(),
                paymentMethod: contract.paymentMethod,
                paymentSchedule: contract.paymentSchedule,
                numberOfPayments: contract.numberOfPayments || "",
                checkDates: contract.checkDates || "",
                paymentDates: contract.paymentDates || ""
            });
            setOpen(true);
        }
    }, [contract, isEdit]);

    const availableProperties = properties.filter(property => property.availableUnits > 0);
    const selectedProperty = properties.find(p => p.id === parseInt(formData.propertyId));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.propertyId || !formData.clientId || !formData.startDate || !formData.endDate || !formData.monthlyRent || !formData.paymentMethod || !formData.paymentSchedule) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول المطلوبة",
                variant: "destructive"
            });
            return;
        }

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (endDate <= startDate) {
            toast({
                title: "خطأ",
                description: "تاريخ نهاية العقد يجب أن يكون بعد تاريخ البداية",
                variant: "destructive"
            });
            return;
        }

        const contractData = {
            propertyId: parseInt(formData.propertyId),
            clientId: parseInt(formData.clientId),
            startDate: formData.startDate,
            endDate: formData.endDate,
            monthlyRent: parseFloat(formData.monthlyRent),
            currency: currency,
            paymentSchedule: formData.paymentSchedule,
            paymentMethod: formData.paymentMethod,
            unitNumber: formData.unitNumber,
            numberOfPayments: formData.numberOfPayments,
            checkDates: formData.checkDates,
            paymentDates: formData.paymentDates
        };

        if (isEdit && contract) {
            updateContract(contract.id, contractData);
            toast({
                title: "تم بنجاح",
                description: "تم تحديث العقد بنجاح"
            });
        } else {
            addContract(contractData);
            
            // تحديث عدد الوحدات المتاحة والمستأجرة
            if (selectedProperty) {
                updateProperty(selectedProperty.id, {
                    rentedUnits: selectedProperty.rentedUnits + 1,
                    availableUnits: selectedProperty.availableUnits - 1
                });
            }
            
            toast({
                title: "تم بنجاح",
                description: "تم إنشاء العقد بنجاح"
            });
        }

        setFormData({
            propertyId: "",
            clientId: "",
            unitNumber: "",
            startDate: "",
            endDate: "",
            monthlyRent: "",
            paymentMethod: "",
            paymentSchedule: "",
            numberOfPayments: "",
            checkDates: "",
            paymentDates: ""
        });
        
        setOpen(false);
        if (onClose) onClose();
    };

    const calculatePaymentDates = () => {
        if (!formData.startDate || !formData.paymentSchedule || !formData.endDate) return;

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const dates = [];
        let currentDate = new Date(startDate);

        // Calculate number of payments based on schedule and contract duration
        let numberOfPayments = 0;
        
        switch (formData.paymentSchedule) {
            case 'monthly':
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                              (endDate.getMonth() - startDate.getMonth());
                numberOfPayments = Math.floor(months) + 1; // +1 for the start month
                // But ensure it's exactly 12 for a full year
                if (months >= 11 && months <= 12) numberOfPayments = 12;
                break;
            case 'quarterly':
                numberOfPayments = 4;
                break;
            case 'semi_annual':
                numberOfPayments = 2;
                break;
            case 'annually':
                numberOfPayments = 1;
                break;
            default:
                return;
        }

        // Generate payment dates
        for (let i = 0; i < numberOfPayments; i++) {
            dates.push(currentDate.toISOString().split('T')[0]);
            
            switch (formData.paymentSchedule) {
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    currentDate.setMonth(currentDate.getMonth() + 3);
                    break;
                case 'semi_annual':
                    currentDate.setMonth(currentDate.getMonth() + 6);
                    break;
                case 'annually':
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                    break;
            }
        }

        setFormData(prev => ({
            ...prev,
            numberOfPayments: dates.length.toString(),
            paymentDates: dates.join(', ')
        }));
    };

    useEffect(() => {
        calculatePaymentDates();
    }, [formData.startDate, formData.endDate, formData.paymentSchedule]);

    const currencySymbols = {
        SAR: "ر.س",
        USD: "$",
        EUR: "€",
        AED: "د.إ"
    };

    if (isEdit) {
        return (
            <Dialog open={open} onOpenChange={(openState) => {
                setOpen(openState);
                if (!openState && onClose) onClose();
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>تعديل العقد</DialogTitle>
                        <DialogDescription>
                            قم بتعديل تفاصيل العقد والحفظ عند الانتهاء
                        </DialogDescription>
                    </DialogHeader>
                    <FormContent 
                        formData={formData}
                        setFormData={setFormData}
                        handleSubmit={handleSubmit}
                        availableProperties={properties}
                        clients={clients}
                        currencySymbols={currencySymbols}
                        currency={currency}
                        isEdit={isEdit}
                        onCancel={() => {
                            setOpen(false);
                            if (onClose) onClose();
                        }}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-primary shadow-elegant">
                    <Plus className="h-4 w-4 mr-2" />
                    إنشاء عقد جديد
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>إنشاء عقد جديد</DialogTitle>
                    <DialogDescription>
                        أدخل تفاصيل العقد الجديد وسيتم حفظه في النظام
                    </DialogDescription>
                </DialogHeader>
                <FormContent 
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    availableProperties={availableProperties}
                    clients={clients}
                    currencySymbols={currencySymbols}
                    currency={currency}
                    isEdit={false}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

function FormContent({ 
    formData, 
    setFormData, 
    handleSubmit, 
    availableProperties, 
    clients, 
    currencySymbols, 
    currency, 
    isEdit,
    onCancel 
}: any) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* العقار */}
            <div>
                <Label htmlFor="propertyId">العقار *</Label>
                <Select value={formData.propertyId} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, propertyId: value }))}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر العقار" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProperties.map((property: any) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name} - وحدات متاحة: {property.availableUnits}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* العميل */}
            <div>
                <Label htmlFor="clientId">العميل *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, clientId: value }))}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name} - {client.phone}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* رقم الوحدة */}
            <div>
                <Label htmlFor="unitNumber">رقم الوحدة</Label>
                <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, unitNumber: e.target.value }))}
                    placeholder="مثال: A-101"
                />
            </div>

            {/* تواريخ العقد */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate">تاريخ بداية العقد *</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))}
                    />
                </div>
                <div>
                    <Label htmlFor="endDate">تاريخ نهاية العقد *</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))}
                    />
                </div>
            </div>

            {/* قيمة الإيجار */}
            <div>
                <Label htmlFor="monthlyRent">قيمة الإيجار الشهري *</Label>
                <div className="flex gap-2">
                    <Input
                        id="monthlyRent"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.monthlyRent}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, monthlyRent: e.target.value }))}
                        placeholder="5000"
                        className="flex-1"
                    />
                    <div className="flex items-center px-3 bg-muted rounded-md">
                        <span className="text-sm text-muted-foreground">
                            {currencySymbols[currency as keyof typeof currencySymbols]}
                        </span>
                    </div>
                </div>
            </div>

            {/* طريقة الدفع */}
            <div>
                <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="cheque">شيك</SelectItem>
                        <SelectItem value="bank_transfer">حوالة بنكية</SelectItem>
                        <SelectItem value="card">بطاقة ائتمان</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* جدولة الدفع */}
            <div>
                <Label htmlFor="paymentSchedule">جدولة الدفع *</Label>
                <Select value={formData.paymentSchedule} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, paymentSchedule: value }))}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر جدولة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">شهري</SelectItem>
                        <SelectItem value="quarterly">ربع سنوي</SelectItem>
                        <SelectItem value="semi_annual">نصف سنوي</SelectItem>
                        <SelectItem value="annually">سنوي</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* عدد الدفعات */}
            {formData.numberOfPayments && (
                <div>
                    <Label>عدد الدفعات المتوقعة</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{formData.numberOfPayments} دفعة</span>
                    </div>
                </div>
            )}

            {/* تواريخ الشيكات */}
            {formData.paymentMethod === "cheque" && (
                <div>
                    <Label htmlFor="checkDates">تواريخ الشيكات</Label>
                    <Input
                        id="checkDates"
                        value={formData.checkDates}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, checkDates: e.target.value }))}
                        placeholder="2024-01-01, 2024-02-01, 2024-03-01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        أدخل التواريخ مفصولة بفواصل (مثال: 2024-01-01, 2024-02-01)
                    </p>
                </div>
            )}

            {/* تواريخ الدفعات */}
            {formData.paymentDates && (
                <div>
                    <Label>تواريخ الدفعات المتوقعة</Label>
                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">{formData.paymentDates}</p>
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                    {isEdit ? "حفظ التعديلات" : "إنشاء العقد"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    إلغاء
                </Button>
            </div>
        </form>
    );
}