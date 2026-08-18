import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutGrid,
  List,
  ShoppingBag,
  Users,
  Handshake,
  Package,
  DollarSign,
  Truck,
  LogOut,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Shield,
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2,
  Percent,
  Settings,
  RefreshCw,
  Download,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Award,
  Flame,
  Sparkles,
  Heart,
  Scissors,
  GraduationCap,
  Stethoscope,
  ExternalLink,
  Receipt,
  CreditCard,
  BarChart3,
  PieChart,
  Layers,
  Lock,
  ArrowLeft,
  MessageSquare,
  Send,
  AlertCircle,
  Target,
  Radio,
  Locate,
  Navigation,
  Compass,
  Fuel,
  Wallet,
  SlidersHorizontal,
} from 'lucide-react';
import { PRODUCTS, BRANDS } from '../data/mockData';

// ==========================================
// INITIAL MOCK DATASETS
// ==========================================

const INITIAL_ORDERS = [
  {
    id: 'PED-9842',
    customer: 'Camila Silva',
    email: 'camila@patitasdelsur.cl',
    phone: '+56 9 8456 1234',
    petName: 'Kira',
    petType: '🐶 Perro',
    petBreed: 'Samoyedo (3 años)',
    items: [
      { name: 'Bravery Salmón Adulto', weight: '12 kg', quantity: 1, price: 68990, code: 'BRAV-SAL-12' },
      { name: 'Snack Ciervo Patagónico Deshidratado', weight: '200 g', quantity: 1, price: 18990, code: 'SNK-CIE-200' },
    ],
    subtotal: 87980,
    shippingCost: 0,
    discount: 0,
    total: 87980,
    date: '18 Ago 2026',
    time: '12:45',
    status: 'en_camino',
    tracking: 'CHI-8839201',
    invoiceNumber: 'BOL-2026-9842',
    address: 'Av. Alemania 0840, Depto 402, Temuco',
    city: 'Temuco',
    deliveryZone: 'Zona 4: Envíos Regionales',
    agreementUsed: null,
    notes: 'Entregar en conserjería si no responde el timbre.',
  },
  {
    id: 'PED-9841',
    customer: 'Felipe Soto',
    email: 'felipe.soto@gmail.com',
    phone: '+56 9 9123 4567',
    petName: 'Jack',
    petType: '🐱 Gato',
    petBreed: 'Europeo Común (2 años)',
    items: [
      { name: 'Patagonia Holística Trucha Silvestre', weight: '7 kg', quantity: 1, price: 52990, code: 'PAT-TRU-7' },
      { name: 'Snack Salmón Húmedo Filetes', weight: '4x85 g', quantity: 1, price: 9490, code: 'SNK-SAL-4' },
    ],
    subtotal: 62480,
    shippingCost: 0,
    discount: 0,
    total: 62480,
    date: '18 Ago 2026',
    time: '10:15',
    status: 'en_preparacion',
    tracking: 'CHI-8839198',
    invoiceNumber: 'BOL-2026-9841',
    address: 'Los Mañíos 124, Puerto Varas',
    city: 'Puerto Varas',
    deliveryZone: 'Zona 1: Radio Urbano Puerto Varas',
    agreementUsed: 'Convenio Clínica Austral (10% dscto)',
    notes: 'Timbre azul al fondo del pasaje.',
  },
  {
    id: 'PED-9838',
    customer: 'Valentina Morales',
    email: 'vale.morales@outlook.cl',
    phone: '+56 9 7890 1234',
    petName: 'Rocky',
    petType: '🐶 Perro',
    petBreed: 'Golden Retriever (4 años)',
    items: [
      { name: 'Bravery Pollo Adulto Raza Grande', weight: '12 kg', quantity: 1, price: 68990, code: 'BRAV-POL-12' },
    ],
    subtotal: 68990,
    shippingCost: 0,
    discount: 0,
    total: 68990,
    date: '17 Ago 2026',
    time: '16:30',
    status: 'entregado',
    tracking: 'CHI-8839145',
    invoiceNumber: 'BOL-2026-9838',
    address: 'San Martín 550, Valdivia',
    city: 'Valdivia',
    deliveryZone: 'Zona 4: Envíos Regionales',
    agreementUsed: null,
    notes: 'Recibió conserje don Pedro.',
  },
  {
    id: 'PED-9832',
    customer: 'Matías González',
    email: 'matias.gonzalez@gmail.com',
    phone: '+56 9 6789 0123',
    petName: 'Milo',
    petType: '🐱 Gato',
    petBreed: 'Siamés (1 año)',
    items: [
      { name: 'Dr. Pet Urinary Care Gatos', weight: '3 kg', quantity: 1, price: 34990, code: 'DRP-URI-3' },
      { name: 'Suplemento Omega 3 Austral', weight: '250 ml', quantity: 1, price: 16990, code: 'SUP-OME-250' },
    ],
    subtotal: 51980,
    shippingCost: 0,
    discount: 0,
    total: 51980,
    date: '16 Ago 2026',
    time: '09:00',
    status: 'entregado',
    tracking: 'CHI-8839012',
    invoiceNumber: 'BOL-2026-9832',
    address: 'Bulnes 890, Osorno',
    city: 'Osorno',
    deliveryZone: 'Zona 4: Envíos Regionales',
    agreementUsed: null,
    notes: 'Dejado en buzón seguro.',
  },
  {
    id: 'PED-9829',
    customer: 'Fernanda Muñoz',
    email: 'fer.munoz@gmail.com',
    phone: '+56 9 5678 9012',
    petName: 'Luna',
    petType: '🐶 Perro',
    petBreed: 'Border Collie (2 años)',
    items: [
      { name: 'Sur Natural Snacks Hueso Recreativo', weight: '400 g', quantity: 1, price: 8990, code: 'SUR-HUE-400' },
      { name: 'Bravery Cordero Adulto Medium/Large', weight: '4 kg', quantity: 1, price: 36000, code: 'BRAV-COR-4' },
    ],
    subtotal: 44990,
    shippingCost: 0,
    discount: 0,
    total: 44990,
    date: '15 Ago 2026',
    time: '14:20',
    status: 'entregado',
    tracking: 'CHI-8838950',
    invoiceNumber: 'BOL-2026-9829',
    address: 'Costanera 230, Puerto Montt',
    city: 'Puerto Montt',
    deliveryZone: 'Zona 2: Intercomunal Puerto Montt - Puerto Varas',
    agreementUsed: 'Convenio K9 Training (Despacho gratis)',
    notes: 'Entregado en persona.',
  },
];

const INITIAL_CUSTOMERS = [
  {
    id: 'CLI-01',
    name: 'Camila Silva',
    email: 'camila@patitasdelsur.cl',
    phone: '+56 9 8456 1234',
    city: 'Temuco',
    address: 'Av. Alemania 0840, Depto 402',
    registrationDate: '10 Feb 2026',
    points: 1250,
    ordersCount: 8,
    totalSpent: 420000,
    pet: {
      name: 'Kira',
      type: 'perro',
      breed: 'Samoyedo',
      birthdate: '2023-04-15',
      age: '3 años',
      weight: '21.5 kg',
      sterilized: 'Sí',
      favoriteFood: 'Bravery Salmón Adulto 12kg',
      bagDurationDays: 30,
      daysRemaining: 4,
      vaccines: 'Al día (Óctuple + Antirrábica 2026) ✓',
      deworming: 'Al día (Nexgard Spectra) ✓',
      vetClinic: 'Clínica Veterinaria Austral',
      allergies: 'Ninguna conocida',
      notes: 'Pelaje abundante, requiere aporte alto de Omega 3 y zinc.',
    },
  },
  {
    id: 'CLI-02',
    name: 'Felipe Soto',
    email: 'felipe.soto@gmail.com',
    phone: '+56 9 9123 4567',
    city: 'Puerto Varas',
    address: 'Los Mañíos 124',
    registrationDate: '01 Mar 2026',
    points: 890,
    ordersCount: 5,
    totalSpent: 295000,
    pet: {
      name: 'Jack',
      type: 'gato',
      breed: 'Europeo Común',
      birthdate: '2024-06-10',
      age: '2 años',
      weight: '4.8 kg',
      sterilized: 'Sí',
      favoriteFood: 'Patagonia Holística Trucha Silvestre 7kg',
      bagDurationDays: 45,
      daysRemaining: 18,
      vaccines: 'Al día (Triple Felina + Leucemia) ✓',
      deworming: 'Al día (Broadline) ✓',
      vetClinic: 'Clínica Veterinaria Austral',
      allergies: 'Sensible al pollo procesado',
      notes: 'Bebe poca agua, se recomienda alternar con latas húmedas.',
    },
  },
  {
    id: 'CLI-03',
    name: 'Valentina Morales',
    email: 'vale.morales@outlook.cl',
    phone: '+56 9 7890 1234',
    city: 'Valdivia',
    address: 'San Martín 550',
    registrationDate: '15 Ene 2026',
    points: 2100,
    ordersCount: 12,
    totalSpent: 680000,
    pet: {
      name: 'Rocky',
      type: 'perro',
      breed: 'Golden Retriever',
      birthdate: '2022-09-01',
      age: '4 años',
      weight: '32.0 kg',
      sterilized: 'Sí',
      favoriteFood: 'Bravery Pollo Adulto 12kg',
      bagDurationDays: 25,
      daysRemaining: 2,
      vaccines: 'Al día ✓',
      deworming: 'Al día ✓',
      vetClinic: 'Veterinaria Río Valdivia',
      allergies: 'Ninguna',
      notes: 'Alta actividad física en pradera.',
    },
  },
  {
    id: 'CLI-04',
    name: 'Matías González',
    email: 'matias.gonzalez@gmail.com',
    phone: '+56 9 6789 0123',
    city: 'Osorno',
    address: 'Bulnes 890',
    registrationDate: '20 Abr 2026',
    points: 400,
    ordersCount: 3,
    totalSpent: 145000,
    pet: {
      name: 'Milo',
      type: 'gato',
      breed: 'Siamés',
      birthdate: '2025-05-18',
      age: '1 año',
      weight: '3.9 kg',
      sterilized: 'Sí',
      favoriteFood: 'Dr. Pet Urinary Care 3kg',
      bagDurationDays: 30,
      daysRemaining: 22,
      vaccines: 'Al día ✓',
      deworming: 'Al día ✓',
      vetClinic: 'Clínica Veterinaria Rahue',
      allergies: 'Historial de cristales urinarios leves',
      notes: 'Monitorear pH urinario trimestral.',
    },
  },
  {
    id: 'CLI-05',
    name: 'Fernanda Muñoz',
    email: 'fer.munoz@gmail.com',
    phone: '+56 9 5678 9012',
    city: 'Puerto Montt',
    address: 'Costanera 230',
    registrationDate: '05 May 2026',
    points: 750,
    ordersCount: 4,
    totalSpent: 180000,
    pet: {
      name: 'Luna',
      type: 'perro',
      breed: 'Border Collie',
      birthdate: '2024-08-20',
      age: '2 años',
      weight: '16.2 kg',
      sterilized: 'No',
      favoriteFood: 'Bravery Cordero Adulto 4kg',
      bagDurationDays: 20,
      daysRemaining: 12,
      vaccines: 'Al día ✓',
      deworming: 'Al día ✓',
      vetClinic: 'Clínica Volcanes Puerto Montt',
      allergies: 'Ninguna',
      notes: 'Entrena agility los fines de semana.',
    },
  },
];

const INITIAL_CONVENIOS = [
  {
    id: 'CONV-01',
    name: 'Clínica Veterinaria Austral',
    type: 'veterinaria',
    typeLabel: 'Clínica Veterinaria',
    contactPerson: 'Dr. Pablo Valenzuela',
    phone: '+56 9 7123 8899',
    email: 'contacto@vetaustral.cl',
    city: 'Puerto Varas & Puerto Montt',
    code: 'CONV-AUSTRAL-10',
    benefitCustomer: '10% Descuento en Alimentos Medicados & Holísticos',
    benefitShipping: 'Despacho prioritario 24h gratuito',
    commissionEntity: '8% Comisión / Cashback mensual',
    redemptionsCount: 28,
    active: true,
    sinceDate: 'Enero 2026',
  },
  {
    id: 'CONV-02',
    name: 'Patagonia K9 Adiestramiento Canino',
    type: 'entrenamiento',
    typeLabel: 'Centro de Entrenamiento',
    contactPerson: 'Rodrigo Araya',
    phone: '+56 9 6543 2100',
    email: 'rodrigo@patagoniak9.cl',
    city: 'Llanquihue & Frutillar',
    code: 'PATAGONIAK9-FREE',
    benefitCustomer: '15% Descuento en Snacks de Entrenamiento + Despacho Gratis',
    benefitShipping: 'Despacho Gratis sin mínimo',
    commissionEntity: '10% Comisión mensual',
    redemptionsCount: 19,
    active: true,
    sinceDate: 'Marzo 2026',
  },
  {
    id: 'CONV-03',
    name: 'Spa & Peluquería Canina Los Volcanes',
    type: 'peluqueria',
    typeLabel: 'Peluquería & Estética Canina',
    contactPerson: 'Marcela Contreras',
    phone: '+56 9 8812 3344',
    email: 'spa@losvolcanespet.cl',
    city: 'Puerto Varas',
    code: 'SPAVOLCAN-5',
    benefitCustomer: '5% Descuento adicional + Muestra gratis de snack con cada baño',
    benefitShipping: 'Tarifa estándar',
    commissionEntity: '5% Comisión en ventas derivadas',
    redemptionsCount: 14,
    active: true,
    sinceDate: 'Abril 2026',
  },
  {
    id: 'CONV-04',
    name: 'Guardería Campestre Llanquihue',
    type: 'guarderia',
    typeLabel: 'Hotel & Guardería Canina',
    contactPerson: 'Cristián Heise',
    phone: '+56 9 9900 1122',
    email: 'guarderia@llanquihuecampestre.cl',
    city: 'Llanquihue',
    code: 'CAMP-LLANQUIHUE',
    benefitCustomer: 'Envío directo a la guardería el día de estadía',
    benefitShipping: 'Despacho gratis a guardería',
    commissionEntity: 'Tarifa preferencial en bolsas de 15kg',
    redemptionsCount: 9,
    active: true,
    sinceDate: 'Mayo 2026',
  },
];

const INITIAL_INVENTORY = [
  {
    id: 'PROD-01',
    name: 'Bravery Salmón Adulto Medium/Large',
    brand: 'Bravery',
    category: 'Alimento Seco Perros',
    petType: 'perros',
    format: '12 kg',
    sku: 'BRAV-SAL-12',
    stock: 24,
    minStock: 8,
    salePrice: 68990,
    unitCostNeto: 42500,
    invoices: [
      {
        invoiceNumber: 'FAC-2026-8819',
        invoiceDate: '02 Ago 2026',
        provider: 'Importadora & Distribuidora Bravery Chile SpA',
        providerRut: '76.452.190-3',
        quantity: 16,
        unitCostNeto: 42500,
      },
      {
        invoiceNumber: 'FAC-SUR-1044',
        invoiceDate: '18 Jul 2026',
        provider: 'Distribuidora Austral Pet Foods SpA',
        providerRut: '77.198.340-K',
        quantity: 8,
        unitCostNeto: 41900,
      },
    ],
    invoiceNumber: 'FAC-2026-8819',
    invoiceDate: '02 Ago 2026',
    provider: 'Importadora & Distribuidora Bravery Chile SpA',
    providerRut: '76.452.190-3',
    status: 'disponible',
  },
  {
    id: 'PROD-02',
    name: 'Bravery Cordero Adulto Medium/Large',
    brand: 'Bravery',
    category: 'Alimento Seco Perros',
    petType: 'perros',
    format: '12 kg',
    sku: 'BRAV-COR-12',
    stock: 18,
    minStock: 6,
    salePrice: 68990,
    unitCostNeto: 42500,
    invoices: [
      {
        invoiceNumber: 'FAC-2026-8819',
        invoiceDate: '02 Ago 2026',
        provider: 'Importadora & Distribuidora Bravery Chile SpA',
        providerRut: '76.452.190-3',
        quantity: 12,
        unitCostNeto: 42500,
      },
      {
        invoiceNumber: 'FAC-VET-4491',
        invoiceDate: '12 Jul 2026',
        provider: 'Nutrición Animal del Pacífico SpA',
        providerRut: '76.882.301-4',
        quantity: 6,
        unitCostNeto: 42000,
      },
    ],
    invoiceNumber: 'FAC-2026-8819',
    invoiceDate: '02 Ago 2026',
    provider: 'Importadora & Distribuidora Bravery Chile SpA',
    providerRut: '76.452.190-3',
    status: 'disponible',
  },
  {
    id: 'PROD-03',
    name: 'Bravery Pollo Adulto Raza Grande',
    brand: 'Bravery',
    category: 'Alimento Seco Perros',
    petType: 'perros',
    format: '12 kg',
    sku: 'BRAV-POL-12',
    stock: 4,
    minStock: 6,
    salePrice: 68990,
    unitCostNeto: 41800,
    invoices: [
      {
        invoiceNumber: 'FAC-2026-8819',
        invoiceDate: '02 Ago 2026',
        provider: 'Importadora & Distribuidora Bravery Chile SpA',
        providerRut: '76.452.190-3',
        quantity: 4,
        unitCostNeto: 41800,
      },
    ],
    invoiceNumber: 'FAC-2026-8819',
    invoiceDate: '02 Ago 2026',
    provider: 'Importadora & Distribuidora Bravery Chile SpA',
    providerRut: '76.452.190-3',
    status: 'stock_bajo',
  },
  {
    id: 'PROD-04',
    name: 'Patagonia Holística Trucha Silvestre',
    brand: 'Patagonia Holística',
    category: 'Alimento Seco Gatos',
    petType: 'gatos',
    format: '7 kg',
    sku: 'PAT-TRU-7',
    stock: 16,
    minStock: 5,
    salePrice: 52990,
    unitCostNeto: 31200,
    invoices: [
      {
        invoiceNumber: 'FAC-PAT-4011',
        invoiceDate: '28 Jul 2026',
        provider: 'Sur Austral Nutrición Animal Ltda.',
        providerRut: '77.198.340-K',
        quantity: 10,
        unitCostNeto: 31200,
      },
      {
        invoiceNumber: 'FAC-PAT-3890',
        invoiceDate: '05 Jun 2026',
        provider: 'Sur Austral Nutrición Animal Ltda.',
        providerRut: '77.198.340-K',
        quantity: 6,
        unitCostNeto: 30800,
      },
    ],
    invoiceNumber: 'FAC-PAT-4011',
    invoiceDate: '28 Jul 2026',
    provider: 'Sur Austral Nutrición Animal Ltda.',
    providerRut: '77.198.340-K',
    status: 'disponible',
  },
  {
    id: 'PROD-05',
    name: 'Dr. Pet Urinary Care Felino',
    brand: 'Dr. Pet Care',
    category: 'Alimento Veterinario Gatos',
    petType: 'gatos',
    format: '3 kg',
    sku: 'DRP-URI-3',
    stock: 12,
    minStock: 4,
    salePrice: 34990,
    unitCostNeto: 21500,
    invoices: [
      {
        invoiceNumber: 'FAC-VET-1092',
        invoiceDate: '10 Ago 2026',
        provider: 'Laboratorios & Nutracéuticos Vet Chile',
        providerRut: '76.882.301-4',
        quantity: 12,
        unitCostNeto: 21500,
      },
    ],
    invoiceNumber: 'FAC-VET-1092',
    invoiceDate: '10 Ago 2026',
    provider: 'Laboratorios & Nutracéuticos Vet Chile',
    providerRut: '76.882.301-4',
    status: 'disponible',
  },
  {
    id: 'PROD-06',
    name: 'Snack Ciervo Patagónico Deshidratado',
    brand: 'Sur Natural',
    category: 'Snacks Deshidratados',
    petType: 'perros',
    format: '200 g',
    sku: 'SNK-CIE-200',
    stock: 45,
    minStock: 15,
    salePrice: 18990,
    unitCostNeto: 9200,
    invoices: [
      {
        invoiceNumber: 'FAC-SUR-7731',
        invoiceDate: '05 Ago 2026',
        provider: 'Alimentos Naturales de la Patagonia SpA',
        providerRut: '76.990.231-1',
        quantity: 30,
        unitCostNeto: 9200,
      },
      {
        invoiceNumber: 'FAC-SUR-6920',
        invoiceDate: '20 Jun 2026',
        provider: 'Alimentos Naturales de la Patagonia SpA',
        providerRut: '76.990.231-1',
        quantity: 15,
        unitCostNeto: 8900,
      },
    ],
    invoiceNumber: 'FAC-SUR-7731',
    invoiceDate: '05 Ago 2026',
    provider: 'Alimentos Naturales de la Patagonia SpA',
    providerRut: '76.990.231-1',
    status: 'disponible',
  },
  {
    id: 'PROD-07',
    name: 'Sur Natural Hueso Recreativo Vacuno',
    brand: 'Sur Natural',
    category: 'Snacks & Mordedores',
    petType: 'perros',
    format: '400 g',
    sku: 'SUR-HUE-400',
    stock: 2,
    minStock: 10,
    salePrice: 8990,
    unitCostNeto: 4100,
    invoices: [
      {
        invoiceNumber: 'FAC-SUR-7731',
        invoiceDate: '05 Ago 2026',
        provider: 'Alimentos Naturales de la Patagonia SpA',
        providerRut: '76.990.231-1',
        quantity: 2,
        unitCostNeto: 4100,
      },
    ],
    invoiceNumber: 'FAC-SUR-7731',
    invoiceDate: '05 Ago 2026',
    provider: 'Alimentos Naturales de la Patagonia SpA',
    providerRut: '76.990.231-1',
    status: 'stock_bajo',
  },
  {
    id: 'PROD-08',
    name: 'Suplemento Omega 3 Austral Salmón',
    brand: 'Sur Natural',
    category: 'Suplementos',
    petType: 'perros',
    format: '250 ml',
    sku: 'SUP-OME-250',
    stock: 28,
    minStock: 8,
    salePrice: 16990,
    unitCostNeto: 8400,
    invoices: [
      {
        invoiceNumber: 'FAC-SUR-7731',
        invoiceDate: '05 Ago 2026',
        provider: 'Alimentos Naturales de la Patagonia SpA',
        providerRut: '76.990.231-1',
        quantity: 20,
        unitCostNeto: 8400,
      },
      {
        invoiceNumber: 'FAC-MED-3001',
        invoiceDate: '15 Jul 2026',
        provider: 'Droguería Veterinaria Puerto Montt Ltda.',
        providerRut: '76.541.229-8',
        quantity: 8,
        unitCostNeto: 8100,
      },
    ],
    invoiceNumber: 'FAC-SUR-7731',
    invoiceDate: '05 Ago 2026',
    provider: 'Alimentos Naturales de la Patagonia SpA',
    providerRut: '76.990.231-1',
    status: 'disponible',
  },
];

