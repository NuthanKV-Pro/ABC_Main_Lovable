import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Download, FileText, AlertTriangle, RotateCcw, ExternalLink, Search, ChevronDown, ChevronUp, Info, Save, FolderOpen, Truck, BookOpen, MapPin, Copy, Eye, Sparkles, Globe, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  qty: number;
  rate: number;
  gstRate: number;
  discount: number;
}

interface AddressDetails {
  line1: string;
  line2: string;
  city: string;
  pincode: string;
}

interface EWayBillDetails {
  transporterName: string;
  transporterId: string;
  transportMode: string;
  vehicleNumber: string;
  distanceKm: string;
  transDocNo: string;
  transDocDate: string;
}

interface InvoiceDraft {
  id: string;
  name: string;
  savedAt: string;
  sellerGSTIN: string;
  buyerGSTIN: string;
  sellerName: string;
  buyerName: string;
  sellerState: string;
  buyerState: string;
  invoiceNo: string;
  invoiceDate: string;
  isInterState: boolean;
  reverseCharge: boolean;
  items: InvoiceItem[];
  eWayBill: EWayBillDetails;
  sellerBillingAddress: AddressDetails;
  buyerBillingAddress: AddressDetails;
  buyerShippingAddress: AddressDetails;
  shippingSameAsBilling: boolean;
  isExportInvoice?: boolean;
  selectedCurrency?: string;
  exchangeRate?: number;
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  defaultRate: number; // approximate rate to INR
}

const currencyData: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", defaultRate: 1 },
  { code: "USD", symbol: "$", name: "US Dollar", defaultRate: 83.50 },
  { code: "EUR", symbol: "€", name: "Euro", defaultRate: 91.20 },
  { code: "GBP", symbol: "£", name: "British Pound", defaultRate: 106.50 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", defaultRate: 22.73 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", defaultRate: 22.27 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", defaultRate: 62.80 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", defaultRate: 55.10 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", defaultRate: 61.50 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", defaultRate: 0.56 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", defaultRate: 95.40 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", defaultRate: 11.50 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", defaultRate: 10.70 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", defaultRate: 18.80 },
  { code: "THB", symbol: "฿", name: "Thai Baht", defaultRate: 2.38 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", defaultRate: 0.063 },
  { code: "ZAR", symbol: "R", name: "South African Rand", defaultRate: 4.60 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", defaultRate: 0.71 },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", defaultRate: 0.27 },
  { code: "NPR", symbol: "रू", name: "Nepalese Rupee", defaultRate: 0.52 },
];

const gstRates = [0, 0.25, 3, 5, 12, 18, 28];

