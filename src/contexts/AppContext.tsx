import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Property {
    id: number;
    name: string;
    type: string;
    location: string;
    floors: number;
    totalUnits: number;
    rentedUnits: number;
    availableUnits: number;
    price: number;
    currency: string;
    status: string;
}

export interface Client {
    id: number;
    name: string;
    phone: string;
    email: string;
    idNumber: string;
    nationality: string;
    address: string;
    type: string;
    properties: number[];
}

interface Contract {
    id: number;
    propertyId: number;
    clientId: number;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    currency: string;
    paymentSchedule: string;
    paymentMethod: string;
    unitNumber?: string;
    numberOfPayments?: string;
    checkDates?: string;
    paymentDates?: string;
}

interface Payment {
    id: number;
    contractId: number;
    amount: number;
    currency: string;
    dueDate: string;
    paidDate?: string;
    paymentMethod: string;
    status: string;
}

interface MaintenanceRequest {
    id: number;
    propertyId: number;
    description: string;
    priority: string;
    status: string;
    requestDate: string;
    completedDate?: string;
}

interface AppContextType {
    properties: Property[];
    clients: Client[];
    contracts: Contract[];
    payments: Payment[];
    maintenanceRequests: MaintenanceRequest[];
    currency: string;
    theme: string;
    language: string;
    addProperty: (property: Omit<Property, 'id'>) => void;
    addClient: (client: Omit<Client, 'id'>) => void;
    addContract: (contract: Omit<Contract, 'id'>) => void;
    addPayment: (payment: Omit<Payment, 'id'>) => void;
    addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id'>) => void;
    updateProperty: (id: number, property: Partial<Property>) => void;
    updateClient: (id: number, client: Partial<Client>) => void;
    updateContract: (id: number, contract: Partial<Contract>) => void;
    updatePayment: (id: number, payment: Partial<Payment>) => void;
    deleteProperty: (id: number) => void;
    deleteClient: (id: number) => void;
    deleteContract: (id: number) => void;
    renewContract: (id: number, newEndDate: string) => void;
    confirmPayment: (id: number) => void;
    setCurrency: (currency: string) => void;
    setTheme: (theme: string) => void;
    setLanguage: (language: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>([
        {
            id: 1,
            name: "مجمع الملز السكني",
            type: "residential",
            location: "حي الملز، الرياض",
            floors: 3,
            totalUnits: 12,
            rentedUnits: 8,
            availableUnits: 4,
            price: 2500,
            currency: "SAR",
            status: "available",
        },
        {
            id: 2,
            name: "برج النخيل التجاري",
            type: "commercial",
            location: "حي النخيل، جدة",
            floors: 5,
            totalUnits: 20,
            rentedUnits: 15,
            availableUnits: 5,
            price: 3500,
            currency: "SAR",
            status: "available",
        },
    ]);

    const [clients, setClients] = useState<Client[]>([
        {
            id: 1,
            name: "أحمد محمد السالم",
            phone: "+966501234567",
            email: "ahmed@example.com",
            idNumber: "1234567890",
            nationality: "سعودي",
            address: "الرياض، حي الملز",
            type: "tenant",
            properties: [1],
        },
        {
            id: 2,
            name: "فاطمة علي أحمد",
            phone: "+966507654321",
            email: "fatima@example.com",
            idNumber: "0987654321",
            nationality: "سعودية",
            address: "جدة، حي النخيل",
            type: "tenant",
            properties: [2],
        },
    ]);

    const [contracts, setContracts] = useState<Contract[]>([
        {
            id: 1,
            propertyId: 2,
            clientId: 2,
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            monthlyRent: 3000,
            currency: "SAR",
            paymentSchedule: "monthly",
            paymentMethod: "cash",
            unitNumber: "A-201",
            numberOfPayments: "12",
            paymentDates: "2024-01-01, 2024-02-01, 2024-03-01"
        },
    ]);

    const [payments, setPayments] = useState<Payment[]>([
        {
            id: 1,
            contractId: 1,
            amount: 3000,
            currency: "SAR",
            dueDate: "2024-01-01",
            paidDate: "2024-01-01",
            paymentMethod: "cash",
            status: "paid",
        },
        {
            id: 2,
            contractId: 1,
            amount: 3000,
            currency: "SAR",
            dueDate: "2024-02-01",
            paymentMethod: "cheque",
            status: "pending",
        },
    ]);

    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([
        {
            id: 1,
            propertyId: 2,
            description: "تسريب في الحمام",
            priority: "high",
            status: "pending",
            requestDate: "2024-01-15",
        },
    ]);

    const [currency, setCurrencyState] = useState(() =>
        localStorage.getItem('currency') || 'AED'
    );

    const [theme, setThemeState] = useState(() =>
        localStorage.getItem('theme') || 'light'
    );

    const [language, setLanguageState] = useState(() =>
        localStorage.getItem('language') || 'ar'
    );

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const addProperty = (property: Omit<Property, 'id'>) => {
        const newProperty = { ...property, id: Date.now() };
        setProperties(prev => [...prev, newProperty]);
    };

    const addClient = (client: Omit<Client, 'id'>) => {
        const newClient = { ...client, id: Date.now() };
        setClients(prev => [...prev, newClient]);
    };

    const addContract = (contract: Omit<Contract, 'id'>) => {
        const newContract = { ...contract, id: Date.now() };
        setContracts(prev => [...prev, newContract]);
    };

    const addPayment = (payment: Omit<Payment, 'id'>) => {
        const newPayment = { ...payment, id: Date.now() };
        setPayments(prev => [...prev, newPayment]);
    };

    const addMaintenanceRequest = (request: Omit<MaintenanceRequest, 'id'>) => {
        const newRequest = { ...request, id: Date.now() };
        setMaintenanceRequests(prev => [...prev, newRequest]);
    };

    const updateProperty = (id: number, updatedProperty: Partial<Property>) => {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updatedProperty } : p));
    };

    const updateClient = (id: number, updatedClient: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
    };

    const updateContract = (id: number, updatedContract: Partial<Contract>) => {
        setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updatedContract } : c));
    };

    const deleteProperty = (id: number) => {
        setProperties(prev => prev.filter(p => p.id !== id));
    };

    const deleteClient = (id: number) => {
        setClients(prev => prev.filter(c => c.id !== id));
    };

    const deleteContract = (id: number) => {
        setContracts(prev => prev.filter(c => c.id !== id));
        // Also delete related payments
        setPayments(prev => prev.filter(p => p.contractId !== id));
    };

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency);
    };

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
    };

    const setLanguage = (newLanguage: string) => {
        setLanguageState(newLanguage);
    };

    const updatePayment = (id: number, updatedPayment: Partial<Payment>) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updatedPayment } : p));
    };

    const renewContract = (id: number, newEndDate: string) => {
        setContracts(prev => prev.map(c => c.id === id ? { ...c, endDate: newEndDate } : c));
    };

    const confirmPayment = (id: number) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : p));
    };

    return (
        <AppContext.Provider value={{
            properties,
            clients,
            contracts,
            payments,
            maintenanceRequests,
            currency,
            theme,
            language,
            addProperty,
            addClient,
            addContract,
            addPayment,
            addMaintenanceRequest,
            updateProperty,
            updateClient,
            updateContract,
            updatePayment,
            deleteProperty,
            deleteClient,
            deleteContract,
            renewContract,
            confirmPayment,
            setCurrency,
            setTheme,
            setLanguage,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}