const INITIAL_PURCHASE_INVOICES = [
  {
    invoiceNumber: 'FAC-2026-8819',
    provider: 'Importadora & Distribuidora Bravery Chile SpA',
    rut: '76.452.190-3',
    date: '02 Ago 2026',
    dueDate: '02 Sep 2026',
    totalNeto: 2450000,
    iva: 465500,
    totalBruto: 2915500,
    status: 'pagada',
    itemsCount: 58,
    paymentMethod: 'Transferencia BCI',
  },
  {
    invoiceNumber: 'FAC-SUR-7731',
    provider: 'Alimentos Naturales de la Patagonia SpA',
    rut: '76.990.231-1',
    date: '05 Ago 2026',
    dueDate: '20 Ago 2026',
    totalNeto: 1120000,
    iva: 212800,
    totalBruto: 1332800,
    status: 'pendiente',
    itemsCount: 110,
    paymentMethod: 'Crédito 15 días',
  },
  {
    invoiceNumber: 'FAC-PAT-4011',
    provider: 'Sur Austral Nutrición Animal Ltda.',
    rut: '77.198.340-K',
    date: '28 Jul 2026',
    dueDate: '28 Ago 2026',
    totalNeto: 890000,
    iva: 169100,
    totalBruto: 1059100,
    status: 'pagada',
    itemsCount: 30,
    paymentMethod: 'Transferencia Santander',
  },
  {
    invoiceNumber: 'FAC-VET-1092',
    provider: 'Laboratorios & Nutracéuticos Vet Chile',
    rut: '76.882.301-4',
    date: '10 Ago 2026',
    dueDate: '10 Sep 2026',
    totalNeto: 650000,
    iva: 123500,
    totalBruto: 773500,
    status: 'pendiente',
    itemsCount: 35,
    paymentMethod: 'Crédito 30 días',
  },
];

const INITIAL_EXPENSES = [
  {
    id: 'EXP-01',
    category: 'combustible',
    categoryLabel: 'Combustible & Bencina',
    icon: '⛽',
    description: 'Carga Bencina 95 - Furgón Reparto Ruta Puerto Varas / Llanquihue',
    provider: 'Estación de Servicios Copec San Francisco',
    documentNumber: 'BOL-COP-4921',
    date: '16 Ago 2026',
    amount: 45000,
    paymentMethod: 'Tarjeta Débito Banco Santander',
    isRecurring: true,
  },
  {
    id: 'EXP-02',
    category: 'combustible',
    categoryLabel: 'Combustible & Bencina',
    icon: '⛽',
    description: 'Carga Bencina 95 - Furgón Ruta Puerto Montt / Alerce / Ensenada',
    provider: 'Shell Ruta 5 Sur Puerto Varas',
    documentNumber: 'BOL-SHL-8831',
    date: '10 Ago 2026',
    amount: 38500,
    paymentMethod: 'Tarjeta Débito Banco Santander',
    isRecurring: true,
  },
  {
    id: 'EXP-03',
    category: 'packaging',
    categoryLabel: 'Packaging & Insumos',
    icon: '📦',
    description: 'Bolsas Kraft Biodegradables 100% Reciclables (500 u.) + Sellos Térmicos',
    provider: 'Imprenta & Packaging Austral SpA',
    documentNumber: 'FAC-PAC-1902',
    date: '08 Ago 2026',
    amount: 28000,
    paymentMethod: 'Transferencia Bancaria BCI',
    isRecurring: false,
  },
  {
    id: 'EXP-04',
    category: 'fijo',
    categoryLabel: 'Arriendo & Gastos Fijos',
    icon: '🏬',
    description: 'Arriendo Bodega & Hub de Distribución San Francisco 412 (Mes Agosto)',
    provider: 'Inmobiliaria Los Colonos SpA',
    documentNumber: 'FAC-INM-3301',
    date: '01 Ago 2026',
    amount: 150000,
    paymentMethod: 'Transferencia Bancaria BCI',
    isRecurring: true,
  },
  {
    id: 'EXP-05',
    category: 'mantenimiento',
    categoryLabel: 'Mantenimiento Vehículo',
    icon: '🔧',
    description: 'Mantención preventiva, alineación y cambio de aceite Furgón Reparto',
    provider: 'Taller Mecánico Los Volcanes',
    documentNumber: 'BOL-MEC-7721',
    date: '04 Ago 2026',
    amount: 65000,
    paymentMethod: 'Tarjeta Crédito',
    isRecurring: false,
  },
  {
    id: 'EXP-06',
    category: 'servicios',
    categoryLabel: 'Servicios & Conectividad',
    icon: '📶',
    description: 'Plan Internet Fibra Bodega + 2 Líneas Móviles Repartidores POS',
    provider: 'Entel Empresas Chile',
    documentNumber: 'FAC-ENT-9021',
    date: '02 Ago 2026',
    amount: 24990,
    paymentMethod: 'PAC Automático BCI',
    isRecurring: true,
  },
];

const INITIAL_DISPATCH_ZONES = [
  {
    id: 'ZONE-01',
    name: 'Zona 1: Radio Urbano Central',
    coverage: 'Puerto Varas Centro, Costanera, Los Colonos, Santa Rosa',
    radiusMinKm: 0,
    radiusMaxKm: 5,
    color: '#10B981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.18)',
    badgeText: '0 a 5 km',
    baseFee: 1990,
    freeThreshold: 25000,
    deliveryTime: 'Mismo día / 24 hrs',
    active: true,
    partnerSpecialFee: 'Despacho 100% Gratis con cualquier convenio veterinario',
    hubsIncluded: ['Puerto Varas Centro', 'Costanera', 'Santa Rosa', 'Los Colonos'],
  },
  {
    id: 'ZONE-02',
    name: 'Zona 2: Intercomunal Puerto Varas - Pto. Montt',
    coverage: 'Puerto Montt, Alerce, Llanquihue, Frutillar Bajo',
    radiusMinKm: 5,
    radiusMaxKm: 18,
    color: '#0E8388', // Teal / Cyan
    bgColor: 'rgba(14, 131, 136, 0.16)',
    badgeText: '5 a 18 km',
    baseFee: 2990,
    freeThreshold: 35000,
    deliveryTime: '24 a 48 hrs',
    active: true,
    partnerSpecialFee: '$1.490 tarifa plana con código de convenio',
    hubsIncluded: ['Puerto Montt', 'Alerce', 'Llanquihue', 'Frutillar Bajo'],
  },
  {
    id: 'ZONE-03',
    name: 'Zona 3: Rutas Rurales & Ensenada',
    coverage: 'Ensenada, Ralún, Río Pescado, Nueva Braunau, Cascadas',
    radiusMinKm: 18,
    radiusMaxKm: 35,
    color: '#F59E0B', // Amber
    bgColor: 'rgba(245, 158, 11, 0.14)',
    badgeText: '18 a 35 km',
    baseFee: 4990,
    freeThreshold: 45000,
    deliveryTime: 'Días Martes y Jueves (Ruta Rural)',
    active: true,
    partnerSpecialFee: '$2.990 preferencial guarderías',
    hubsIncluded: ['Ensenada', 'Nueva Braunau', 'Río Pescado', 'Cascadas'],
  },
  {
    id: 'ZONE-04',
    name: 'Zona 4: Envíos Regionales & Todo Chile',
    coverage: 'Valdivia, Osorno, Temuco, Concepción, Santiago',
    radiusMinKm: 35,
    radiusMaxKm: 65,
    color: '#8B5CF6', // Purple
    bgColor: 'rgba(139, 92, 246, 0.10)',
    badgeText: '> 35 km Regional',
    baseFee: 6990,
    freeThreshold: 60000,
    deliveryTime: '48 a 72 hrs hábiles (Blue Express)',
    active: true,
    partnerSpecialFee: 'Tarifa convenio Blue Express $4.990',
    hubsIncluded: ['Valdivia', 'Osorno', 'Temuco', 'Santiago / Otras Regiones'],
  },
];

// Helper currency formatter
const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// 14 Frases motivacionales y cariñosas que representan el espíritu de Patitas del Sur (ciclo rotativo de 14 días)
const MOTIVATIONAL_PHRASES = [
  "Cada bolsa entregada lleva el amor y la pureza de los ríos y bosques del sur a un hogar feliz. 🏔️🐾",
  "Nutrir con ingredientes reales es el acto de amor más noble que podemos regalar a nuestros peludos. 🐟❤️",
  "Hoy es un gran día para llenar platos con salud, vitalidad y sonrisas de cuatro patas. ✨🐶",
  "Nuestra pasión nace en la Patagonia: alimentar con honestidad, cuidar con el corazón. 🌿🌲",
  "Detrás de cada pedido hay una familia que confía en nosotros para ver a su compañero saltar de alegría. 🐾🏡",
  "El salmón fresco y las praderas limpias no son solo ingredientes, son nuestra promesa de bienestar animal. 🌊🐕",
  "Un perro sano y un gato juguetón son el mejor testimonio de un trabajo hecho con amor y dedicación. 🐱✨",
  "Que hoy la fuerza de la naturaleza austral inspire cada despacho y cada conversación con nuestros tutores. 🏔️🚀",
  "Amar a las mascotas es elegir lo mejor para ellas todos los días, sin atajos ni rellenos artificiales. 🥩🐾",
  "Transformamos la nutrición en momentos de felicidad compartida en cada rincón de Chile. 🇨🇱❤️",
  "La lealtad infinita de nuestras mascotas merece lo más puro de nuestra tierra patagónica. 🐶🌲",
  "Pequeños cambios en su alimentación crean vidas más largas, saludables y llenas de juegos. 🏃‍♂️🐾",
  "Cuidar de Kira, Jack y miles de peludos es el motor que llena de energía a Patitas del Sur cada mañana. 🐾☀️",
  "Conectando la magia del sur con el corazón de cada familia. ¡Excelente jornada para todo el equipo! 🏔️✨",
];

// Saludo dinámico según la hora del sistema
const getDynamicGreeting = (user, adminEmail) => {
  const hour = new Date().getHours();
  let name = 'Ignacio';
  if (user && user.name) {
    name = user.name.split(' ')[0];
  } else if (adminEmail) {
    const prefix = adminEmail.split('@')[0];
    name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  if (hour >= 5 && hour < 12) {
    return `¡Buenos días, ${name}! ☀️`;
  } else if (hour >= 12 && hour < 20) {
    return `¡Buenas tardes, ${name}! 🌤️`;
  } else {
    return `¡Buenas noches, ${name}! 🌙`;
  }
};

// Frase del día basada en el día del año (ciclo de 14 días rotativo)
const getDailyMotivationalQuote = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffDays = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const dayIndex = ((diffDays % 14) + 14) % 14;
  return {
    quote: MOTIVATIONAL_PHRASES[dayIndex],
    dayNumber: dayIndex + 1,
  };
};

// Helper to resolve high-res product packshots
const getProductImage = (itemName = '') => {
  const lower = itemName.toLowerCase();
  if (lower.includes('pollo') || lower.includes('chicken')) return '/images/bravery_chicken.jpg';
  if (lower.includes('cordero') || lower.includes('lamb')) return '/images/bravery_lamb.jpg';
  if (lower.includes('salmón') || lower.includes('salmon') || lower.includes('bravery')) return '/images/bravery_salmon.jpg';
  if (lower.includes('trucha') || lower.includes('patagonia')) return '/images/cat_food_tuna.png';
  if (lower.includes('urinary') || lower.includes('dr. pet') || lower.includes('dr pet')) return '/images/cat_food_tuna.png';
  if (lower.includes('ciervo') || lower.includes('deshidratado')) return '/images/dog_food_ingredients.png';
  if (lower.includes('hueso') || lower.includes('recreativo')) return '/images/dog_kibble_detail.png';
  if (lower.includes('omega') || lower.includes('suplemento')) return '/images/dog_food_salmon.png';
  return '/images/bravery_salmon.jpg';
};