const hsnCodesData: { code: string; description: string; tooltip: string }[] = [
  { code: "9983", description: "Professional Services", tooltip: "Legal, accounting, management consultancy, and other professional services" },
  { code: "9984", description: "Telecommunications", tooltip: "Telecom services including data transmission, VoIP, broadband" },
  { code: "9985", description: "IT & Software Services", tooltip: "Software development, IT consulting, cloud services, data processing" },
  { code: "9986", description: "Support Services", tooltip: "Business support including call centers, collection agencies, packaging" },
  { code: "9971", description: "Financial Services", tooltip: "Banking, insurance, stock broking, fund management services" },
  { code: "9972", description: "Real Estate Services", tooltip: "Real estate agency, property management, building maintenance" },
  { code: "9973", description: "Leasing/Rental Services", tooltip: "Leasing or rental of machinery, equipment, vehicles without operator" },
  { code: "8471", description: "Computers & Laptops", tooltip: "Automatic data processing machines, desktops, laptops, tablets" },
  { code: "8517", description: "Mobile Phones", tooltip: "Smartphones, feature phones, satellite phones, wireless devices" },
  { code: "6109", description: "T-shirts & Apparel", tooltip: "T-shirts, singlets, tank tops of knitted or crocheted fabric" },
  { code: "0402", description: "Milk Products", tooltip: "Milk and cream, concentrated or containing added sugar/sweetening" },
  { code: "1006", description: "Rice", tooltip: "Rice in the husk (paddy or rough), husked, semi/wholly milled" },
  { code: "8703", description: "Motor Cars", tooltip: "Motor cars and other motor vehicles for transport of persons" },
  { code: "3304", description: "Beauty Products", tooltip: "Lip, eye, face make-up preparations, manicure/pedicure products" },
  { code: "3004", description: "Medicines", tooltip: "Medicaments consisting of mixed or unmixed products for therapeutic use" },
  { code: "2202", description: "Beverages", tooltip: "Waters including mineral & aerated with added sugar/flavoring" },
  { code: "9982", description: "Legal Services", tooltip: "Legal advisory, representation, documentation, arbitration services" },
  { code: "998311", description: "Management Consultancy", tooltip: "General management, financial management, HR, marketing consulting" },
  { code: "998312", description: "Business Consultancy", tooltip: "Strategy, operations, supply chain, and organizational consulting" },
  { code: "998313", description: "IT Consultancy", tooltip: "IT strategy, systems planning, architecture design consulting" },
  { code: "998314", description: "Tax Consultancy", tooltip: "Tax advisory, planning, compliance, and representation services" },
  { code: "998315", description: "Accounting Services", tooltip: "Bookkeeping, auditing, tax preparation, payroll services" },
  { code: "9974", description: "Architecture Services", tooltip: "Architectural design, advisory, planning, urban planning services" },
  { code: "998341", description: "Architectural Advisory", tooltip: "Architectural consulting and preliminary design services" },
  { code: "998342", description: "Architectural Design", tooltip: "Building design, drafting, model making, project management" },
  { code: "998343", description: "Urban Planning", tooltip: "Urban and regional planning, landscape architecture services" },
  { code: "998344", description: "Engineering Design", tooltip: "Engineering design services for buildings, infrastructure" },
  { code: "998345", description: "Engineering Advisory", tooltip: "Integrated engineering services, project management engineering" },
  { code: "998346", description: "Surveying & Mapping", tooltip: "Surface surveying, hydrographic, sub-surface, map making" },
  { code: "997311", description: "Machinery Rental", tooltip: "Leasing/rental of machinery & equipment without operator" },
  { code: "997312", description: "Vehicle Rental", tooltip: "Leasing/rental of motor vehicles without driver" },
  { code: "997313", description: "Office Equipment Rental", tooltip: "Leasing/rental of computers, telecom equipment, office machinery" },
  { code: "997314", description: "Property Rental", tooltip: "Rental of commercial/residential property, office space" },
  { code: "997319", description: "Other Rental Services", tooltip: "Rental of other goods including textiles, furniture, containers" },
  { code: "9992", description: "Education Services", tooltip: "Primary, secondary, higher education, and training services" },
  { code: "999210", description: "Primary Education", tooltip: "Pre-primary and primary education services" },
  { code: "999220", description: "Secondary Education", tooltip: "Secondary and higher secondary education services" },
  { code: "999230", description: "Higher Education", tooltip: "University, college, polytechnic education services" },
  { code: "999240", description: "Vocational Training", tooltip: "Specialized vocational training, coaching, skill development" },
  { code: "999250", description: "Coaching Services", tooltip: "Coaching classes, test prep, tutoring services" },
  { code: "9993", description: "Healthcare Services", tooltip: "Hospital, medical, dental, paramedical services" },
  { code: "999311", description: "Hospital Services", tooltip: "Inpatient hospital, nursing home, sanatorium services" },
  { code: "999312", description: "Medical Services", tooltip: "General/specialist medical practitioner services" },
  { code: "999313", description: "Dental Services", tooltip: "Dental practitioner services, oral surgery" },
  { code: "999314", description: "Paramedical Services", tooltip: "Physiotherapy, optometry, nursing, ambulance services" },
  { code: "9965", description: "Goods Transport", tooltip: "Freight transport by road, rail, water, or air" },
  { code: "9964", description: "Passenger Transport", tooltip: "Passenger transport by road, rail, air, water" },
  { code: "996511", description: "Road Freight", tooltip: "Freight transport by road including courier, tanker services" },
  { code: "996512", description: "Rail Freight", tooltip: "Freight transport by railways, container train operations" },
  { code: "996521", description: "Coastal Shipping", tooltip: "Coastal and transoceanic water transport of goods" },
  { code: "996531", description: "Air Freight", tooltip: "Transport of freight by aircraft including charter" },
  { code: "9963", description: "Restaurant Services", tooltip: "Food & beverage serving, catering, takeaway services" },
  { code: "996331", description: "Catering Services", tooltip: "Event catering, institutional catering, contract catering" },
  { code: "2106", description: "Food Preparations", tooltip: "Food preparations not elsewhere specified" },
  { code: "2101", description: "Coffee & Tea Extracts", tooltip: "Extracts, essences and concentrates of coffee, tea" },
  { code: "1905", description: "Bread & Bakery", tooltip: "Bread, pastry, cakes, biscuits, and other bakery products" },
  { code: "9954", description: "Construction Services", tooltip: "Building, civil engineering, installation construction services" },
  { code: "995411", description: "Residential Construction", tooltip: "Construction of residential buildings and houses" },
  { code: "995412", description: "Commercial Construction", tooltip: "Construction of commercial buildings, offices, shopping malls" },
  { code: "995421", description: "Road Construction", tooltip: "Construction of highways, roads, bridges, tunnels" },
  { code: "995422", description: "Utility Construction", tooltip: "Construction of utility projects - water, gas, power" },
  { code: "997131", description: "Life Insurance", tooltip: "Life insurance, annuity, pension fund services" },
  { code: "997132", description: "Non-life Insurance", tooltip: "Accident, health, motor, fire, property insurance" },
  { code: "997133", description: "Reinsurance", tooltip: "Reinsurance of life and non-life insurance" },
  { code: "997134", description: "Insurance Auxiliary", tooltip: "Insurance broking, actuarial, risk assessment services" },
  { code: "9983", description: "Advertising Services", tooltip: "Advertising, market research, public opinion polling" },
  { code: "998361", description: "Print Advertising", tooltip: "Newspaper, magazine, directory advertising space sale" },
  { code: "998362", description: "TV & Radio Advertising", tooltip: "Television and radio advertising time sale" },
  { code: "998363", description: "Digital Advertising", tooltip: "Online advertising, social media, search engine marketing" },
  { code: "998364", description: "Outdoor Advertising", tooltip: "Billboard, transit, cinema, digital signage advertising" },
  { code: "9963", description: "Accommodation Services", tooltip: "Hotel, inn, camping, holiday center lodging services" },
  { code: "9995", description: "Tour Operator Services", tooltip: "Tour operator, travel agency, tourist guide services" },
  { code: "996311", description: "5-Star Hotel", tooltip: "Room/unit accommodation in five-star hotels/resorts" },
  { code: "996312", description: "Hotel (below 5-Star)", tooltip: "Room/unit accommodation in hotels rated below 5-star" },
  { code: "996321", description: "Homestay Services", tooltip: "Home-sharing, homestay, vacation rental accommodation" },
  { code: "8443", description: "Printers & Scanners", tooltip: "Printing machinery, printers, copying machines, scanners" },
  { code: "8528", description: "TV & Monitors", tooltip: "Monitors, projectors, television receivers" },
  { code: "8523", description: "Storage Media", tooltip: "Discs, tapes, solid-state storage, smart cards for recording" },
  { code: "8504", description: "Transformers/Chargers", tooltip: "Electrical transformers, static converters, chargers, UPS" },
  { code: "8544", description: "Cables & Wires", tooltip: "Insulated wire, cable, optical fiber cables, connectors" },
  { code: "6101", description: "Men's Overcoats", tooltip: "Men's/boys' overcoats, jackets, cloaks of knitted fabric" },
  { code: "6104", description: "Women's Suits", tooltip: "Women's/girls' suits, dresses, skirts of knitted fabric" },
  { code: "6110", description: "Sweaters & Pullovers", tooltip: "Jerseys, pullovers, cardigans, waistcoats, knitted" },
  { code: "6203", description: "Men's Trousers", tooltip: "Men's/boys' suits, trousers, shorts of woven fabric" },
  { code: "6204", description: "Women's Dresses", tooltip: "Women's/girls' suits, dresses, skirts of woven fabric" },
  { code: "9401", description: "Chairs & Seats", tooltip: "Seats, chairs (including dentists'), swivel chairs, parts" },
  { code: "9403", description: "Office Furniture", tooltip: "Other furniture - desks, cabinets, bookcases, shelves" },
  { code: "9404", description: "Mattresses", tooltip: "Mattress supports, mattresses, sleeping bags, bed items" },
  { code: "9405", description: "Lighting Fixtures", tooltip: "Lamps, light fittings, illuminated signs, chandeliers" },
  { code: "8711", description: "Motorcycles", tooltip: "Motorcycles, mopeds, scooters, motorized cycles" },
  { code: "8708", description: "Auto Parts", tooltip: "Parts and accessories of motor vehicles (bodies, brakes)" },
  { code: "4011", description: "Tyres (New)", tooltip: "New pneumatic rubber tyres for cars, buses, trucks" },
  { code: "8507", description: "Batteries", tooltip: "Electric accumulators/batteries including Li-ion, lead-acid" },
  { code: "3305", description: "Hair Care Products", tooltip: "Shampoos, hair lacquers, hair dyes, conditioners" },
  { code: "3306", description: "Oral Care Products", tooltip: "Toothpaste, dental floss, mouthwash, denture preparations" },
  { code: "3307", description: "Perfumes & Deodorants", tooltip: "Perfumes, eau de toilette, deodorants, bath preparations" },
  { code: "3401", description: "Soap & Detergents", tooltip: "Soap, organic surface-active agents, washing preparations" },
  { code: "4820", description: "Stationery", tooltip: "Registers, notebooks, letter pads, diaries, folders of paper" },
  { code: "4901", description: "Books & Publications", tooltip: "Printed books, brochures, leaflets, and similar materials" },
  { code: "4911", description: "Printed Materials", tooltip: "Trade advertising, commercial catalogs, printed maps" },
  { code: "9506", description: "Sports Equipment", tooltip: "Articles and equipment for sports, outdoor games, swimming" },
  { code: "9504", description: "Gaming Equipment", tooltip: "Video game consoles, table games, billiards, bowling" },
  { code: "7113", description: "Gold Jewellery", tooltip: "Articles of jewellery of precious metal, gold, silver" },
  { code: "7117", description: "Imitation Jewellery", tooltip: "Imitation jewellery, fashion jewellery, costume jewellery" },
  { code: "7108", description: "Gold (Unwrought)", tooltip: "Gold in unwrought, semi-manufactured, or powder form" },
  { code: "2710", description: "Petroleum Products", tooltip: "Petroleum oils - diesel, petrol, kerosene, lubricating oils" },
  { code: "2711", description: "LPG & Natural Gas", tooltip: "Petroleum gases - LPG, natural gas, propane, butane" },
  { code: "8541", description: "Solar Cells/Panels", tooltip: "Semiconductor devices, solar cells, photovoltaic panels" },
  { code: "0713", description: "Pulses (Dried)", tooltip: "Dried leguminous vegetables - peas, chickpeas, lentils, beans" },
  { code: "0804", description: "Dates & Figs", tooltip: "Dates, figs, pineapples, avocados, guavas, mangoes" },
  { code: "1001", description: "Wheat", tooltip: "Wheat and meslin, durum wheat, seed wheat" },
  { code: "1201", description: "Soya Beans", tooltip: "Soya beans, whether or not broken, for oil extraction" },
  { code: "3923", description: "Plastic Packaging", tooltip: "Articles for conveyance or packing of goods, of plastics" },
  { code: "4819", description: "Paper Packaging", tooltip: "Cartons, boxes, cases, bags of paper or paperboard" },
  { code: "9981", description: "R&D Services", tooltip: "Research and experimental development in sciences" },
  { code: "9961", description: "Maintenance Services", tooltip: "Maintenance and repair of fabricated metal products, machinery" },
  { code: "9962", description: "Cleaning Services", tooltip: "General cleaning, specialized cleaning, janitorial services" },
  { code: "9967", description: "Event Management", tooltip: "Convention, trade show, event management, exhibition services" },
  { code: "9968", description: "Courier & Postal", tooltip: "Postal and courier services, P.O. box rental" },
  { code: "9969", description: "Waste Management", tooltip: "Sewage, waste collection, treatment, disposal, recycling" },
  { code: "9996", description: "Recreation Services", tooltip: "Sporting, amusement, recreation, cultural, entertainment" },
  { code: "9997", description: "Other Services", tooltip: "Washing, dry-cleaning, hairdressing, funeral, other services" },
];

