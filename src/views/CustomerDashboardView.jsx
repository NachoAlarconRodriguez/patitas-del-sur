import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Store,
  Package,
  Award,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Minus,
  X,
  Check,
  Utensils,
  Stethoscope,
  Syringe,
  Pill,
  UserCheck,
  Search,
  Calendar,
  Filter,
  RotateCcw,
  Truck,
  Dumbbell,
  Scale,
  Layers,
  Bone,
} from 'lucide-react';
import { PRODUCTS, BRANDS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import PromoCarousel from '../components/PromoCarousel';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomDropdown from '../components/CustomDropdown';

export default function CustomerDashboardView({ user, onLogout, onAddToCart, onSelectProduct }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mascotas'); // 'mascotas' | 'compras' | 'tienda'
  const [storeFilter, setStoreFilter] = useState('todos'); // 'todos' | 'perro' | 'gato'
  
  // Modal for adding a new pet (Multi-step Wizard)
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [petStep, setPetStep] = useState(1); // 1: Especie | 2: Info Mascota | 3: Alimento Habitual
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState('perro');
  const [newPetBirthdate, setNewPetBirthdate] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('');
  const [newPetSterilized, setNewPetSterilized] = useState('si');
  const [newPetFoodSearch, setNewPetFoodSearch] = useState('');
  const [newPetFood, setNewPetFood] = useState('Bravery Cordero Adulto Raza Mediana / Grande 12kg');
  const [isCustomFood, setIsCustomFood] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [newPetDuration, setNewPetDuration] = useState('30');

  // Calculate age from ISO birthdate (YYYY-MM-DD)
  const calculateAgeFromBirthdate = (isoDate) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return '';
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);
    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return '';

    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const m = today.getMonth() + 1 - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return age >= 0 ? `${age}` : '0';
  };

  const handleBirthdateChange = (isoDate) => {
    setNewPetBirthdate(isoDate);
    const calculatedAge = calculateAgeFromBirthdate(isoDate);
    setNewPetAge(calculatedAge);
  };

  const handleAgeChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setNewPetAge(rawVal);
    if (rawVal) {
      const ageNum = parseInt(rawVal, 10);
      const today = new Date();
      const targetYear = today.getFullYear() - ageNum;
      const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
      const formattedDay = String(today.getDate()).padStart(2, '0');
      const calculatedIso = `${targetYear}-${formattedMonth}-${formattedDay}`;
      setNewPetBirthdate(calculatedIso);
    } else {
      setNewPetBirthdate('');
    }
  };

  // Modal for Pet Health Log (Bitácora de Salud)
  const [selectedHealthPet, setSelectedHealthPet] = useState(null);
  const [logCategoryFilter, setLogCategoryFilter] = useState('vacunas'); // 'vacunas' | 'antiparasitario' | 'consulta'

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Format Date object to Spanish string e.g. "18 de Agosto 2026"
  const formatDateToSpanish = (d = new Date()) => {
    return `${d.getDate()} de ${MONTH_NAMES_ES[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Helper to parse Spanish date or ISO string into Date object
  const parseSpanishOrIsoDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) return dateStr;

    const valStr = String(dateStr).trim();

    // Check Spanish string "18 de Agosto 2026"
    const match = valStr.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+(\d{4})/i);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2].toLowerCase();
      const year = parseInt(match[3], 10);
      const mIdx = MONTH_NAMES_ES.findIndex(m => m.toLowerCase() === monthName);
      if (mIdx !== -1) {
        return new Date(year, mIdx, day);
      }
    }

    // Check ISO YYYY-MM-DD
    if (valStr.includes('-')) {
      const parts = valStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }

    const fallback = new Date(valStr);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  // Helper to compute next due date in Spanish relative to selected application date
  const calculateNextDueDate = (months = 12, baseDate = null) => {
    const m = parseInt(months, 10) || 12;
    const base = parseSpanishOrIsoDate(baseDate || newLogDate);
    const target = new Date(base.getFullYear(), base.getMonth() + m, base.getDate());
    return `${target.getDate()} de ${MONTH_NAMES_ES[target.getMonth()]} ${target.getFullYear()}`;
  };

  // New Log Entry Form State
  const todaySpanish = formatDateToSpanish(new Date());
  const [isAddLogFormOpen, setIsAddLogFormOpen] = useState(false);
  const [newLogCategory, setNewLogCategory] = useState('vacunas');
  const [newLogTitle, setNewLogTitle] = useState('Vacuna Séxtuple Canina (DHPPI+L)');
  const [newLogDate, setNewLogDate] = useState(todaySpanish);
  const [newLogFrequency, setNewLogFrequency] = useState('12'); // meses
  const [newLogNextDue, setNewLogNextDue] = useState(calculateNextDueDate(12, todaySpanish));
  const [newLogReminder, setNewLogReminder] = useState(true);
  const [isCustomVaccine, setIsCustomVaccine] = useState(false);
  const [customVaccineName, setCustomVaccineName] = useState('');
  const [selectedAntiparasiticId, setSelectedAntiparasiticId] = useState('nexgard-spectra-dog');
  const [isCustomAntiparasitic, setIsCustomAntiparasitic] = useState(false);
  const [customAntiparasiticName, setCustomAntiparasiticName] = useState('');
  const [newLogVetName, setNewLogVetName] = useState('Dr. Matías Morales');
  const [newLogNotes, setNewLogNotes] = useState('');

  // Accordion state for Health Log items
  const [expandedLogIds, setExpandedLogIds] = useState({});

  const toggleLogExpand = (id) => {
    setExpandedLogIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to determine status (Al Día vs Atrasada)
  const getLogStatus = (log) => {
    if (!log.nextDueDate) {
      return {
        label: 'Al Día',
        isOverdue: false,
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        Icon: CheckCircle2,
      };
    }
    const nextDate = parseSpanishOrIsoDate(log.nextDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    const isOverdue = nextDate < today;
    if (isOverdue) {
      return {
        label: 'Atrasado',
        isOverdue: true,
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        Icon: AlertTriangle,
      };
    }
    return {
      label: 'Al Día',
      isOverdue: false,
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      Icon: CheckCircle2,
    };
  };

  // Replenish Food Modal State
  const [selectedReplenishPet, setSelectedReplenishPet] = useState(null);
  const [replenishWeight, setReplenishWeight] = useState('');
  const [replenishQuantity, setReplenishQuantity] = useState(1);
  const [replenishAddedSuccess, setReplenishAddedSuccess] = useState(false);
  const [selectedSimilarWeight, setSelectedSimilarWeight] = useState({});
  const similarSliderRef = useRef(null);

  const scrollSimilar = (direction) => {
    if (similarSliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      similarSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Loyalty Points & Coupons State
  const [userPoints, setUserPoints] = useState(1250);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([
    {
      id: 'CUPON-BIENVENIDA-10K',
      title: 'Cupón $10.000 CLP Dcto.',
      pointsCost: 1000,
      validity: 'Válido para 1 compra',
      remainingUses: 1,
      code: 'PTS-ORO-10K',
      date: 'Canje ciclo anterior',
    }
  ]);
  const [redeemSuccessMessage, setRedeemSuccessMessage] = useState(null);

  const REDEEM_REWARDS = [
    {
      id: 'reward-500',
      points: 500,
      discountLabel: '$5.000 Dcto.',
      title: 'Cupón $5.000 CLP de Descuento',
      validity: 'Válido para 1 compra',
      description: 'Aplica $5.000 de descuento directo en el total de tu próxima compra.',
      icon: '💵',
    },
    {
      id: 'reward-1000',
      points: 1000,
      discountLabel: '$10.000 Dcto.',
      title: 'Cupón $10.000 CLP de Descuento',
      validity: 'Válido para 1 compra',
      description: 'Aplica $10.000 de descuento directo en el total de tu próxima compra.',
      icon: '💰',
    },
    {
      id: 'reward-1500',
      points: 1500,
      discountLabel: 'Envío Gratis',
      title: 'Cupón Despacho Gratis a Domicilio',
      validity: 'Válido en tus próximas 2 compras',
      description: 'Envío 100% gratuito a domicilio aplicable en tus próximos 2 pedidos.',
      icon: '🚚',
    },
    {
      id: 'reward-2000',
      points: 2000,
      discountLabel: '20% Dcto. + Snack',
      title: 'Cupón 20% Dcto + Snack de Regalo',
      validity: 'Válido para 1 compra',
      description: '20% de descuento total en tu pedido + 1 Snack 100% Natural de premio.',
      icon: '🎁',
    },
  ];

  const handleRedeemReward = (reward) => {
    if (userPoints < reward.points) return;

    setUserPoints(prev => prev - reward.points);
    const newCoupon = {
      id: `CUPON-${Date.now()}`,
      title: reward.title,
      pointsCost: reward.points,
      validity: reward.validity,
      remainingUses: reward.id === 'reward-1500' ? 2 : 1,
      code: `PTS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      date: 'Canjeado hoy',
    };
    setActiveCoupons(prev => [newCoupon, ...prev]);
    setRedeemSuccessMessage(`🎉 ¡Canje exitoso! Se descontaron ${reward.points.toLocaleString('es-CL')} Pts. Tu ${reward.title} (${reward.validity}) ya está activo para tus compras.`);
    setTimeout(() => {
      setRedeemSuccessMessage(null);
    }, 4500);
  };

  const getReplenishProducts = (pet) => {
    if (!pet) return { currentProduct: null, similarProducts: [] };

    const petTypeFilter = pet.type === 'gato' ? 'gatos' : 'perros';
    
    // Find current main product
    const currentProduct = PRODUCTS.find(p => 
      p.petType === petTypeFilter && (
        (p.id === 'bravery-chicken-adult' && pet.foodName.toLowerCase().includes('pollo') && pet.type === 'perro') ||
        (p.id === 'bravery-salmon-cat' && pet.foodName.toLowerCase().includes('salmón') && pet.type === 'gato') ||
        pet.foodName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(pet.foodName.toLowerCase().split(' ')[0])
      )
    ) || PRODUCTS.find(p => p.petType === petTypeFilter && p.category === 'Alimento Seco') || PRODUCTS[0];

    // Similar products: same petType, same category ('Alimento Seco'), excluding currentProduct
    // Prioritize same brand (Bravery)
    const otherProducts = PRODUCTS.filter(p => 
      p.id !== currentProduct.id &&
      p.petType === petTypeFilter &&
      p.category === 'Alimento Seco'
    ).sort((a, b) => {
      if (a.brand === currentProduct.brand && b.brand !== currentProduct.brand) return -1;
      if (b.brand === currentProduct.brand && a.brand !== currentProduct.brand) return 1;
      return 0;
    });

    return { currentProduct, similarProducts: otherProducts };
  };

  const handleOpenReplenishModal = (pet) => {
    setSelectedReplenishPet(pet);
    setReplenishQuantity(1);
    setReplenishAddedSuccess(false);

    const { currentProduct } = getReplenishProducts(pet);
    if (currentProduct && currentProduct.weights && currentProduct.weights.length > 0) {
      const matchWeight = currentProduct.weights.find(w => pet.bagSize && w.includes(pet.bagSize.replace(' ', '')));
      setReplenishWeight(matchWeight || currentProduct.weights[currentProduct.weights.length - 1]);
    }
  };

  const getFlavorBadge = (product) => {
    const text = (product.name + ' ' + (product.mainProtein || '') + ' ' + (product.flavor || '')).toLowerCase();
    if (text.includes('salmón') || text.includes('salmon')) return { label: 'Sabor Salmón Silvestre', emoji: '🐟', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
    if (text.includes('cordero')) return { label: 'Sabor Cordero de Pradera', emoji: '🥩', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (text.includes('pollo')) return { label: 'Sabor Pollo de Granja', emoji: '🍗', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
    if (text.includes('cerdo') || text.includes('ibérico')) return { label: 'Sabor Cerdo Ibérico', emoji: '🥓', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
    if (text.includes('arenque') || text.includes('pescado')) return { label: 'Sabor Arenque Azul', emoji: '🐟', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
    if (text.includes('trucha')) return { label: 'Sabor Trucha & Catnip', emoji: '🐟', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    return { label: product.mainProtein || 'Fórmula 100% Natural', emoji: '🌿', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const currentUser = user || {
    name: 'Camila Silva',
    email: 'camila@patitasdelsur.cl',
    petName: 'Kira 🐶',
    petType: 'perro',
    memberSince: 'Agosto 2026',
  };

  // State for user's registered pets
  const [pets, setPets] = useState([
    {
      id: 'pet-1',
      name: currentUser.petName || 'Kira 🐶',
      type: 'perro',
      weight: '8 kg',
      foodName: 'Bravery Pollo Adulto Raza Mediana / Grande 12kg',
      bagSize: '12 kg',
      totalDaysDuration: 30,
      daysRemaining: 12,
      lastOrderDate: '05 de Agosto 2026',
      estimatedDepletionDate: '29 de Agosto 2026',
    },
    {
      id: 'pet-2',
      name: 'Milo 🐱',
      type: 'gato',
      weight: '4 kg',
      foodName: 'Bravery Salmón Adulto Cat 7kg',
      bagSize: '7 kg',
      totalDaysDuration: 45,
      daysRemaining: 28,
      lastOrderDate: '20 de Julio 2026',
      estimatedDepletionDate: '15 de Septiembre 2026',
    }
  ]);

  // State for Health Logs (Bitácora Médica por Mascota con Recordatorios de Vacunas y Antiparasitarios)
  const [healthLogs, setHealthLogs] = useState({
    'pet-1': [
      {
        id: 'hl-1',
        date: '10 de Agosto 2026',
        category: 'vacunas',
        title: 'Vacuna Séxtuple Canina (DHPPI+L)',
        nextDueDate: '10 de Agosto 2027',
        frequencyMonths: 12,
        reminderEnabled: true,
      },
      {
        id: 'hl-1b',
        date: '15 de Mayo 2026',
        category: 'vacunas',
        title: 'Vacuna Antirrábica Canina',
        nextDueDate: '15 de Mayo 2027',
        frequencyMonths: 12,
        reminderEnabled: true,
      },
      {
        id: 'hl-2',
        date: '15 de Julio 2026',
        category: 'antiparasitario',
        title: 'NexGard Spectra Perros 7.5 - 15kg (Masticable Mensual)',
        productId: 'nexgard-spectra-dog',
        price: 18990,
        nextDueDate: '15 de Agosto 2026',
        frequencyMonths: 1,
        reminderEnabled: true,
      },
      {
        id: 'hl-3',
        date: '02 de Mayo 2026',
        category: 'consulta',
        title: 'Chequeo Preventivo & Evaluación Nutricional',
        nextDueDate: '02 de Noviembre 2026',
        frequencyMonths: 6,
        reminderEnabled: true,
        notes: 'Piel sana, pelaje denso. Mantener dieta super premium rica en salmón y omega-3.',
      }
    ],
    'pet-2': [
      {
        id: 'hl-5',
        date: '10 de Junio 2026',
        category: 'vacunas',
        title: 'Vacuna Triple Felina (Trivalente)',
        nextDueDate: '10 de Junio 2027',
        frequencyMonths: 12,
        reminderEnabled: true,
        notes: 'Protección contra panleucopenia, rinotraqueítis y calicivirus felino.',
      },
      {
        id: 'hl-4',
        date: '01 de Agosto 2026',
        category: 'antiparasitario',
        title: 'Bravecto Plus Gatos (Pipeta Spot-on 12 Semanas)',
        productId: 'bravecto-plus-cat',
        price: 28990,
        nextDueDate: '01 de Noviembre 2026',
        frequencyMonths: 3,
        reminderEnabled: true,
        notes: 'Protección de 12 semanas contra pulgas, garrapatas y ácaros.',
      }
    ]
  });

  const handleAddPetSubmit = (e) => {
    e.preventDefault();
    if (!newPetName) return;

    const finalFoodName = isCustomFood && customFoodName ? customFoodName : newPetFood;
    const newId = `pet-${Date.now()}`;
    const createdPet = {
      id: newId,
      name: `${newPetName} ${newPetType === 'perro' ? '🐶' : '🐱'}`,
      type: newPetType,
      birthdate: newPetBirthdate || 'No especificada',
      weight: newPetWeight ? `${newPetWeight} kg` : '6 kg',
      sterilized: newPetSterilized === 'si' ? 'Sí' : 'No',
      foodName: finalFoodName,
      bagSize: '12 kg',
      totalDaysDuration: parseInt(newPetDuration, 10) || 30,
      daysRemaining: parseInt(newPetDuration, 10) || 30,
      lastOrderDate: 'Hoy (Registrado)',
      estimatedDepletionDate: 'En 30 días',
      isCustomFoodNotice: isCustomFood,
    };

    setPets([createdPet, ...pets]);
    setHealthLogs({
      ...healthLogs,
      [newId]: [
        {
          id: `hl-${Date.now()}`,
          date: 'Hoy',
          category: 'consulta',
          title: 'Registro Inicial de Salud',
          notes: `Mascota registrada. Esterilizado/a: ${newPetSterilized === 'si' ? 'Sí' : 'No'}. Peso: ${newPetWeight ? newPetWeight + ' kg' : 'Sin registrar'}. Alimento: ${finalFoodName}.`,
        }
      ]
    });

    setPetStep(1);
    setNewPetName('');
    setNewPetBirthdate('');
    setNewPetAge('');
    setNewPetWeight('');
    setNewPetSterilized('si');
    setNewPetFoodSearch('');
    setIsCustomFood(false);
    setCustomFoodName('');
    setIsFoodDropdownOpen(false);
    setNewPetDuration('30');
    setIsAddPetModalOpen(false);
  };

  const handleAddHealthLogSubmit = (e) => {
    e.preventDefault();
    let finalTitle = newLogTitle;
    let finalProductId = null;
    let finalPrice = null;

    if (newLogCategory === 'vacunas') {
      finalTitle = isCustomVaccine && customVaccineName ? customVaccineName : newLogTitle;
    } else if (newLogCategory === 'antiparasitario') {
      if (isCustomAntiparasitic && customAntiparasiticName) {
        finalTitle = customAntiparasiticName;
      } else {
        const found = PRODUCTS.find(p => p.id === selectedAntiparasiticId);
        if (found) {
          finalTitle = found.name;
          finalProductId = found.id;
          finalPrice = found.price;
        } else {
          finalTitle = newLogTitle;
        }
      }
    }

    if (!selectedHealthPet || !finalTitle) return;

    const petId = selectedHealthPet.id;
    const computedNextDue = newLogNextDue || calculateNextDueDate(newLogFrequency);

    const newEntry = {
      id: `hl-${Date.now()}`,
      date: newLogDate || 'Hoy',
      category: newLogCategory,
      title: finalTitle,
      productId: finalProductId,
      price: finalPrice,
      frequencyMonths: parseInt(newLogFrequency, 10) || (newLogCategory === 'vacunas' ? 12 : 1),
      nextDueDate: computedNextDue,
      reminderEnabled: newLogReminder,
      vetName: newLogCategory === 'consulta' ? (newLogVetName || 'Médico Veterinario') : undefined,
      notes: newLogNotes || '',
    };

    const updatedLogs = [newEntry, ...(healthLogs[petId] || [])];
    setHealthLogs({
      ...healthLogs,
      [petId]: updatedLogs,
    });

    setIsCustomVaccine(false);
    setCustomVaccineName('');
    setIsCustomAntiparasitic(false);
    setCustomAntiparasiticName('');
    setNewLogNotes('');
    setIsAddLogFormOpen(false);
  };

  // Orders Filter State
  const [orderFilterPeriod, setOrderFilterPeriod] = useState('todos');
  const [orderFilterCategory, setOrderFilterCategory] = useState('todos');
  const [orderFilterStatus, setOrderFilterStatus] = useState('todos');
  const [orderFilterSearch, setOrderFilterSearch] = useState('');

  // Orders Mock Data with Categories & Dates
  const mockOrders = [
    {
      id: 'PTS-1042',
      date: '17 Ago 2026',
      dateIso: '2026-08-17',
      product: 'Bravery Cordero Adulto Raza Mediana / Grande 12kg',
      category: 'Alimento Seco',
      total: '$68.990',
      pointsEarned: 689,
      status: 'En Camino 🚚',
      statusCode: 'en_camino',
      statusColor: 'bg-[#0E8388]/10 text-[#0E8388] border-[#0E8388]/30',
    },
    {
      id: 'PTS-1015',
      date: '28 Jul 2026',
      dateIso: '2026-07-28',
      product: 'Bravecto Plus Gatos Pipeta Spot-on (12 Semanas)',
      category: 'Antiparasitarios / Salud',
      total: '$28.990',
      pointsEarned: 289,
      status: 'Entregado ✓',
      statusCode: 'entregado',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'PTS-0988',
      date: '02 Jul 2026',
      dateIso: '2026-07-02',
      product: 'Salmón de la Patagonia Ultra Premium 2kg',
      category: 'Alimento Seco',
      total: '$24.990',
      pointsEarned: 249,
      status: 'Entregado ✓',
      statusCode: 'entregado',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'PTS-0871',
      date: '15 Jun 2026',
      dateIso: '2026-06-15',
      product: 'Pack 3x Snacks Deshidratados Pulmón de Res',
      category: 'Snacks Naturales',
      total: '$7.990',
      pointsEarned: 79,
      status: 'Entregado ✓',
      statusCode: 'entregado',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'PTS-0750',
      date: '10 May 2026',
      dateIso: '2026-05-10',
      product: 'NexGard Spectra Perros 7.5 - 15kg (Masticable Mensual)',
      category: 'Antiparasitarios / Salud',
      total: '$18.990',
      pointsEarned: 189,
      status: 'Entregado ✓',
      statusCode: 'entregado',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'PTS-0632',
      date: '14 Abr 2026',
      dateIso: '2026-04-14',
      product: 'Bravery Pollo Adulto Raza Mediana / Grande 12kg',
      category: 'Alimento Seco',
      total: '$68.990',
      pointsEarned: 689,
      status: 'Entregado ✓',
      statusCode: 'entregado',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
  ];

  // Filtered Orders Calculation
  const filteredOrders = mockOrders.filter((order) => {
    // 1. Period / Date Filter
    if (orderFilterPeriod === '30dias') {
      if (!order.dateIso.startsWith('2026-08') && !order.dateIso.startsWith('2026-07-28')) return false;
    } else if (orderFilterPeriod === '3meses') {
      if (!['2026-08', '2026-07', '2026-06'].some(m => order.dateIso.startsWith(m))) return false;
    } else if (orderFilterPeriod === '2026') {
      if (!order.dateIso.startsWith('2026')) return false;
    }

    // 2. Product Category Filter
    if (orderFilterCategory !== 'todos') {
      if (order.category !== orderFilterCategory) return false;
    }

    // 3. Status Filter
    if (orderFilterStatus !== 'todos') {
      if (order.statusCode !== orderFilterStatus) return false;
    }

    // 4. Search Filter
    if (orderFilterSearch.trim()) {
      const q = orderFilterSearch.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchProduct = order.product.toLowerCase().includes(q);
      if (!matchId && !matchProduct) return false;
    }

    return true;
  });

  // Store Filter States (Matching public store)
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeSelectedBrand, setStoreSelectedBrand] = useState('Todas');
  const [storeProteinFilter, setStoreProteinFilter] = useState('Todos');
  const [storeWeightFilter, setStoreWeightFilter] = useState('Todos');
  const [storeCategoryFilter, setStoreCategoryFilter] = useState('Todos');

  // Base products filtered by pet type tab
  const baseStoreProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (storeFilter === 'perro') return p.petType === 'perros' || p.petType === 'ambos';
      if (storeFilter === 'gato') return p.petType === 'gatos' || p.petType === 'ambos';
      return true;
    });
  }, [storeFilter]);

  // Brand product counts
  const storeBrandCounts = useMemo(() => {
    const counts = {};
    baseStoreProducts.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [baseStoreProducts]);

  // Master Filtered Store Products
  const storeFilteredProducts = useMemo(() => {
    return baseStoreProducts.filter((product) => {
      // 1. Brand filter
      if (storeSelectedBrand !== 'Todas' && product.brand !== storeSelectedBrand) {
        return false;
      }

      // 2. Search query
      if (storeSearchQuery.trim()) {
        const q = storeSearchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchTagline = product.tagline ? product.tagline.toLowerCase().includes(q) : false;
        const matchBrand = product.brand ? product.brand.toLowerCase().includes(q) : false;
        const matchIngredients = product.ingredients
          ? product.ingredients.some((ing) => ing.toLowerCase().includes(q))
          : false;
        if (!matchName && !matchTagline && !matchBrand && !matchIngredients) {
          return false;
        }
      }

      // 3. Protein % Filter
      if (storeProteinFilter !== 'Todos') {
        const prot = product.proteinValue || 0;
        if (storeProteinFilter === 'high' && (prot < 30 || prot > 40)) return false;
        if (storeProteinFilter === 'super' && prot <= 40) return false;
        if (storeProteinFilter === 'moderate' && prot >= 30) return false;
      }

      // 4. Weight Filter
      if (storeWeightFilter !== 'Todos') {
        const weights = product.weights || [];
        if (storeWeightFilter === 'snacks') {
          const isSnackWeight = weights.some((w) => w.includes('g') && !w.includes('kg'));
          if (!isSnackWeight) return false;
        } else if (storeWeightFilter === 'standard') {
          const isStandardWeight = weights.some((w) => w.includes('2 kg') || w.includes('3 kg') || w.includes('1.5 kg') || w.includes('4 kg') || w.includes('7 kg'));
          if (!isStandardWeight) return false;
        } else if (storeWeightFilter === 'bulk') {
          const isBulkWeight = weights.some((w) => w.includes('5 kg') || w.includes('10 kg') || w.includes('12 kg') || w.includes('15 kg'));
          if (!isBulkWeight) return false;
        }
      }

      // 5. Category Filter
      if (storeCategoryFilter !== 'Todos' && product.category !== storeCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [baseStoreProducts, storeSelectedBrand, storeSearchQuery, storeProteinFilter, storeWeightFilter, storeCategoryFilter]);

  const [hoveredStoreCircle, setHoveredStoreCircle] = useState(null);

  const proteinChips = [
    { label: 'Todas', value: 'Todos', emoji: '✨' },
    { label: 'Alta (30%-40%)', value: 'high', emoji: '💪' },
    { label: 'Súper (>70%)', value: 'super', emoji: '⚡' },
    { label: 'Moderada (<30%)', value: 'moderate', emoji: '🌱' },
  ];

  const weightChips = [
    { label: 'Todos', value: 'Todos', emoji: '✨' },
    { label: 'Snacks (100-250g)', value: 'snacks', emoji: '🍖' },
    { label: 'Bolsas (1.5-4kg)', value: 'standard', emoji: '📦' },
    { label: 'Granel (5-15kg)', value: 'bulk', emoji: '🏔️' },
  ];

  const categoryChips = [
    { label: 'Todos', value: 'Todos', emoji: '✨' },
    { label: 'Alimento Seco', value: 'Alimento Seco', emoji: '🥣' },
    { label: 'Snacks Naturales', value: 'Snacks Naturales', emoji: '🍖' },
    { label: 'Alimento Húmedo', value: 'Alimento Húmedo', emoji: '🥫' },
    { label: 'Suplementos', value: 'Suplementos', emoji: '🧪' },
  ];

  const getActiveProteinLabel = () => {
    const found = proteinChips.find((c) => c.value === storeProteinFilter);
    return found ? found.label : 'Proteína';
  };

  const getActiveWeightLabel = () => {
    const found = weightChips.find((c) => c.value === storeWeightFilter);
    return found ? found.label : 'Formato (Peso)';
  };

  const getActiveCategoryLabel = () => {
    const found = categoryChips.find((c) => c.value === storeCategoryFilter);
    return found ? found.label : 'Tipo de Alimento';
  };

  const handleResetStoreFilters = () => {
    setStoreSelectedBrand('Todas');
    setStoreSearchQuery('');
    setStoreProteinFilter('Todos');
    setStoreWeightFilter('Todos');
    setStoreCategoryFilter('Todos');
  };

  const activeStoreFiltersCount =
    (storeSearchQuery ? 1 : 0) +
    (storeSelectedBrand !== 'Todas' ? 1 : 0) +
    (storeProteinFilter !== 'Todos' ? 1 : 0) +
    (storeWeightFilter !== 'Todos' ? 1 : 0) +
    (storeCategoryFilter !== 'Todos' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-4 pb-20 px-4 md:px-8">
      
      {/* PERSISTENT FLOATING TOP MENU BAR INSIDE CLIENT SESSION */}
      <header className="sticky top-4 z-50 mb-8 w-fit max-w-[95vw] mx-auto px-2">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-full p-1.5 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all duration-300">
          
          {/* 3 Modern Segmented Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
            <button
              onClick={() => setActiveTab('mascotas')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'mascotas'
                  ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-md shadow-[#0E8388]/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-extrabold'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'mascotas' ? 'text-rose-300' : 'text-rose-500'}`} />
              <span>Mis Mascotas</span>
            </button>

            <button
              onClick={() => setActiveTab('compras')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'compras'
                  ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-md shadow-[#0E8388]/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-extrabold'
              }`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${activeTab === 'compras' ? 'text-emerald-300' : 'text-emerald-600'}`} />
              <span>Mis Compras</span>
            </button>

            <button
              onClick={() => setActiveTab('tienda')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'tienda'
                  ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-md shadow-[#0E8388]/20 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-extrabold'
              }`}
            >
              <Store className={`w-3.5 h-3.5 ${activeTab === 'tienda' ? 'text-amber-300' : 'text-amber-500'}`} />
              <span>Tienda</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block mx-0.5" />

          {/* Right: Exit / Logout Action Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-extrabold text-xs transition-all border border-slate-200/80 active:scale-95 shadow-xs"
            title="Cerrar sesión y salir"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">Salir</span>
          </button>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">

        {/* TAB 1: MIS MASCOTAS (Perfil, Registro, Bitácora de Salud & Calculadora) */}
        {activeTab === 'mascotas' && (
          <div className="space-y-8">
            
            {/* Header Showcase Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                  Nutrición & Ficha Médica de Salud
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Mascotas Registradas de {currentUser.name} 🐶🐱
                </h1>
                <p className="text-xs md:text-sm text-emerald-100 font-medium max-w-xl">
                  Registra tus mascotas, consulta su bitácora médica de vacunas y monitorea la cantidad de alimento disponible.
                </p>
              </div>

              <button
                onClick={() => setIsAddPetModalOpen(true)}
                className="relative z-10 px-6 py-3.5 rounded-2xl bg-white text-[#0A3E40] hover:bg-emerald-50 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#0E8388]" />
                <span>Agregar Nueva Mascota</span>
              </button>

              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* List of Registered Pets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pets.map((pet) => {
                const percentRemaining = Math.round((pet.daysRemaining / pet.totalDaysDuration) * 100);
                const isLow = pet.daysRemaining <= 10;
                const petLogs = healthLogs[pet.id] || [];

                return (
                  <div key={pet.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      
                      {/* Top Pet Identity Bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E6F4F1] to-[#CBE5E1] border border-[#0E8388]/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
                            {pet.type === 'perro' ? '🐶' : '🐱'}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900">{pet.name}</h3>
                            <p className="text-xs text-slate-500 font-bold">{pet.type === 'perro' ? 'Perro' : 'Gato'} • Peso: {pet.weight}</p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          isLow ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isLow ? '⚠️ Reponer Pronto' : '✓ Alimento al Día'}
                        </span>
                      </div>

                      {/* Assigned Food Info */}
                      <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                        <div className="flex items-center gap-2 font-black text-slate-800">
                          <Utensils className="w-4 h-4 text-[#0E8388]" />
                          <span>Alimento Registrado:</span>
                        </div>
                        <div className="font-extrabold text-[#0A3E40] text-sm">{pet.foodName}</div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-3 pt-1">
                          <span>Saco: {pet.bagSize}</span>
                          <span>•</span>
                          <span>Última Compra: {pet.lastOrderDate}</span>
                        </div>
                      </div>

                      {/* Food Duration Progress & Calculator Tracker */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#0E8388]" />
                            <span>Duración Estimada de Comida:</span>
                          </span>
                          <span className={isLow ? 'text-amber-600 font-black' : 'text-[#0E8388]'}>
                            {pet.daysRemaining} días restantes ({percentRemaining}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-[#0E8388] to-[#10B981]'
                            }`}
                            style={{ width: `${percentRemaining}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium">
                          📅 Fecha calculada para agotamiento: <strong>{pet.estimatedDepletionDate}</strong>.
                        </p>
                      </div>

                    </div>

                    {/* Bottom CTA Action Buttons (Reponer + Bitácora de Salud) */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleOpenReplenishModal(pet)}
                        className="py-3 px-4 rounded-2xl bg-[#0E8388] hover:bg-[#0A3E40] text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reponer Alimento</span>
                      </button>

                      <button
                        onClick={() => setSelectedHealthPet(pet)}
                        className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-[#0E8388]/10 hover:text-[#0E8388] text-slate-700 font-extrabold text-xs transition-all border border-slate-200/80 flex items-center justify-center gap-1.5"
                      >
                        <Stethoscope className="w-4 h-4 text-[#0E8388]" />
                        <span>Bitácora de Salud ({petLogs.length})</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: MIS COMPRAS & FIDELIZACIÓN (Historial & Puntos Patitas) */}
        {activeTab === 'compras' && (
          <div className="space-y-8">
            
            {/* Header Showcase Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                  Historial de Envíos & Programa de Puntos
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Mis Compras & Puntos Patitas 🛒
                </h1>
                <p className="text-xs md:text-sm text-emerald-100 font-medium max-w-xl">
                  Revisa todos tus pedidos realizados, seguimiento de despachos en tiempo real y tus puntos acumulados para canjear descuentos.
                </p>
              </div>

              {/* Loyalty Summary Badge */}
              <div className="relative z-10 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shrink-0 space-y-1 text-center md:text-right">
                <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-center md:justify-end gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Socio Nivel Oro 🥇</span>
                </div>
                <div className="text-3xl font-black">{userPoints.toLocaleString('es-CL')} Pts</div>
                <div className="text-[11px] text-emerald-100 font-bold">${(userPoints * 10).toLocaleString('es-CL')} CLP en Descuentos</div>
              </div>

              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* Redeem Success Toast */}
            {redeemSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>{redeemSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setRedeemSuccessMessage(null)}
                  className="text-white/80 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* REAL PHYSICAL-STYLE DIGITAL MEMBERSHIP CARD SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left 5 Cols: CUSTOM PATITAS DEL SUR BRAND VIP MEMBERSHIP CARD */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="w-full aspect-[1.58/1] rounded-3xl p-6 text-slate-900 bg-gradient-to-br from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1] shadow-2xl border-2 border-[#0E8388]/30 relative overflow-hidden flex flex-col justify-between group transform transition-transform hover:scale-[1.02]">
                  
                  {/* Watermarked Official Patitas del Sur Logo Outline in Background */}
                  <img
                    src="/images/logo_patitas_del_sur.svg"
                    alt=""
                    className="absolute -right-8 -bottom-10 h-64 w-auto opacity-15 pointer-events-none select-none filter contrast-125"
                  />

                  {/* Decorative Brand Color Bar at Top */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981]" />

                  {/* Card Top Row: Official Logo & Tier Badge */}
                  <div className="relative z-10 flex items-center justify-between pt-1">
                    <img
                      src="/images/logo_patitas_del_sur.svg"
                      alt="Patitas del Sur"
                      className="h-10 w-auto object-contain drop-shadow-xs"
                    />

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A3E40] text-white shadow-md border border-[#0E8388]/40">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        SOCIO ORO 🥇
                      </span>
                    </div>
                  </div>

                  {/* Card Middle Row: Member Name, ID & Points Balance */}
                  <div className="relative z-10 space-y-1.5 my-auto pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#0E8388]">
                        Tarjeta de Fidelización Oficial
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        N° #PTS-1042
                      </span>
                    </div>

                    <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
                      <span>{currentUser.name}</span>
                      <span className="text-xs font-bold text-slate-500 font-mono">2026 / 2027</span>
                    </div>

                    {/* Points Box */}
                    <div className="p-3 rounded-2xl bg-white/90 border border-[#0E8388]/30 shadow-xs flex items-center justify-between backdrop-blur-md">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-500 block">Saldo de Puntos</span>
                        <span className="text-2xl font-black text-[#0A3E40]">{userPoints.toLocaleString('es-CL')} PTS</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-black text-slate-500 block">Valor Canjeable</span>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          ${(userPoints * 10).toLocaleString('es-CL')} CLP Dcto
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Row: Pet Icons & Brand Guarantee */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-600 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-[#0A3E40]">
                      <span>🐾 Mascotas: {currentUser.petName}</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-[#0E8388] uppercase tracking-wider">
                      Patitas del Sur SpA
                    </div>
                  </div>

                </div>
              </div>

              {/* Right 7 Cols: Progress Bar & Milestone Tier Rewards Panel */}
              <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-block mb-1">
                        Canje de Puntos por Compras 🚀
                      </span>
                      <h3 className="text-xl font-black text-slate-900">
                        {userPoints < 1500 ? 'Próximo Beneficio: Envío Gratis (2 compras) 🚚' : '¡Tienes puntos listos para canjear! 🎁'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Al canjear un cupón, los puntos se descuentan y el beneficio aplica en tus compras indicadas.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsRedeemModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Canjear Puntos</span>
                    </button>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-slate-700">
                        {userPoints < 1500 ? 'Progreso para Envío Gratis (1.500 Pts):' : 'Progreso a 2.000 Pts (20% Dcto + Regalo):'}
                      </span>
                      <span className="text-[#0E8388]">
                        {userPoints < 1500
                          ? `¡Faltan solo ${1500 - userPoints} Pts! (${Math.round((userPoints / 1500) * 100)}%)`
                          : userPoints < 2000
                          ? `¡Faltan ${2000 - userPoints} Pts! (${Math.round((userPoints / 2000) * 100)}%)`
                          : '¡Nivel Máximo de Recompensas Alcanzado!'}
                      </span>
                    </div>
                    <div className="w-full h-4 rounded-full bg-slate-200 overflow-hidden p-0.5 border border-slate-300">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] transition-all duration-700 shadow-md relative"
                        style={{ width: `${Math.min(100, (userPoints / 1500) * 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Tiers Horizontal List (Explicit Validity Per Purchases) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Milestone 1: 500 Pts */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 500 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="text-[10px] font-black text-emerald-800 uppercase">500 Pts</div>
                    <div className="font-extrabold text-slate-900">$5.000 Dcto</div>
                    <div className="text-[10px] text-slate-600 font-medium">Válido: 1 compra</div>
                    <div className={`text-[10px] font-black ${userPoints >= 500 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {userPoints >= 500 ? '✓ Canjeable' : '🔒 Faltan Pts'}
                    </div>
                  </div>

                  {/* Milestone 2: 1000 Pts */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 1000 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="text-[10px] font-black text-emerald-800 uppercase">1.000 Pts</div>
                    <div className="font-extrabold text-slate-900">$10.000 Dcto</div>
                    <div className="text-[10px] text-slate-600 font-medium">Válido: 1 compra</div>
                    <div className={`text-[10px] font-black ${userPoints >= 1000 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {userPoints >= 1000 ? '✓ Canjeable' : '🔒 Faltan Pts'}
                    </div>
                  </div>

                  {/* Milestone 3: 1500 Pts */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 1500 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-2 border-amber-300 shadow-xs'}`}>
                    <div className="text-[10px] font-black text-amber-900 uppercase">1.500 Pts ⚡</div>
                    <div className="font-extrabold text-slate-900">Envío Gratis</div>
                    <div className="text-[10px] text-slate-600 font-medium">Válido: 2 compras</div>
                    <div className="text-[10px] text-amber-800 font-black">
                      {userPoints >= 1500 ? '✓ Canjeable' : '¡Próxima Meta!'}
                    </div>
                  </div>

                  {/* Milestone 4: 2000 Pts */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 2000 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                    <div className="text-[10px] font-black text-slate-500 uppercase">2.000 Pts 🔒</div>
                    <div className="font-extrabold text-slate-700">20% + Regalo</div>
                    <div className="text-[10px] text-slate-600 font-medium">Válido: 1 compra</div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      {userPoints >= 2000 ? '✓ Canjeable' : 'Bloqueado'}
                    </div>
                  </div>
                </div>

                {/* Active Redeemed Coupons List */}
                {activeCoupons.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎟️</span>
                        <span>Cupones Activos Canjeados ({activeCoupons.length})</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">Listos para aplicar al pagar</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {activeCoupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs flex items-center justify-between gap-3 shrink-0 shadow-2xs"
                        >
                          <div>
                            <div className="font-black text-emerald-950 text-xs">{coupon.title}</div>
                            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 mt-0.5">
                              <span className="bg-emerald-100 px-1.5 py-0.2 rounded-md font-mono">{coupon.code}</span>
                              <span>• {coupon.validity}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Order History Table with Interactive Filters */}
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
              
              {/* Header & Filter Controls Bar */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#0E8388]" />
                    <span>Detalle de Compras Realizadas</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Historial de pedidos, puntos generados y estado de despacho en tiempo real:
                  </p>
                </div>

                {/* Filters Toolbar */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  
                  {/* 1. Date Filter Dropdown */}
                  <div className="relative min-w-[145px]">
                    <select
                      value={orderFilterPeriod}
                      onChange={(e) => setOrderFilterPeriod(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
                    >
                      <option value="todos">📅 Todas las fechas</option>
                      <option value="30dias">⏳ Últimos 30 días</option>
                      <option value="3meses">🗓️ Últimos 3 meses</option>
                      <option value="2026">📆 Todo el 2026</option>
                    </select>
                    <Calendar className="w-3.5 h-3.5 text-[#0E8388] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 2. Product Category Filter */}
                  <div className="relative min-w-[155px]">
                    <select
                      value={orderFilterCategory}
                      onChange={(e) => setOrderFilterCategory(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
                    >
                      <option value="todos">🥩 Todos los productos</option>
                      <option value="Alimento Seco">🥩 Alimento Seco</option>
                      <option value="Snacks Naturales">🥓 Snacks Naturales</option>
                      <option value="Antiparasitarios / Salud">💊 Antiparasitarios</option>
                    </select>
                    <Package className="w-3.5 h-3.5 text-[#0E8388] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 3. Shipment Status Filter */}
                  <div className="relative min-w-[145px]">
                    <select
                      value={orderFilterStatus}
                      onChange={(e) => setOrderFilterStatus(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
                    >
                      <option value="todos">🚚 Todos los estados</option>
                      <option value="en_camino">🚚 En Camino</option>
                      <option value="entregado">✓ Entregado</option>
                    </select>
                    <Truck className="w-3.5 h-3.5 text-[#0E8388] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 4. Search Filter Input */}
                  <div className="relative min-w-[150px] flex-1 sm:flex-initial">
                    <input
                      type="text"
                      value={orderFilterSearch}
                      onChange={(e) => setOrderFilterSearch(e.target.value)}
                      placeholder="Buscar pedido..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 5. Reset Filter Button */}
                  {(orderFilterPeriod !== 'todos' || orderFilterCategory !== 'todos' || orderFilterStatus !== 'todos' || orderFilterSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderFilterPeriod('todos');
                        setOrderFilterCategory('todos');
                        setOrderFilterStatus('todos');
                        setOrderFilterSearch('');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Restablecer filtros"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpiar</span>
                    </button>
                  )}

                </div>
              </div>

              {/* Table / Results */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">N° Pedido</th>
                      <th className="px-5 py-3.5">Fecha</th>
                      <th className="px-5 py-3.5">Producto Adquirido</th>
                      <th className="px-5 py-3.5">Tipo</th>
                      <th className="px-5 py-3.5">Puntos Ganados</th>
                      <th className="px-5 py-3.5">Monto Total</th>
                      <th className="px-5 py-3.5 text-right">Estado del Envío</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-black text-[#0E8388] font-mono">{order.id}</td>
                          <td className="px-5 py-4 text-slate-500">{order.date}</td>
                          <td className="px-5 py-4 font-bold text-slate-900">{order.product}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                              {order.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-black text-amber-600">+{order.pointsEarned} Pts</td>
                          <td className="px-5 py-4 font-extrabold text-slate-900">{order.total}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${order.statusColor}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                          <div className="max-w-xs mx-auto space-y-2">
                            <span className="text-3xl block">🔍</span>
                            <div className="font-black text-slate-800 text-sm">No se encontraron compras</div>
                            <p className="text-xs text-slate-500 font-medium">
                              No hay pedidos que coincidan con los filtros seleccionados.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setOrderFilterPeriod('todos');
                                setOrderFilterCategory('todos');
                                setOrderFilterStatus('todos');
                                setOrderFilterSearch('');
                              }}
                              className="mt-2 px-4 py-1.5 rounded-xl bg-[#0E8388] text-white font-bold text-xs hover:bg-[#0A3E40] transition-colors cursor-pointer"
                            >
                              Ver todas las compras
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1 pt-1">
                <span>Mostrando <strong>{filteredOrders.length}</strong> de <strong>{mockOrders.length}</strong> compras</span>
                <span className="text-emerald-700 font-bold">✓ Puntos acumulados automáticamente</span>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: TIENDA EMBEBIDA EN LA SESIÓN DEL CLIENTE */}
        {activeTab === 'tienda' && (
          <div className="space-y-8">
            
            {/* Header Showcase Banner with Integrated Filters */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl space-y-5 relative overflow-hidden">
              
              {/* Top Row: Title + Species Segmented Toggle */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                    Catálogo Oficial para Clientes
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    Tienda Patitas del Sur 🛒
                  </h1>
                  <p className="text-xs text-emerald-100 font-medium max-w-xl">
                    Compra directamente desde tu sesión de usuario con tus puntos de descuento activos.
                  </p>
                </div>

                {/* Species Toggle Pills */}
                <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md shrink-0 w-fit">
                  <button
                    onClick={() => setStoreFilter('todos')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      storeFilter === 'todos' ? 'bg-white text-[#0A3E40] shadow-sm' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStoreFilter('perro')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      storeFilter === 'perro' ? 'bg-white text-[#0A3E40] shadow-sm' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    🐶 Perros
                  </button>
                  <button
                    onClick={() => setStoreFilter('gato')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      storeFilter === 'gato' ? 'bg-white text-[#0A3E40] shadow-sm' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    🐱 Gatos
                  </button>
                </div>
              </div>

              {/* Integrated Search Bar inside Banner */}
              <div className="relative z-10 w-full">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                  <input
                    type="text"
                    placeholder="Buscar por palabra clave (ej. salmón, cordero, pollo, snack, cachorro...)"
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/15 border border-white/30 text-white placeholder-white/70 text-xs font-semibold backdrop-blur-md focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-inner"
                  />
                  {storeSearchQuery && (
                    <button
                      onClick={() => setStoreSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white cursor-pointer"
                      title="Borrar búsqueda"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal Expanding Inline Filter Capsules (Empuje Lateral Dinámico idéntico a la tienda pública) */}
              <div className="relative z-10 flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 transition-all duration-500 ease-out scrollbar-none max-w-full">
                
                {/* CAPSULE 1: MARCA */}
                <div
                  onMouseEnter={() => setHoveredStoreCircle('brand')}
                  onMouseLeave={() => setHoveredStoreCircle(null)}
                  className="shrink-0 transition-all duration-500 ease-out"
                >
                  {hoveredStoreCircle === 'brand' ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/30 border border-white/40 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-xs font-black text-emerald-200 uppercase tracking-wider px-3 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-300" /> Marca:
                      </span>
                      <button
                        onClick={() => setStoreSelectedBrand('Todas')}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                          storeSelectedBrand === 'Todas'
                            ? 'bg-white text-[#0A3E40] shadow-sm scale-105'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Todas
                      </button>
                      {BRANDS.map((b) => {
                        const count = storeBrandCounts[b.name] || 0;
                        const isSelected = storeSelectedBrand === b.name;
                        return (
                          <button
                            key={b.id}
                            onClick={() => setStoreSelectedBrand(b.name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-white text-[#0A3E40] shadow-sm scale-105'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <span>{b.logo}</span>
                            <span>{b.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-[#0A3E40]/20 text-[#0A3E40]' : 'bg-white/20 text-white'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => setHoveredStoreCircle('brand')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 border shadow-xs cursor-pointer ${
                        storeSelectedBrand !== 'Todas'
                          ? 'bg-white text-[#0A3E40] border-white shadow-md scale-105'
                          : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${storeSelectedBrand !== 'Todas' ? 'bg-[#0A3E40]/15' : 'bg-white/20'}`}>
                        <Layers className="w-3 h-3 text-[#10B981]" />
                      </div>
                      <span>{storeSelectedBrand !== 'Todas' ? storeSelectedBrand : 'Marca'}</span>
                      {storeSelectedBrand !== 'Todas' && <Check className="w-3.5 h-3.5 text-[#0A3E40]" />}
                    </button>
                  )}
                </div>

                {/* CAPSULE 2: PROTEÍNA */}
                <div
                  onMouseEnter={() => setHoveredStoreCircle('protein')}
                  onMouseLeave={() => setHoveredStoreCircle(null)}
                  className="shrink-0 transition-all duration-500 ease-out"
                >
                  {hoveredStoreCircle === 'protein' ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/30 border border-white/40 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-xs font-black text-emerald-200 uppercase tracking-wider px-3 flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-300" /> Proteína:
                      </span>
                      {proteinChips.map((chip) => {
                        const isSelected = storeProteinFilter === chip.value;
                        return (
                          <button
                            key={chip.value}
                            onClick={() => setStoreProteinFilter(chip.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-white text-[#0A3E40] shadow-sm scale-105'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <span>{chip.emoji}</span>
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => setHoveredStoreCircle('protein')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 border shadow-xs cursor-pointer ${
                        storeProteinFilter !== 'Todos'
                          ? 'bg-white text-[#0A3E40] border-white shadow-md scale-105'
                          : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${storeProteinFilter !== 'Todos' ? 'bg-[#0A3E40]/15' : 'bg-white/20'}`}>
                        <Dumbbell className="w-3 h-3 text-[#10B981]" />
                      </div>
                      <span>{storeProteinFilter !== 'Todos' ? getActiveProteinLabel() : 'Proteína'}</span>
                      {storeProteinFilter !== 'Todos' && <Check className="w-3.5 h-3.5 text-[#0A3E40]" />}
                    </button>
                  )}
                </div>

                {/* CAPSULE 3: FORMATO (PESO) */}
                <div
                  onMouseEnter={() => setHoveredStoreCircle('weight')}
                  onMouseLeave={() => setHoveredStoreCircle(null)}
                  className="shrink-0 transition-all duration-500 ease-out"
                >
                  {hoveredStoreCircle === 'weight' ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/30 border border-white/40 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-xs font-black text-emerald-200 uppercase tracking-wider px-3 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-300" /> Formato:
                      </span>
                      {weightChips.map((chip) => {
                        const isSelected = storeWeightFilter === chip.value;
                        return (
                          <button
                            key={chip.value}
                            onClick={() => setStoreWeightFilter(chip.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-white text-[#0A3E40] shadow-sm scale-105'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <span>{chip.emoji}</span>
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => setHoveredStoreCircle('weight')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 border shadow-xs cursor-pointer ${
                        storeWeightFilter !== 'Todos'
                          ? 'bg-white text-[#0A3E40] border-white shadow-md scale-105'
                          : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${storeWeightFilter !== 'Todos' ? 'bg-[#0A3E40]/15' : 'bg-white/20'}`}>
                        <Scale className="w-3 h-3 text-[#10B981]" />
                      </div>
                      <span>{storeWeightFilter !== 'Todos' ? getActiveWeightLabel() : 'Formato (Peso)'}</span>
                      {storeWeightFilter !== 'Todos' && <Check className="w-3.5 h-3.5 text-[#0A3E40]" />}
                    </button>
                  )}
                </div>

                {/* CAPSULE 4: TIPO DE ALIMENTO */}
                <div
                  onMouseEnter={() => setHoveredStoreCircle('category')}
                  onMouseLeave={() => setHoveredStoreCircle(null)}
                  className="shrink-0 transition-all duration-500 ease-out"
                >
                  {hoveredStoreCircle === 'category' ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/30 border border-white/40 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-xs font-black text-emerald-200 uppercase tracking-wider px-3 flex items-center gap-1">
                        <Bone className="w-3.5 h-3.5 text-emerald-300" /> Tipo:
                      </span>
                      {categoryChips.map((chip) => {
                        const isSelected = storeCategoryFilter === chip.value;
                        return (
                          <button
                            key={chip.value}
                            onClick={() => setStoreCategoryFilter(chip.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-white text-[#0A3E40] shadow-sm scale-105'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <span>{chip.emoji}</span>
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      onClick={() => setHoveredStoreCircle('category')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 border shadow-xs cursor-pointer ${
                        storeCategoryFilter !== 'Todos'
                          ? 'bg-white text-[#0A3E40] border-white shadow-md scale-105'
                          : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${storeCategoryFilter !== 'Todos' ? 'bg-[#0A3E40]/15' : 'bg-white/20'}`}>
                        <Bone className="w-3 h-3 text-[#10B981]" />
                      </div>
                      <span>{storeCategoryFilter !== 'Todos' ? getActiveCategoryLabel() : 'Tipo de Alimento'}</span>
                      {storeCategoryFilter !== 'Todos' && <Check className="w-3.5 h-3.5 text-[#0A3E40]" />}
                    </button>
                  )}
                </div>

              </div>

              {/* Bottom Row: Results Counter & Reset Button */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/15 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-emerald-100 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {storeFilteredProducts.length} {storeFilteredProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
                  </span>
                </div>

                {activeStoreFiltersCount > 0 && (
                  <button
                    onClick={handleResetStoreFilters}
                    className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer border border-white/25 active:scale-95 shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Limpiar Filtros ({activeStoreFiltersCount})</span>
                  </button>
                )}
              </div>

              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* Product Catalog Grid inside Client Session */}
            {storeFilteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeFilteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
                <span className="text-4xl block">🔍</span>
                <h3 className="text-lg font-black text-slate-800">No encontramos productos con estos filtros</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Prueba cambiando la marca, el rango de proteína, o borra los términos de búsqueda.
                </p>
                <button
                  onClick={handleResetStoreFilters}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white text-xs font-black hover:scale-105 transition-all shadow-md cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL 1: REGISTRAR NUEVA MASCOTA (MULTI-STEP WIZARD) */}
      {isAddPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Agregar Nueva Mascota 🐾</h3>
                <p className="text-xs text-slate-500 font-medium">Asistente de registro en 3 pasos</p>
              </div>
              <button
                onClick={() => {
                  setPetStep(1);
                  setIsAddPetModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Wizard Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${(petStep / 3) * 100}%` }}
              />
            </div>

            <form onSubmit={handleAddPetSubmit} className="space-y-4 text-xs font-semibold">
              
              {/* STEP 1: TIPO DE MASCOTA (Perro o Gato) */}
              {petStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20 inline-block mb-1">
                      Paso 1 de 3: Especie 🐾
                    </span>
                    <h4 className="text-lg font-black text-slate-900">¿Tu mascota es Perro o Gato?</h4>
                    <p className="text-xs text-slate-500 font-medium">Selecciona la especie para adaptar las opciones nutricionales.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Option Perro */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewPetType('perro');
                        setPetStep(2);
                      }}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:scale-105 active:scale-95 ${
                        newPetType === 'perro'
                          ? 'border-[#0E8388] bg-[#E6F4F1]/60 shadow-lg ring-2 ring-[#0E8388]/30'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-5xl drop-shadow-xs">🐶</span>
                      <div>
                        <div className="font-black text-slate-900 text-base">Perro</div>
                        <p className="text-[11px] text-slate-500 font-medium">Nutrición Canina</p>
                      </div>
                      {newPetType === 'perro' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388] text-white text-[10px] font-black uppercase">
                          ✓ Seleccionado
                        </span>
                      )}
                    </button>

                    {/* Option Gato */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewPetType('gato');
                        setPetStep(2);
                      }}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:scale-105 active:scale-95 ${
                        newPetType === 'gato'
                          ? 'border-[#0E8388] bg-[#E6F4F1]/60 shadow-lg ring-2 ring-[#0E8388]/30'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-5xl drop-shadow-xs">🐱</span>
                      <div>
                        <div className="font-black text-slate-900 text-base">Gato</div>
                        <p className="text-[11px] text-slate-500 font-medium">Nutrición Felina</p>
                      </div>
                      {newPetType === 'gato' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388] text-white text-[10px] font-black uppercase">
                          ✓ Seleccionado
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPetStep(2)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Siguiente: Datos de la Mascota</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* STEP 2: INFORMACIÓN DE LA MASCOTA */}
              {petStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                      Paso 2 de 3: Datos de {newPetType === 'perro' ? '🐶 Perro' : '🐱 Gato'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">66% completado</span>
                  </div>

                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-700 uppercase text-[11px]">Nombre de la Mascota *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Luna, Milo, Jack, Thor..."
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-hidden focus:border-[#0E8388] focus:bg-white"
                    />
                  </div>

                  {/* Fecha de Nacimiento, Edad & Peso (Bi-directional calculation) */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px]">Fecha Nacimiento</label>
                      <CustomDatePicker
                        value={newPetBirthdate}
                        onChange={handleBirthdateChange}
                        placeholder="dd / mm / aaaa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px]">Edad (Años)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej. 3"
                        value={newPetAge}
                        onChange={handleAgeChange}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-hidden focus:border-[#0E8388] focus:bg-white text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px]">Peso (KG Entero)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej. 12"
                        value={newPetWeight}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setNewPetWeight(val);
                        }}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-hidden focus:border-[#0E8388] focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  {/* ¿Está Esterilizado? */}
                  <div className="space-y-2 pt-1">
                    <label className="font-black text-slate-700 uppercase text-[11px] block">¿Está esterilizado / capado?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewPetSterilized('si')}
                        className={`py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          newPetSterilized === 'si'
                            ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>✂️ Sí, esterilizado/a</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewPetSterilized('no')}
                        className={`py-2.5 px-4 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          newPetSterilized === 'no'
                            ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>🐾 No esterilizado/a</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPetStep(1)}
                      className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      ← Volver
                    </button>

                    <button
                      type="button"
                      disabled={!newPetName.trim()}
                      onClick={() => setPetStep(3)}
                      className={`w-2/3 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                        newPetName.trim()
                          ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white hover:scale-[1.02]'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Siguiente: Alimento</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ALIMENTO HABITUAL & DURACIÓN */}
              {petStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                      Paso 3 de 3: Alimento & Duración 🥣
                    </span>
                    <span className="text-xs font-bold text-emerald-600">100% completado</span>
                  </div>

                  {/* Selection Mode: Live Autocomplete Combobox vs Custom Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-slate-700 uppercase text-[11px]">
                        Alimento Habitual de {newPetName}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomFood(!isCustomFood);
                          setIsFoodDropdownOpen(false);
                        }}
                        className="text-[11px] font-bold text-[#0E8388] underline hover:text-[#0A3E40] cursor-pointer"
                      >
                        {isCustomFood ? '← Seleccionar del catálogo' : '➕ No está en la lista'}
                      </button>
                    </div>

                    {!isCustomFood ? (
                      <div className="relative">
                        {/* Live Search Input */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Empieza a escribir (ej. Bravery, Salmón, Cordero)..."
                            value={newPetFoodSearch}
                            onFocus={() => setIsFoodDropdownOpen(true)}
                            onChange={(e) => {
                              setNewPetFoodSearch(e.target.value);
                              setIsFoodDropdownOpen(true);
                            }}
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-[#0E8388] focus:bg-white text-slate-900 shadow-xs"
                          />
                          {newPetFoodSearch && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewPetFoodSearch('');
                                setIsFoodDropdownOpen(true);
                              }}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 font-bold text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Floating Live Suggestions Panel */}
                        {isFoodDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl p-2 shadow-2xl border border-slate-200 max-h-56 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
                            {PRODUCTS
                              .filter(p => {
                                if (!newPetType) return true;
                                const pt = (p.petType || p.type || '').toLowerCase();
                                const target = newPetType === 'perro' ? 'perro' : 'gato';
                                return pt.includes(target) || pt.includes('todos') || !pt;
                              })
                              .filter(p => {
                                if (!newPetFoodSearch) return true;
                                const q = newPetFoodSearch.toLowerCase();
                                const nameStr = (p.name || '').toLowerCase();
                                const tagStr = (p.tagline || p.description || '').toLowerCase();
                                const brandStr = (p.brand || '').toLowerCase();
                                return nameStr.includes(q) || tagStr.includes(q) || brandStr.includes(q);
                              })
                              .map(product => {
                                const selectedName = `${product.name} (${product.weights ? product.weights[0] : (product.weight || '12 kg')})`;
                                return (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => {
                                      setNewPetFood(selectedName);
                                      setNewPetFoodSearch(selectedName);
                                      setIsFoodDropdownOpen(false);
                                    }}
                                    className="w-full p-2.5 rounded-xl hover:bg-[#E6F4F1] transition-all text-left flex items-center justify-between group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{newPetType === 'perro' ? '🐶' : '🐱'}</span>
                                      <div>
                                        <div className="font-extrabold text-slate-900 text-xs group-hover:text-[#0E8388]">
                                          {product.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium">
                                          {product.brand} • {product.category || 'Alimento Seco'}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-[#0E8388] group-hover:text-white text-[10px] font-black text-slate-700">
                                      {product.weights ? product.weights[0] : (product.weight || '12 kg')}
                                    </span>
                                  </button>
                                );
                              })
                            }

                            {/* Option for unlisted foods */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomFood(true);
                                setIsFoodDropdownOpen(false);
                              }}
                              className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all text-left flex items-center gap-2 text-amber-900 cursor-pointer mt-1"
                            >
                              <span className="text-base">➕</span>
                              <div>
                                <div className="font-black text-xs">¿No encuentras tu alimento?</div>
                                <div className="text-[10px] text-amber-800 font-medium">Ingresar marca y alimento manualmente</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Manual Custom Food Input with Notice Banner */
                      <div className="space-y-3">
                        <input
                          type="text"
                          required
                          placeholder="Escribe el nombre del alimento y marca..."
                          value={customFoodName}
                          onChange={(e) => setCustomFoodName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAF9F5] border-2 border-[#0E8388]/40 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-hidden focus:border-[#0E8388]"
                        />

                        {/* Friendly Notification Banner */}
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                          <div className="font-black flex items-center gap-1.5">
                            <span>💡 ¡Tomamos nota de tu alimento!</span>
                          </div>
                          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                            Intentaremos gestionar el stock e incorporar <strong>"{customFoodName || 'esta marca'}"</strong> a nuestro catálogo de Patitas del Sur para tu próximo pedido mensual.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Duración Estimada */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-700 uppercase text-[11px]">
                      Duración Estimada del Saco (Días)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={newPetDuration}
                      onChange={(e) => setNewPetDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-500 font-medium">
                      Te avisaremos automáticamente 5 días antes de agotarse.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPetStep(2)}
                      className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                    >
                      ← Volver
                    </button>

                    <button
                      type="submit"
                      className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Guardar Registro de Mascota 🐾</span>
                    </button>
                  </div>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: BITÁCORA DE SALUD VETERINARIA (Vacunas, Antiparasitarios & Notas del Veterinario) */}
      {selectedHealthPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* ULTRA-PREMIUM SHOWCASE HEADER BANNER */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-400/30">
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  🏥
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                      Ficha Clínica Veterinaria 🩺
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Bitácora de Salud de {selectedHealthPet.name}</span>
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Historial médico, vacunas, antiparasitarios y diagnósticos veterinarios al día.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHealthPet(null)}
                className="w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 flex items-center justify-center font-bold transition-all shrink-0 self-start sm:self-auto cursor-pointer"
              >
                ✕
              </button>

              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* CLEAN 3-COLUMN SEGMENTED CONTROL (NO SCROLLBAR, NO 'VER TODO', NO TOP 'REGISTRAR ENTRADA') */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setLogCategoryFilter('vacunas')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    logCategoryFilter === 'vacunas'
                      ? 'bg-[#0A3E40] text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <Syringe className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">Vacunas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogCategoryFilter('antiparasitario')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    logCategoryFilter === 'antiparasitario'
                      ? 'bg-[#0A3E40] text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Antiparasitario</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogCategoryFilter('consulta')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    logCategoryFilter === 'consulta'
                      ? 'bg-[#0A3E40] text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#0E8388] shrink-0" />
                  <span className="truncate">Notas Veterinario</span>
                </button>
              </div>

              {/* Active Tab Sub-header with Dedicated Category Action Button */}
              <div className="flex items-center justify-between px-1">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>
                    Historial de {logCategoryFilter === 'vacunas' ? 'Vacunas 💉' : logCategoryFilter === 'antiparasitario' ? 'Antiparasitarios 💊' : 'Notas Veterinarias 🩺'}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setNewLogCategory(logCategoryFilter);
                    if (logCategoryFilter === 'vacunas') {
                      setNewLogTitle(selectedHealthPet.type === 'gato' ? 'Vacuna Triple Felina (Trivalente)' : 'Vacuna Séxtuple Canina (DHPPI+L)');
                      setNewLogFrequency('12');
                      setNewLogNextDue(calculateNextDueDate(12));
                    } else if (logCategoryFilter === 'antiparasitario') {
                      const petAntiparasitics = PRODUCTS.filter(p => 
                        p.category === 'Antiparasitarios' && (
                          selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                        )
                      );
                      if (petAntiparasitics.length > 0) {
                        setSelectedAntiparasiticId(petAntiparasitics[0].id);
                        setNewLogTitle(petAntiparasitics[0].name);
                        setNewLogFrequency(`${petAntiparasitics[0].frequencyMonths || 1}`);
                        setNewLogNextDue(calculateNextDueDate(petAntiparasitics[0].frequencyMonths || 1));
                      }
                    }
                    setIsAddLogFormOpen(!isAddLogFormOpen);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:from-[#0A3E40] hover:to-[#0E8388] text-white font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-300/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isAddLogFormOpen
                      ? 'Cancelar'
                      : logCategoryFilter === 'vacunas'
                      ? 'Registrar Vacuna 💉'
                      : logCategoryFilter === 'antiparasitario'
                      ? 'Registrar Antiparasitario 💊'
                      : 'Registrar Nota 🩺'}
                  </span>
                </button>
              </div>
            </div>

            {/* Collapsible Form for Adding New Health Log */}
            {isAddLogFormOpen && (
              <form onSubmit={handleAddHealthLogSubmit} className="p-6 rounded-3xl bg-[#FAF9F5] border-2 border-[#0E8388]/30 space-y-4 text-xs font-semibold animate-in fade-in duration-200 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="font-black text-[#0A3E40] uppercase tracking-wider flex items-center gap-2 text-sm">
                    {newLogCategory === 'vacunas' ? (
                      <Syringe className="w-4 h-4 text-rose-500" />
                    ) : newLogCategory === 'antiparasitario' ? (
                      <Pill className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-[#0E8388]" />
                    )}
                    <span>
                      {newLogCategory === 'vacunas'
                        ? `Registrar Vacuna para ${selectedHealthPet.name}`
                        : newLogCategory === 'antiparasitario'
                        ? `Registrar Antiparasitario para ${selectedHealthPet.name}`
                        : `Nueva Consulta Médica para ${selectedHealthPet.name}`}
                    </span>
                  </h4>
                  {(newLogCategory === 'vacunas' || newLogCategory === 'antiparasitario') && (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      🔔 Recordatorio Activo
                    </span>
                  )}
                </div>

                {newLogCategory === 'vacunas' ? (
                  <>
                    {/* TIPO DE VACUNA */}
                    <div className="space-y-1.5">
                      {isCustomVaccine ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <Syringe className="w-3.5 h-3.5 text-rose-500" />
                              <span>Nombre de la Vacuna Personalizada</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCustomVaccine(false)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ← Seleccionar de la lista
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Vacuna Giardia, Vacuna KC, etc."
                            value={customVaccineName}
                            onChange={(e) => setCustomVaccineName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-hidden text-slate-800 text-xs"
                          />
                        </div>
                      ) : (
                        <CustomDropdown
                          label="Tipo de Vacuna"
                          icon={Syringe}
                          value={newLogTitle}
                          options={
                            selectedHealthPet.type === 'gato'
                              ? [
                                  { value: "Vacuna Triple Felina (Trivalente)", label: "Vacuna Triple Felina" },
                                  { value: "Vacuna Leucemia Felina (FeLV)", label: "Vacuna Leucemia Felina (FeLV)" },
                                  { value: "Vacuna Antirrábica Felina", label: "Vacuna Antirrábica Felina" },
                                  { value: "Vacuna KC / Complejo Respiratorio Felino", label: "Vacuna KC Complejo Respiratorio" },
                                ]
                              : [
                                  { value: "Vacuna Séxtuple Canina (DHPPI+L)", label: "Vacuna Séxtuple (DHPPI+L)" },
                                  { value: "Vacuna Antirrábica Canina", label: "Vacuna Antirrábica" },
                                  { value: "Vacuna KC / Tos de las Perreras (Bordetella)", label: "Vacuna KC / Tos de las Perreras" },
                                  { value: "Vacuna Óctuple Canina", label: "Vacuna Óctuple Canina" },
                                  { value: "Vacuna Puppy / Cachorro (Primera Dosis)", label: "Vacuna Puppy / Cachorro" },
                                ]
                          }
                          onChange={(val) => setNewLogTitle(val)}
                          rightAction={
                            <button
                              type="button"
                              onClick={() => setIsCustomVaccine(true)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ➕ Otra vacuna
                            </button>
                          }
                        />
                      )}
                    </div>

                    {/* FECHA DE APLICACIÓN Y FRECUENCIA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CustomDatePicker
                        label="Fecha de Aplicación"
                        icon={Clock}
                        value={newLogDate}
                        onChange={(spanishDate) => {
                          setNewLogDate(spanishDate);
                          setNewLogNextDue(calculateNextDueDate(newLogFrequency, spanishDate));
                        }}
                      />

                      <CustomDropdown
                        label="Frecuencia de Refuerzo"
                        icon={Clock}
                        value={newLogFrequency}
                        options={[
                          { value: "12", label: "Anual (12 meses)" },
                          { value: "6", label: "Semestral (6 meses)" },
                          { value: "1", label: "Refuerzo Cachorro (21-30 días)" },
                        ]}
                        onChange={(freq) => {
                          setNewLogFrequency(freq);
                          setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                        }}
                      />
                    </div>

                    {/* PRÓXIMA VACUNA CALCULADA */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0E8388]/10 to-teal-500/10 border border-emerald-300/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-[#0A3E40] uppercase flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#0E8388]" />
                        <span>Próxima Vacuna:</span>
                      </span>
                      <span className="text-xs font-black text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                        📅 {newLogNextDue}
                      </span>
                    </div>
                  </>
                ) : newLogCategory === 'antiparasitario' ? (
                  <>
                    {/* SELECTOR DE ANTIPARASITARIOS ASOCIADOS A LA TIENDA */}
                    <div className="space-y-1.5">
                      {isCustomAntiparasitic ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-amber-500" />
                              <span>Antiparasitario Personalizado</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCustomAntiparasitic(false)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ← Seleccionar de la tienda
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Drontal Plus, Endogard, etc."
                            value={customAntiparasiticName}
                            onChange={(e) => setCustomAntiparasiticName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-hidden text-slate-800 text-xs"
                          />
                        </div>
                      ) : (
                        <CustomDropdown
                          label="Antiparasitario de la Tienda Online"
                          icon={Store}
                          value={selectedAntiparasiticId}
                          options={PRODUCTS.filter(p => p.category === 'Antiparasitarios' && (
                            selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                          )).map(prod => ({
                            value: prod.id,
                            label: `${prod.name} — ${formatCLP(prod.price)}`,
                          }))}
                          onChange={(prodId) => {
                            setSelectedAntiparasiticId(prodId);
                            const prod = PRODUCTS.find(p => p.id === prodId);
                            if (prod) {
                              setNewLogTitle(prod.name);
                              const freq = `${prod.frequencyMonths || 1}`;
                              setNewLogFrequency(freq);
                              setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                            }
                          }}
                          rightAction={
                            <button
                              type="button"
                              onClick={() => setIsCustomAntiparasitic(true)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ➕ Otro no listado
                            </button>
                          }
                        />
                      )}
                    </div>

                    {/* FECHA DE APLICACIÓN Y FRECUENCIA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CustomDatePicker
                        label="Fecha de Aplicación"
                        icon={Clock}
                        value={newLogDate}
                        onChange={(spanishDate) => {
                          setNewLogDate(spanishDate);
                          setNewLogNextDue(calculateNextDueDate(newLogFrequency, spanishDate));
                        }}
                      />

                      <CustomDropdown
                        label="Duración de Protección"
                        icon={Clock}
                        value={newLogFrequency}
                        options={[
                          { value: "1", label: "Mensual (1 mes / 30 días)" },
                          { value: "3", label: "Trimestral (3 meses / 12 semanas)" },
                          { value: "6", label: "Semestral (6 meses)" },
                        ]}
                        onChange={(freq) => {
                          setNewLogFrequency(freq);
                          setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                        }}
                      />
                    </div>

                    {/* PRÓXIMA DOSIS CALCULADA */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0E8388]/10 to-teal-500/10 border border-amber-300/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-[#0A3E40] uppercase flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Próxima Dosis:</span>
                      </span>
                      <span className="text-xs font-black text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-xs">
                        📅 {newLogNextDue}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Motivo de Consulta / Examen</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Chequeo preventivo de rutina"
                          value={newLogTitle}
                          onChange={(e) => setNewLogTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-hidden text-slate-800 text-xs"
                        />
                      </div>

                      <CustomDatePicker
                        label="Fecha de Atención"
                        icon={Clock}
                        value={newLogDate}
                        onChange={(spanishDate) => {
                          setNewLogDate(spanishDate);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Notas & Observaciones</label>
                      <textarea
                        rows={2}
                        placeholder="Observaciones clínicas, dieta, etc."
                        value={newLogNotes}
                        onChange={(e) => setNewLogNotes(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden leading-relaxed text-xs"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Guardar en Bitácora de {selectedHealthPet.name}</span>
                        </button>
                      </form>
                    )}

                    {/* Health Logs List */}
                    <div className="space-y-3.5">
                      {((healthLogs[selectedHealthPet.id] || []).filter(log => {
                        if (logCategoryFilter === 'todos') return true;
                        return log.category === logCategoryFilter;
                      })).length > 0 ? (
                        (healthLogs[selectedHealthPet.id] || [])
                          .filter(log => logCategoryFilter === 'todos' || log.category === logCategoryFilter)
                          .map((log) => {
                            if (log.category === 'vacunas') {
                              const isExpanded = !!expandedLogIds[log.id];
                              const status = getLogStatus(log);
                              const StatusIcon = status.Icon;

                              return (
                                <div
                                  key={log.id}
                                  className={`rounded-2xl border transition-all shadow-xs overflow-hidden bg-slate-50 ${
                                    isExpanded
                                      ? 'border-[#0E8388]/40 ring-2 ring-[#0E8388]/10 bg-white'
                                      : 'border-slate-200/90 hover:border-slate-300'
                                  }`}
                                >
                                  {/* Collapsible Header: Vaccine Name + Status + Chevron */}
                                  <div
                                    onClick={() => toggleLogExpand(log.id)}
                                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                                        {log.title}
                                      </h4>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${status.bg}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        <span>{status.label}</span>
                                      </span>
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-[#0E8388]/10 text-[#0E8388]' : 'text-slate-400'}`}>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#0E8388]' : ''}`} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Content Details */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                                      {/* Dates Information Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            📅 Fecha de Aplicación
                                          </span>
                                          <span className="text-xs font-black text-slate-800">
                                            {log.date}
                                          </span>
                                        </div>

                                        <div className={`p-3 rounded-xl border space-y-0.5 ${status.isOverdue ? 'bg-rose-50/80 border-rose-200/80' : 'bg-emerald-50/80 border-emerald-200/80'}`}>
                                          <span className={`text-[10px] font-black uppercase tracking-wider block flex items-center gap-1 ${status.isOverdue ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            <Clock className={`w-3 h-3 ${status.isOverdue ? 'text-rose-600' : 'text-emerald-600'}`} />
                                            <span>Próxima Vacuna / Refuerzo</span>
                                          </span>
                                          <span className={`text-xs font-black ${status.isOverdue ? 'text-rose-900' : 'text-emerald-900'}`}>
                                            {log.nextDueDate || 'En 1 año'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Automated Reminder Pill */}
                                      <div className="px-3.5 py-2 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-900 font-bold">
                                        <span className="flex items-center gap-1.5">
                                          <span>🔔</span>
                                          <span>Aviso automático activado</span>
                                        </span>
                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                          Activo
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (log.category === 'antiparasitario') {
                              const isExpanded = !!expandedLogIds[log.id];
                              const status = getLogStatus(log);
                              const StatusIcon = status.Icon;

                              // Match with store product
                              const matchedProduct = PRODUCTS.find(p => 
                                (log.productId && p.id === log.productId) ||
                                p.name.toLowerCase().includes(log.title.toLowerCase().split(' ')[0]) ||
                                log.title.toLowerCase().includes(p.brand.toLowerCase())
                              ) || PRODUCTS.find(p => p.category === 'Antiparasitarios');

                              return (
                                <div
                                  key={log.id}
                                  className={`rounded-2xl border transition-all shadow-xs overflow-hidden bg-slate-50 ${
                                    isExpanded
                                      ? 'border-emerald-400/50 ring-2 ring-emerald-400/10 bg-white'
                                      : 'border-slate-200/90 hover:border-slate-300'
                                  }`}
                                >
                                  {/* Collapsible Header */}
                                  <div
                                    onClick={() => toggleLogExpand(log.id)}
                                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                                        {log.title}
                                      </h4>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${status.bg}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        <span>{status.label}</span>
                                      </span>
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'}`}>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-800' : ''}`} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Content Details */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                                      {/* Dates Information Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            📅 Fecha de Aplicación
                                          </span>
                                          <span className="text-xs font-black text-slate-800">
                                            {log.date}
                                          </span>
                                        </div>

                                        <div className={`p-3 rounded-xl border space-y-0.5 ${status.isOverdue ? 'bg-rose-50/80 border-rose-200/80' : 'bg-emerald-50/80 border-emerald-200/80'}`}>
                                          <span className={`text-[10px] font-black uppercase tracking-wider block flex items-center gap-1 ${status.isOverdue ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            <Clock className={`w-3 h-3 ${status.isOverdue ? 'text-rose-600' : 'text-emerald-600'}`} />
                                            <span>Próxima Dosis / Refuerzo</span>
                                          </span>
                                          <span className={`text-xs font-black ${status.isOverdue ? 'text-rose-900' : 'text-emerald-900'}`}>
                                            {log.nextDueDate || 'En 1 mes'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Automated Reminder Pill (Always Green for Active Status) */}
                                      <div className="px-3.5 py-2 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-900 font-bold">
                                        <span className="flex items-center gap-1.5">
                                          <span>🔔</span>
                                          <span>Aviso automático activado</span>
                                        </span>
                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                          Activo
                                        </span>
                                      </div>

                                      {/* DIRECT STORE LINK & REPO REORDER ACTION */}
                                      {matchedProduct && (
                                        <div className="p-3 bg-gradient-to-r from-white to-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                          <div className="flex items-center gap-3">
                                            <img
                                              src={matchedProduct.image}
                                              alt={matchedProduct.name}
                                              className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0"
                                            />
                                            <div>
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-wider">
                                                  🛒 Disponible en Tienda Online
                                                </span>
                                                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                                                  En Stock
                                                </span>
                                              </div>
                                              <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{matchedProduct.name}</h5>
                                              <p className="text-xs font-black text-[#0A3E40] mt-0.5">
                                                {formatCLP(matchedProduct.price)}
                                              </p>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              onAddToCart(matchedProduct, matchedProduct.weights?.[0] || '1 Dosis', 1);
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-[#0A3E40] hover:bg-[#0E8388] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                                          >
                                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                                            <span>Comprar Reposición</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            const isExpanded = !!expandedLogIds[log.id];
                            return (
                              <div
                                key={log.id}
                                className={`rounded-2xl border transition-all shadow-xs overflow-hidden bg-slate-50 ${
                                  isExpanded
                                    ? 'border-teal-400/50 ring-2 ring-teal-400/10 bg-white'
                                    : 'border-slate-200/90 hover:border-slate-300'
                                }`}
                              >
                                <div
                                  onClick={() => toggleLogExpand(log.id)}
                                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">{log.title}</h4>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-slate-500 font-bold">{log.date}</span>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-teal-100 text-teal-700' : 'text-slate-400'}`}>
                                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-teal-700' : ''}`} />
                                    </div>
                                  </div>
                                </div>

                                {isExpanded && log.notes && (
                                  <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-150">
                                    <p className="text-slate-700 text-xs font-medium bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed mt-2">
                                      💬 <strong>Observación Médica:</strong> "{log.notes}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        /* CATEGORY SPECIFIC EMPTY STATE WITH DIRECT REGISTRATION BUTTON */
                        <div className="text-center py-10 px-6 rounded-3xl bg-gradient-to-br from-slate-50 to-[#E6F4F1]/30 border border-slate-200 space-y-4 shadow-inner">
                  <div className="w-16 h-16 rounded-3xl bg-white shadow-md border border-slate-200 mx-auto flex items-center justify-center text-3xl">
                    {logCategoryFilter === 'vacunas' ? '💉' : logCategoryFilter === 'antiparasitario' ? '💊' : '🩺'}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-slate-900 text-base">
                      No hay registros en {logCategoryFilter === 'vacunas' ? 'Vacunas' : logCategoryFilter === 'antiparasitario' ? 'Antiparasitarios' : 'Notas Veterinarias'}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                      {logCategoryFilter === 'vacunas'
                        ? `Registra las vacunas de ${selectedHealthPet.name} para activar los recordatorios automáticos de próximos refuerzos.`
                        : logCategoryFilter === 'antiparasitario'
                        ? `Registra los antiparasitarios de ${selectedHealthPet.name} para activar los avisos de próximas dosis y reponerlos en 1 clic.`
                        : `Lleva el control de salud al día para ${selectedHealthPet.name}.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewLogCategory(logCategoryFilter);
                      if (logCategoryFilter === 'vacunas') {
                        setNewLogTitle(selectedHealthPet.type === 'gato' ? 'Vacuna Triple Felina (Trivalente)' : 'Vacuna Séxtuple Canina (DHPPI+L)');
                        setNewLogFrequency('12');
                        setNewLogNextDue(calculateNextDueDate(12));
                      } else if (logCategoryFilter === 'antiparasitario') {
                        const petAntiparasitics = PRODUCTS.filter(p => 
                          p.category === 'Antiparasitarios' && (
                            selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                          )
                        );
                        if (petAntiparasitics.length > 0) {
                          setSelectedAntiparasiticId(petAntiparasitics[0].id);
                          setNewLogTitle(petAntiparasitics[0].name);
                          setNewLogFrequency(`${petAntiparasitics[0].frequencyMonths || 1}`);
                          setNewLogNextDue(calculateNextDueDate(petAntiparasitics[0].frequencyMonths || 1));
                        }
                      }
                      setIsAddLogFormOpen(true);
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:scale-105 text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer border border-emerald-300/40"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      Registrar {logCategoryFilter === 'vacunas' ? 'Nueva Vacuna 💉' : logCategoryFilter === 'antiparasitario' ? 'Antiparasitario 💊' : 'Nota Médica 🩺'}
                    </span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL: REPONER ALIMENTO CON ALIMENTO HABITUAL Y OPCIONES SIMILARES / SABORES */}
      {selectedReplenishPet && (() => {
        const { currentProduct, similarProducts } = getReplenishProducts(selectedReplenishPet);
        const mainFlavor = currentProduct ? getFlavorBadge(currentProduct) : null;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-auto overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {selectedReplenishPet.type === 'gato' ? '🐱' : '🐶'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-200 uppercase tracking-wider block">
                      Nutrición & Reposición Inteligente
                    </span>
                    <h3 className="text-sm sm:text-lg font-black text-white leading-tight">
                      Reponer Alimento de {selectedReplenishPet.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReplenishPet(null)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Scrollable Area */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 1. MAIN CURRENT PRODUCT CARD (ALIMENTO HABITUAL) */}
                {currentProduct && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 border-2 border-[#0E8388]/30 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Alimento Habitual de {selectedReplenishPet.name}</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        🟢 En Stock Inmediato
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      {/* Product Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <img
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          className="w-full h-full object-contain hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8388]">
                            {currentProduct.brand} {currentProduct.gama && `• ${currentProduct.gama}`}
                          </span>
                          {mainFlavor && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mainFlavor.bg}`}>
                              {mainFlavor.emoji} {mainFlavor.label}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          {currentProduct.name}
                        </h4>

                        <div className="flex items-baseline justify-center sm:justify-start gap-2">
                          <span className="text-lg sm:text-xl font-black text-[#0A3E40]">
                            {formatCLP(currentProduct.price)}
                          </span>
                          {currentProduct.originalPrice && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {formatCLP(currentProduct.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Format / Weight Selector */}
                        {currentProduct.weights && currentProduct.weights.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                              Selecciona el Formato:
                            </span>
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                              {currentProduct.weights.map((weight) => (
                                <button
                                  key={weight}
                                  type="button"
                                  onClick={() => setReplenishWeight(weight)}
                                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                    replenishWeight === weight
                                      ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {weight}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Add to Cart Action */}
                    <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Cantidad:</span>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => setReplenishQuantity(Math.max(1, replenishQuantity - 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-900">
                            {replenishQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReplenishQuantity(replenishQuantity + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(currentProduct, replenishWeight || currentProduct.weights?.[0] || '12 kg', replenishQuantity);
                          setReplenishAddedSuccess(true);
                          setTimeout(() => setReplenishAddedSuccess(false), 2500);
                        }}
                        className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                          replenishAddedSuccess
                            ? 'bg-emerald-600 text-white shadow-emerald-200'
                            : 'bg-[#0A3E40] hover:bg-[#0E8388] text-white'
                        }`}
                      >
                        {replenishAddedSuccess ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-200" />
                            <span>¡Agregado al Carrito!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                            <span>Comprar & Reponer Alimento</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SIMILAR OPTIONS & FLAVOR VARIETIES (CAROUSEL WITH NAVIGATION ARROWS) */}
                {similarProducts.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <span>🔄</span>
                          <span>¿Quieres variar de sabor? Otras opciones {currentProduct?.brand ? `de ${currentProduct.brand}` : 'similares'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Misma calidad y digestibilidad para rotar el menú de {selectedReplenishPet.name} sin problemas estomacales.
                        </p>
                      </div>

                      {/* Navigation Arrows */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => scrollSimilar('left')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-[#0E8388] hover:text-white hover:border-[#0E8388] text-slate-700 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Ver anteriores"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollSimilar('right')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-[#0E8388] hover:text-white hover:border-[#0E8388] text-slate-700 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Ver siguientes"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Scrollable Track */}
                    <div
                      ref={similarSliderRef}
                      className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {similarProducts.map((prod) => {
                        const flavor = getFlavorBadge(prod);
                        const weightChoice = selectedSimilarWeight[prod.id] || prod.weights?.[prod.weights.length - 1] || '12 kg';

                        return (
                          <div
                            key={prod.id}
                            className="min-w-[270px] sm:min-w-[290px] max-w-[290px] p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#0E8388]/60 hover:shadow-md transition-all flex flex-col justify-between gap-3 group shrink-0 snap-start"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0 flex items-center justify-center">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${flavor.bg}`}>
                                  <span>{flavor.emoji}</span>
                                  <span>{flavor.label}</span>
                                </span>
                                <h5 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                                  {prod.name}
                                </h5>
                                <div className="text-xs font-black text-[#0A3E40]">
                                  {formatCLP(prod.price)}
                                </div>
                              </div>
                            </div>

                            {/* Weight Choice + Add Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              {prod.weights && prod.weights.length > 0 ? (
                                <div className="flex items-center gap-1">
                                  {prod.weights.map((w) => (
                                    <button
                                      key={w}
                                      type="button"
                                      onClick={() => setSelectedSimilarWeight(prev => ({ ...prev, [prod.id]: w }))}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                        weightChoice === w
                                          ? 'bg-slate-900 text-white border-slate-900'
                                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {w}
                                    </button>
                                  ))}
                                </div>
                              ) : <div />}

                              <button
                                type="button"
                                onClick={() => {
                                  onAddToCart(prod, weightChoice, 1);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#0E8388]/10 hover:bg-[#0E8388] text-[#0E8388] hover:text-white font-black text-[11px] transition-all flex items-center gap-1 cursor-pointer active:scale-95 ml-auto"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Agregar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. NUTRITIONAL TIP BOX */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong>Tip Nutricional Patitas del Sur:</strong> Al rotar entre sabores de la misma línea <em>{currentProduct?.brand || 'Bravery'} (100% Monoproteica y Grain Free)</em>, la transición se puede realizar de forma directa y segura, brindándole a {selectedReplenishPet.name} variedad de proteínas sin alterar su digestión.
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: CANJE DE PUNTOS POR BENEFICIOS Y CUPONES DE COMPRA */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🎁
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-200 uppercase tracking-wider block">
                    Club Patitas del Sur
                  </span>
                  <h3 className="text-sm sm:text-lg font-black text-white leading-tight">
                    Canjear Puntos de Fidelización
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRedeemModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Balance & Explanation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tu Saldo Disponible</span>
                  <div className="text-2xl font-black text-[#0A3E40] flex items-baseline gap-2">
                    <span>{userPoints.toLocaleString('es-CL')} PTS</span>
                    <span className="text-xs text-emerald-700 font-bold">(${ (userPoints * 10).toLocaleString('es-CL') } CLP canjeables)</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-200 text-right">
                  <span className="text-[10px] font-black text-amber-600 block">Socio VIP Oro 🥇</span>
                  <span className="text-[11px] font-extrabold text-slate-700">10 Pts = $100 CLP</span>
                </div>
              </div>

              {/* Clarification Rule Box (Purchase-based validity, not lifetime) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <strong>¿Cómo funciona el canje?:</strong> Al canjear un beneficio, los puntos se <strong>descuentan de tu saldo</strong> y el cupón queda activo para aplicarse en la <strong>cantidad de compras indicada</strong> (no es de por vida). Una vez utilizado, acumulas nuevos puntos en tus siguientes pedidos para reiniciar el ciclo.
                </div>
              </div>

              {/* Rewards List */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Recompensas Disponibles para Canjear:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REDEEM_REWARDS.map((reward) => {
                    const canAfford = userPoints >= reward.points;

                    return (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          canAfford
                            ? 'bg-white border-slate-200 hover:border-[#0E8388] hover:shadow-md'
                            : 'bg-slate-50 border-slate-200/70 opacity-60'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-2xl">{reward.icon}</span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              canAfford ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}>
                              {reward.points.toLocaleString('es-CL')} Pts
                            </span>
                          </div>

                          <div>
                            <h5 className="text-xs font-black text-slate-900 leading-snug">
                              {reward.title}
                            </h5>
                            <span className="inline-block mt-0.5 text-[10px] font-extrabold text-[#0E8388] bg-teal-50 px-2 py-0.2 rounded-md border border-teal-100">
                              🎟️ {reward.validity}
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                              {reward.description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => {
                            handleRedeemReward(reward);
                            setIsRedeemModalOpen(false);
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                            canAfford
                              ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white cursor-pointer active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Canjear por {reward.points} Pts</span>
                            </>
                          ) : (
                            <span>Faltan {reward.points - userPoints} Pts</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