export default function AdminDashboardView({ user }) {
  const navigate = useNavigate();

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Frase del día activa
  const dailyQuote = useMemo(() => getDailyMotivationalQuote(), []);

  // Active Tab: 'dashboard' | 'pedidos' | 'clientes' | 'convenios' | 'inventario' | 'finanzas' | 'despachos'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filtro de Período Global para todo el Dashboard: 'dia' | 'semana' | 'mes'
  const [globalTimeFilter, setGlobalTimeFilter] = useState('mes');

  // Slide activo del Carrusel de Gráficos (0 a 6)
  const [currentChartSlide, setCurrentChartSlide] = useState(0);

  // Datasets State
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [convenios, setConvenios] = useState(INITIAL_CONVENIOS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [invoices, setInvoices] = useState(INITIAL_PURCHASE_INVOICES);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [dispatchZones, setDispatchZones] = useState(INITIAL_DISPATCH_ZONES);

  // Mercado Pago Configuration State
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
    commissionRatePercent: 3.19, // 3.19% + IVA
    fixedFeeCLP: 350, // $350 CLP fijo
    ivaPercent: 19, // 19% IVA
    payoutSchedule: 'instant', // 'instant' | '14_days'
    cardDiscountActive: false,
  });

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerViewMode, setCustomerViewMode] = useState('grid'); // 'grid' | 'list'
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('todos'); // 'todos' | 'bajo' | 'disponible'
  const [inventoryViewMode, setInventoryViewMode] = useState('list'); // 'grid' | 'list'
  const [convenioFilter, setConvenioFilter] = useState('todos');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('todos'); // 'todos' | 'combustible' | 'packaging' | 'fijo' | 'mantenimiento' | 'servicios'

  // Modals & Drawers
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);
  const [selectedProductPreview, setSelectedProductPreview] = useState(null);
  const [selectedProductInvoicesModal, setSelectedProductInvoicesModal] = useState(null);
  const [isReplenishmentModalOpen, setIsReplenishmentModalOpen] = useState(false);
  const [replenishmentFilter, setReplenishmentFilter] = useState('criticos'); // 'criticos' | 'todos'
  const [isAddAgreementModalOpen, setIsAddAgreementModalOpen] = useState(false);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  // Google Maps Radial Delivery State
  const [mapType, setMapType] = useState('streets'); // 'streets' | 'satellite' | 'terrain'
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
  const [hoveredMapZoneId, setHoveredMapZoneId] = useState(null);
  const [simulatedAddress, setSimulatedAddress] = useState('Alerce Norte, Puerto Varas');
  const [simulatedDistanceKm, setSimulatedDistanceKm] = useState(11.5);

  // Forms
  const [newAgreement, setNewAgreement] = useState({
    name: '',
    type: 'veterinaria',
    contactPerson: '',
    phone: '',
    email: '',
    city: 'Puerto Varas',
    code: '',
    benefitCustomer: '',
    commissionEntity: '8%',
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    invoiceNumber: '',
    provider: '',
    providerRut: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    productName: '',
    format: '12 kg',
    quantityReceived: 10,
    unitCostNeto: 42000,
    salePrice: 68990,
  });

  const [newExpenseForm, setNewExpenseForm] = useState({
    category: 'combustible',
    description: '',
    provider: '',
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    amount: 35000,
    paymentMethod: 'Tarjeta Débito Banco Santander',
    isRecurring: false,
  });

  const handleSaveNewExpense = (e) => {
    e.preventDefault();
    if (!newExpenseForm.description || !newExpenseForm.amount) {
      showToast('Por favor completa la descripción y el monto del gasto.');
      return;
    }

    const categoryIcons = {
      combustible: { label: 'Combustible & Bencina', icon: '⛽' },
      packaging: { label: 'Packaging & Insumos', icon: '📦' },
      fijo: { label: 'Arriendo & Gastos Fijos', icon: '🏬' },
      mantenimiento: { label: 'Mantenimiento Vehículo', icon: '🔧' },
      servicios: { label: 'Servicios & Conectividad', icon: '📶' },
      otros: { label: 'Otros Gastos Operativos', icon: '💼' },
    };

    const catInfo = categoryIcons[newExpenseForm.category] || {
      label: 'Gasto Operativo',
      icon: '💼',
    };

    const newExp = {
      id: `EXP-${String(expenses.length + 1).padStart(2, '0')}`,
      category: newExpenseForm.category,
      categoryLabel: catInfo.label,
      icon: catInfo.icon,
      description: newExpenseForm.description,
      provider: newExpenseForm.provider || 'Comercio Local',
      documentNumber: newExpenseForm.documentNumber || `BOL-${Date.now().toString().slice(-4)}`,
      date: newExpenseForm.date,
      amount: parseInt(newExpenseForm.amount, 10),
      paymentMethod: newExpenseForm.paymentMethod || 'Tarjeta Débito',
      isRecurring: !!newExpenseForm.isRecurring,
    };

    setExpenses([newExp, ...expenses]);
    setIsAddExpenseModalOpen(false);
    setNewExpenseForm({
      category: 'combustible',
      description: '',
      provider: '',
      documentNumber: '',
      date: new Date().toISOString().split('T')[0],
      amount: 35000,
      paymentMethod: 'Tarjeta Débito Banco Santander',
      isRecurring: false,
    });
    showToast(`Gasto "${newExp.description}" de ${formatCLP(newExp.amount)} registrado.`);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    showToast('Gasto eliminado del registro contable.');
  };

  // Toast alert
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (adminEmail.trim().length > 0 && adminPassword.trim().length > 0) {
      setIsAdminAuthenticated(true);
      setAuthError('');
      showToast('¡Bienvenido al Panel de Administración!');
    } else {
      setAuthError('Por favor ingresa un correo y contraseña de administrador.');
    }
  };

  const handleQuickAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setAuthError('');
    showToast('¡Acceso concedido como Administrador Principal!');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    showToast('Sesión de administrador cerrada con éxito.');
  };

  // Order status updater
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Pedido ${orderId} actualizado a: ${newStatus.replace('_', ' ').toUpperCase()}`);
    if (selectedOrderModal && selectedOrderModal.id === orderId) {
      setSelectedOrderModal((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Toggle Convenio Active
  const handleToggleConvenio = (id) => {
    setConvenios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    showToast('Estado del convenio actualizado');
  };

  // Create Convenio
  const handleSaveConvenio = (e) => {
    e.preventDefault();
    if (!newAgreement.name || !newAgreement.code) {
      showToast('Por favor completa el nombre y código del convenio');
      return;
    }
    const created = {
      ...newAgreement,
      id: `CONV-0${convenios.length + 1}`,
      typeLabel:
        newAgreement.type === 'veterinaria'
          ? 'Clínica Veterinaria'
          : newAgreement.type === 'entrenamiento'
          ? 'Centro de Entrenamiento'
          : newAgreement.type === 'peluqueria'
          ? 'Peluquería & Spa Canino'
          : 'Guardería & Hotel',
      benefitShipping: 'Despacho preferencial',
      redemptionsCount: 0,
      active: true,
      sinceDate: 'Agosto 2026',
    };
    setConvenios([created, ...convenios]);
    setIsAddAgreementModalOpen(false);
    setNewAgreement({
      name: '',
      type: 'veterinaria',
      contactPerson: '',
      phone: '',
      email: '',
      city: 'Puerto Varas',
      code: '',
      benefitCustomer: '',
      commissionEntity: '8%',
    });
    showToast('¡Nuevo convenio registrado con éxito!');
  };

  // Register New Invoice & Stock
  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!newInvoiceForm.invoiceNumber || !newInvoiceForm.productName) {
      showToast('Por favor completa los datos de la factura y producto');
      return;
    }

    const subtotalNeto = newInvoiceForm.quantityReceived * newInvoiceForm.unitCostNeto;
    const iva = Math.round(subtotalNeto * 0.19);
    const newInvoiceObj = {
      invoiceNumber: newInvoiceForm.invoiceNumber,
      provider: newInvoiceForm.provider || 'Proveedor Autorizado',
      rut: newInvoiceForm.providerRut || '76.123.456-7',
      date: newInvoiceForm.date,
      dueDate: newInvoiceForm.dueDate || 'En 30 días',
      totalNeto: subtotalNeto,
      iva: iva,
      totalBruto: subtotalNeto + iva,
      status: 'pendiente',
      itemsCount: parseInt(newInvoiceForm.quantityReceived, 10),
      paymentMethod: 'Crédito Proveedor',
    };
    setInvoices([newInvoiceObj, ...invoices]);

    const existingIndex = inventory.findIndex(
      (p) => p.name.toLowerCase() === newInvoiceForm.productName.toLowerCase()
    );

    if (existingIndex > -1) {
      setInventory((prev) => {
        const updated = [...prev];
        const prevItem = updated[existingIndex];
        const existingInvoices = prevItem.invoices || [
          {
            invoiceNumber: prevItem.invoiceNumber,
            invoiceDate: prevItem.invoiceDate,
            provider: prevItem.provider,
            providerRut: prevItem.providerRut,
            quantity: prevItem.stock,
            unitCostNeto: prevItem.unitCostNeto,
          },
        ];

        const newInvoiceEntry = {
          invoiceNumber: newInvoiceForm.invoiceNumber,
          invoiceDate: newInvoiceForm.date,
          provider: newInvoiceForm.provider || 'Proveedor Autorizado',
          providerRut: newInvoiceForm.providerRut || '76.123.456-7',
          quantity: parseInt(newInvoiceForm.quantityReceived, 10),
          unitCostNeto: parseInt(newInvoiceForm.unitCostNeto, 10),
        };

        updated[existingIndex] = {
          ...prevItem,
          stock: prevItem.stock + parseInt(newInvoiceForm.quantityReceived, 10),
          invoiceNumber: newInvoiceForm.invoiceNumber,
          invoiceDate: newInvoiceForm.date,
          unitCostNeto: parseInt(newInvoiceForm.unitCostNeto, 10),
          salePrice: parseInt(newInvoiceForm.salePrice, 10),
          provider: newInvoiceForm.provider || prevItem.provider,
          providerRut: newInvoiceForm.providerRut || prevItem.providerRut,
          invoices: [newInvoiceEntry, ...existingInvoices],
        };
        return updated;
      });
    } else {
      const newInvoiceEntry = {
        invoiceNumber: newInvoiceForm.invoiceNumber,
        invoiceDate: newInvoiceForm.date,
        provider: newInvoiceForm.provider || 'Proveedor Autorizado',
        providerRut: newInvoiceForm.providerRut || '76.123.456-7',
        quantity: parseInt(newInvoiceForm.quantityReceived, 10),
        unitCostNeto: parseInt(newInvoiceForm.unitCostNeto, 10),
      };

      const newProd = {
        id: `PROD-${String(inventory.length + 1).padStart(2, '0')}`,
        name: newInvoiceForm.productName,
        brand: 'Patitas del Sur',
        category: 'Alimento Seco',
        petType: 'perros',
        format: newInvoiceForm.format,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        stock: parseInt(newInvoiceForm.quantityReceived, 10),
        minStock: 6,
        salePrice: parseInt(newInvoiceForm.salePrice, 10),
        unitCostNeto: parseInt(newInvoiceForm.unitCostNeto, 10),
        invoices: [newInvoiceEntry],
        invoiceNumber: newInvoiceForm.invoiceNumber,
        invoiceDate: newInvoiceForm.date,
        provider: newInvoiceForm.provider,
        providerRut: newInvoiceForm.providerRut,
        status: 'disponible',
      };
      setInventory([newProd, ...inventory]);
    }

    setIsAddInvoiceModalOpen(false);
    showToast(`Factura ${newInvoiceForm.invoiceNumber} registrada e inventario actualizado.`);
  };

  // Dispatch Zone updater
  const handleSaveZoneEdit = (e) => {
    e.preventDefault();
    if (!editingZone) return;
    setDispatchZones((prev) =>
      prev.map((z) => (z.id === editingZone.id ? { ...editingZone } : z))
    );
    setEditingZone(null);
    showToast('Tarifa de despacho actualizada correctamente');
  };

  // Calculations for Financial Dashboard
  const financialMetrics = useMemo(() => {
    const liveSalesFromOrders = orders.reduce((acc, o) => acc + o.total, 0);
    const totalSales = liveSalesFromOrders > 1000000 ? liveSalesFromOrders : 4850000;

    // Desglose de ingresos por método de pago
    const mpSales = Math.round(totalSales * 0.72); // 72% de ventas con Mercado Pago / Tarjetas
    const transferSales = Math.round(totalSales * 0.22); // 22% por Transferencia Bancaria Directa
    const cashSales = totalSales - mpSales - transferSales; // 6% Efectivo
    const mpTxCount = Math.max(1, Math.round(mpSales / 42000)); // ~83 transacciones

    // Costo de Mercadería Vendida (COGS - 58% promedio según facturas)
    const estimatedCOGS = Math.round(totalSales * 0.58);
    const grossMargin = totalSales - estimatedCOGS;
    const grossMarginPercent = ((grossMargin / totalSales) * 100).toFixed(1);

    // Cálculo dinámico de comisiones Mercado Pago
    const mpPercentFeeNeto = Math.round(mpSales * (mercadoPagoConfig.commissionRatePercent / 100));
    const mpFixedFeeNeto = Math.round(mpTxCount * (mercadoPagoConfig.fixedFeeCLP || 0));
    const mpTotalNeto = mpPercentFeeNeto + mpFixedFeeNeto;
    const mpTotalIva = Math.round(mpTotalNeto * (mercadoPagoConfig.ivaPercent / 100));
    const mpTotalCostWithIva = mpTotalNeto + mpTotalIva;
    const mpEffectiveRate = ((mpTotalCostWithIva / mpSales) * 100).toFixed(2);
    const mpNetRevenueReceived = mpSales - mpTotalCostWithIva;

    // Desglose de Gastos Operacionales Registrados
    const combustibleExpenses = expenses
      .filter((e) => e.category === 'combustible')
      .reduce((acc, e) => acc + e.amount, 0);

    const packagingExpenses = expenses
      .filter((e) => e.category === 'packaging')
      .reduce((acc, e) => acc + e.amount, 0);

    const fixedExpenses = expenses
      .filter((e) => e.category === 'fijo')
      .reduce((acc, e) => acc + e.amount, 0);

    const maintenanceExpenses = expenses
      .filter((e) => e.category === 'mantenimiento')
      .reduce((acc, e) => acc + e.amount, 0);

    const servicesExpenses = expenses
      .filter((e) => e.category === 'servicios')
      .reduce((acc, e) => acc + e.amount, 0);

    const otherExpenses = expenses
      .filter((e) => !['combustible', 'packaging', 'fijo', 'mantenimiento', 'servicios'].includes(e.category))
      .reduce((acc, e) => acc + e.amount, 0);

    const totalRegisteredExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Comisiones convenios veterinarios y adiestradores
    const partnerCommissions = Math.round(totalSales * 0.038);

    // Gastos Operacionales Totales & Utilidad Neta Real
    const totalOperatingExpenses = totalRegisteredExpenses + mpTotalCostWithIva + partnerCommissions;
    const netProfit = grossMargin - totalOperatingExpenses;
    const netProfitPercent = ((netProfit / totalSales) * 100).toFixed(1);

    // Valorización de Inventario
    const totalInventoryCost = inventory.reduce(
      (acc, p) => acc + (p.unitCostNeto || 0) * (p.stock || 0),
      0
    );
    const totalInventoryPVP = inventory.reduce(
      (acc, p) => acc + (p.salePrice || 0) * (p.stock || 0),
      0
    );

    return {
      totalSales,
      mpSales,
      transferSales,
      cashSales,
      mpTxCount,
      estimatedCOGS,
      grossMargin,
      grossMarginPercent,
      mpPercentFeeNeto,
      mpFixedFeeNeto,
      mpTotalCostWithIva,
      mpEffectiveRate,
      mpNetRevenueReceived,
      combustibleExpenses,
      packagingExpenses,
      fixedExpenses,
      maintenanceExpenses,
      servicesExpenses,
      otherExpenses,
      totalRegisteredExpenses,
      partnerCommissions,
      totalOperatingExpenses,
      netProfit,
      netProfitPercent,
      totalInventoryCost,
      totalInventoryPVP,
    };
  }, [orders, inventory, expenses, mercadoPagoConfig]);

  // Dynamic values depending on selected period: 'dia' | 'semana' | 'mes'
  const salesPeriodData = useMemo(() => {
    const todayOrdersTotal = orders
      .filter((o) => o.date.includes('18 Ago') || o.status === 'en_camino' || o.status === 'en_preparacion')
      .reduce((acc, o) => acc + o.total, 0) || 150460;

    const todayAmount = todayOrdersTotal;
    const weekAmount = 2875000;
    const monthAmount = financialMetrics.totalSales > 1000000 ? financialMetrics.totalSales : 4850000;

    return {
      dia: {
        title: 'Ventas de Hoy',
        amount: todayAmount,
        growth: '+14.2% vs ayer',
        detail: `${orders.length} pedidos hoy`,
        periodLabel: 'Día',
      },
      semana: {
        title: 'Ventas de la Semana',
        amount: weekAmount,
        growth: '+15.8% vs sem. anterior',
        detail: '38 pedidos (7 días)',
        periodLabel: 'Semana',
      },
      mes: {
        title: 'Ventas del Mes Actual',
        amount: monthAmount,
        growth: '+18.4% vs mes anterior',
        detail: 'Agosto 2026',
        periodLabel: 'Mes Actual',
      },
    };
  }, [orders, financialMetrics]);

  // Dynamic values depending on selected period for orders: 'dia' | 'semana' | 'mes'
  const ordersPeriodData = useMemo(() => {
    return {
      dia: {
        title: 'Pedidos de Hoy',
        count: `${orders.length} Pedidos`,
        statusText: '1 en prep. • 1 en camino',
        detail: '80% entregados hoy',
        periodLabel: 'Día',
      },
      semana: {
        title: 'Pedidos de la Semana',
        count: '38 Pedidos',
        statusText: '34 entregados • 4 en ruta',
        detail: '+12.5% vs sem. ant.',
        periodLabel: 'Semana',
      },
      mes: {
        title: 'Pedidos del Mes Actual',
        count: '72 Pedidos',
        statusText: '68 completados • 4 en proc.',
        detail: 'Agosto 2026',
        periodLabel: 'Mes Actual',
      },
    };
  }, [orders]);

  // Dynamic values depending on selected period for customers: 'dia' | 'semana' | 'mes'
  const customersPeriodData = useMemo(() => {
    return {
      dia: {
        title: 'Clientes de Hoy',
        count: '2 Nuevos',
        statusText: '2 Mascotas inscritas 🐾',
        detail: '100% perfil completo',
        periodLabel: 'Día',
      },
      semana: {
        title: 'Clientes de la Semana',
        count: '14 Nuevos',
        statusText: '14 Mascotas activas 🐾',
        detail: '+22.5% vs sem. ant.',
        periodLabel: 'Semana',
      },
      mes: {
        title: 'Clientes del Mes Actual',
        count: `${customers.length > 5 ? customers.length : 48} Tutores`,
        statusText: `${customers.length} con ficha activa 🐾`,
        detail: '+31.4% en Agosto',
        periodLabel: 'Mes Actual',
      },
    };
  }, [customers]);

  // Chart, KPIs and Pet breakdown synced with global filter: 'dia' | 'semana' | 'mes'
  const dashboardAnalyticsData = useMemo(() => {
    if (globalTimeFilter === 'dia') {
      return {
        chartTitle: 'Actividad de Ventas por Horas (Hoy)',
        chartSubtitle: 'Ingresos y pedidos registrados en la jornada de hoy',
        chartBadge: 'Total Hoy: $620.000 (5 pedidos)',
        bars: [
          { day: '09:00', val: 40, amount: '$45.000' },
          { day: '11:00', val: 75, amount: '$125.000' },
          { day: '13:00', val: 100, amount: '$180.000' },
          { day: '15:00', val: 55, amount: '$90.000' },
          { day: '17:00', val: 70, amount: '$110.000' },
          { day: '19:00', val: 45, amount: '$70.000' },
          { day: '21:00', val: 20, amount: '$0' },
        ],
        footerTicket: '$62.000',
        footerOnTime: '100% puntual',
        footerRedemptions: '12 canjes hoy',
        perrosPercent: 68,
        perrosAmount: '$421.600',
        gatosPercent: 32,
        gatosAmount: '$198.400',
      };
    }

    if (globalTimeFilter === 'semana') {
      return {
        chartTitle: 'Actividad de Ventas Semanales',
        chartSubtitle: 'Ingresos diarios acumulados de los últimos 7 días',
        chartBadge: 'Promedio: $485.000 / día',
        bars: [
          { day: 'Mié 12', val: 65, amount: '$315.000' },
          { day: 'Jue 13', val: 80, amount: '$420.000' },
          { day: 'Vie 14', val: 95, amount: '$590.000' },
          { day: 'Sáb 15', val: 70, amount: '$380.000' },
          { day: 'Dom 16', val: 45, amount: '$240.000' },
          { day: 'Lun 17', val: 85, amount: '$510.000' },
          { day: 'Hoy 18', val: 100, amount: '$620.000' },
        ],
        footerTicket: '$63.280',
        footerOnTime: '98.5% a tiempo',
        footerRedemptions: '70 canjes',
        perrosPercent: 65,
        perrosAmount: '$1.868.750',
        gatosPercent: 35,
        gatosAmount: '$1.006.250',
      };
    }

    // Default: 'mes'
    return {
      chartTitle: 'Actividad de Ventas Mensuales (Agosto 2026)',
      chartSubtitle: 'Ingresos consolidados por semana del mes en curso',
      chartBadge: 'Total Mes: $4.850.000',
      bars: [
        { day: 'Sem 1 (1-7)', val: 60, amount: '$950.000' },
        { day: 'Sem 2 (8-14)', val: 80, amount: '$1.250.000' },
        { day: 'Sem 3 (15-21)', val: 100, amount: '$1.550.000' },
        { day: 'Sem 4 (Proy.)', val: 70, amount: '$1.100.000' },
      ],
      footerTicket: '$67.360',
      footerOnTime: '99.1% cumplimiento',
      footerRedemptions: '142 canjes',
      perrosPercent: 65,
      perrosAmount: '$3.150.000',
      gatosPercent: 35,
      gatosAmount: '$1.700.000',
    };
  }, [globalTimeFilter]);

  // Zona de despacho calculada dinámicamente en base a KM
  const simulatedZoneResult = useMemo(() => {
    const d = parseFloat(simulatedDistanceKm) || 0;
    const found = dispatchZones.find(
      (z) => d >= (z.radiusMinKm ?? 0) && d < (z.radiusMaxKm ?? 999)
    ) || dispatchZones[dispatchZones.length - 1];
    return found || dispatchZones[0];
  }, [simulatedDistanceKm, dispatchZones]);

  // =========================================================================
  // VIEW 1: LIGHT & WARM AUTHENTICATION SCREEN IF NOT AUTHENTICATED
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Soft Pastel Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#0E8388]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#10B981]/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C86D39]/10 blur-[90px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0E8388] transition-colors bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0E8388]" />
              <span>Volver a la Tienda</span>
            </Link>

            <span className="text-[10px] font-black text-[#0E8388] bg-[#0E8388]/10 border border-[#0E8388]/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Acceso Restringido
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0A3E40] via-[#0E8388] to-[#10B981] mx-auto flex items-center justify-center shadow-lg shadow-[#0E8388]/20 border-2 border-white">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Control central de operaciones, pedidos, clientes CRM, convenios y finanzas de Patitas del Sur.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Correo de Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@patitasdelsur.cl"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#0E8388] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#0E8388] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#0E8388]/25 hover:opacity-95 transition-all cursor-pointer active:scale-95 mt-2"
              >
                Iniciar Sesión Administrador
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0E8388] border border-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span>Acceso Rápido 1-Clic (Demo Modo)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIGHT & PASTEL ADMIN PORTAL WITH SIDEBAR MENU
  // =========================================================================
  const pendingOrdersCount = orders.filter((o) => o.status === 'en_preparacion' || o.status === 'en_camino').length;
  const lowStockCount = inventory.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-500/40 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================= */}
      {/* LEFT SIDEBAR NAVIGATION MENU (Light / Pastel Style)     */}
      {/* ======================================================= */}
      <aside className="w-64 lg:w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-40 shadow-xs">
        
        {/* Top Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0A3E40] via-[#0E8388] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-[#0E8388]/20 border border-white shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight">Patitas del Sur</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold truncate">Panel de Control General</p>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1.5">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'dashboard' ? 'bg-black/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                En vivo
              </span>
            </button>

            {/* 2. Pedidos */}
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* 3. Clientes (CRM) */}
            <button
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Clientes (CRM)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'clientes' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {customers.length}
              </span>
            </button>

            {/* 4. Convenios */}
            <button
              onClick={() => setActiveTab('convenios')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'convenios'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Handshake className="w-4 h-4" />
                <span>Convenios</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'convenios' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {convenios.filter((c) => c.active).length} Activos
              </span>
            </button>

            {/* 5. Inventario */}
            <button
              onClick={() => setActiveTab('inventario')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'inventario'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Inventario & Facturas</span>
              </div>
              {lowStockCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {lowStockCount} bajo
                </span>
              )}
            </button>

            {/* 6. Finanzas */}
            <button
              onClick={() => setActiveTab('finanzas')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'finanzas'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4" />
                <span>Finanzas</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'finanzas' ? 'bg-black/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                Balances
              </span>
            </button>

            {/* 7. Despachos */}
            <button
              onClick={() => setActiveTab('despachos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'despachos'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4" />
                <span>Despachos</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'despachos' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {dispatchZones.length} Zonas
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0E8388]" />
            <span>Ver Tienda Pública</span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#0E8388]/15 border border-[#0E8388]/30 flex items-center justify-center text-[#0E8388] font-bold text-xs">
                A
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">Admin Patitas</div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>En línea</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Cerrar la sesión de Administrador"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================= */}
      {/* MAIN VIEW CONTENT CONTAINER (Light Pastel Palette)      */}
      {/* ======================================================= */}
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD (Resumen del Día, Gráficas y KPIs)                      */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Greeting Bar with Dynamic Time Greeting & Daily Motivational Quote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {getDynamicGreeting(user, adminEmail)}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#10B981]" />
                    <span>Día #{dailyQuote.dayNumber} de 14</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#0E8388] font-bold flex items-center gap-1.5 leading-relaxed">
                  <Heart className="w-3.5 h-3.5 text-[#C86D39] fill-[#C86D39] shrink-0" />
                  <span>"{dailyQuote.quote}"</span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center gap-2 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0E8388]" />
                  <span>
                    {new Intl.DateTimeFormat('es-CL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(new Date()).replace(/^\w/, (c) => c.toUpperCase())}
                  </span>
                </span>
                <button
                  onClick={() => showToast('Métricas actualizadas en tiempo real')}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4 text-[#0E8388]" />
                </button>
              </div>
            </div>

            {/* Global Dashboard Period Filter Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                <div className="p-1.5 rounded-xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <Filter className="w-4 h-4" />
                </div>
                <span>Período del Dashboard:</span>
                <span className="text-slate-500 font-semibold hidden md:inline">
                  (Sincroniza todas las métricas, tarjetas y gráficos)
                </span>
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/70 gap-1 w-full sm:w-auto">
                {[
                  { id: 'dia', label: 'Hoy (Día)', icon: Clock },
                  { id: 'semana', label: 'Últimos 7 Días', icon: BarChart3 },
                  { id: 'mes', label: 'Mes Actual (Agosto)', icon: Calendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setGlobalTimeFilter(tab.id);
                      showToast(`Dashboard actualizado a: ${tab.label}`);
                    }}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      globalTimeFilter === tab.id
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Cards Row (Driven by Global Filter) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Card 1: Ventas */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500">
                    {salesPeriodData[globalTimeFilter].title}
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {formatCLP(salesPeriodData[globalTimeFilter].amount)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{salesPeriodData[globalTimeFilter].growth}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {salesPeriodData[globalTimeFilter].detail}
                  </span>
                </div>
              </div>

              {/* Card 2: Pedidos */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500">
                    {ordersPeriodData[globalTimeFilter].title}
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {ordersPeriodData[globalTimeFilter].count}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold truncate max-w-[155px]">
                    {ordersPeriodData[globalTimeFilter].statusText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {ordersPeriodData[globalTimeFilter].detail}
                  </span>
                </div>
              </div>

              {/* Card 3: Clientes CRM */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500">
                    {customersPeriodData[globalTimeFilter].title}
                  </span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {customersPeriodData[globalTimeFilter].count}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold truncate max-w-[155px]">
                    {customersPeriodData[globalTimeFilter].statusText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {customersPeriodData[globalTimeFilter].detail}
                  </span>
                </div>
              </div>

              {/* Card 4: Valor Inventario */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-500">Valor Inventario</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {formatCLP(financialMetrics.totalInventoryCost)}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  <span>18 SKUs asociados a factura</span>
                </div>
              </div>
            </div>

            {/* Graphs & Operational Overview (Driven by Global Filter) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphic 1: Multi-Chart Carousel with 7 Interactive Slides */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
                {/* Header with Navigation Controls */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 text-[#0E8388] border border-slate-200 shrink-0">
                        {currentChartSlide === 0 && <DollarSign className="w-5 h-5" />}
                        {currentChartSlide === 1 && <ShoppingBag className="w-5 h-5 text-blue-600" />}
                        {currentChartSlide === 2 && <MapPin className="w-5 h-5 text-emerald-600" />}
                        {currentChartSlide === 3 && <Truck className="w-5 h-5 text-purple-600" />}
                        {currentChartSlide === 4 && <Award className="w-5 h-5 text-amber-500" />}
                        {currentChartSlide === 5 && <Handshake className="w-5 h-5 text-[#0E8388]" />}
                        {currentChartSlide === 6 && <Flame className="w-5 h-5 text-rose-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            {currentChartSlide === 0 && dashboardAnalyticsData.chartTitle}
                            {currentChartSlide === 1 && `Volumen de Pedidos (${globalTimeFilter === 'dia' ? 'Hoy' : globalTimeFilter === 'semana' ? 'Últimos 7 Días' : 'Agosto 2026'})`}
                            {currentChartSlide === 2 && 'Distribución Geográfica por Comuna / Zona'}
                            {currentChartSlide === 3 && 'Modalidad de Entrega (Domicilio vs. Puntos de Retiro)'}
                            {currentChartSlide === 4 && 'Top 5 Productos & Alimentos Más Vendidos'}
                            {currentChartSlide === 5 && 'Rendimiento por Convenios & Alianzas Locales'}
                            {currentChartSlide === 6 && 'Horarios y Días Pico de Mayor Demanda'}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            Gráfico {currentChartSlide + 1} de 7
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {currentChartSlide === 0 && dashboardAnalyticsData.chartSubtitle}
                          {currentChartSlide === 1 && 'Cantidad de órdenes procesadas y estados de despacho'}
                          {currentChartSlide === 2 && 'Concentración de entregas en la cuenca del Lago Llanquihue y regiones'}
                          {currentChartSlide === 3 && 'Porcentaje de flota propia vs. retiro en clínicas y guarderías aliadas'}
                          {currentChartSlide === 4 && 'Ranking de alimentos y snacks preferidos por los tutores'}
                          {currentChartSlide === 5 && 'Ventas derivadas por convenios veterinarios vs. venta directa'}
                          {currentChartSlide === 6 && 'Horas y días con mayor volumen de compras para optimizar rutas'}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setCurrentChartSlide((prev) => (prev === 0 ? 6 : prev - 1))}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                        title="Gráfico anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentChartSlide((prev) => (prev === 6 ? 0 : prev + 1))}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                        title="Siguiente gráfico"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SLIDE 0: INGRESOS POR VENTAS ($ CLP) */}
                {currentChartSlide === 0 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="pt-2 grid grid-flow-col auto-cols-fr gap-3 items-end h-44 border-b border-slate-100 pb-3">
                      {dashboardAnalyticsData.bars.map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group/bar">
                          <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            {bar.amount}
                          </span>
                          <div className="w-full bg-slate-100 rounded-t-xl h-32 flex items-end p-1">
                            <div
                              className={`w-full rounded-lg transition-all duration-700 ${
                                idx === dashboardAnalyticsData.bars.length - 1 || bar.val === 100
                                  ? 'bg-gradient-to-t from-[#0E8388] to-[#10B981] shadow-md shadow-[#0E8388]/30'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              style={{ height: `${bar.val}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 text-center truncate max-w-full">
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-1 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Ticket Promedio</span>
                        <span className="text-sm font-black text-slate-900">{dashboardAnalyticsData.footerTicket}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Tasa Entrega a Tiempo</span>
                        <span className="text-sm font-black text-emerald-600">{dashboardAnalyticsData.footerOnTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Canjes por Convenios</span>
                        <span className="text-sm font-black text-purple-600">{dashboardAnalyticsData.footerRedemptions}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 1: VOLUMEN DE PEDIDOS (CANTIDAD DE ÓRDENES) */}
                {currentChartSlide === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="pt-2 grid grid-flow-col auto-cols-fr gap-3 items-end h-44 border-b border-slate-100 pb-3">
                      {(globalTimeFilter === 'dia'
                        ? [
                            { label: '09:00', count: 1, height: 50 },
                            { label: '11:00', count: 1, height: 50 },
                            { label: '13:00', count: 2, height: 100 },
                            { label: '15:00', count: 0, height: 10 },
                            { label: '17:00', count: 1, height: 50 },
                            { label: '19:00', count: 0, height: 10 },
                          ]
                        : globalTimeFilter === 'semana'
                        ? [
                            { label: 'Mié 12', count: 4, height: 50 },
                            { label: 'Jue 13', count: 6, height: 75 },
                            { label: 'Vie 14', count: 8, height: 100 },
                            { label: 'Sáb 15', count: 5, height: 62 },
                            { label: 'Dom 16', count: 3, height: 37 },
                            { label: 'Lun 17', count: 7, height: 87 },
                            { label: 'Hoy 18', count: 5, height: 62 },
                          ]
                        : [
                            { label: 'Sem 1 (1-7)', count: 15, height: 65 },
                            { label: 'Sem 2 (8-14)', count: 19, height: 82 },
                            { label: 'Sem 3 (15-21)', count: 23, height: 100 },
                            { label: 'Sem 4 (22-31)', count: 15, height: 65 },
                          ]
                      ).map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group/col">
                          <span className="text-[11px] font-black text-blue-600 opacity-0 group-hover/col:opacity-100 transition-opacity">
                            {col.count} {col.count === 1 ? 'pedido' : 'pedidos'}
                          </span>
                          <div className="w-full bg-slate-100 rounded-t-xl h-32 flex items-end p-1">
                            <div
                              className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-lg shadow-sm transition-all duration-700"
                              style={{ height: `${col.height}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{col.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-1 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Entregados</span>
                        <span className="text-sm font-black text-emerald-600">94.4% (68)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">En Ruta 🚚</span>
                        <span className="text-sm font-black text-blue-600">4.1% (3)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">En Preparación</span>
                        <span className="text-sm font-black text-amber-600">1.5% (1)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 2: DISTRIBUCIÓN GEOGRÁFICA POR COMUNA */}
                {currentChartSlide === 2 && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                    {[
                      { city: 'Puerto Varas (Radio Urbano Central)', percent: 42, count: '30 pedidos', total: '$2.037.000', color: 'from-[#0E8388] to-[#10B981]' },
                      { city: 'Puerto Montt & Alerce', percent: 28, count: '20 pedidos', total: '$1.358.000', color: 'from-blue-600 to-cyan-500' },
                      { city: 'Llanquihue & Frutillar', percent: 18, count: '13 pedidos', total: '$873.000', color: 'from-purple-600 to-indigo-500' },
                      { city: 'Ensenada & Zonas Rurales', percent: 7, count: '5 pedidos', total: '$339.500', color: 'from-amber-500 to-orange-400' },
                      { city: 'Envíos Regionales (Courier Express)', percent: 5, count: '4 pedidos', total: '$242.500', color: 'from-rose-500 to-pink-500' },
                    ].map((zone, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#0E8388]" />
                            <span>{zone.city}</span>
                          </span>
                          <span className="text-slate-900 font-black">
                            {zone.percent}% <span className="text-slate-400 font-normal">({zone.count} • {zone.total})</span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${zone.color} rounded-full transition-all duration-700`}
                            style={{ width: `${zone.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Comuna Líder</span>
                        <span className="text-sm font-black text-slate-900">Puerto Varas</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Cobertura Activa</span>
                        <span className="text-sm font-black text-emerald-600">5 Zonas</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Despacho Promedio</span>
                        <span className="text-sm font-black text-[#0E8388]">24 Horas</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 3: MODALIDAD DE ENTREGA (DOMICILIO VS RETIRO EN CONVENIOS) */}
                {currentChartSlide === 3 && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-emerald-800">Despacho a Domicilio</span>
                          <Truck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-900">64%</div>
                        <p className="text-[11px] text-emerald-700 font-medium">46 pedidos entregados con flota propia</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-purple-800">Puntos de Retiro / Convenio</span>
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-black text-purple-900">26%</div>
                        <p className="text-[11px] text-purple-700 font-medium">19 retiros en Clínicas y Guarderías</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-800">Courier Regional</span>
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-black text-blue-900">10%</div>
                        <p className="text-[11px] text-blue-700 font-medium">7 envíos nacionales Blue Express</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Composición Total de Envíos</span>
                      <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="h-full bg-gradient-to-r from-[#0E8388] to-[#10B981]" style={{ width: '64%' }} title="Domicilio 64%" />
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: '26%' }} title="Punto Retiro 26%" />
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '10%' }} title="Courier 10%" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
                        <span>🟢 64% Flota Propia</span>
                        <span>🟣 26% Retiro en Aliados</span>
                        <span>🔵 10% Courier Express</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Costo Promedio Flete</span>
                        <span className="text-sm font-black text-slate-900">$1.990 CLP</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Ahorro Tutores Convenio</span>
                        <span className="text-sm font-black text-purple-600">$57.000 CLP</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Satisfacción Envíos</span>
                        <span className="text-sm font-black text-emerald-600">99.4% ✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 4: TOP 5 PRODUCTOS MÁS VENDIDOS */}
                {currentChartSlide === 4 && (
                  <div className="space-y-2.5 pt-1 animate-in fade-in duration-300">
                    {[
                      { rank: '🥇', name: 'Bravery Salmón Adulto Medium/Large', format: '12 kg', units: 32, total: '$2.207.680', percent: 100 },
                      { rank: '🥈', name: 'Patagonia Holística Trucha Silvestre', format: '7 kg', units: 24, total: '$1.271.760', percent: 75 },
                      { rank: '🥉', name: 'Bravery Pollo Adulto Raza Grande', format: '12 kg', units: 18, total: '$1.241.820', percent: 56 },
                      { rank: '4️⃣', name: 'Snack Ciervo Patagónico Deshidratado', format: '200 g', units: 45, total: '$854.550', percent: 45 },
                      { rank: '5️⃣', name: 'Dr. Pet Urinary Care Felino', format: '3 kg', units: 15, total: '$524.850', percent: 35 },
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.rank}</span>
                          <div>
                            <div className="font-black text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Formato {item.format} • {item.units} unidades vendidas</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900">{item.total}</div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Top #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Categoría Líder</span>
                        <span className="text-sm font-black text-slate-900">Perros Adultos (65%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Formato Más Pedido</span>
                        <span className="text-sm font-black text-[#0E8388]">Saco 12 kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Ticket por Producto</span>
                        <span className="text-sm font-black text-purple-600">$54.200</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 5: RENDIMIENTO POR CONVENIOS LOCALES */}
                {currentChartSlide === 5 && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                    {[
                      { name: 'Clínica Veterinaria Austral', code: 'CONV-AUSTRAL-10', redemptions: 28, total: '$1.890.000', commission: '$151.200', percent: 75, icon: '🏥' },
                      { name: 'Patagonia K9 Adiestramiento', code: 'PATAGONIAK9-FREE', redemptions: 19, total: '$1.180.000', commission: '$118.000', percent: 50, icon: '🐕' },
                      { name: 'Spa & Peluquería Los Volcanes', code: 'SPAVOLCAN-5', redemptions: 14, total: '$780.000', commission: '$39.000', percent: 35, icon: '✂️' },
                      { name: 'Guardería Campestre Llanquihue', code: 'CAMP-LLANQUIHUE', redemptions: 9, total: '$540.000', commission: '$43.200', percent: 25, icon: '🏡' },
                    ].map((conv, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span>{conv.icon}</span>
                            <span>{conv.name}</span>
                            <span className="text-[10px] font-mono font-bold text-[#0E8388] bg-[#0E8388]/10 px-1.5 py-0.5 rounded">
                              {conv.code}
                            </span>
                          </div>
                          <div className="font-black text-slate-900">{conv.total}</div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>{conv.redemptions} canjes acumulados</span>
                          <span className="text-purple-700 font-bold">Comisión: {conv.commission}</span>
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Total Ventas Convenios</span>
                        <span className="text-sm font-black text-slate-900">38.9% del Total</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Aliado N°1</span>
                        <span className="text-sm font-black text-emerald-600">Clínica Austral</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Comisiones Pagadas</span>
                        <span className="text-sm font-black text-purple-600">$351.400</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 6: HORARIOS Y DÍAS PICO DE COMPRA */}
                {currentChartSlide === 6 && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-800">Franja Pico Tarde (13:00 - 17:00)</span>
                        <div className="text-2xl font-black text-amber-900">45% Demanda</div>
                        <p className="text-[11px] text-amber-800 font-medium">Mayor concentración de compras del día</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-purple-800">Franja Noche (18:00 - 22:00)</span>
                        <div className="text-2xl font-black text-purple-900">35% Demanda</div>
                        <p className="text-[11px] text-purple-800 font-medium">Compras en el hogar post-jornada laboral</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-blue-800">Franja Mañana (08:00 - 12:00)</span>
                        <div className="text-2xl font-black text-blue-900">20% Demanda</div>
                        <p className="text-[11px] text-blue-800 font-medium">Pedidos matutinos para entrega exprés</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Días con Mayor Flujo de Pedidos</span>
                      <div className="grid grid-cols-7 gap-1.5 text-center pt-1 font-bold">
                        {[
                          { day: 'Lun', val: '26% 🔥', active: true },
                          { day: 'Mar', val: '14%', active: false },
                          { day: 'Mié', val: '12%', active: false },
                          { day: 'Jue', val: '15%', active: false },
                          { day: 'Vie', val: '20% ⭐', active: true },
                          { day: 'Sáb', val: '8%', active: false },
                          { day: 'Dom', val: '5%', active: false },
                        ].map((d, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border ${
                              d.active
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] block text-slate-400">{d.day}</span>
                            <span className="text-[11px]">{d.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-1 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Hora Punta Exacta</span>
                        <span className="text-sm font-black text-rose-600">14:30 hrs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Día Más Fuerte</span>
                        <span className="text-sm font-black text-emerald-600">Lunes (26%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Tasa de Conversión</span>
                        <span className="text-sm font-black text-purple-600">4.8% en vivo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Graphic 2: Category Breakdown */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Distribución por Mascota</h3>
                  <p className="text-xs text-slate-500">Porcentaje de ventas Perros vs. Gatos</p>
                </div>

                <div className="space-y-4">
                  {/* Perros Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#0E8388] flex items-center gap-1.5">🐶 Alimentos & Snacks Perros</span>
                      <span className="text-slate-900">
                        {dashboardAnalyticsData.perrosPercent}% ({dashboardAnalyticsData.perrosAmount})
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0E8388] to-[#10B981] rounded-full transition-all duration-500"
                        style={{ width: `${dashboardAnalyticsData.perrosPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Gatos Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#C86D39] flex items-center gap-1.5">🐱 Nutrición Felina</span>
                      <span className="text-slate-900">
                        {dashboardAnalyticsData.gatosPercent}% ({dashboardAnalyticsData.gatosAmount})
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C86D39] to-[#F59E0B] rounded-full transition-all duration-500"
                        style={{ width: `${dashboardAnalyticsData.gatosPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Operational Quick Alert Box with Action Button */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Alertas de Reposición Próxima</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                      2 Críticos (&lt; 5 días)
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    Hay <strong>2 tutores</strong> que agotarán el alimento de su mascota en menos de 5 días (<strong className="underline decoration-amber-400">Kira: 4 días</strong> • <strong className="underline decoration-amber-400">Rocky: 2 días</strong>).
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsReplenishmentModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Clientes & Alimentos a Reponer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Orders of the Day Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Pedidos Recientes del Día</h3>
                  <p className="text-xs text-slate-500">Últimos pedidos registrados para despacho hoy</p>
                </div>
                <button
                  onClick={() => setActiveTab('pedidos')}
                  className="text-xs font-bold text-[#0E8388] hover:text-[#0A3E40] flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todos los pedidos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">ID Pedido</th>
                      <th className="py-3 px-3">Cliente & Mascota</th>
                      <th className="py-3 px-3">Productos</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 3).map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 whitespace-nowrap min-w-[120px]">
                          <div className="font-mono font-black text-[#0E8388] text-xs whitespace-nowrap leading-none">{o.id}</div>
                          <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap mt-1">{o.date} • {o.time}</div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">
                          <div className="font-bold text-slate-900 whitespace-nowrap leading-none">{o.customer}</div>
                          <div className="text-[11px] text-slate-600 font-semibold whitespace-nowrap mt-1 flex items-center gap-1.5">
                            <span>{o.petType?.toLowerCase().includes('gato') || o.petType?.includes('🐱') ? '🐱' : '🐶'}</span>
                            <span>{o.petName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 font-medium">
                          {o.items.map((i, idx) => (
                            <span
                              key={idx}
                              onClick={() => setSelectedProductPreview({
                                ...i,
                                orderId: o.id,
                                customer: o.customer,
                                petName: o.petName,
                                petType: o.petType,
                                tracking: o.tracking,
                              })}
                              className="hover:text-[#0E8388] hover:underline cursor-pointer"
                              title="Clic para ver foto del producto"
                            >
                              {idx > 0 ? ', ' : ''}{i.quantity}x {i.name}
                            </span>
                          ))}
                        </td>
                        <td className="py-3.5 px-3 font-black text-slate-900 whitespace-nowrap">{formatCLP(o.total)}</td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            o.status === 'entregado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'en_camino'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrderModal(o)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PEDIDOS (Gestión Integral & Ver Detalle)                           */}
        {/* ========================================================================= */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Gestión de Pedidos & Envíos 📦
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Revisa el detalle de cada compra, actualiza estados de despacho y gestiona boletas de entrega.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Descargando planilla Excel de pedidos...')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#0E8388]" />
                  <span>Exportar Pedidos</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente, mascota o dirección..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: 'todos', label: 'Todos', count: orders.length },
                  { id: 'en_preparacion', label: 'En Preparación', count: orders.filter((o) => o.status === 'en_preparacion').length },
                  { id: 'en_camino', label: 'En Camino 🚚', count: orders.filter((o) => o.status === 'en_camino').length },
                  { id: 'entregado', label: 'Entregados ✓', count: orders.filter((o) => o.status === 'entregado').length },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      orderStatusFilter === st.id
                        ? 'bg-[#0E8388] text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st.label} ({st.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Pedido / Fecha</th>
                      <th className="py-3.5 px-4">Cliente & Mascota</th>
                      <th className="py-3.5 px-4">Desglose de Ítems</th>
                      <th className="py-3.5 px-4">Zona / Ciudad</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-center">Acciones Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders
                      .filter((o) => {
                        const matchQ =
                          o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.petName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.city.toLowerCase().includes(orderSearch.toLowerCase());
                        const matchS = orderStatusFilter === 'todos' || o.status === orderStatusFilter;
                        return matchQ && matchS;
                      })
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 whitespace-nowrap min-w-[130px]">
                            <div className="font-mono font-black text-[#0E8388] text-xs whitespace-nowrap leading-none">{order.id}</div>
                            <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap mt-1">{order.date} • {order.time}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap min-w-[140px]">
                            <div className="font-bold text-slate-900 whitespace-nowrap leading-none">{order.customer}</div>
                            <div className="text-[11px] text-slate-600 font-semibold whitespace-nowrap mt-1.5 flex items-center gap-1.5">
                              <span>{order.petType?.toLowerCase().includes('gato') || order.petType?.includes('🐱') ? '🐱' : '🐶'}</span>
                              <span>{order.petName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-xs">
                            <div className="space-y-1">
                              {order.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProductPreview({
                                      ...it,
                                      orderId: order.id,
                                      customer: order.customer,
                                      petName: order.petName,
                                      petType: order.petType,
                                      tracking: order.tracking,
                                    });
                                  }}
                                  className="text-slate-700 hover:text-[#0E8388] text-xs font-medium truncate cursor-pointer transition-colors hover:underline"
                                  title="Clic para ver foto del producto"
                                >
                                  • {it.quantity}x {it.name} ({it.weight})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            <div className="font-bold text-slate-800">{order.city}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{order.address}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-black text-slate-900 text-sm">{formatCLP(order.total)}</div>
                            <div className="text-[10px] text-[#0E8388] font-bold">{order.invoiceNumber}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'entregado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'en_camino'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.status === 'entregado' && <CheckCircle2 className="w-3 h-3" />}
                              {order.status === 'en_camino' && <Truck className="w-3 h-3" />}
                              {order.status === 'en_preparacion' && <Clock className="w-3 h-3" />}
                              <span>{order.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {order.status === 'en_preparacion' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'en_camino')}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                                >
                                  Despachar
                                </button>
                              )}
                              {order.status === 'en_camino' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'entregado')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                                >
                                  Entregar
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrderModal(order)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs"
                              >
                                Ver detalle
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLIENTES (CRM con Ficha de Mascota Completa)                      */}
        {/* ========================================================================= */}
        {activeTab === 'clientes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  CRM de Clientes & Mascotas 🐶🐱
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Base de datos de tutores, historial de pedidos y fichas nutricionales completas ingresadas en el sitio web.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {customers.length} Tutores Activos
                </span>
              </div>
            </div>

            {/* Search & View Mode Switcher */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de cliente, mascota, raza o ciudad..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              {/* View Switcher: Tarjetas (Grid) / Lista (Table) */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setCustomerViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      customerViewMode === 'grid'
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      customerViewMode === 'list'
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                  Mostrando {customers.filter((c) => {
                    const q = customerSearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      c.city.toLowerCase().includes(q) ||
                      c.pet.name.toLowerCase().includes(q) ||
                      c.pet.breed.toLowerCase().includes(q)
                    );
                  }).length} perfiles
                </div>
              </div>
            </div>

            {/* VISTA 1: TARJETAS (GRID) */}
            {customerViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {customers
                  .filter((c) => {
                    const q = customerSearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      c.city.toLowerCase().includes(q) ||
                      c.pet.name.toLowerCase().includes(q) ||
                      c.pet.breed.toLowerCase().includes(q)
                    );
                  })
                  .map((customer) => {
                    const isUrgent = (customer.pet?.daysRemaining ?? 99) < 10;
                    return (
                      <div
                        key={customer.id}
                        className={`rounded-3xl p-6 space-y-4 transition-all flex flex-col justify-between hover:shadow-lg ${
                          isUrgent
                            ? 'bg-gradient-to-b from-rose-50 to-rose-100/60 border-2 border-rose-400 ring-2 ring-rose-400/30 shadow-md shadow-rose-200/50'
                            : 'bg-white border border-slate-200/80 shadow-xs hover:shadow-md'
                        }`}
                      >
                        {/* Alerta de Reposición Urgente (< 10 días) */}
                        {isUrgent && (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-xs">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>¡REPOSICIÓN! Quedan {customer.pet.daysRemaining} días</span>
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                              Encargar
                            </span>
                          </div>
                        )}

                        {/* Header Tutor */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-xs ${
                              isUrgent
                                ? 'bg-gradient-to-tr from-rose-600 to-rose-500 shadow-rose-200'
                                : 'bg-gradient-to-tr from-[#0E8388] to-[#10B981]'
                            }`}>
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className={`font-black text-base leading-tight ${isUrgent ? 'text-rose-950' : 'text-slate-900'}`}>
                                {customer.name}
                              </h3>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                <MapPin className={`w-3 h-3 ${isUrgent ? 'text-rose-600' : 'text-[#0E8388]'}`} />
                                <span>{customer.city}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isUrgent
                              ? 'bg-white text-rose-700 border-rose-300'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {customer.points} pts
                          </span>
                        </div>

                        {/* Mascota Box */}
                        <div className={`rounded-2xl p-4 space-y-2.5 ${
                          isUrgent
                            ? 'bg-white/95 border border-rose-200 shadow-2xs'
                            : 'bg-slate-50/80 border border-slate-100'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                              <span>{customer.pet.type === 'perro' ? '🐶' : '🐱'}</span>
                              <span>{customer.pet.name}</span>
                              <span className="text-xs text-slate-500 font-normal">({customer.pet.breed})</span>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                              isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {customer.pet.weight}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-700 space-y-1">
                            <div className="truncate">
                              <strong className="text-slate-500">Dieta:</strong> {customer.pet.favoriteFood}
                            </div>
                            <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                              isUrgent ? 'border-rose-100' : 'border-slate-200/80'
                            }`}>
                              <span className="text-slate-500">Bolsa: {customer.pet.bagDurationDays} días</span>
                              <span className={`font-black ${
                                isUrgent
                                  ? 'text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200'
                                  : 'text-amber-700 font-bold'
                              }`}>
                                Quedan ~{customer.pet.daysRemaining} días
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Summary Stats */}
                        <div className={`grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t ${
                          isUrgent ? 'border-rose-200/80' : 'border-slate-100'
                        }`}>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Compras</span>
                            <span className="font-black text-slate-900">{customer.ordersCount} pedidos</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Gastado</span>
                            <span className="font-black text-emerald-700">{formatCLP(customer.totalSpent)}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => setSelectedCustomerModal(customer)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                            isUrgent
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          <Eye className={`w-3.5 h-3.5 ${isUrgent ? 'text-white' : 'text-[#0E8388]'}`} />
                          <span>{isUrgent ? '🚨 Encargar / Ver Ficha Nutricional' : 'Ver Ficha Nutricional & Clínica'}</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* VISTA 2: LISTA / TABLA DETALLADA */}
            {customerViewMode === 'list' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-4 px-4">Cliente / Tutor</th>
                        <th className="py-4 px-4">Contacto & Ciudad</th>
                        <th className="py-4 px-4">Mascota Principal</th>
                        <th className="py-4 px-4">Dieta & Autonomía</th>
                        <th className="py-4 px-4 text-center">Puntos Club</th>
                        <th className="py-4 px-4">Historial Compras</th>
                        <th className="py-4 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers
                        .filter((c) => {
                          const q = customerSearch.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q) ||
                            c.city.toLowerCase().includes(q) ||
                            c.pet.name.toLowerCase().includes(q) ||
                            c.pet.breed.toLowerCase().includes(q)
                          );
                        })
                        .map((customer) => {
                          const isUrgent = (customer.pet?.daysRemaining ?? 99) < 10;
                          return (
                            <tr
                              key={customer.id}
                              className={`transition-colors ${
                                isUrgent
                                  ? 'bg-rose-50/70 hover:bg-rose-100/80 border-l-4 border-l-rose-500'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-2xs ${
                                    isUrgent
                                      ? 'bg-gradient-to-tr from-rose-600 to-rose-500'
                                      : 'bg-gradient-to-tr from-[#0E8388] to-[#10B981]'
                                  }`}>
                                    {customer.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className={`font-bold leading-tight ${isUrgent ? 'text-rose-950 font-black' : 'text-slate-900'}`}>
                                      {customer.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {customer.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-medium text-slate-700">{customer.email}</div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className={`w-3 h-3 ${isUrgent ? 'text-rose-600' : 'text-[#0E8388]'}`} />
                                  <span>{customer.city}</span>
                                  <span>•</span>
                                  <span>{customer.phone}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <span>{customer.pet.type === 'perro' ? '🐶' : '🐱'}</span>
                                  <span>{customer.pet.name}</span>
                                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                                    isUrgent
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {customer.pet.weight}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {customer.pet.breed} ({customer.pet.age})
                                </div>
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                <div className="font-semibold text-slate-800 truncate text-[11px]">
                                  {customer.pet.favoriteFood}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <span>Bolsa: {customer.pet.bagDurationDays}d</span>
                                  <span>•</span>
                                  <span className={`font-black ${
                                    isUrgent
                                      ? 'text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200'
                                      : 'text-emerald-700 font-bold'
                                  }`}>
                                    {isUrgent ? '🚨 Quedan' : 'Quedan'} ~{customer.pet.daysRemaining} días
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border ${
                                  isUrgent
                                    ? 'bg-white text-rose-700 border-rose-300'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                  <Sparkles className="w-3 h-3 text-purple-500" />
                                  {customer.points} pts
                                </span>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="font-black text-emerald-700 text-xs">{formatCLP(customer.totalSpent)}</div>
                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{customer.ordersCount} compras realizadas</div>
                              </td>
                              <td className="py-4 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedCustomerModal(customer)}
                                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-2xs ${
                                    isUrgent
                                      ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600'
                                      : 'bg-slate-100 hover:bg-[#0E8388] hover:text-white text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {isUrgent ? 'Reponer / Ficha' : 'Ver Ficha'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CONVENIOS (Entidades Locales: Veterinarias, Adiestramiento, Spa)    */}
        {/* ========================================================================= */}
        {activeTab === 'convenios' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Convenios & Alianzas Locales 🤝
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Gestiona y configura alianzas comerciales con clínicas veterinarias, adiestradores y guarderías del sur.
                </p>
              </div>

              <button
                onClick={() => setIsAddAgreementModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white text-xs font-extrabold shadow-md shadow-[#0E8388]/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Convenio</span>
              </button>
            </div>

            {/* Convenios Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Convenios Activos</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{convenios.filter((c) => c.active).length}</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Ventas Derivadas</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">$1.890.000</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Comisiones Aliados</span>
                <div className="text-2xl font-black text-purple-700 mt-1">$189.000</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Canjes Realizados</span>
                <div className="text-2xl font-black text-amber-700 mt-1">70 canjes</div>
              </div>
            </div>

            {/* Convenios Table / Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {convenios.map((conv) => (
                <div
                  key={conv.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {conv.type === 'veterinaria' && '🏥'}
                        {conv.type === 'entrenamiento' && '🐕'}
                        {conv.type === 'peluqueria' && '✂️'}
                        {conv.type === 'guarderia' && '🏡'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">{conv.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            conv.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {conv.active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{conv.typeLabel} • {conv.city}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleConvenio(conv.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        conv.active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title="Activar / Pausar Convenio"
                    >
                      {conv.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Benefit details */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Código Promocional:</span>
                      <span className="font-mono font-black text-[#0E8388] bg-[#0E8388]/10 px-2.5 py-0.5 rounded border border-[#0E8388]/20">
                        {conv.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Beneficio Cliente:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">{conv.benefitCustomer}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Retorno Aliado:</span>
                      <span className="font-bold text-purple-700">{conv.commissionEntity}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                      <span className="text-slate-500">Contacto: {conv.contactPerson} ({conv.phone})</span>
                      <span className="text-emerald-700 font-bold">{conv.redemptionsCount} canjes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INVENTARIO & FACTURAS DE COMPRA (Vista Tarjetas & Vista Tabla)     */}
        {/* ========================================================================= */}
        {activeTab === 'inventario' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Inventario & Facturas de Compra 📦
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Control de stock en bodega. Cada SKU puede estar respaldado por múltiples facturas electrónicas y proveedores.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher (Tarjetas vs Tabla) */}
                <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'grid'
                        ? 'bg-white text-[#0E8388] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Vista en Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'list'
                        ? 'bg-white text-[#0E8388] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Vista en Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddInvoiceModalOpen(true)}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white text-xs font-extrabold shadow-md shadow-[#0E8388]/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ingresar Factura / Stock</span>
                </button>
              </div>
            </div>

            {/* Inventory Overview KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Total SKUs Activos</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{inventory.length}</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Unidades en Bodega</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {inventory.reduce((acc, p) => acc + p.stock, 0)} u.
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Costo Inventario Neto</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{formatCLP(financialMetrics.totalInventoryCost)}</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Valor Proyectado PVP</span>
                <div className="text-2xl font-black text-amber-700 mt-1">{formatCLP(financialMetrics.totalInventoryPVP)}</div>
              </div>
            </div>

            {/* Search & Stock Level Filter */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar producto, SKU, proveedor o N° Factura..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>

                {/* Stock Level Filter Buttons */}
                <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setInventoryStockFilter('todos')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      inventoryStockFilter === 'todos'
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({inventory.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryStockFilter('bajo')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      inventoryStockFilter === 'bajo'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      Stock Bajo ({inventory.filter((p) => p.stock <= (p.minStock || 5) || p.status === 'stock_bajo').length})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryStockFilter('disponible')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      inventoryStockFilter === 'disponible'
                        ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Óptimo ({inventory.filter((p) => p.stock > (p.minStock || 5) && p.status !== 'stock_bajo').length})
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium hidden lg:block">
                Respaldo tributario: 100% de productos asociados a factura electrónica
              </div>
            </div>

            {/* =================================================================== */}
            {/* VIEW MODE 1: TARJETAS (CARDS GRID VIEW)                             */}
            {/* =================================================================== */}
            {inventoryViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                {inventory
                  .filter((p) => {
                    const q = inventorySearch.toLowerCase();
                    const invoicesMatch = (p.invoices || []).some(
                      (inv) =>
                        inv.invoiceNumber.toLowerCase().includes(q) ||
                        inv.provider.toLowerCase().includes(q) ||
                        (inv.providerRut || '').toLowerCase().includes(q)
                    );

                    const matchQ =
                      p.name.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      (p.invoiceNumber || '').toLowerCase().includes(q) ||
                      (p.provider || '').toLowerCase().includes(q) ||
                      invoicesMatch;

                    const isLow = p.stock <= (p.minStock || 5) || p.status === 'stock_bajo';
                    const matchStock =
                      inventoryStockFilter === 'todos'
                        ? true
                        : inventoryStockFilter === 'bajo'
                        ? isLow
                        : !isLow;

                    return matchQ && matchStock;
                  })
                  .map((prod) => {
                    const isLow = prod.stock <= (prod.minStock || 5) || prod.status === 'stock_bajo';
                    const marginPercent = Math.round(
                      ((prod.salePrice - prod.unitCostNeto) / prod.salePrice) * 100
                    );
                    const prodInvoices = prod.invoices || [
                      {
                        invoiceNumber: prod.invoiceNumber,
                        invoiceDate: prod.invoiceDate,
                        provider: prod.provider,
                        providerRut: prod.providerRut,
                        quantity: prod.stock,
                        unitCostNeto: prod.unitCostNeto,
                      },
                    ];
                    // Get unique providers
                    const uniqueProviders = Array.from(
                      new Set(prodInvoices.map((inv) => inv.provider))
                    );

                    return (
                      <div
                        key={prod.id}
                        className={`bg-white rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all ${
                          isLow
                            ? 'border-2 border-rose-400 ring-2 ring-rose-300/30 bg-gradient-to-b from-rose-50/40 to-white'
                            : 'border-slate-200/80'
                        }`}
                      >
                        {/* Top: Product Image, Category & Stock Badge */}
                        <div>
                          <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200/80 p-3 flex items-center justify-center overflow-hidden group">
                            <img
                              src={getProductImage(prod.name)}
                              alt={prod.name}
                              className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Format Pill */}
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#0E8388] border border-slate-200 shadow-xs">
                              {prod.format}
                            </span>
                            {/* Stock Indicator Badge */}
                            <span
                              className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isLow
                                  ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isLow ? `⚠️ ${prod.stock} u. Bajo` : `✓ ${prod.stock} u.`}
                            </span>
                          </div>

                          {/* Product Title & Brand */}
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span className="uppercase">{prod.brand}</span>
                              <span className="font-mono">{prod.sku}</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">
                              {prod.name}
                            </h4>
                          </div>

                          {/* Pricing & Margin Box */}
                          <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 text-center">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Costo Neto</span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {formatCLP(prod.unitCostNeto)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">PVP Venta</span>
                              <span className="text-xs font-black text-slate-900">
                                {formatCLP(prod.salePrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-emerald-700 block">Margen</span>
                              <span className="text-xs font-black text-emerald-700">
                                +{marginPercent}%
                              </span>
                            </div>
                          </div>

                          {/* Invoices & Providers Multi-Info */}
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500">
                                Facturas ({prodInvoices.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedProductInvoicesModal(prod)}
                                className="text-[10px] font-black text-[#0E8388] hover:underline cursor-pointer"
                              >
                                Ver Historial →
                              </button>
                            </div>

                            {/* Invoice Badges List */}
                            <div className="flex flex-wrap gap-1.5">
                              {prodInvoices.map((inv, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedProductInvoicesModal(prod)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 text-blue-800 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                                  title={`${inv.provider} • ${inv.invoiceDate}`}
                                >
                                  <FileText className="w-2.5 h-2.5 text-blue-600" />
                                  <span>{inv.invoiceNumber}</span>
                                </button>
                              ))}
                            </div>

                            {/* Multiple Providers Tag */}
                            <div className="text-[11px] text-slate-600 font-medium">
                              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                                Proveedor(es):
                              </span>
                              {uniqueProviders.map((prov, i) => (
                                <div key={i} className="truncate text-slate-700 font-semibold" title={prov}>
                                  • {prov}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNewInvoiceForm((prev) => ({
                                ...prev,
                                productName: prod.name,
                                format: prod.format,
                                unitCostNeto: prod.unitCostNeto,
                                salePrice: prod.salePrice,
                                provider: prod.provider,
                                providerRut: prod.providerRut,
                              }));
                              setIsAddInvoiceModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Cargar Factura</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProductInvoicesModal(prod)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Ver detalle completo de facturas y lotes"
                          >
                            <Receipt className="w-4 h-4 text-slate-700" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW MODE 2: TABLA (LIST VIEW)                                      */}
            {/* =================================================================== */}
            {inventoryViewMode === 'list' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Producto & Formato</th>
                        <th className="py-3.5 px-4">Facturas de Compra</th>
                        <th className="py-3.5 px-4">Proveedores Asociados</th>
                        <th className="py-3.5 px-4">Costo Neto</th>
                        <th className="py-3.5 px-4">Precio Venta (PVP)</th>
                        <th className="py-3.5 px-4">Margen</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory
                        .filter((p) => {
                          const q = inventorySearch.toLowerCase();
                          const invoicesMatch = (p.invoices || []).some(
                            (inv) =>
                              inv.invoiceNumber.toLowerCase().includes(q) ||
                              inv.provider.toLowerCase().includes(q) ||
                              (inv.providerRut || '').toLowerCase().includes(q)
                          );

                          const matchQ =
                            p.name.toLowerCase().includes(q) ||
                            p.sku.toLowerCase().includes(q) ||
                            (p.invoiceNumber || '').toLowerCase().includes(q) ||
                            (p.provider || '').toLowerCase().includes(q) ||
                            invoicesMatch;

                          const isLow = p.stock <= (p.minStock || 5) || p.status === 'stock_bajo';
                          const matchStock =
                            inventoryStockFilter === 'todos'
                              ? true
                              : inventoryStockFilter === 'bajo'
                              ? isLow
                              : !isLow;

                          return matchQ && matchStock;
                        })
                        .map((prod) => {
                          const isLow = prod.stock <= (prod.minStock || 5) || prod.status === 'stock_bajo';
                          const marginPercent = Math.round(
                            ((prod.salePrice - prod.unitCostNeto) / prod.salePrice) * 100
                          );
                          const prodInvoices = prod.invoices || [
                            {
                              invoiceNumber: prod.invoiceNumber,
                              invoiceDate: prod.invoiceDate,
                              provider: prod.provider,
                              providerRut: prod.providerRut,
                              quantity: prod.stock,
                              unitCostNeto: prod.unitCostNeto,
                            },
                          ];
                          const uniqueProviders = Array.from(
                            new Set(prodInvoices.map((inv) => inv.provider))
                          );

                          return (
                            <tr
                              key={prod.id}
                              className={`transition-colors ${
                                isLow
                                  ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Product Info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={getProductImage(prod.name)}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm leading-snug">{prod.name}</div>
                                    <div className="text-[11px] text-slate-500 font-mono">
                                      {prod.sku} • {prod.format}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Facturas de Compra (Multiple Support) */}
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap gap-1">
                                    {prodInvoices.map((inv, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSelectedProductInvoicesModal(prod)}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50/90 hover:bg-blue-100 border border-blue-200 text-blue-800 font-mono font-bold text-[10px] transition-colors cursor-pointer"
                                        title={`${inv.provider} • ${inv.invoiceDate}`}
                                      >
                                        <FileText className="w-2.5 h-2.5 text-blue-600" />
                                        <span>{inv.invoiceNumber}</span>
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProductInvoicesModal(prod)}
                                    className="text-[10px] text-[#0E8388] font-bold hover:underline cursor-pointer block"
                                  >
                                    {prodInvoices.length === 1 ? '1 Factura de respaldo' : `${prodInvoices.length} Facturas de compra`}
                                  </button>
                                </div>
                              </td>

                              {/* Proveedores Asociados (Multiple Support) */}
                              <td className="py-4 px-4 max-w-xs text-slate-700">
                                <div className="space-y-0.5">
                                  {uniqueProviders.map((prov, i) => (
                                    <div key={i} className="font-bold text-xs truncate" title={prov}>
                                      • {prov}
                                    </div>
                                  ))}
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {prodInvoices[0]?.providerRut || 'RUT Registrado'}
                                  </div>
                                </div>
                              </td>

                              {/* Costo Neto */}
                              <td className="py-4 px-4 font-mono font-bold text-slate-600">
                                {formatCLP(prod.unitCostNeto)}
                              </td>

                              {/* Precio Venta */}
                              <td className="py-4 px-4 font-black text-slate-900 text-sm">
                                {formatCLP(prod.salePrice)}
                              </td>

                              {/* Margen */}
                              <td className="py-4 px-4">
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs">
                                  +{marginPercent}%
                                </span>
                              </td>

                              {/* Stock */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-black text-sm ${
                                      isLow ? 'text-rose-600 font-bold' : 'text-slate-900'
                                    }`}
                                  >
                                    {prod.stock} u.
                                  </span>
                                  {isLow && (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-black uppercase animate-pulse">
                                      Bajo
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProductInvoicesModal(prod)}
                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                    title="Ver todas las facturas y proveedores"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewInvoiceForm((prev) => ({
                                        ...prev,
                                        productName: prod.name,
                                        format: prod.format,
                                        unitCostNeto: prod.unitCostNeto,
                                        salePrice: prod.salePrice,
                                        provider: prod.provider,
                                        providerRut: prod.providerRut,
                                      }));
                                      setIsAddInvoiceModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-xl bg-[#0E8388]/10 hover:bg-[#0E8388]/20 text-[#0E8388] transition-colors cursor-pointer"
                                    title="Cargar nueva factura para este producto"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: FINANZAS (Control Financiero, Mercado Pago, Combustible & Gastos)  */}
        {/* ========================================================================= */}
        {activeTab === 'finanzas' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <span>Control Financiero & Flujo de Caja</span>
                  <span className="text-2xl">💵</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Control en tiempo real de ingresos por ventas, deducciones de pasarela (Mercado Pago), combustible de reparto y gastos operativos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMercadoPagoModalOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-blue-700" />
                  <span>⚙️ Configurar Mercado Pago ({mercadoPagoConfig.commissionRatePercent}% + IVA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Registrar Gasto / Boleta</span>
                </button>

                <span className="text-xs font-black px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline-block">
                  Agosto 2026 • Puerto Varas
                </span>
              </div>
            </div>

            {/* Income & Expense KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Ingresos por Ventas */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Ingresos Brutos Ventas</span>
                  <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">{formatCLP(financialMetrics.totalSales)}</div>
                <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>72% MP • 22% Transf.</span>
                  <span className="text-emerald-700 font-bold">+18.4% vs mes ant.</span>
                </div>
              </div>

              {/* Card 2: Costo de Mercadería (COGS) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Costo Mercadería (COGS)</span>
                  <span className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                    <Package className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-700">{formatCLP(financialMetrics.estimatedCOGS)}</div>
                <div className="text-[11px] text-emerald-700 font-bold">
                  Margen Bruto: +{financialMetrics.grossMarginPercent}% ({formatCLP(financialMetrics.grossMargin)})
                </div>
              </div>

              {/* Card 3: Gastos Operativos & Comisiones */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">Gastos Operativos & Comis.</span>
                  <span className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
                    <Fuel className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-700">{formatCLP(financialMetrics.totalOperatingExpenses)}</div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  MP: {formatCLP(financialMetrics.mpTotalCostWithIva)} • Bencina: {formatCLP(financialMetrics.combustibleExpenses)}
                </div>
              </div>

              {/* Card 4: Utilidad Operativa Neta */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-300 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900 text-[11px] font-extrabold uppercase tracking-wider">Utilidad Operativa Real</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                    EBITDA
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-800">{formatCLP(financialMetrics.netProfit)}</div>
                <div className="text-[11px] text-emerald-700 font-extrabold">
                  {financialMetrics.netProfitPercent}% rentabilidad neta real
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* TWO-COLUMN PANELS: MERCADO PAGO + BENCINA & TRANSPORTE */}
            {/* ======================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PANEL 1: MERCADO PAGO (Comisiones & Cobros con Tarjeta) */}
              <div className="bg-white border border-blue-200/80 rounded-3xl p-6 space-y-5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shadow-xs">
                      💳
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">Mercado Pago & Pasarela de Pagos</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase">
                          Activo
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Cobros procesados vía Débito, Crédito y Botón de Pago online
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMercadoPagoModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Configurar comisión de Mercado Pago"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                  </button>
                </div>

                {/* Mercado Pago Fee Breakdown Matrix */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">Ventas recaudadas vía Mercado Pago:</span>
                    <span className="font-black text-slate-900 font-mono text-sm">{formatCLP(financialMetrics.mpSales)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Transacciones procesadas:</span>
                    <span className="font-mono font-bold text-slate-700">{financialMetrics.mpTxCount} cobros</span>
                  </div>

                  <div className="pt-2 border-t border-blue-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Comisión variable ({mercadoPagoConfig.commissionRatePercent}% neto):</span>
                      <span className="font-mono text-rose-600 font-bold">-{formatCLP(financialMetrics.mpPercentFeeNeto)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Cargo fijo (${mercadoPagoConfig.fixedFeeCLP} por cobro):</span>
                      <span className="font-mono text-rose-600 font-bold">-{formatCLP(financialMetrics.mpFixedFeeNeto)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>IVA sobre comisión ({mercadoPagoConfig.ivaPercent}%):</span>
                      <span className="font-mono text-rose-600 font-bold">
                        -{formatCLP(financialMetrics.mpTotalCostWithIva - financialMetrics.mpPercentFeeNeto - financialMetrics.mpFixedFeeNeto)}
                      </span>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="pt-2.5 border-t border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-500 block">Total Deducido Pasarela</span>
                      <span className="text-xs text-rose-700 font-black">
                        -{formatCLP(financialMetrics.mpTotalCostWithIva)} (Tasa efec. {financialMetrics.mpEffectiveRate}%)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase font-bold text-slate-500 block">Líquido Depositado</span>
                      <span className="text-sm font-black text-emerald-800 font-mono">
                        {formatCLP(financialMetrics.mpNetRevenueReceived)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Acreditación: <strong>Inmediata en cuenta bancaria</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMercadoPagoModalOpen(true)}
                    className="text-[#0E8388] font-bold hover:underline cursor-pointer"
                  >
                    Ajustar Parámetros →
                  </button>
                </div>
              </div>

              {/* PANEL 2: COMBUSTIBLE, BENCINA & RUTAS DE REPARTO */}
              <div className="bg-white border border-amber-200/80 rounded-3xl p-6 space-y-5 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg shadow-xs">
                      ⛽
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">Combustible & Rutas de Reparto</h3>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                          2 Furgones
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Control de bencina para repartos en Puerto Varas, Llanquihue, Puerto Montt y Ensenada
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewExpenseForm((prev) => ({
                        ...prev,
                        category: 'combustible',
                        description: 'Carga Bencina 95 - Furgón Reparto',
                        provider: 'Copec San Francisco Puerto Varas',
                      }));
                      setIsAddExpenseModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Cargar nuevo gasto de bencina"
                  >
                    <Plus className="w-4 h-4 text-slate-700" />
                  </button>
                </div>

                {/* Fuel Metrics Breakdown */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">Total Gastado en Bencina (Agosto):</span>
                    <span className="font-black text-amber-900 font-mono text-sm">
                      {formatCLP(financialMetrics.combustibleExpenses)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Rendimiento Mensual</span>
                      <span className="font-black text-slate-900 text-xs">~1.850 km recorridos</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Costo Bencina / Entrega</span>
                      <span className="font-black text-slate-900 text-xs">~$950 CLP por pedido</span>
                    </div>
                  </div>

                  {/* Registered fuel receipts */}
                  <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Últimas Cargas Registradas:</span>
                    {expenses
                      .filter((e) => e.category === 'combustible')
                      .slice(0, 2)
                      .map((fuelExp) => (
                        <div key={fuelExp.id} className="flex items-center justify-between text-[11px] text-slate-600 bg-white/60 p-2 rounded-xl">
                          <span className="truncate pr-2">
                            ⛽ <strong>{fuelExp.provider}</strong> ({fuelExp.date})
                          </span>
                          <span className="font-mono font-bold text-slate-900 shrink-0">{formatCLP(fuelExp.amount)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Rutas: <strong>Pto. Varas, Llanquihue, Pto. Montt, Ensenada</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewExpenseForm((prev) => ({
                        ...prev,
                        category: 'combustible',
                        description: 'Carga Bencina 95 - Furgón Reparto',
                        provider: 'Copec San Francisco Puerto Varas',
                      }));
                      setIsAddExpenseModalOpen(true);
                    }}
                    className="text-[#0E8388] font-bold hover:underline cursor-pointer"
                  >
                    + Nueva Carga de Bencina →
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* EXPENSES LEDGER: LIBRO DE GASTOS OPERACIONALES          */}
            {/* ======================================================= */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Libro de Gastos Operacionales Registrados</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Registro de compras, combustible, insumos, packaging y arriendos operacionales
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Registrar Gasto</span>
                  </button>
                </div>
              </div>

              {/* Expense Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1">
                {[
                  { id: 'todos', label: `Todos (${expenses.length})` },
                  { id: 'combustible', label: `⛽ Combustible (${expenses.filter((e) => e.category === 'combustible').length})` },
                  { id: 'packaging', label: `📦 Packaging (${expenses.filter((e) => e.category === 'packaging').length})` },
                  { id: 'fijo', label: `🏬 Arriendo & Fijos (${expenses.filter((e) => e.category === 'fijo').length})` },
                  { id: 'mantenimiento', label: `🔧 Mantención (${expenses.filter((e) => e.category === 'mantenimiento').length})` },
                  { id: 'servicios', label: `📶 Servicios (${expenses.filter((e) => e.category === 'servicios').length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setExpenseFilterCategory(pill.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      expenseFilterCategory === pill.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Expenses Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Fecha</th>
                      <th className="py-3 px-3">Categoría</th>
                      <th className="py-3 px-3">Descripción & Proveedor</th>
                      <th className="py-3 px-3">N° Comprobante</th>
                      <th className="py-3 px-3">Medio de Pago</th>
                      <th className="py-3 px-3">Monto Total</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses
                      .filter((exp) =>
                        expenseFilterCategory === 'todos' ? true : exp.category === expenseFilterCategory
                      )
                      .map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-3 text-slate-600 font-medium">{exp.date}</td>
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-[11px]">
                              <span>{exp.icon || '💼'}</span>
                              <span>{exp.categoryLabel || exp.category}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-900">{exp.description}</div>
                            <div className="text-[11px] text-slate-500">{exp.provider}</div>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-600">
                            {exp.documentNumber}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 font-medium">
                            {exp.paymentMethod}
                          </td>
                          <td className="py-3.5 px-3 font-black text-slate-900 font-mono text-sm">
                            {formatCLP(exp.amount)}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Eliminar gasto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ======================================================= */}
            {/* FACTURAS DE PROVEEDORES REGISTRADAS (COMPRAS DE STOCK) */}
            {/* ======================================================= */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Facturas de Proveedores Registradas (Mercadería / Stock)</h3>
                  <p className="text-xs text-slate-500 font-medium">Control de pagos y compras de mercadería respaldadas ante el SII</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Cargar Factura Compra</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">N° Factura</th>
                      <th className="py-3 px-3">Proveedor & RUT</th>
                      <th className="py-3 px-3">Fecha Emisión</th>
                      <th className="py-3 px-3">Vencimiento</th>
                      <th className="py-3 px-3">Monto Neto</th>
                      <th className="py-3 px-3">Total Bruto (+IVA)</th>
                      <th className="py-3 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-[#0E8388]">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{inv.provider}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.rut}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{inv.date}</td>
                        <td className="py-3.5 px-3 text-slate-500">{inv.dueDate}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">{formatCLP(inv.totalNeto)}</td>
                        <td className="py-3.5 px-3 font-black text-slate-900">{formatCLP(inv.totalBruto)}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              inv.status === 'pagada'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: DESPACHOS (Configuración de Zonas, Tarifas & Google Maps Radial)   */}
        {/* ========================================================================= */}
        {activeTab === 'despachos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <span>Zonificación Radial & Tarifas Google Maps</span>
                  <span className="text-xl">🗺️</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Zonificación concéntrica por kilómetros desde la Bodega Central en Puerto Varas. Fija tarifas automáticas según distancia geográfica.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hub: Puerto Varas Centro (Km 0)</span>
                </span>
                <span className="text-xs font-black px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {dispatchZones.length} Anillos Radiales Activos
                </span>
              </div>
            </div>

            {/* =================================================================== */}
            {/* GOOGLE MAPS INTERACTIVE RADIAL ZONES MAP                            */}
            {/* =================================================================== */}
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm space-y-0">
              {/* Map Header & Toolbar */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0E8388] to-[#10B981] text-white flex items-center justify-center shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">Google Maps • Radios Geográficos & Tarifas por Kilómetro</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        En Vivo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Bodega Central: San Francisco 412, Puerto Varas (-41.3195, -72.9854)
                    </p>
                  </div>
                </div>

                {/* Map Controls & Map Type */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Map Type Switcher */}
                  <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl border border-slate-300/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setMapType('streets')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        mapType === 'streets'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Calles Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapType('satellite')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        mapType === 'satellite'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Satélite
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapType('terrain')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        mapType === 'terrain'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Relieve
                    </button>
                  </div>

                  {/* Zoom Buttons */}
                  <div className="inline-flex items-center bg-slate-100 rounded-2xl border border-slate-200 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setMapZoomLevel((z) => Math.min(z + 0.15, 1.4))}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 font-black cursor-pointer"
                      title="Acercar mapa"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoomLevel((z) => Math.max(z - 0.15, 0.75))}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 font-black cursor-pointer border-l border-slate-200"
                      title="Alejar mapa"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoomLevel(1)}
                      className="px-2.5 py-1 text-slate-700 hover:text-[#0E8388] font-bold cursor-pointer border-l border-slate-200 text-[10px]"
                      title="Re-centrar mapa"
                    >
                      🎯 Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Radial Map Canvas with Google Maps UI Overlays */}
              <div
                className={`relative w-full h-[520px] overflow-hidden select-none transition-colors duration-300 ${
                  mapType === 'satellite'
                    ? 'bg-[#15231c]'
                    : mapType === 'terrain'
                    ? 'bg-[#eaf0e6]'
                    : 'bg-[#f4f1ea]'
                }`}
              >
                {/* Floating Google Maps Search & Commune Quick Selector */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
                  {/* Search Bar */}
                  <div className="bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 w-full sm:w-96 pointer-events-auto">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar dirección en Pto. Varas, Llanquihue, etc..."
                      value={simulatedAddress}
                      onChange={(e) => setSimulatedAddress(e.target.value)}
                      className="w-full bg-transparent text-slate-900 text-xs font-bold focus:outline-none placeholder:text-slate-400"
                    />
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-black text-[10px] shrink-0 border border-emerald-200">
                      {simulatedDistanceKm} km
                    </span>
                  </div>

                  {/* Commune Preset Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
                    {[
                      { name: 'Pto. Varas Centro', km: 2.5 },
                      { name: 'Llanquihue', km: 7.5 },
                      { name: 'Alerce Norte', km: 11.5 },
                      { name: 'Pto. Montt', km: 18.0 },
                      { name: 'Frutillar', km: 24.0 },
                      { name: 'Ensenada', km: 38.0 },
                    ].map((chip) => (
                      <button
                        key={chip.name}
                        type="button"
                        onClick={() => {
                          setSimulatedAddress(chip.name);
                          setSimulatedDistanceKm(chip.km);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-xs ${
                          simulatedDistanceKm === chip.km
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200 backdrop-blur-xs'
                        }`}
                      >
                        📍 {chip.name} ({chip.km} km)
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Radial Map */}
                <svg
                  viewBox="0 0 1000 620"
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{ transform: `scale(${mapZoomLevel})`, transformOrigin: '480px 340px' }}
                >
                  <defs>
                    <radialGradient id="hubRadarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0E8388" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#0E8388" stopOpacity="0" />
                    </radialGradient>
                    <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                    </filter>
                    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Grid Lines (Google Maps coordinates grid) */}
                  <g opacity={mapType === 'satellite' ? '0.1' : '0.25'} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 4">
                    <line x1="0" y1="120" x2="1000" y2="120" />
                    <line x1="0" y1="240" x2="1000" y2="240" />
                    <line x1="0" y1="360" x2="1000" y2="360" />
                    <line x1="0" y1="480" x2="1000" y2="480" />
                    <line x1="200" y1="0" x2="200" y2="620" />
                    <line x1="400" y1="0" x2="400" y2="620" />
                    <line x1="600" y1="0" x2="600" y2="620" />
                    <line x1="800" y1="0" x2="800" y2="620" />
                  </g>

                  {/* Topographic Background: Lago Llanquihue */}
                  <path
                    d="M 360,130 Q 420,95 530,115 T 720,180 T 780,270 Q 750,330 650,340 T 475,310 T 360,250 Z"
                    fill={mapType === 'satellite' ? '#0E334D' : '#A3D3F5'}
                    stroke={mapType === 'satellite' ? '#1E4B6E' : '#7CBFE6'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="560"
                    y="210"
                    fill={mapType === 'satellite' ? '#7BB2DD' : '#3B82B6'}
                    fontSize="14"
                    fontWeight="900"
                    fontStyle="italic"
                    letterSpacing="1"
                    textAnchor="middle"
                    opacity="0.85"
                  >
                    LAGO LLANQUIHUE
                  </text>

                  {/* Seno de Reloncaví (Puerto Montt) */}
                  <path
                    d="M 440,540 Q 520,510 620,530 T 800,580 L 800,620 L 300,620 Z"
                    fill={mapType === 'satellite' ? '#092336' : '#9DCDEB'}
                    stroke={mapType === 'satellite' ? '#183D5C' : '#7CBFE6'}
                    strokeWidth="2"
                  />
                  <text
                    x="560"
                    y="585"
                    fill={mapType === 'satellite' ? '#7BB2DD' : '#3B82B6'}
                    fontSize="12"
                    fontWeight="800"
                    fontStyle="italic"
                    textAnchor="middle"
                    opacity="0.8"
                  >
                    Seno de Reloncaví (Puerto Montt)
                  </text>

                  {/* Main Highways Network (Google Maps Style) */}
                  {/* Ruta 5 Sur (Dual Carriageway Orange Highway) */}
                  <path
                    d="M 330,50 Q 365,160 395,250 T 475,335 T 505,425 T 525,505"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 330,50 Q 365,160 395,250 T 475,335 T 505,425 T 525,505"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Route 5 Shield Marker */}
                  <g filter="url(#badgeShadow)">
                    <rect x="335" y="70" width="22" height="16" rx="4" fill="#0E8388" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="346" y="82" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">5</text>
                  </g>

                  {/* Ruta 225 a Ensenada */}
                  <path
                    d="M 475,335 Q 600,345 710,290"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 475,335 Q 600,345 710,290"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x="610" y="325" fill="#64748B" fontSize="9" fontWeight="800">
                    Ruta 225 (Ensenada)
                  </text>

                  {/* Ruta V-505 Puerto Varas - Alerce - Pto Montt */}
                  <path
                    d="M 475,335 Q 500,380 505,425 Q 515,465 525,505"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeDasharray="4 2"
                  />

                  {/* ========================================================= */}
                  {/* CONCENTRIC RADIAL DISTANCE RINGS (Centered at 480, 340)   */}
                  {/* ========================================================= */}

                  {/* Ring 4: > 35 km (Regional / Todo Chile) */}
                  <circle
                    cx="480"
                    cy="340"
                    r="275"
                    fill={hoveredMapZoneId === 'ZONE-04' ? 'rgba(139, 92, 246, 0.20)' : 'rgba(139, 92, 246, 0.08)'}
                    stroke="#8B5CF6"
                    strokeWidth={hoveredMapZoneId === 'ZONE-04' ? '3' : '2'}
                    strokeDasharray="6 4"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredMapZoneId('ZONE-04')}
                    onMouseLeave={() => setHoveredMapZoneId(null)}
                  />

                  {/* Ring 3: 18 to 35 km (Rural / Ensenada / Frutillar) */}
                  <circle
                    cx="480"
                    cy="340"
                    r="200"
                    fill={hoveredMapZoneId === 'ZONE-03' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.10)'}
                    stroke="#F59E0B"
                    strokeWidth={hoveredMapZoneId === 'ZONE-03' ? '3' : '2'}
                    strokeDasharray="6 4"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredMapZoneId('ZONE-03')}
                    onMouseLeave={() => setHoveredMapZoneId(null)}
                  />

                  {/* Ring 2: 5 to 18 km (Intercomunal Pto Varas - Pto Montt) */}
                  <circle
                    cx="480"
                    cy="340"
                    r="130"
                    fill={hoveredMapZoneId === 'ZONE-02' ? 'rgba(14, 131, 136, 0.25)' : 'rgba(14, 131, 136, 0.12)'}
                    stroke="#0E8388"
                    strokeWidth={hoveredMapZoneId === 'ZONE-02' ? '3' : '2'}
                    strokeDasharray="6 4"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredMapZoneId('ZONE-02')}
                    onMouseLeave={() => setHoveredMapZoneId(null)}
                  />

                  {/* Ring 1: 0 to 5 km (Radio Urbano Central) */}
                  <circle
                    cx="480"
                    cy="340"
                    r="60"
                    fill={hoveredMapZoneId === 'ZONE-01' ? 'rgba(16, 185, 129, 0.32)' : 'rgba(16, 185, 129, 0.18)'}
                    stroke="#10B981"
                    strokeWidth={hoveredMapZoneId === 'ZONE-01' ? '3.5' : '2.5'}
                    strokeDasharray="4 3"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredMapZoneId('ZONE-01')}
                    onMouseLeave={() => setHoveredMapZoneId(null)}
                  />

                  {/* ========================================================= */}
                  {/* CLEAN, NON-COLLIDING RADIAL DISTANCE BADGE LABELS         */}
                  {/* ========================================================= */}
                  {/* Zone 1 Badge: Top Right */}
                  <g filter="url(#badgeShadow)">
                    <rect x="525" y="275" width="125" height="22" rx="11" fill="#10B981" />
                    <text x="587" y="289" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                      🟢 0–5 km • $1.990
                    </text>
                  </g>

                  {/* Zone 2 Badge: Bottom Right */}
                  <g filter="url(#badgeShadow)">
                    <rect x="580" y="420" width="135" height="22" rx="11" fill="#0E8388" />
                    <text x="647" y="434" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                      🔵 5–18 km • $2.990
                    </text>
                  </g>

                  {/* Zone 3 Badge: Top Left */}
                  <g filter="url(#badgeShadow)">
                    <rect x="235" y="210" width="140" height="22" rx="11" fill="#F59E0B" />
                    <text x="305" y="224" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                      🟠 18–35 km • $4.990
                    </text>
                  </g>

                  {/* Zone 4 Badge: Perimeter Bottom Left */}
                  <g filter="url(#badgeShadow)">
                    <rect x="180" y="490" width="145" height="22" rx="11" fill="#8B5CF6" />
                    <text x="252" y="504" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                      🟣 &gt;35 km • $6.990
                    </text>
                  </g>

                  {/* ========================================================= */}
                  {/* LANDMARKS & CITIES ON MAP                                 */}
                  {/* ========================================================= */}

                  {/* Llanquihue (7.5 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Llanquihue Centro'); setSimulatedDistanceKm(7.5); }}>
                    <circle cx="400" cy="270" r="5" fill="#0E8388" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="390" y="265" fill="#0F172A" fontSize="11" fontWeight="800" textAnchor="end">Llanquihue (7.5 km)</text>
                  </g>

                  {/* Frutillar (24 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Frutillar Bajo'); setSimulatedDistanceKm(24); }}>
                    <circle cx="360" cy="170" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="350" y="165" fill="#0F172A" fontSize="11" fontWeight="800" textAnchor="end">Frutillar (24 km)</text>
                  </g>

                  {/* Alerce (11.5 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Alerce Norte'); setSimulatedDistanceKm(11.5); }}>
                    <circle cx="505" cy="425" r="5" fill="#0E8388" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="518" y="429" fill="#0F172A" fontSize="11" fontWeight="800">Alerce (11.5 km)</text>
                  </g>

                  {/* Puerto Montt (18 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Puerto Montt Costanera'); setSimulatedDistanceKm(18); }}>
                    <circle cx="525" cy="495" r="6" fill="#0E8388" stroke="#FFFFFF" strokeWidth="2.5" />
                    <text x="538" y="499" fill="#0F172A" fontSize="12" fontWeight="900">Puerto Montt (18 km)</text>
                  </g>

                  {/* Ensenada (38 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Ensenada / Ruta 225'); setSimulatedDistanceKm(38); }}>
                    <circle cx="710" cy="290" r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="722" y="294" fill="#0F172A" fontSize="11" fontWeight="800">Ensenada (38 km)</text>
                  </g>

                  {/* Volcán Osorno */}
                  <g>
                    <text x="780" y="170" fontSize="20" textAnchor="middle">🌋</text>
                    <text x="780" y="190" fill="#475569" fontSize="10" fontWeight="800" textAnchor="middle">Volcán Osorno (2.652m)</text>
                  </g>

                  {/* Volcán Calbuco */}
                  <g>
                    <text x="720" y="430" fontSize="18" textAnchor="middle">🌋</text>
                    <text x="720" y="448" fill="#475569" fontSize="10" fontWeight="800" textAnchor="middle">Volcán Calbuco (2.003m)</text>
                  </g>

                  {/* ========================================================= */}
                  {/* SIMULATED DYNAMIC VECTOR & DELIVERY VAN (🚚)              */}
                  {/* ========================================================= */}
                  {simulatedDistanceKm && (() => {
                    const angle = 0.785; // ~45 deg angle vector
                    const maxRadius = 275;
                    const clampedKm = Math.min(simulatedDistanceKm, 65);
                    const vectorLength = (clampedKm / 65) * maxRadius;
                    const targetX = 480 + Math.cos(angle) * vectorLength;
                    const targetY = 340 + Math.sin(angle) * vectorLength;
                    const midX = 480 + Math.cos(angle) * (vectorLength * 0.5);
                    const midY = 340 + Math.sin(angle) * (vectorLength * 0.5);

                    return (
                      <g>
                        {/* Dynamic Distance Vector Line */}
                        <line
                          x1="480"
                          y1="340"
                          x2={targetX}
                          y2={targetY}
                          stroke="#EF4444"
                          strokeWidth="3.5"
                          strokeDasharray="6 3"
                        />

                        {/* Animated Dispatch Van moving on route */}
                        <g transform={`translate(${midX - 12}, ${midY - 12})`}>
                          <circle cx="12" cy="12" r="14" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" shadow="drop" />
                          <text x="12" y="17" fontSize="13" textAnchor="middle">🚚</text>
                        </g>

                        {/* Destination Target Pin (Google Maps Red Marker) */}
                        <circle
                          cx={targetX}
                          cy={targetY}
                          r="16"
                          fill="#EF4444"
                          opacity="0.35"
                          className="animate-ping"
                        />
                        <circle
                          cx={targetX}
                          cy={targetY}
                          r="9"
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth="3"
                        />

                        {/* Floating InfoWindow Tooltip above target pin */}
                        <g filter="url(#shadowGlow)">
                          <rect
                            x={targetX - 90}
                            y={targetY - 55}
                            width="180"
                            height="44"
                            rx="14"
                            fill="#0F172A"
                          />
                          {/* Triangle pointer */}
                          <polygon
                            points={`${targetX - 6},${targetY - 11} ${targetX + 6},${targetY - 11} ${targetX},${targetY - 3}`}
                            fill="#0F172A"
                          />
                          <text x={targetX} y={targetY - 37} fill="#38BDF8" fontSize="10" fontWeight="900" textAnchor="middle">
                            📍 {simulatedAddress || 'Dirección de Entrega'}
                          </text>
                          <text x={targetX} y={targetY - 22} fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
                            {simulatedDistanceKm} km → Tarifa: {formatCLP(simulatedZoneResult.baseFee)}
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* ========================================================= */}
                  {/* CENTRAL HUB (BODEGA CENTRAL PUERTO VARAS - KM 0)          */}
                  {/* ========================================================= */}
                  <g filter="url(#shadowGlow)">
                    {/* Animated Radar Pulse */}
                    <circle cx="480" cy="340" r="22" fill="url(#hubRadarGlow)" className="animate-ping" opacity="0.8" />
                    {/* Central Marker */}
                    <circle cx="480" cy="340" r="10" fill="#0E8388" stroke="#FFFFFF" strokeWidth="3" />
                    <circle cx="480" cy="340" r="4" fill="#FFFFFF" />

                    {/* Central Badge */}
                    <rect x="405" y="356" width="150" height="24" rx="12" fill="#0E8388" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="480" y="372" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                      🏠 BODEGA CENTRAL (Km 0)
                    </text>
                  </g>
                </svg>

                {/* Google Maps Bottom Bar: Watermark + Legend */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 shadow-xs">
                  <span className="font-black text-slate-800 tracking-tighter text-xs">Google</span>
                  <span>•</span>
                  <span>Escala: 5 km | 10 km</span>
                  <span>•</span>
                  <span className="text-[10px] text-slate-400">Región de Los Lagos</span>
                </div>

                {/* Floating Map Legend Bar */}
                <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-md hidden sm:flex items-center gap-3 text-[11px] font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span>0–5 km ($1.990)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#0E8388]" />
                    <span>5–18 km ($2.990)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span>18–35 km ($4.990)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
                    <span>&gt;35 km ($6.990)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* VISUAL KILOMETER PROGRESSION RULER (REGLA LINEAL DE TARIFAS)        */}
            {/* =================================================================== */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Regla de Progresión Tarifaria por Kilómetros</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Cálculo 100% Automático
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    A mayor distancia desde la Bodega Central en Puerto Varas, el sistema asigna el tramo tarifario correspondiente.
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  Distancia Actual Seleccionada: <strong className="text-slate-900 font-black font-mono text-sm">{simulatedDistanceKm} km</strong>
                </div>
              </div>

              {/* Segmented Color Ruler */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {/* Tramo 1 */}
                  <div
                    onClick={() => setSimulatedDistanceKm(3.5)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      simulatedDistanceKm <= 5
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-[1.02]'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                      Tramo 1 (0 a 5 km)
                    </span>
                    <div className="text-lg font-black mt-0.5">$1.990</div>
                    <div className="text-[10px] font-medium mt-0.5">Urbano Puerto Varas</div>
                  </div>

                  {/* Tramo 2 */}
                  <div
                    onClick={() => setSimulatedDistanceKm(12)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      simulatedDistanceKm > 5 && simulatedDistanceKm <= 18
                        ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-md scale-[1.02]'
                        : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                      Tramo 2 (5 a 18 km)
                    </span>
                    <div className="text-lg font-black mt-0.5">$2.990</div>
                    <div className="text-[10px] font-medium mt-0.5">Pto. Montt, Llanquihue, Alerce</div>
                  </div>

                  {/* Tramo 3 */}
                  <div
                    onClick={() => setSimulatedDistanceKm(25)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      simulatedDistanceKm > 18 && simulatedDistanceKm <= 35
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                      Tramo 3 (18 a 35 km)
                    </span>
                    <div className="text-lg font-black mt-0.5">$4.990</div>
                    <div className="text-[10px] font-medium mt-0.5">Frutillar, Ensenada, Rural</div>
                  </div>

                  {/* Tramo 4 */}
                  <div
                    onClick={() => setSimulatedDistanceKm(50)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      simulatedDistanceKm > 35
                        ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-[1.02]'
                        : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                      Tramo 4 (&gt; 35 km)
                    </span>
                    <div className="text-lg font-black mt-0.5">$6.990</div>
                    <div className="text-[10px] font-medium mt-0.5">Regionales &amp; Todo Chile</div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SIMULADOR DE DISTANCIA & COTIZADOR DE TARIFA EN VIVO                */}
            {/* =================================================================== */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#0E8388]/20 blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0E8388] text-white text-[10px] font-black uppercase tracking-wider">
                      Simulador en Tiempo Real
                    </span>
                    <h3 className="text-xl font-black text-white">Calculadora Dinámica de Tarifa por Kilómetros</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Mueve el control deslizante de kilómetros para simular al instante el costo de envío que se cobrará al cliente.
                  </p>
                </div>
              </div>

              {/* Slider & Address Input */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Distance Range Slider */}
                <div className="lg:col-span-7 space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Distancia Radial desde Bodega Central:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {simulatedDistanceKm} km
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {simulatedZoneResult.name}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="65"
                    step="0.5"
                    value={simulatedDistanceKm}
                    onChange={(e) => setSimulatedDistanceKm(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span className={simulatedDistanceKm <= 5 ? 'text-emerald-400 font-bold' : ''}>0–5 km ($1.990)</span>
                    <span className={simulatedDistanceKm > 5 && simulatedDistanceKm <= 18 ? 'text-blue-400 font-bold' : ''}>5–18 km ($2.990)</span>
                    <span className={simulatedDistanceKm > 18 && simulatedDistanceKm <= 35 ? 'text-amber-400 font-bold' : ''}>18–35 km ($4.990)</span>
                    <span className={simulatedDistanceKm > 35 ? 'text-purple-400 font-bold' : ''}>&gt;35 km ($6.990)</span>
                  </div>
                </div>

                {/* Calculation Result Card */}
                <div className="lg:col-span-5 bg-gradient-to-tr from-[#0E8388] to-[#10B981] rounded-2xl p-5 shadow-lg space-y-2 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md">
                      Resultado de Cotización
                    </span>
                    <span className="font-bold text-xs">{simulatedZoneResult.badgeText}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-black leading-snug">{simulatedZoneResult.name}</h4>
                    <p className="text-[11px] text-emerald-100 mt-0.5">{simulatedZoneResult.coverage}</p>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-100 block">Tarifa Despacho</span>
                      <span className="text-2xl font-black font-mono">{formatCLP(simulatedZoneResult.baseFee)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-100 block">Envío Gratis desde</span>
                      <span className="text-sm font-black">{formatCLP(simulatedZoneResult.freeThreshold)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* ZONAS RADIALES CONFIGURADAS & TARIFARIO POR DISTANCIA (CARDS)       */}
            {/* =================================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Zonas Radiales & Tarifario por Distancia</h3>
                <span className="text-xs text-slate-500 font-medium">Haz clic en el lápiz para modificar valores o radios en km</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dispatchZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`bg-white border rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                      hoveredMapZoneId === zone.id
                        ? 'border-2 border-[#0E8388] ring-2 ring-[#0E8388]/20'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="w-4 h-4 rounded-full mt-1 shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-base">{zone.name}</h4>
                            <span
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: zone.bgColor, color: zone.color }}
                            >
                              {zone.badgeText}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{zone.coverage}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingZone(zone)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                        title="Editar Tarifa & Radio"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Radio de Cobertura:</span>
                        <span className="font-mono font-black text-slate-900">
                          {zone.radiusMinKm} km a {zone.radiusMaxKm} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Tarifa Base:</span>
                        <span className="font-black text-slate-900 text-sm">{formatCLP(zone.baseFee)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Envío Gratis desde:</span>
                        <span className="font-bold text-emerald-700">{formatCLP(zone.freeThreshold)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Tiempo de Entrega:</span>
                        <span className="font-semibold text-slate-700">{zone.deliveryTime}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/80 text-[11px] text-purple-800 font-medium">
                        <strong>Beneficio Convenio:</strong> {zone.partnerSpecialFee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: DETALLE DE PEDIDO (Light Design)                                */}
      {/* ========================================================================= */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-[#0E8388] border border-emerald-100">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Detalle de Pedido {selectedOrderModal.id}</h3>
                  <p className="text-xs text-slate-500">{selectedOrderModal.date} a las {selectedOrderModal.time}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Pet Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Tutor & Contacto</span>
                <div className="font-bold text-slate-900 text-sm">{selectedOrderModal.customer}</div>
                <div className="text-slate-600">{selectedOrderModal.email}</div>
                <div className="text-slate-600">{selectedOrderModal.phone}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Mascota Destinataria</span>
                <div className="font-bold text-[#0E8388] text-sm flex items-center gap-1.5">
                  <span>{selectedOrderModal.petType?.toLowerCase().includes('gato') || selectedOrderModal.petType?.includes('🐱') ? '🐱' : '🐶'}</span>
                  <span>{selectedOrderModal.petName}</span>
                </div>
                <div className="text-slate-600">{selectedOrderModal.petBreed}</div>
                <div className="text-slate-500 font-mono text-[10px]">Tracking: {selectedOrderModal.tracking}</div>
              </div>
            </div>

            {/* Address & Delivery Zone */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Dirección de Entrega</span>
              <div className="font-bold text-slate-900">{selectedOrderModal.address}</div>
              <div className="text-slate-600 font-medium">{selectedOrderModal.deliveryZone}</div>
              {selectedOrderModal.notes && (
                <div className="text-amber-800 text-[11px] pt-1">
                  <strong>Nota del cliente:</strong> "{selectedOrderModal.notes}"
                </div>
              )}
            </div>

            {/* Items Breakdown with Product Images */}
            <div className="space-y-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Productos Comprados (Clic para ver imagen grande)</span>
              <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {selectedOrderModal.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedProductPreview({
                      ...item,
                      orderId: selectedOrderModal.id,
                      customer: selectedOrderModal.customer,
                      petName: selectedOrderModal.petName,
                      petType: selectedOrderModal.petType,
                      tracking: selectedOrderModal.tracking,
                    })}
                    className="p-3 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    title="Clic para ver foto ampliada del producto"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-xs">
                        <img
                          src={getProductImage(item.name)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-[#0E8388] transition-colors">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">{item.weight}</span>
                          <span>SKU: {item.code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900">{item.quantity} x {formatCLP(item.price)}</div>
                      <span className="text-[10px] text-[#0E8388] font-bold group-hover:underline">Ver foto 🔍</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Productos:</span>
                <span className="font-mono text-slate-900 font-bold">{formatCLP(selectedOrderModal.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de Despacho:</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {selectedOrderModal.shippingCost === 0 ? 'GRATIS' : formatCLP(selectedOrderModal.shippingCost)}
                </span>
              </div>
              {selectedOrderModal.agreementUsed && (
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>Convenio Aplicado:</span>
                  <span>{selectedOrderModal.agreementUsed}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Pagado:</span>
                <span className="text-[#0E8388]">{formatCLP(selectedOrderModal.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, 'en_preparacion')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedOrderModal.status === 'en_preparacion'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  En Preparación
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, 'en_camino')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedOrderModal.status === 'en_camino'
                      ? 'bg-blue-600 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  En Camino 🚚
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, 'entregado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedOrderModal.status === 'entregado'
                      ? 'bg-emerald-600 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Entregado ✓
                </button>
              </div>

              <button
                onClick={() => showToast(`Imprimiendo Guía & Boleta ${selectedOrderModal.invoiceNumber}...`)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Imprimir Boleta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FICHA CLINICA / CRM CLIENTE (Light Design)                      */}
      {/* ========================================================================= */}
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E8388] to-[#10B981] text-white font-black text-xl flex items-center justify-center shadow-xs">
                  {selectedCustomerModal.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedCustomerModal.name}</h3>
                  <p className="text-xs text-slate-500">
                    Cliente desde {selectedCustomerModal.registrationDate} • {selectedCustomerModal.city}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pet Full File */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCustomerModal.pet.type === 'perro' ? '🐶' : '🐱'}</span>
                  <div>
                    <h4 className="text-base font-black text-slate-900">{selectedCustomerModal.pet.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{selectedCustomerModal.pet.breed} • {selectedCustomerModal.pet.age}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                    Peso: {selectedCustomerModal.pet.weight}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Esterilizado: {selectedCustomerModal.pet.sterilized}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Alimento Habitual</span>
                  <span className="font-semibold text-slate-900">{selectedCustomerModal.pet.favoriteFood}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Consumo & Duración</span>
                  <span className="font-semibold text-slate-900">{selectedCustomerModal.pet.bagDurationDays} días por bolsa</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Vacunas</span>
                  <span className="font-semibold text-emerald-700">{selectedCustomerModal.pet.vaccines}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Desparasitación</span>
                  <span className="font-semibold text-emerald-700">{selectedCustomerModal.pet.deworming}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Clínica de Cabecera</span>
                  <span className="font-semibold text-purple-700">{selectedCustomerModal.pet.vetClinic}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Alergias / Sensibilidades</span>
                  <span className="font-semibold text-amber-700">{selectedCustomerModal.pet.allergies}</span>
                </div>
              </div>

              {selectedCustomerModal.pet.notes && (
                <div className="p-3 rounded-xl bg-white text-xs text-slate-700 border border-slate-200">
                  <strong className="text-slate-500">Observaciones Clínicas:</strong> {selectedCustomerModal.pet.notes}
                </div>
              )}
            </div>

            {/* Quick Contact buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => showToast(`Iniciando contacto WhatsApp con ${selectedCustomerModal.name}...`)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contactar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREAR CONVENIO NUEVO (Light Design)                             */}
      {/* ========================================================================= */}
      {isAddAgreementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Nuevo Convenio Institucional 🤝</h3>
              <button
                onClick={() => setIsAddAgreementModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConvenio} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Nombre de la Entidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Clínica Veterinaria Puerto Varas"
                  value={newAgreement.name}
                  onChange={(e) => setNewAgreement({ ...newAgreement, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Tipo de Aliado</label>
                  <select
                    value={newAgreement.type}
                    onChange={(e) => setNewAgreement({ ...newAgreement, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  >
                    <option value="veterinaria">🏥 Clínica Veterinaria</option>
                    <option value="entrenamiento">🐕 Adiestramiento / K9</option>
                    <option value="peluqueria">✂️ Peluquería & Spa</option>
                    <option value="guarderia">🏡 Guardería & Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Código Promocional</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: CONV-VET-PV"
                    value={newAgreement.code}
                    onChange={(e) => setNewAgreement({ ...newAgreement, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-mono font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Contacto / Encargado</label>
                  <input
                    type="text"
                    placeholder="Dr. Juan Pérez"
                    value={newAgreement.contactPerson}
                    onChange={(e) => setNewAgreement({ ...newAgreement, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+56 9 1234 5678"
                    value={newAgreement.phone}
                    onChange={(e) => setNewAgreement({ ...newAgreement, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Beneficio para el Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 10% Descuento en Alimentos Medicados + Despacho Prioritario"
                  value={newAgreement.benefitCustomer}
                  onChange={(e) => setNewAgreement({ ...newAgreement, benefitCustomer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAgreementModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-bold shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer"
                >
                  Guardar Convenio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INGRESAR FACTURA & STOCK (Light Design)                         */}
      {/* ========================================================================= */}
      {isAddInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Ingreso de Factura & Stock 📦</h3>
                <p className="text-xs text-slate-500 font-medium">Asocia la factura tributaria a la mercadería recibida</p>
              </div>
              <button
                onClick={() => setIsAddInvoiceModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">N° de Factura Compra</label>
                  <input
                    type="text"
                    required
                    placeholder="FAC-2026-9042"
                    value={newInvoiceForm.invoiceNumber}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-mono font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Fecha Emisión Factura</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceForm.date}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Proveedor</label>
                  <input
                    type="text"
                    placeholder="Distribuidora Bravery Chile"
                    value={newInvoiceForm.provider}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">RUT Proveedor</label>
                  <input
                    type="text"
                    placeholder="76.452.190-3"
                    value={newInvoiceForm.providerRut}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, providerRut: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Producto Recibido</label>
                <input
                  type="text"
                  required
                  placeholder="Bravery Salmón Adulto 12kg"
                  value={newInvoiceForm.productName}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, productName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Cantidad (Unidades)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInvoiceForm.quantityReceived}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, quantityReceived: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Costo Unit. Neto ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newInvoiceForm.unitCostNeto}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, unitCostNeto: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">PVP Venta ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newInvoiceForm.salePrice}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, salePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-mono font-black focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-bold shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer"
                >
                  Guardar Factura & Cargar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDITAR ZONA DE DESPACHO (Light Design)                          */}
      {/* ========================================================================= */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Editar Tarifa de Despacho 🚚</h3>
              <button
                onClick={() => setEditingZone(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZoneEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Nombre de la Zona</label>
                <input
                  type="text"
                  required
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Radio Mínimo (km)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingZone.radiusMinKm ?? 0}
                    onChange={(e) => setEditingZone({ ...editingZone, radiusMinKm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Radio Máximo (km)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingZone.radiusMaxKm ?? 20}
                    onChange={(e) => setEditingZone({ ...editingZone, radiusMaxKm: parseFloat(e.target.value) || 20 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-mono font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Tarifa Base ($ CLP)</label>
                  <input
                    type="number"
                    required
                    value={editingZone.baseFee}
                    onChange={(e) => setEditingZone({ ...editingZone, baseFee: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-black focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Envío Gratis Sobre ($ CLP)</label>
                  <input
                    type="number"
                    required
                    value={editingZone.freeThreshold}
                    onChange={(e) => setEditingZone({ ...editingZone, freeThreshold: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-black focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Tiempo de Entrega</label>
                <input
                  type="text"
                  value={editingZone.deliveryTime}
                  onChange={(e) => setEditingZone({ ...editingZone, deliveryTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Regla Especial de Convenio</label>
                <input
                  type="text"
                  value={editingZone.partnerSpecialFee}
                  onChange={(e) => setEditingZone({ ...editingZone, partnerSpecialFee: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-purple-700 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-bold shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer"
                >
                  Actualizar Tarifa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: PLANIFICADOR DE REPOSICIÓN PREDICTIVA DE ALIMENTOS */}
      {/* ======================================================= */}
      {isReplenishmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">Planificador Predictivo de Reposición</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      Nutrición & Consumo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Monitoreo automático de días restantes de alimento según peso, ración diaria y fecha de última compra
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReplenishmentModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Counters & Filter Bar */}
            <div className="p-5 bg-slate-50/80 border-b border-slate-100 space-y-4 shrink-0">
              {/* Metric Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">🔴 Nivel Crítico (&lt; 5 días)</span>
                    <span className="text-lg font-black text-rose-900">2 Mascotas</span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-white px-2 py-1 rounded-xl shadow-xs">Kira, Rocky</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">🟡 Atención Próxima (&lt; 15 días)</span>
                    <span className="text-lg font-black text-amber-900">1 Mascota</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-white px-2 py-1 rounded-xl shadow-xs">Luna</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">🟢 Stock Óptimo (&gt; 15 días)</span>
                    <span className="text-lg font-black text-emerald-900">2 Mascotas</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-xl shadow-xs">Jack, Milo</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
                  {[
                    { id: 'criticos', label: '⚠️ Solo Críticos (< 5 días)' },
                    { id: 'proximos', label: '🟡 Próximos 15 días' },
                    { id: 'todos', label: 'Todos los Tutores (5)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReplenishmentFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        replenishmentFilter === tab.id
                          ? 'bg-[#0E8388] text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-500 font-semibold">
                  Mostrando clientes calculados con IA nutricional
                </span>
              </div>
            </div>

            {/* List of Customers and Food to Replenish */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {customers
                .filter((cust) => {
                  if (replenishmentFilter === 'criticos') return (cust.pet?.daysRemaining || 30) <= 5;
                  if (replenishmentFilter === 'proximos') return (cust.pet?.daysRemaining || 30) <= 15;
                  return true;
                })
                .map((cust) => {
                  const days = cust.pet?.daysRemaining || 30;
                  const isCritical = days <= 5;
                  const isWarning = days > 5 && days <= 15;
                  const totalDays = cust.pet?.bagDurationDays || 30;
                  const consumedPercent = Math.min(100, Math.round(((totalDays - days) / totalDays) * 100));

                  // Calculate estimated run-out date
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() + days);
                  const formattedTargetDate = new Intl.DateTimeFormat('es-CL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  }).format(targetDate);

                  return (
                    <div
                      key={cust.id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isCritical
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-xs'
                          : isWarning
                          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Pet & Food Highlight */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                            {cust.pet?.type === 'perro' ? '🐶' : '🐱'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-slate-900">
                                {cust.pet?.name}{' '}
                                <span className="text-xs font-semibold text-slate-500">
                                  ({cust.pet?.breed} • {cust.pet?.weight})
                                </span>
                              </h4>
                              {isCritical && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                  ⚠️ Reposición Urgente
                                </span>
                              )}
                              {isWarning && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                  🟡 Atención Próxima
                                </span>
                              )}
                            </div>

                            {/* Food SKU Info */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-extrabold text-[#0E8388] bg-[#0E8388]/10 px-2.5 py-0.5 rounded-lg border border-[#0E8388]/20 flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" />
                                <span>{cust.pet?.favoriteFood}</span>
                              </span>
                              <span className="text-slate-500 font-medium">
                                Formato para {totalDays} días
                              </span>
                            </div>

                            {/* Tutor Info */}
                            <div className="text-xs text-slate-600 flex items-center gap-3 pt-1 flex-wrap font-medium">
                              <span><strong>Tutor:</strong> {cust.name}</span>
                              <span>•</span>
                              <span><strong>Ciudad:</strong> {cust.city}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">{cust.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Consumption Countdown & Runout Date */}
                        <div className="md:text-right space-y-1.5 shrink-0">
                          <div className="flex md:justify-end items-baseline gap-1.5">
                            <span className="text-xs text-slate-500 font-bold">Le quedan:</span>
                            <span
                              className={`text-xl font-black ${
                                isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {days} {days === 1 ? 'día' : 'días'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            Se agota aprox.: <strong className="text-slate-900">{formattedTargetDate}</strong>
                          </div>

                          {/* Progress Bar of Consumption */}
                          <div className="w-44 h-2.5 rounded-full bg-slate-200 overflow-hidden ml-auto">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : isWarning
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${consumedPercent}%` }}
                              title={`${consumedPercent}% consumido`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">{consumedPercent}% de la bolsa consumida</span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-xs text-slate-500 font-medium">
                          Clínica habitual: <strong className="text-slate-800">{cust.pet?.vetClinic || 'Convenio Local'}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const msg = `¡Hola ${cust.name}! Te escribimos con cariño desde Patitas del Sur 🐾. Calculamos que a ${cust.pet?.name} le quedan aproximadamente ${days} días de su alimento "${cust.pet?.favoriteFood}". ¿Te gustaría que te programemos el despacho a ${cust.city} para que no se quede sin su comida? Tienes tu 10% de descuento habitual activo ✨. ¡Avísanos y lo preparamos de inmediato!`;
                              navigator.clipboard?.writeText?.(msg);
                              showToast(`¡Mensaje para ${cust.name} copiado al portapapeles y listo para WhatsApp!`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Enviar Recordatorio WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Generando orden de reposición de "${cust.pet?.favoriteFood}" para ${cust.name}...`);
                              setActiveTab('pedidos');
                              setIsReplenishmentModalOpen(false);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Crear Pedido de Reposición</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomerModal(cust);
                            }}
                            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Ver ficha médica/nutricional completa"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                💡 <strong>Consejo Patitas del Sur:</strong> Enviar el recordatorio con 4 días de anticipación aumenta la tasa de recompra recurrente en un <strong>42%</strong>.
              </span>
              <button
                type="button"
                onClick={() => setIsReplenishmentModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Cerrar Planificador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: VISTA PREVIA DEL PRODUCTO CON FOTO REAL         */}
      {/* ======================================================= */}
      {selectedProductPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Pop-up Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Detalle Visual del Producto</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Código: {selectedProductPreview.code || 'SKU-PATITAS'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductPreview(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop-up Content */}
            <div className="p-6 space-y-5">
              {/* Product Image Container */}
              <div className="w-full h-56 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200 p-4 flex items-center justify-center relative group overflow-hidden">
                <img
                  src={getProductImage(selectedProductPreview.name)}
                  alt={selectedProductPreview.name}
                  className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#0E8388] border border-slate-200 shadow-xs">
                  {selectedProductPreview.weight || 'Formato Original'}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs">
                  {selectedProductPreview.quantity} unidad(es) en pedido
                </span>
              </div>

              {/* Product Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0E8388] tracking-wider block">
                    {selectedProductPreview.name.toLowerCase().includes('bravery') ? 'Línea Bravery Super Premium 100% Grain Free' : 'Patitas del Sur Selección Premium'}
                  </span>
                  <h4 className="text-lg font-black text-slate-900 leading-snug">
                    {selectedProductPreview.name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Precio Unitario</span>
                    <span className="text-sm font-black text-slate-900">{formatCLP(selectedProductPreview.price)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-0.5">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total Ítem</span>
                    <span className="text-sm font-black text-emerald-800">
                      {formatCLP((selectedProductPreview.price || 0) * (selectedProductPreview.quantity || 1))}
                    </span>
                  </div>
                </div>

                {/* Associated Order info if available */}
                {selectedProductPreview.orderId && (
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                    <div className="flex items-center justify-between text-blue-900 font-bold text-[11px]">
                      <span>Asociado al Pedido {selectedProductPreview.orderId}</span>
                      <span className="font-mono">{selectedProductPreview.tracking || ''}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Tutor: <strong>{selectedProductPreview.customer}</strong> • Mascota: <strong>{selectedProductPreview.petName}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pop-up Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedProductPreview(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white font-black text-xs shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer text-center"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: HISTORIAL DE FACTURAS Y PROVEEDORES POR SKU     */}
      {/* ======================================================= */}
      {selectedProductInvoicesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Historial de Facturas & Proveedores</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SKU: {selectedProductInvoicesModal.sku} • {selectedProductInvoicesModal.format}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductInvoicesModal(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Product Header Strip */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={getProductImage(selectedProductInvoicesModal.name)}
                  alt={selectedProductInvoicesModal.name}
                  className="w-14 h-14 object-contain bg-white rounded-xl border border-slate-200 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#0E8388] tracking-wider block">
                    {selectedProductInvoicesModal.brand}
                  </span>
                  <h4 className="font-black text-slate-900 text-sm truncate">
                    {selectedProductInvoicesModal.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                    <span>Stock Actual: <strong className="text-slate-900 font-black">{selectedProductInvoicesModal.stock} u.</strong></span>
                    <span>PVP: <strong className="text-slate-900 font-black">{formatCLP(selectedProductInvoicesModal.salePrice)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Facturas de Compra Registradas ({(selectedProductInvoicesModal.invoices || []).length || 1})
                  </h5>
                  <span className="text-[11px] text-emerald-700 font-bold">100% Respaldado Tributariamente</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {(
                    selectedProductInvoicesModal.invoices || [
                      {
                        invoiceNumber: selectedProductInvoicesModal.invoiceNumber,
                        invoiceDate: selectedProductInvoicesModal.invoiceDate,
                        provider: selectedProductInvoicesModal.provider,
                        providerRut: selectedProductInvoicesModal.providerRut,
                        quantity: selectedProductInvoicesModal.stock,
                        unitCostNeto: selectedProductInvoicesModal.unitCostNeto,
                      },
                    ]
                  ).map((inv, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-mono font-black text-xs">
                            <FileText className="w-3 h-3 text-blue-700" />
                            <span>{inv.invoiceNumber}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{inv.invoiceDate || 'Reciente'}</span>
                        </div>
                        <div className="font-bold text-slate-800">{inv.provider}</div>
                        <div className="text-[10px] text-slate-400 font-mono">RUT: {inv.providerRut || '76.452.190-3'}</div>
                      </div>

                      <div className="sm:text-right space-y-0.5 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                        <div className="text-slate-500 text-[11px]">
                          Unidades recibidas: <strong className="text-slate-900 font-black">{inv.quantity || 10} u.</strong>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Costo Unit. Neto: <strong className="text-slate-900 font-black">{formatCLP(inv.unitCostNeto || selectedProductInvoicesModal.unitCostNeto)}</strong>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">
                          Subtotal Lote: {formatCLP((inv.quantity || 10) * (inv.unitCostNeto || selectedProductInvoicesModal.unitCostNeto))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const prod = selectedProductInvoicesModal;
                  setSelectedProductInvoicesModal(null);
                  setNewInvoiceForm((prev) => ({
                    ...prev,
                    productName: prod.name,
                    format: prod.format,
                    unitCostNeto: prod.unitCostNeto,
                    salePrice: prod.salePrice,
                    provider: prod.provider,
                    providerRut: prod.providerRut,
                  }));
                  setIsAddInvoiceModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Nueva Factura / Proveedor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProductInvoicesModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: CONFIGURACIÓN DE MERCADO PAGO                   */}
      {/* ======================================================= */}
      {isMercadoPagoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Configuración de Mercado Pago</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ajusta los cobros por venta con tarjeta y botón de pago
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMercadoPagoModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsMercadoPagoModalOpen(false);
                showToast(`Parámetros de Mercado Pago actualizados (${mercadoPagoConfig.commissionRatePercent}% + $${mercadoPagoConfig.fixedFeeCLP} CLP).`);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Comisión Variable (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="15"
                      value={mercadoPagoConfig.commissionRatePercent}
                      onChange={(e) =>
                        setMercadoPagoConfig((prev) => ({
                          ...prev,
                          commissionRatePercent: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Estándar Chile: 3.19%</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Costo Fijo por Cobro ($ CLP)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={mercadoPagoConfig.fixedFeeCLP}
                      onChange={(e) =>
                        setMercadoPagoConfig((prev) => ({
                          ...prev,
                          fixedFeeCLP: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">CLP</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Cargo fijo por transacción</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    IVA sobre Comisión (%)
                  </label>
                  <input
                    type="number"
                    value={mercadoPagoConfig.ivaPercent}
                    onChange={(e) =>
                      setMercadoPagoConfig((prev) => ({
                        ...prev,
                        ivaPercent: parseInt(e.target.value, 10) || 19,
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">19% IVA tributario Chile</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Plazo de Acreditación
                  </label>
                  <select
                    value={mercadoPagoConfig.payoutSchedule}
                    onChange={(e) =>
                      setMercadoPagoConfig((prev) => ({
                        ...prev,
                        payoutSchedule: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                  >
                    <option value="instant">Inmediata (Recomendado)</option>
                    <option value="14_days">14 Días (Menor comisión)</option>
                    <option value="30_days">30 Días</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">Disponibilidad en cuenta</span>
                </div>
              </div>

              {/* Simulation Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
                <div className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                  <span>Simulación en una venta de $45.000 CLP:</span>
                  <span className="font-mono text-emerald-700">
                    Neto a recibir: {formatCLP(45000 - Math.round(((45000 * (mercadoPagoConfig.commissionRatePercent / 100)) + (mercadoPagoConfig.fixedFeeCLP || 0)) * (1 + (mercadoPagoConfig.ivaPercent || 19) / 100)))}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5">
                  <div>• Comisión variable: -{formatCLP(Math.round(45000 * (mercadoPagoConfig.commissionRatePercent / 100)))}</div>
                  <div>• Cargo fijo: -{formatCLP(mercadoPagoConfig.fixedFeeCLP || 0)}</div>
                  <div>• Total retenido con IVA: -{formatCLP(Math.round(((45000 * (mercadoPagoConfig.commissionRatePercent / 100)) + (mercadoPagoConfig.fixedFeeCLP || 0)) * (1 + (mercadoPagoConfig.ivaPercent || 19) / 100)))}</div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMercadoPagoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: REGISTRAR NUEVO GASTO / BOLETA OPERACIONAL      */}
      {/* ======================================================= */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Registrar Gasto Operacional</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ingresa boletas de combustible, insumos, packaging o arriendos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  Categoría del Gasto
                </label>
                <select
                  value={newExpenseForm.category}
                  onChange={(e) =>
                    setNewExpenseForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                >
                  <option value="combustible">⛽ Combustible & Bencina de Reparto</option>
                  <option value="packaging">📦 Packaging, Cajas & Bolsas Kraft</option>
                  <option value="fijo">🏬 Arriendo Bodega & Gastos Fijos</option>
                  <option value="mantenimiento">🔧 Mantenimiento de Vehículo</option>
                  <option value="servicios">📶 Servicios Básicos & Conectividad</option>
                  <option value="otros">💼 Otros Gastos Operativos</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  Descripción del Gasto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carga Bencina 95 - Furgón Ruta Llanquihue"
                  value={newExpenseForm.description}
                  onChange={(e) =>
                    setNewExpenseForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Proveedor / Comercio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Copec San Francisco"
                    value={newExpenseForm.provider}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({ ...prev, provider: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    N° Boleta / Factura
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: BOL-COP-8910"
                    value={newExpenseForm.documentNumber}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({ ...prev, documentNumber: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Fecha del Gasto
                  </label>
                  <input
                    type="date"
                    value={newExpenseForm.date}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Monto Total ($ CLP)
                  </label>
                  <input
                    type="number"
                    step="500"
                    placeholder="Ej: 35000"
                    value={newExpenseForm.amount}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  Medio de Pago Utilizado
                </label>
                <select
                  value={newExpenseForm.paymentMethod}
                  onChange={(e) =>
                    setNewExpenseForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                >
                  <option value="Tarjeta Débito Banco Santander">Tarjeta Débito Banco Santander</option>
                  <option value="Tarjeta Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia Bancaria BCI">Transferencia Bancaria BCI</option>
                  <option value="Efectivo Caja Chica">Efectivo Caja Chica</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Gasto en Finanzas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