// HSN/SAC to typical GST rate mapping
const hsnGstRateMap: Record<string, { rate: number; label: string }> = {
  "0402": { rate: 5, label: "Milk Products – 5%" }, "0713": { rate: 5, label: "Pulses – 5%" }, "0804": { rate: 0, label: "Fresh Fruits – 0% (unbranded)" },
  "1001": { rate: 5, label: "Wheat – 5%" }, "1006": { rate: 5, label: "Rice – 5%" }, "1201": { rate: 5, label: "Soya Beans – 5%" },
  "1905": { rate: 18, label: "Bread & Bakery – 18% (branded)" }, "2101": { rate: 18, label: "Coffee/Tea Extracts – 18%" },
  "2106": { rate: 18, label: "Food Preparations – 18%" }, "2202": { rate: 28, label: "Aerated Beverages – 28%" },
  "2710": { rate: 18, label: "Petroleum Products – 18% (where applicable)" }, "2711": { rate: 5, label: "LPG – 5%" },
  "3004": { rate: 12, label: "Medicines – 12%" }, "3304": { rate: 28, label: "Beauty Products – 28%" },
  "3305": { rate: 18, label: "Hair Care – 18%" }, "3306": { rate: 18, label: "Oral Care – 18%" },
  "3307": { rate: 28, label: "Perfumes – 28%" }, "3401": { rate: 18, label: "Soap – 18%" },
  "3923": { rate: 18, label: "Plastic Packaging – 18%" }, "4011": { rate: 28, label: "Tyres – 28%" },
  "4819": { rate: 18, label: "Paper Packaging – 18%" }, "4820": { rate: 18, label: "Stationery – 18%" },
  "4901": { rate: 0, label: "Books – 0% (printed)" }, "4911": { rate: 12, label: "Printed Materials – 12%" },
  "6101": { rate: 12, label: "Men's Overcoats – 12% (>₹1000)" }, "6104": { rate: 12, label: "Women's Suits – 12% (>₹1000)" },
  "6109": { rate: 5, label: "T-shirts – 5% (≤₹1000)" }, "6110": { rate: 12, label: "Sweaters – 12% (>₹1000)" },
  "6203": { rate: 12, label: "Men's Trousers – 12% (>₹1000)" }, "6204": { rate: 12, label: "Women's Dresses – 12% (>₹1000)" },
  "7108": { rate: 3, label: "Gold – 3%" }, "7113": { rate: 3, label: "Gold Jewellery – 3%" }, "7117": { rate: 18, label: "Imitation Jewellery – 18%" },
  "8443": { rate: 18, label: "Printers – 18%" }, "8471": { rate: 18, label: "Computers – 18%" },
  "8504": { rate: 18, label: "Transformers/Chargers – 18%" }, "8507": { rate: 28, label: "Batteries – 28%" },
  "8517": { rate: 18, label: "Mobile Phones – 18%" }, "8523": { rate: 18, label: "Storage Media – 18%" },
  "8528": { rate: 28, label: "TV & Monitors – 28%" }, "8541": { rate: 5, label: "Solar Panels – 5%" },
  "8544": { rate: 18, label: "Cables – 18%" }, "8703": { rate: 28, label: "Motor Cars – 28%" },
  "8708": { rate: 28, label: "Auto Parts – 28%" }, "8711": { rate: 28, label: "Motorcycles – 28%" },
  "9401": { rate: 18, label: "Chairs – 18%" }, "9403": { rate: 18, label: "Furniture – 18%" },
  "9404": { rate: 18, label: "Mattresses – 18%" }, "9405": { rate: 18, label: "Lighting – 18%" },
  "9504": { rate: 28, label: "Gaming Equipment – 28%" }, "9506": { rate: 18, label: "Sports Equipment – 18%" },
  // Services (SAC codes)
  "9954": { rate: 18, label: "Construction – 18% (commercial)" }, "9961": { rate: 18, label: "Maintenance – 18%" },
  "9962": { rate: 18, label: "Cleaning – 18%" }, "9963": { rate: 18, label: "Restaurant – 5% (non-AC) / 18%" },
  "9964": { rate: 18, label: "Passenger Transport – 18% (AC)" }, "9965": { rate: 18, label: "Goods Transport – 18%" },
  "9967": { rate: 18, label: "Event Management – 18%" }, "9968": { rate: 18, label: "Courier – 18%" },
  "9969": { rate: 18, label: "Waste Management – 18%" }, "9971": { rate: 18, label: "Financial Services – 18%" },
  "9972": { rate: 18, label: "Real Estate – 18%" }, "9973": { rate: 18, label: "Rental – 18%" },
  "9974": { rate: 18, label: "Architecture – 18%" }, "9981": { rate: 18, label: "R&D Services – 18%" },
  "9982": { rate: 18, label: "Legal Services – 18%" }, "9983": { rate: 18, label: "Professional Services – 18%" },
  "9984": { rate: 18, label: "Telecom – 18%" }, "9985": { rate: 18, label: "IT & Software – 18%" },
  "9986": { rate: 18, label: "Support Services – 18%" }, "9992": { rate: 18, label: "Education – 18% (commercial)" },
  "9993": { rate: 18, label: "Healthcare – 18% (non-exempt)" }, "9995": { rate: 18, label: "Tour Operator – 18%" },
  "9996": { rate: 18, label: "Recreation – 18%" }, "9997": { rate: 18, label: "Other Services – 18%" },
  // Sub-codes map to parent
  "995411": { rate: 12, label: "Residential Construction – 12%" }, "995412": { rate: 18, label: "Commercial Construction – 18%" },
  "995421": { rate: 12, label: "Road Construction – 12%" }, "995422": { rate: 18, label: "Utility Construction – 18%" },
  "996311": { rate: 18, label: "5-Star Hotel – 18%" }, "996312": { rate: 12, label: "Hotel (<₹7500) – 12%" },
  "996321": { rate: 12, label: "Homestay – 12%" }, "996331": { rate: 18, label: "Catering – 18%" },
  "996511": { rate: 18, label: "Road Freight – 18% (or 5% GTA)" }, "996512": { rate: 5, label: "Rail Freight – 5%" },
  "996521": { rate: 18, label: "Coastal Shipping – 18%" }, "996531": { rate: 18, label: "Air Freight – 18%" },
  "997131": { rate: 18, label: "Life Insurance – 18%" }, "997132": { rate: 18, label: "Non-life Insurance – 18%" },
  "997133": { rate: 18, label: "Reinsurance – 18%" }, "997134": { rate: 18, label: "Insurance Auxiliary – 18%" },
  "997311": { rate: 18, label: "Machinery Rental – 18%" }, "997312": { rate: 18, label: "Vehicle Rental – 18%" },
  "997313": { rate: 18, label: "Office Equipment Rental – 18%" }, "997314": { rate: 18, label: "Property Rental – 18%" },
  "997319": { rate: 18, label: "Other Rental – 18%" },
  "998311": { rate: 18, label: "Management Consultancy – 18%" }, "998312": { rate: 18, label: "Business Consultancy – 18%" },
  "998313": { rate: 18, label: "IT Consultancy – 18%" }, "998314": { rate: 18, label: "Tax Consultancy – 18%" },
  "998315": { rate: 18, label: "Accounting Services – 18%" },
  "998341": { rate: 18, label: "Architectural Advisory – 18%" }, "998342": { rate: 18, label: "Architectural Design – 18%" },
  "998343": { rate: 18, label: "Urban Planning – 18%" }, "998344": { rate: 18, label: "Engineering Design – 18%" },
  "998345": { rate: 18, label: "Engineering Advisory – 18%" }, "998346": { rate: 18, label: "Surveying – 18%" },
  "998361": { rate: 18, label: "Print Advertising – 18%" }, "998362": { rate: 18, label: "TV/Radio Advertising – 18%" },
  "998363": { rate: 18, label: "Digital Advertising – 18%" }, "998364": { rate: 18, label: "Outdoor Advertising – 18%" },
  "999210": { rate: 0, label: "Primary Education – Exempt" }, "999220": { rate: 0, label: "Secondary Education – Exempt" },
  "999230": { rate: 18, label: "Higher Education – 18% (private)" }, "999240": { rate: 18, label: "Vocational Training – 18%" },
  "999250": { rate: 18, label: "Coaching – 18%" },
  "999311": { rate: 0, label: "Hospital Services – Exempt" }, "999312": { rate: 0, label: "Medical Services – Exempt" },
  "999313": { rate: 18, label: "Dental Services – 18% (cosmetic)" }, "999314": { rate: 0, label: "Paramedical – Exempt (clinical)" },
};

const getGstSuggestion = (hsnCode: string): { rate: number; label: string } | null => {
  if (!hsnCode) return null;
  // Exact match first
  if (hsnGstRateMap[hsnCode]) return hsnGstRateMap[hsnCode];
  // Try parent codes (6-digit → 4-digit)
  if (hsnCode.length > 4 && hsnGstRateMap[hsnCode.slice(0, 4)]) return hsnGstRateMap[hsnCode.slice(0, 4)];
  return null;
};

const validateGSTIN = (gstin: string): boolean => {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.toUpperCase());
};

const DRAFTS_KEY = "gst_invoice_drafts";
const emptyAddress: AddressDetails = { line1: "", line2: "", city: "", pincode: "" };

const getStoredDrafts = (): InvoiceDraft[] => {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveDraftsToStorage = (drafts: InvoiceDraft[]) => {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
};

const formatAddr = (a: AddressDetails): string => {
  return [a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(", ");
};

const AddressFields = ({ address, onChange, label }: { address: AddressDetails; onChange: (a: AddressDetails) => void; label: string }) => (
  <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
    <div className="flex items-center gap-1.5 mb-1">
      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
    <Input placeholder="Address Line 1" value={address.line1} onChange={e => onChange({ ...address, line1: e.target.value })} className="text-sm" />
    <Input placeholder="Address Line 2 (optional)" value={address.line2} onChange={e => onChange({ ...address, line2: e.target.value })} className="text-sm" />
    <div className="grid grid-cols-2 gap-2">
      <Input placeholder="City" value={address.city} onChange={e => onChange({ ...address, city: e.target.value })} className="text-sm" />
      <Input placeholder="PIN Code" value={address.pincode} onChange={e => onChange({ ...address, pincode: e.target.value })} maxLength={6} className="text-sm" />
    </div>
  </div>
);

const GSTInvoiceGenerator = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [sellerGSTIN, setSellerGSTIN] = useState("29ABCDE1234F1Z5");
  const [buyerGSTIN, setBuyerGSTIN] = useState("");
  const [sellerName, setSellerName] = useState("ABC Enterprises");
  const [buyerName, setBuyerName] = useState("");
  const [sellerState, setSellerState] = useState("29");
  const [buyerState, setBuyerState] = useState("29");
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-001");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInterState, setIsInterState] = useState(false);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [hsnSearchQuery, setHsnSearchQuery] = useState("");
  const [isHsnOpen, setIsHsnOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [draftsDialogOpen, setDraftsDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState<InvoiceDraft[]>(getStoredDrafts);

  // Multi-currency states
  const [isExportInvoice, setIsExportInvoice] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(1);

  // Address states
  const [sellerBillingAddress, setSellerBillingAddress] = useState<AddressDetails>({ ...emptyAddress });
  const [buyerBillingAddress, setBuyerBillingAddress] = useState<AddressDetails>({ ...emptyAddress });
  const [buyerShippingAddress, setBuyerShippingAddress] = useState<AddressDetails>({ ...emptyAddress });
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);

  const [eWayBill, setEWayBill] = useState<EWayBillDetails>({
    transporterName: "", transporterId: "", transportMode: "road",
    vehicleNumber: "", distanceKm: "", transDocNo: "", transDocDate: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Software Development Services", hsnCode: "9985", qty: 1, rate: 100000, gstRate: 18, discount: 0 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), description: "", hsnCode: "", qty: 1, rate: 0, gstRate: 18, discount: 0 }]);
  };
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      // Auto-suggest GST rate when HSN code changes
      if (field === "hsnCode") {
        const suggestion = getGstSuggestion(String(value));
        if (suggestion) updated.gstRate = suggestion.rate;
      }
      return updated;
    }));
  };

  const handleReset = () => {
    setSellerGSTIN(""); setBuyerGSTIN(""); setSellerName(""); setBuyerName("");
    setSellerState("29"); setBuyerState("29");
    setInvoiceNo("INV-2026-001"); setInvoiceDate(new Date().toISOString().split('T')[0]);
    setIsInterState(false); setReverseCharge(false);
    setItems([{ id: "1", description: "", hsnCode: "", qty: 1, rate: 0, gstRate: 18, discount: 0 }]);
    setEWayBill({ transporterName: "", transporterId: "", transportMode: "road", vehicleNumber: "", distanceKm: "", transDocNo: "", transDocDate: "" });
    setSellerBillingAddress({ ...emptyAddress }); setBuyerBillingAddress({ ...emptyAddress });
    setBuyerShippingAddress({ ...emptyAddress }); setShippingSameAsBilling(true);
    setIsExportInvoice(false); setSelectedCurrency("INR"); setExchangeRate(1);
  };

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    const info = currencyData.find(c => c.code === code);
    if (info) setExchangeRate(info.defaultRate);
    if (code !== "INR") setIsExportInvoice(true);
  };

  const totals = useMemo(() => {
    let subtotal = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalDiscount = 0;
    items.forEach(item => {
      const lineTotal = item.qty * item.rate;
      const discountAmt = (lineTotal * item.discount) / 100;
      const taxableValue = lineTotal - discountAmt;
      const gstAmt = (taxableValue * item.gstRate) / 100;
      subtotal += taxableValue; totalDiscount += discountAmt;
      if (isInterState) { totalIGST += gstAmt; } else { totalCGST += gstAmt / 2; totalSGST += gstAmt / 2; }
    });
    return { subtotal, totalCGST, totalSGST, totalIGST, totalDiscount, grandTotal: subtotal + totalCGST + totalSGST + totalIGST };
  }, [items, isInterState]);

  const showEWayBill = totals.grandTotal > 50000;
  const currencyInfo = currencyData.find(c => c.code === selectedCurrency) || currencyData[0];
  const isForeignCurrency = selectedCurrency !== "INR";
  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatForeignCurrency = (n: number) => {
    const fcAmount = exchangeRate > 0 ? n / exchangeRate : 0;
    return `${currencyInfo.symbol}${fcAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const formatDualCurrency = (n: number) => {
    if (!isForeignCurrency) return formatCurrency(n);
    return `${formatForeignCurrency(n)} (${formatCurrency(n)})`;
  };
  const isSellerGSTINValid = validateGSTIN(sellerGSTIN);
  const isBuyerGSTINValid = !buyerGSTIN || validateGSTIN(buyerGSTIN);

  const effectiveShipping = shippingSameAsBilling ? buyerBillingAddress : buyerShippingAddress;

  const filteredHsnCodes = useMemo(() => {
    if (!hsnSearchQuery.trim()) return hsnCodesData;
    const q = hsnSearchQuery.toLowerCase();
    return hsnCodesData.filter(h => h.code.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.tooltip.toLowerCase().includes(q));
  }, [hsnSearchQuery]);

  const states: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
    "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar",
    "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
    "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat", "27": "Maharashtra",
    "29": "Karnataka", "32": "Kerala", "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh"
  };

  // === Save / Load Drafts ===
  const handleSaveDraft = () => {
    const name = draftName.trim() || `Draft - ${invoiceNo}`;
    const draft: InvoiceDraft = {
      id: Date.now().toString(), name, savedAt: new Date().toISOString(),
      sellerGSTIN, buyerGSTIN, sellerName, buyerName, sellerState, buyerState,
      invoiceNo, invoiceDate, isInterState, reverseCharge, items, eWayBill,
      sellerBillingAddress, buyerBillingAddress, buyerShippingAddress, shippingSameAsBilling,
      isExportInvoice, selectedCurrency, exchangeRate,
    };
    const updated = [draft, ...savedDrafts].slice(0, 20);
    setSavedDrafts(updated); saveDraftsToStorage(updated); setDraftName("");
    toast.success(`Draft "${name}" saved`);
  };

  const handleLoadDraft = (draft: InvoiceDraft) => {
    setSellerGSTIN(draft.sellerGSTIN); setBuyerGSTIN(draft.buyerGSTIN);
    setSellerName(draft.sellerName); setBuyerName(draft.buyerName);
    setSellerState(draft.sellerState); setBuyerState(draft.buyerState);
    setInvoiceNo(draft.invoiceNo); setInvoiceDate(draft.invoiceDate);
    setIsInterState(draft.isInterState); setReverseCharge(draft.reverseCharge);
    setItems(draft.items);
    if (draft.eWayBill) setEWayBill(draft.eWayBill);
    if (draft.sellerBillingAddress) setSellerBillingAddress(draft.sellerBillingAddress);
    if (draft.buyerBillingAddress) setBuyerBillingAddress(draft.buyerBillingAddress);
    if (draft.buyerShippingAddress) setBuyerShippingAddress(draft.buyerShippingAddress);
    setShippingSameAsBilling(draft.shippingSameAsBilling ?? true);
    setIsExportInvoice(draft.isExportInvoice ?? false);
    setSelectedCurrency(draft.selectedCurrency ?? "INR");
    setExchangeRate(draft.exchangeRate ?? 1);
    setDraftsDialogOpen(false);
    toast.success(`Loaded "${draft.name}"`);
  };

  const handleDeleteDraft = (id: string) => {
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated); saveDraftsToStorage(updated);
    toast.success("Draft deleted");
  };

  // === PDF Generation ===
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text("TAX INVOICE", pageWidth / 2, 16, { align: "center" });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${invoiceNo}  |  Date: ${invoiceDate}`, pageWidth / 2, 24, { align: "center" });

    doc.setTextColor(0, 0, 0);
    let y = 36;
    doc.setFontSize(8); doc.setTextColor(100, 100, 100);
    doc.text(`Supply Type: ${isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}${reverseCharge ? "  |  Reverse Charge: Yes" : ""}`, 14, y);
    doc.setTextColor(0, 0, 0);
    y += 8;

    const sellerAddr = formatAddr(sellerBillingAddress);
    const buyerAddr = formatAddr(buyerBillingAddress);
    const shipAddr = formatAddr(effectiveShipping);

    // Seller / Buyer details
    autoTable(doc, {
      startY: y,
      body: [
        [
          { content: 'SELLER DETAILS', styles: { fontStyle: 'bold', fontSize: 9, fillColor: [240, 240, 240] } },
          { content: 'BUYER DETAILS', styles: { fontStyle: 'bold', fontSize: 9, fillColor: [240, 240, 240] } }
        ],
        [
          `${sellerName || "-"}\nGSTIN: ${sellerGSTIN || "-"}\nState: ${states[sellerState] || "-"}${sellerAddr ? `\nAddress: ${sellerAddr}` : ""}`,
          `${buyerName || "-"}\nGSTIN: ${buyerGSTIN || "B2C (Unregistered)"}\nState: ${states[buyerState] || "-"}${buyerAddr ? `\nBilling: ${buyerAddr}` : ""}${shipAddr && shipAddr !== buyerAddr ? `\nShipping: ${shipAddr}` : ""}`
        ],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: (pageWidth - 28) / 2 }, 1: { cellWidth: (pageWidth - 28) / 2 } },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable?.finalY + 6 || y + 40;

    // Items table
    const tableHead = isInterState
      ? [["#", "Description", "HSN/SAC", "Qty", "Rate", "Disc%", "Taxable", "IGST", "Total"]]
      : [["#", "Description", "HSN/SAC", "Qty", "Rate", "Disc%", "Taxable", "CGST", "SGST", "Total"]];

    const tableBody = items.map((item, i) => {
      const lineTotal = item.qty * item.rate;
      const discAmt = (lineTotal * item.discount) / 100;
      const taxable = lineTotal - discAmt;
      const gst = (taxable * item.gstRate) / 100;
      if (isInterState) {
        return [String(i + 1), item.description, item.hsnCode, String(item.qty), formatCurrency(item.rate), `${item.discount}%`, formatCurrency(taxable), formatCurrency(gst), formatCurrency(taxable + gst)];
      }
      return [String(i + 1), item.description, item.hsnCode, String(item.qty), formatCurrency(item.rate), `${item.discount}%`, formatCurrency(taxable), formatCurrency(gst / 2), formatCurrency(gst / 2), formatCurrency(taxable + gst)];
    });

    autoTable(doc, {
      head: tableHead, body: tableBody, startY: y,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: isInterState
        ? { 0: { cellWidth: 8 }, 1: { cellWidth: 45 }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' } }
        : { 0: { cellWidth: 8 }, 1: { cellWidth: 38 }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable?.finalY + 6 || y + 40;

    // Summary
    const summaryRows: string[][] = [['Subtotal', formatCurrency(totals.subtotal)]];
    if (totals.totalDiscount > 0) summaryRows.push(['Discount', `-${formatCurrency(totals.totalDiscount)}`]);
    if (isInterState) { summaryRows.push(['IGST', formatCurrency(totals.totalIGST)]); }
    else { summaryRows.push(['CGST', formatCurrency(totals.totalCGST)]); summaryRows.push(['SGST', formatCurrency(totals.totalSGST)]); }
    summaryRows.push(['Grand Total', formatCurrency(totals.grandTotal)]);

    autoTable(doc, {
      startY: y, body: summaryRows, theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'right', cellWidth: pageWidth - 28 - 60 }, 1: { halign: 'right', cellWidth: 60 } },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.row.index === summaryRows.length - 1) {
          data.cell.styles.fontStyle = 'bold'; data.cell.styles.fontSize = 12;
          data.cell.styles.fillColor = [240, 248, 255];
        }
      }
    });

    y = (doc as any).lastAutoTable?.finalY + 6 || y + 40;

    // e-Way Bill
    if (showEWayBill && (eWayBill.transporterName || eWayBill.vehicleNumber)) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text("e-Way Bill / Transport Details", 14, y); y += 4;
      const ewayRows = [
        ['Transporter Name', eWayBill.transporterName || '-'],
        ['Transporter ID', eWayBill.transporterId || '-'],
        ['Mode of Transport', eWayBill.transportMode === 'road' ? 'Road' : eWayBill.transportMode === 'rail' ? 'Rail' : eWayBill.transportMode === 'air' ? 'Air' : 'Ship'],
        ['Vehicle Number', eWayBill.vehicleNumber || '-'],
        ['Distance (km)', eWayBill.distanceKm || '-'],
        ['Transport Doc No', eWayBill.transDocNo || '-'],
        ['Transport Doc Date', eWayBill.transDocDate || '-'],
      ];
      autoTable(doc, { startY: y, body: ewayRows, theme: 'grid', styles: { fontSize: 9, cellPadding: 3 }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }, margin: { left: 14, right: 14 } });
      y = (doc as any).lastAutoTable?.finalY + 6 || y + 40;
    }

    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(7); doc.setTextColor(128, 128, 128);
    doc.text("This is a computer-generated invoice. No signature required.", pageWidth / 2, footerY, { align: "center" });
    doc.text("Generated by ABC - AI Legal & Tax Co-pilot", pageWidth / 2, footerY + 4, { align: "center" });
    doc.save(`GST_Invoice_${invoiceNo}.pdf`);
  };

  const generateWord = () => {
    const taxRows = items.map((item, i) => {
      const lineTotal = item.qty * item.rate;
      const discAmt = (lineTotal * item.discount) / 100;
      const taxable = lineTotal - discAmt;
      const gst = (taxable * item.gstRate) / 100;
      const taxCols = isInterState
        ? `<td style="text-align:right">${formatCurrency(gst)}</td>`
        : `<td style="text-align:right">${formatCurrency(gst / 2)}</td><td style="text-align:right">${formatCurrency(gst / 2)}</td>`;
      return `<tr><td>${i + 1}</td><td>${item.description}</td><td>${item.hsnCode}</td><td style="text-align:right">${item.qty}</td><td style="text-align:right">${formatCurrency(item.rate)}</td><td style="text-align:right">${item.discount}%</td><td style="text-align:right">${formatCurrency(taxable)}</td>${taxCols}<td style="text-align:right">${formatCurrency(taxable + gst)}</td></tr>`;
    }).join("");

    const taxHeader = isInterState ? "<th>IGST</th>" : "<th>CGST</th><th>SGST</th>";
    const taxSummary = isInterState
      ? `<p>IGST: ${formatCurrency(totals.totalIGST)}</p>`
      : `<p>CGST: ${formatCurrency(totals.totalCGST)}</p><p>SGST: ${formatCurrency(totals.totalSGST)}</p>`;

    const sellerAddr = formatAddr(sellerBillingAddress);
    const buyerAddr = formatAddr(buyerBillingAddress);
    const shipAddr = formatAddr(effectiveShipping);

    const eWaySection = showEWayBill && (eWayBill.transporterName || eWayBill.vehicleNumber)
      ? `<h3>e-Way Bill / Transport Details</h3>
         <table><tr><td><strong>Transporter</strong></td><td>${eWayBill.transporterName || '-'}</td><td><strong>Vehicle No</strong></td><td>${eWayBill.vehicleNumber || '-'}</td></tr>
         <tr><td><strong>Transport Mode</strong></td><td>${eWayBill.transportMode}</td><td><strong>Distance</strong></td><td>${eWayBill.distanceKm || '-'} km</td></tr></table>`
      : '';

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>GST Invoice</title>
      <style>body{font-family:Calibri,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 8px;font-size:11px}th{background:#2980b9;color:#fff}h1{text-align:center;color:#2c3e50}.summary{text-align:right;margin-top:16px}</style>
      </head><body>
      <h1>TAX INVOICE</h1>
      <p>Invoice No: ${invoiceNo} | Date: ${invoiceDate} | ${isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}${reverseCharge ? " | Reverse Charge: Yes" : ""}</p>
      <table style="width:100%;border:none;margin-bottom:16px"><tr>
        <td style="border:none;width:50%;vertical-align:top"><strong>Seller</strong><br>${sellerName}<br>GSTIN: ${sellerGSTIN}<br>State: ${states[sellerState] || "-"}${sellerAddr ? `<br>Address: ${sellerAddr}` : ""}</td>
        <td style="border:none;width:50%;vertical-align:top"><strong>Buyer</strong><br>${buyerName || "-"}<br>GSTIN: ${buyerGSTIN || "B2C (Unregistered)"}<br>State: ${states[buyerState] || "-"}${buyerAddr ? `<br>Billing: ${buyerAddr}` : ""}${shipAddr && shipAddr !== buyerAddr ? `<br>Shipping: ${shipAddr}` : ""}</td>
      </tr></table>
      <table><thead><tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Disc%</th><th>Taxable</th>${taxHeader}<th>Total</th></tr></thead><tbody>${taxRows}</tbody></table>
      <div class="summary">
        <p>Subtotal: ${formatCurrency(totals.subtotal)}</p>
        ${taxSummary}
        <p><strong>Grand Total: ${formatCurrency(totals.grandTotal)}</strong></p>
      </div>
      ${eWaySection}
      <p style="font-size:9px;color:#999;margin-top:30px">This is a computer-generated invoice.</p>
      </body></html>`;

    const blob = new Blob([html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `GST_Invoice_${invoiceNo}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => goBack()}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">GST Invoice Generator</h1>
              <p className="text-muted-foreground text-sm">Generate GST-compliant invoices with HSN/SAC codes & GSTIN validation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5"><RotateCcw className="h-4 w-4" /> Reset</Button>
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><Save className="h-4 w-4" /> Save Draft</Button></DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Save Invoice Draft</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label>Draft Name</Label><Input placeholder={`Draft - ${invoiceNo}`} value={draftName} onChange={e => setDraftName(e.target.value)} /></div>
                  <Button onClick={handleSaveDraft} className="w-full gap-1.5"><Save className="h-4 w-4" /> Save</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={draftsDialogOpen} onOpenChange={setDraftsDialogOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><FolderOpen className="h-4 w-4" /> Load Draft</Button></DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Saved Drafts</DialogTitle></DialogHeader>
                {savedDrafts.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">No saved drafts yet</p>
                ) : (
                  <div className="space-y-2 pt-2">
                    {savedDrafts.map(draft => (
                      <div key={draft.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{draft.name}</p>
                          <p className="text-xs text-muted-foreground">{draft.invoiceNo} &bull; {new Date(draft.savedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <Button size="sm" variant="outline" onClick={() => handleLoadDraft(draft)}>Load</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteDraft(draft.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Download</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={generatePDF}><FileText className="h-4 w-4 mr-2" /> Download as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={generateWord}><FileText className="h-4 w-4 mr-2" /> Download as Word (.doc)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Seller & Buyer Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Seller Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Business Name</Label><Input value={sellerName} onChange={e => setSellerName(e.target.value)} /></div>
              <div>
                <Label>GSTIN</Label>
                <Input value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value.toUpperCase())} maxLength={15} />
                {sellerGSTIN && <p className={`text-xs mt-1 ${isSellerGSTINValid ? 'text-green-500' : 'text-destructive'}`}>{isSellerGSTINValid ? "✓ Valid GSTIN format" : "✗ Invalid GSTIN format"}</p>}
              </div>
              <div>
                <Label>State</Label>
                <Select value={sellerState} onValueChange={v => { setSellerState(v); setIsInterState(v !== buyerState); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(states).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <AddressFields address={sellerBillingAddress} onChange={setSellerBillingAddress} label="Billing Address" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Buyer Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Buyer Name</Label><Input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Buyer business name" /></div>
              <div>
                <Label>GSTIN (optional for B2C)</Label>
                <Input value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value.toUpperCase())} maxLength={15} placeholder="Leave blank for B2C" />
                {buyerGSTIN && <p className={`text-xs mt-1 ${isBuyerGSTINValid ? 'text-green-500' : 'text-destructive'}`}>{isBuyerGSTINValid ? "✓ Valid GSTIN format" : "✗ Invalid GSTIN format"}</p>}
              </div>
              <div>
                <Label>State</Label>
                <Select value={buyerState} onValueChange={v => { setBuyerState(v); setIsInterState(v !== sellerState); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(states).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <AddressFields address={buyerBillingAddress} onChange={setBuyerBillingAddress} label="Billing Address" />
              <div className="flex items-center gap-2">
                <Checkbox id="same-addr" checked={shippingSameAsBilling} onCheckedChange={(c) => setShippingSameAsBilling(!!c)} />
                <Label htmlFor="same-addr" className="text-sm cursor-pointer">Shipping address same as billing</Label>
              </div>
              {!shippingSameAsBilling && (
                <AddressFields address={buyerShippingAddress} onChange={setBuyerShippingAddress} label="Shipping Address" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoice Meta */}
        <Card className="mt-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>Invoice No.</Label><Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
              <div><Label>Invoice Date</Label><Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
              <div className="flex items-center gap-2 pt-6"><Badge variant={isInterState ? "default" : "secondary"}>{isInterState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}</Badge></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={reverseCharge} onCheckedChange={setReverseCharge} /><Label className="text-sm">Reverse Charge</Label></div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Currency / Export Invoice */}
        <Card className="mt-6 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Multi-Currency / Export Invoice
            </CardTitle>
            <CardDescription>Enable for export invoices — amounts will show in foreign currency with INR equivalent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={isExportInvoice} onCheckedChange={(c) => {
                  setIsExportInvoice(c);
                  if (!c) { setSelectedCurrency("INR"); setExchangeRate(1); }
                  if (c && selectedCurrency === "INR") { handleCurrencyChange("USD"); }
                }} />
                <Label className="text-sm">Export Invoice</Label>
              </div>
              <div>
                <Label>Invoice Currency</Label>
                <Select value={selectedCurrency} onValueChange={handleCurrencyChange} disabled={!isExportInvoice}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencyData.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exchange Rate (1 {selectedCurrency} = ₹)</Label>
                <div className="flex gap-1.5">
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(Number(e.target.value))}
                    disabled={!isExportInvoice || selectedCurrency === "INR"}
                    step="0.01"
                    min="0"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" disabled={!isExportInvoice} onClick={() => {
                        const info = currencyData.find(c => c.code === selectedCurrency);
                        if (info) setExchangeRate(info.defaultRate);
                        toast.info("Reset to approximate default rate. For actual rates, check RBI reference rates.");
                      }}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Reset to default approximate rate</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {isForeignCurrency && (
                <div className="text-sm p-2 rounded-lg bg-muted/50 border">
                  <p className="text-muted-foreground text-xs">Grand Total in {selectedCurrency}:</p>
                  <p className="font-bold text-primary text-lg">{formatForeignCurrency(totals.grandTotal)}</p>
                  <p className="text-xs text-muted-foreground">INR Equivalent: {formatCurrency(totals.grandTotal)}</p>
                </div>
              )}
            </div>
            {isExportInvoice && (
              <div className="mt-3 p-2.5 rounded-lg bg-muted/30 border flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong>Export Invoice Note:</strong> For exports, GST is either charged at 0% (under LUT/Bond) or at applicable rate with refund claim.
                  Use RBI reference rate on the date of invoice for conversion. Items are entered in INR; the foreign currency equivalent is auto-calculated.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Invoice Items</span>
              <Button size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead><TableHead>HSN/SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate (₹)</TableHead>
                    <TableHead className="text-right">GST %</TableHead><TableHead className="text-right">Disc %</TableHead>
                    <TableHead className="text-right">Amount</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => {
                    const lineTotal = item.qty * item.rate;
                    const discAmt = (lineTotal * item.discount) / 100;
                    const taxable = lineTotal - discAmt;
                    const gst = (taxable * item.gstRate) / 100;
                    return (
                      <TableRow key={item.id}>
                        <TableCell><Input className="min-w-[150px]" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} /></TableCell>
                        <TableCell>
                          <div className="relative">
                            <Input className="w-24" value={item.hsnCode} onChange={e => updateItem(item.id, "hsnCode", e.target.value)} placeholder="HSN/SAC" />
                            {item.hsnCode && getGstSuggestion(item.hsnCode) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] text-primary font-medium truncate max-w-[80px]">{getGstSuggestion(item.hsnCode)!.label}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">GST rate auto-suggested based on HSN/SAC code. You can override manually.</p></TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell><Input className="w-16" type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", Number(e.target.value))} /></TableCell>
                        <TableCell><Input className="w-24" type="number" value={item.rate} onChange={e => updateItem(item.id, "rate", Number(e.target.value))} /></TableCell>
                        <TableCell>
                          <Select value={String(item.gstRate)} onValueChange={v => updateItem(item.id, "gstRate", Number(v))}>
                            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>{gstRates.map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input className="w-16" type="number" value={item.discount} onChange={e => updateItem(item.id, "discount", Number(e.target.value))} /></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(taxable + gst)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              {totals.totalDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-{formatCurrency(totals.totalDiscount)}</span></div>}
              {isInterState ? (
                <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>{formatCurrency(totals.totalIGST)}</span></div>
              ) : (<>
                <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>{formatCurrency(totals.totalCGST)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>{formatCurrency(totals.totalSGST)}</span></div>
              </>)}
              {reverseCharge && <div className="flex items-center gap-2 text-sm text-amber-500"><AlertTriangle className="h-4 w-4" /> Tax payable under Reverse Charge</div>}
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Grand Total</span><span className="text-primary">{formatCurrency(totals.grandTotal)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Live Invoice Preview */}
        <Card className="mt-6">
          <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Live Invoice Preview
                  </CardTitle>
                  {isPreviewOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CardDescription>See a live formatted preview of your invoice as you fill in details</CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="border rounded-lg bg-card p-6 space-y-6 shadow-inner max-w-3xl mx-auto">
                  {/* Preview Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold text-primary tracking-tight">TAX INVOICE</h2>
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Invoice No: <strong className="text-foreground">{invoiceNo || "—"}</strong></span>
                      <span>Date: <strong className="text-foreground">{invoiceDate || "—"}</strong></span>
                    </div>
                    <div className="flex justify-center gap-3 mt-2">
                      <Badge variant={isInterState ? "default" : "secondary"}>{isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}</Badge>
                      {reverseCharge && <Badge variant="outline" className="text-amber-600 border-amber-400">Reverse Charge</Badge>}
                    </div>
                  </div>

                  {/* Seller / Buyer */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Seller</p>
                      <p className="font-semibold text-foreground">{sellerName || "—"}</p>
                      <p className="text-muted-foreground text-xs">GSTIN: {sellerGSTIN || "—"}</p>
                      <p className="text-muted-foreground text-xs">State: {states[sellerState] || "—"}</p>
                      {formatAddr(sellerBillingAddress) && <p className="text-muted-foreground text-xs mt-1">{formatAddr(sellerBillingAddress)}</p>}
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Buyer</p>
                      <p className="font-semibold text-foreground">{buyerName || "—"}</p>
                      <p className="text-muted-foreground text-xs">GSTIN: {buyerGSTIN || "B2C (Unregistered)"}</p>
                      <p className="text-muted-foreground text-xs">State: {states[buyerState] || "—"}</p>
                      {formatAddr(buyerBillingAddress) && <p className="text-muted-foreground text-xs mt-1">Billing: {formatAddr(buyerBillingAddress)}</p>}
                      {!shippingSameAsBilling && formatAddr(buyerShippingAddress) && <p className="text-muted-foreground text-xs">Shipping: {formatAddr(buyerShippingAddress)}</p>}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/60">
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">HSN/SAC</TableHead>
                          <TableHead className="text-xs text-right">Qty</TableHead>
                          <TableHead className="text-xs text-right">Rate</TableHead>
                          <TableHead className="text-xs text-right">Disc%</TableHead>
                          <TableHead className="text-xs text-right">Taxable</TableHead>
                          {isInterState ? (
                            <TableHead className="text-xs text-right">IGST</TableHead>
                          ) : (<>
                            <TableHead className="text-xs text-right">CGST</TableHead>
                            <TableHead className="text-xs text-right">SGST</TableHead>
                          </>)}
                          <TableHead className="text-xs text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item, idx) => {
                          const lt = item.qty * item.rate;
                          const da = (lt * item.discount) / 100;
                          const tv = lt - da;
                          const gstAmt = (tv * item.gstRate) / 100;
                          return (
                            <TableRow key={item.id} className="text-xs">
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell className="font-medium">{item.description || "—"}</TableCell>
                              <TableCell className="font-mono">{item.hsnCode || "—"}</TableCell>
                              <TableCell className="text-right">{item.qty}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                              <TableCell className="text-right">{item.discount}%</TableCell>
                              <TableCell className="text-right">{formatCurrency(tv)}</TableCell>
                              {isInterState ? (
                                <TableCell className="text-right">{formatCurrency(gstAmt)}</TableCell>
                              ) : (<>
                                <TableCell className="text-right">{formatCurrency(gstAmt / 2)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(gstAmt / 2)}</TableCell>
                              </>)}
                              <TableCell className="text-right font-semibold">{formatCurrency(tv + gstAmt)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Preview Summary */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                      {totals.totalDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-{formatCurrency(totals.totalDiscount)}</span></div>}
                      {isInterState ? (
                        <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>{formatCurrency(totals.totalIGST)}</span></div>
                      ) : (<>
                        <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>{formatCurrency(totals.totalCGST)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>{formatCurrency(totals.totalSGST)}</span></div>
                      </>)}
                      <Separator />
                      <div className="flex justify-between font-bold text-base"><span>Grand Total</span><span className="text-primary">{formatCurrency(totals.grandTotal)}</span></div>
                    </div>
                  </div>

                  {/* e-Way Bill in preview */}
                  {showEWayBill && (eWayBill.transporterName || eWayBill.vehicleNumber) && (
                    <div className="border-t pt-3 text-xs space-y-1">
                      <p className="font-semibold text-sm flex items-center gap-1.5"><Truck className="h-4 w-4" /> Transport Details</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                        {eWayBill.transporterName && <span>Transporter: <strong className="text-foreground">{eWayBill.transporterName}</strong></span>}
                        {eWayBill.vehicleNumber && <span>Vehicle: <strong className="text-foreground">{eWayBill.vehicleNumber}</strong></span>}
                        <span>Mode: <strong className="text-foreground capitalize">{eWayBill.transportMode}</strong></span>
                        {eWayBill.distanceKm && <span>Distance: <strong className="text-foreground">{eWayBill.distanceKm} km</strong></span>}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">This is a computer-generated invoice. No signature required.</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {showEWayBill && (
          <Card className="mt-6 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" /> e-Way Bill Details
                <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-xs ml-auto">Required for invoices &gt; ₹50,000</Badge>
              </CardTitle>
              <CardDescription>As per GST rules, e-Way Bill is mandatory for movement of goods worth more than ₹50,000</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label>Transporter Name</Label><Input value={eWayBill.transporterName} onChange={e => setEWayBill(p => ({ ...p, transporterName: e.target.value }))} placeholder="Name of transporter" /></div>
                <div><Label>Transporter ID (GSTIN)</Label><Input value={eWayBill.transporterId} onChange={e => setEWayBill(p => ({ ...p, transporterId: e.target.value.toUpperCase() }))} placeholder="GSTIN of transporter" maxLength={15} /></div>
                <div>
                  <Label>Mode of Transport</Label>
                  <Select value={eWayBill.transportMode} onValueChange={v => setEWayBill(p => ({ ...p, transportMode: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">Road</SelectItem><SelectItem value="rail">Rail</SelectItem>
                      <SelectItem value="air">Air</SelectItem><SelectItem value="ship">Ship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Vehicle Number</Label><Input value={eWayBill.vehicleNumber} onChange={e => setEWayBill(p => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))} placeholder="e.g. KA01AB1234" /></div>
                <div><Label>Approx Distance (km)</Label><Input type="number" value={eWayBill.distanceKm} onChange={e => setEWayBill(p => ({ ...p, distanceKm: e.target.value }))} placeholder="Distance in km" /></div>
                <div><Label>Transport Doc No.</Label><Input value={eWayBill.transDocNo} onChange={e => setEWayBill(p => ({ ...p, transDocNo: e.target.value }))} placeholder="GR/RR/CN number" /></div>
                <div><Label>Transport Doc Date</Label><Input type="date" value={eWayBill.transDocDate} onChange={e => setEWayBill(p => ({ ...p, transDocDate: e.target.value }))} /></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GST Invoicing Guide */}
        <Card className="mt-6">
          <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    GST Invoicing Guide (FY 2025-26 & 2026-27)
                  </CardTitle>
                  {isGuideOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CardDescription>Comprehensive guide covering GST invoice rules, e-Way Bills, HSN requirements & compliance</CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Accordion type="multiple" className="w-full">
                  {/* Section 1: What is a GST Invoice */}
                  <AccordionItem value="what-is">
                    <AccordionTrigger className="text-sm font-semibold">What is a GST Invoice?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>A GST Invoice is a document issued by a registered supplier to the buyer containing details of goods/services supplied, their value, and the tax charged. It serves as the primary document for claiming Input Tax Credit (ITC).</p>
                      <p><strong>Legal basis:</strong> Section 31 of the CGST Act, 2017, read with Rule 46 of the CGST Rules, 2017.</p>
                      <p><strong>Who must issue:</strong> Every registered person supplying taxable goods or services must issue a tax invoice. Composition dealers issue a "Bill of Supply" instead.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 2: Mandatory Fields */}
                  <AccordionItem value="mandatory-fields">
                    <AccordionTrigger className="text-sm font-semibold">Mandatory Fields in a GST Invoice (Rule 46)</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>As per Rule 46 of CGST Rules, a tax invoice must contain:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Name, address & GSTIN</strong> of the supplier</li>
                        <li><strong>Consecutive serial number</strong> (unique for a FY, max 16 characters, containing alphabets/numerals/special characters)</li>
                        <li><strong>Date of issue</strong></li>
                        <li><strong>Name, address & GSTIN/UIN</strong> of the recipient (if registered)</li>
                        <li><strong>Name & address</strong> of the recipient along with delivery address and state code (if unregistered, value &gt; ₹50,000)</li>
                        <li><strong>HSN Code</strong> of goods or SAC of services</li>
                        <li><strong>Description</strong> of goods or services</li>
                        <li><strong>Quantity and unit</strong> (for goods)</li>
                        <li><strong>Total value</strong> of supply</li>
                        <li><strong>Taxable value</strong> after discount</li>
                        <li><strong>Rate and amount</strong> of CGST, SGST/UTGST, IGST</li>
                        <li><strong>Place of supply</strong> (along with state name for inter-state)</li>
                        <li><strong>Whether tax is payable on reverse charge basis</strong></li>
                        <li><strong>Signature</strong> or digital signature of the supplier</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 3: HSN/SAC Requirements */}
                  <AccordionItem value="hsn-requirements">
                    <AccordionTrigger className="text-sm font-semibold">HSN/SAC Code Requirements (FY 2025-26 onwards)</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>As per Notification No. 78/2020 (amended), HSN code requirements on invoices are based on aggregate annual turnover:</p>
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted"><th className="p-2 text-left">Turnover</th><th className="p-2 text-left">HSN Digits Required</th></tr></thead>
                          <tbody>
                            <tr className="border-t"><td className="p-2">Up to ₹5 Crore</td><td className="p-2">4-digit HSN (mandatory from 01-04-2025)</td></tr>
                            <tr className="border-t"><td className="p-2">Above ₹5 Crore</td><td className="p-2">6-digit HSN (mandatory)</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs"><strong>Important:</strong> From FY 2025-26, even taxpayers with turnover up to ₹5 Cr must mention 4-digit HSN on B2B invoices. 6-digit HSN is mandatory for exports and supplies to SEZ.</p>
                      <p className="text-xs"><strong>SAC (Service Accounting Code):</strong> Services use SAC codes (starting with 99). The same turnover-based rules apply for SAC codes on invoices.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 4: Types of Invoices */}
                  <AccordionItem value="invoice-types">
                    <AccordionTrigger className="text-sm font-semibold">Types of GST Documents</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Tax Invoice:</strong> Issued for taxable supply of goods/services by a registered person</li>
                        <li><strong>Bill of Supply:</strong> Issued by composition dealers or for exempt supplies (no tax breakup)</li>
                        <li><strong>Credit Note:</strong> Issued when taxable value or tax in invoice exceeds actual amount, or goods returned</li>
                        <li><strong>Debit Note:</strong> Issued when taxable value or tax in invoice falls short of actual amount</li>
                        <li><strong>Receipt Voucher:</strong> Issued on receipt of advance payment before supply</li>
                        <li><strong>Refund Voucher:</strong> Issued when supply is not made after receiving advance</li>
                        <li><strong>Delivery Challan:</strong> For transport of goods without supply (job work, exhibitions)</li>
                        <li><strong>Revised Invoice:</strong> Issued by newly registered persons for supplies made before registration</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 5: CGST vs SGST vs IGST */}
                  <AccordionItem value="tax-types">
                    <AccordionTrigger className="text-sm font-semibold">CGST vs SGST vs IGST — When to Apply</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted"><th className="p-2 text-left">Scenario</th><th className="p-2 text-left">Tax Applied</th></tr></thead>
                          <tbody>
                            <tr className="border-t"><td className="p-2">Supplier & Buyer in same state</td><td className="p-2">CGST + SGST (split equally)</td></tr>
                            <tr className="border-t"><td className="p-2">Supplier & Buyer in different states</td><td className="p-2">IGST (full amount)</td></tr>
                            <tr className="border-t"><td className="p-2">Supply to/from SEZ</td><td className="p-2">IGST</td></tr>
                            <tr className="border-t"><td className="p-2">Import of goods/services</td><td className="p-2">IGST</td></tr>
                            <tr className="border-t"><td className="p-2">Within Union Territory</td><td className="p-2">CGST + UTGST</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs"><strong>Place of Supply (PoS):</strong> Determines whether IGST or CGST+SGST applies. For goods, PoS is generally where delivery terminates. For services, it is the location of the recipient.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 6: e-Way Bill */}
                  <AccordionItem value="eway-bill">
                    <AccordionTrigger className="text-sm font-semibold">e-Way Bill Rules (FY 2025-26 & 2026-27)</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p><strong>What:</strong> An e-Way Bill is an electronic document generated on the GST portal for movement of goods worth more than ₹50,000 (in a single consignment).</p>
                      <p><strong>When required:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Movement of goods valued &gt; ₹50,000 (inter-state or intra-state)</li>
                        <li>Movement by a registered person even if value &lt; ₹50,000 (in some states)</li>
                        <li>Inter-state movement of handicraft goods by exempt dealers</li>
                      </ul>
                      <p><strong>Validity (based on distance):</strong></p>
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted"><th className="p-2 text-left">Type</th><th className="p-2 text-left">Distance</th><th className="p-2 text-left">Validity</th></tr></thead>
                          <tbody>
                            <tr className="border-t"><td className="p-2">Regular</td><td className="p-2">Up to 200 km</td><td className="p-2">1 day</td></tr>
                            <tr className="border-t"><td className="p-2">Regular</td><td className="p-2">Every additional 200 km</td><td className="p-2">+1 day each</td></tr>
                            <tr className="border-t"><td className="p-2">Over-dimensional cargo</td><td className="p-2">Up to 20 km</td><td className="p-2">1 day</td></tr>
                            <tr className="border-t"><td className="p-2">Over-dimensional cargo</td><td className="p-2">Every additional 20 km</td><td className="p-2">+1 day each</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p><strong>Exemptions from e-Way Bill:</strong></p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Goods transported by non-motorized conveyance</li>
                        <li>Goods transported from port/airport to ICD/CFS under customs supervision</li>
                        <li>Transit cargo to/from Nepal or Bhutan</li>
                        <li>Defence Ministry consignments</li>
                        <li>Empty cargo containers</li>
                        <li>Goods exempt from tax (Schedule-I items like fresh fruits, vegetables, milk)</li>
                        <li>Goods transported within 50 km from place of business to transporter</li>
                      </ul>
                      <p><strong>Generation:</strong> Via <a href="https://ewaybillgst.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ewaybillgst.gov.in</a> or through GST Suvidha Provider APIs. Can also be generated via SMS, Android app, or bulk upload.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 7: Time Limits */}
                  <AccordionItem value="time-limits">
                    <AccordionTrigger className="text-sm font-semibold">Time Limits for Issuing Invoices</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted"><th className="p-2 text-left">Supply Type</th><th className="p-2 text-left">Time Limit</th></tr></thead>
                          <tbody>
                            <tr className="border-t"><td className="p-2">Goods (normal)</td><td className="p-2">Before or at the time of removal/delivery</td></tr>
                            <tr className="border-t"><td className="p-2">Goods (continuous supply)</td><td className="p-2">On or before the due date of payment</td></tr>
                            <tr className="border-t"><td className="p-2">Services (general)</td><td className="p-2">Within 30 days from date of supply</td></tr>
                            <tr className="border-t"><td className="p-2">Services (banking/insurance)</td><td className="p-2">Within 45 days from date of supply</td></tr>
                            <tr className="border-t"><td className="p-2">Exports</td><td className="p-2">Before or after shipment (not later than 15 days from date of BL)</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 8: Reverse Charge */}
                  <AccordionItem value="reverse-charge">
                    <AccordionTrigger className="text-sm font-semibold">Reverse Charge Mechanism (RCM)</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>Under RCM, the recipient of goods/services pays the tax instead of the supplier. Applicable under:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Section 9(3):</strong> Notified goods/services — e.g., legal services by advocate, sponsorship services, GTA services, director services to a company</li>
                        <li><strong>Section 9(4):</strong> Supply from unregistered person to registered person (currently applicable only for specified categories like real estate)</li>
                      </ul>
                      <p><strong>Invoice under RCM:</strong> The recipient must issue a self-invoice. The invoice must clearly mention "Tax payable on reverse charge basis."</p>
                      <p><strong>ITC on RCM:</strong> Tax paid under RCM is eligible for ITC, provided it is used for business purposes and conditions under Section 16 are satisfied.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 9: ITC on Invoices */}
                  <AccordionItem value="itc-rules">
                    <AccordionTrigger className="text-sm font-semibold">Input Tax Credit (ITC) — Key Rules for FY 2025-26</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>ITC can only be claimed if:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>You possess a valid <strong>tax invoice or debit note</strong></li>
                        <li>You have actually <strong>received the goods/services</strong></li>
                        <li>The supplier has <strong>filed GSTR-1</strong> and the invoice reflects in your <strong>GSTR-2B</strong></li>
                        <li>You have <strong>paid the tax to the government</strong> (supplier's obligation)</li>
                        <li>You have <strong>filed your GSTR-3B</strong></li>
                        <li>The invoice is not for <strong>blocked credits</strong> under Section 17(5) — motor vehicles, food & beverages, personal consumption, etc.</li>
                      </ul>
                      <p><strong>Time limit to claim ITC:</strong> Earlier of the due date of GSTR-3B for September of following year OR date of filing annual return.</p>
                      <p className="text-xs"><strong>New for FY 2025-26:</strong> GSTR-2B auto-populated ITC is the benchmark. ITC cannot exceed GSTR-2B amount + 5% (10% earlier). Ensure all your suppliers file returns timely.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 10: Key Deadlines */}
                  <AccordionItem value="deadlines">
                    <AccordionTrigger className="text-sm font-semibold">Key GST Filing Deadlines (FY 2025-26 & 2026-27)</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted"><th className="p-2 text-left">Return</th><th className="p-2 text-left">Due Date</th><th className="p-2 text-left">Details</th></tr></thead>
                          <tbody>
                            <tr className="border-t"><td className="p-2 font-medium">GSTR-1</td><td className="p-2">11th of next month</td><td className="p-2">Outward supplies (sales invoices)</td></tr>
                            <tr className="border-t"><td className="p-2 font-medium">GSTR-3B</td><td className="p-2">20th of next month</td><td className="p-2">Summary return with tax payment</td></tr>
                            <tr className="border-t"><td className="p-2 font-medium">GSTR-1 (QRMP)</td><td className="p-2">13th of month following quarter</td><td className="p-2">Quarterly filers (turnover ≤ ₹5 Cr)</td></tr>
                            <tr className="border-t"><td className="p-2 font-medium">GSTR-3B (QRMP)</td><td className="p-2">22nd/24th of month following quarter</td><td className="p-2">Quarterly filers (date varies by state)</td></tr>
                            <tr className="border-t"><td className="p-2 font-medium">GSTR-9</td><td className="p-2">31st December</td><td className="p-2">Annual return (turnover &gt; ₹2 Cr)</td></tr>
                            <tr className="border-t"><td className="p-2 font-medium">GSTR-9C</td><td className="p-2">31st December</td><td className="p-2">Reconciliation statement (turnover &gt; ₹5 Cr)</td></tr>
                            <tr className="border-t"><td className="p-2 font-medium">IFF</td><td className="p-2">13th of each month</td><td className="p-2">Invoice Furnishing Facility for QRMP quarterly filers</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs"><strong>Late fee:</strong> ₹50/day (₹20 for nil return) for GSTR-3B. ₹50/day for GSTR-1. Maximum cap varies. Interest at 18% p.a. on tax liability.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 11: E-invoicing */}
                  <AccordionItem value="e-invoicing">
                    <AccordionTrigger className="text-sm font-semibold">E-Invoicing (IRN) Requirements</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p><strong>E-invoicing</strong> is mandatory for businesses with aggregate turnover exceeding specified thresholds:</p>
                      <div className="rounded border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-muted"><th className="p-2 text-left">Effective Date</th><th className="p-2 text-left">Turnover Threshold</th></tr></thead>
                          <tbody>
                            <tr className="border-t"><td className="p-2">From 01-08-2023</td><td className="p-2">₹5 Crore and above</td></tr>
                            <tr className="border-t"><td className="p-2">Applicable for FY 2025-26</td><td className="p-2">₹5 Crore and above (any preceding FY from 2017-18)</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p><strong>How it works:</strong></p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Generate invoice in your system in e-invoice format (JSON)</li>
                        <li>Upload to Invoice Registration Portal (IRP) — <a href="https://einvoice1.gst.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">einvoice1.gst.gov.in</a></li>
                        <li>IRP validates, generates IRN (Invoice Reference Number) and QR code</li>
                        <li>Signed invoice returned; auto-populates GSTR-1 and e-Way Bill</li>
                      </ul>
                      <p className="text-xs"><strong>Penalty:</strong> Non-compliance with e-invoicing attracts penalty of 100% of tax due or ₹10,000, whichever is higher, per invoice.</p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section 12: Common Mistakes */}
                  <AccordionItem value="common-mistakes">
                    <AccordionTrigger className="text-sm font-semibold">Common GST Invoicing Mistakes to Avoid</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li><strong>Wrong GSTIN:</strong> Always verify buyer's GSTIN before invoicing. A wrong GSTIN means buyer cannot claim ITC.</li>
                        <li><strong>Missing HSN/SAC:</strong> Non-compliance can lead to rejection of ITC claim and penalty.</li>
                        <li><strong>Wrong place of supply:</strong> Leads to wrong tax type (IGST vs CGST+SGST), causing reconciliation issues.</li>
                        <li><strong>Invoice date mismatch:</strong> Invoice date should match the actual date of supply for proper reporting.</li>
                        <li><strong>Not mentioning reverse charge:</strong> If applicable, failing to mention RCM on invoice violates compliance.</li>
                        <li><strong>Duplicate invoice numbers:</strong> Serial numbers must be unique within a financial year.</li>
                        <li><strong>Not issuing credit/debit notes:</strong> For returns, price revisions, or corrections — issue CN/DN instead of modifying the original invoice.</li>
                        <li><strong>Missing shipping address:</strong> For B2C invoices above ₹50,000, shipping address with state code is mandatory.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 border flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Disclaimer:</strong> This guide is for informational purposes only and is based on GST laws applicable as of FY 2025-26.
                    Always refer to official notifications and consult a CA/tax professional for specific compliance queries. Visit{" "}
                    <a href="https://cbic-gst.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cbic-gst.gov.in</a> for latest updates.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* HSN Reference - Collapsible */}
        <Card className="mt-6">
          <Collapsible open={isHsnOpen} onOpenChange={setIsHsnOpen}>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <CardTitle className="text-lg">Common HSN/SAC Codes Reference ({hsnCodesData.length} codes)</CardTitle>
                  {isHsnOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CardDescription className="flex items-center gap-2 mt-1">
                Click to expand &bull;
                <a href="https://cbic-gst.gov.in/gst-goods-services-rates.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  Official CBIC HSN/SAC Search <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by code, name, or description..." value={hsnSearchQuery} onChange={e => setHsnSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {filteredHsnCodes.map(h => (
                    <Tooltip key={h.code + h.description}>
                      <TooltipTrigger asChild>
                        <div className="p-2 rounded border text-sm hover:bg-muted/50 cursor-help transition-colors flex items-start gap-1.5">
                          <div className="flex-1 min-w-0">
                            <span className="font-mono font-semibold text-primary">{h.code}</span>
                            <span className="text-muted-foreground ml-1.5 text-xs">{h.description}</span>
                          </div>
                          <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[250px]"><p className="text-xs">{h.tooltip}</p></TooltipContent>
                    </Tooltip>
                  ))}
                  {filteredHsnCodes.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-4 text-sm">No codes found matching "{hsnSearchQuery}"</p>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
};

export default GSTInvoiceGenerator;
