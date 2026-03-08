import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Download, FileText, CheckCircle, AlertTriangle, RotateCcw, ExternalLink, Search, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

const gstRates = [0, 0.25, 3, 5, 12, 18, 28];

const hsnCodesData: { code: string; description: string; tooltip: string }[] = [
  // IT & Software
  { code: "9983", description: "Professional Services", tooltip: "Legal, accounting, management consultancy, and other professional services" },
  { code: "9984", description: "Telecommunications", tooltip: "Telecom services including data transmission, VoIP, broadband" },
  { code: "9985", description: "IT & Software Services", tooltip: "Software development, IT consulting, cloud services, data processing" },
  { code: "9986", description: "Support Services", tooltip: "Business support including call centers, collection agencies, packaging" },
  // Financial
  { code: "9971", description: "Financial Services", tooltip: "Banking, insurance, stock broking, fund management services" },
  { code: "9972", description: "Real Estate Services", tooltip: "Real estate agency, property management, building maintenance" },
  { code: "9973", description: "Leasing/Rental Services", tooltip: "Leasing or rental of machinery, equipment, vehicles without operator" },
  // Goods
  { code: "8471", description: "Computers & Laptops", tooltip: "Automatic data processing machines, desktops, laptops, tablets" },
  { code: "8517", description: "Mobile Phones", tooltip: "Smartphones, feature phones, satellite phones, wireless devices" },
  { code: "6109", description: "T-shirts & Apparel", tooltip: "T-shirts, singlets, tank tops of knitted or crocheted fabric" },
  { code: "0402", description: "Milk Products", tooltip: "Milk and cream, concentrated or containing added sugar/sweetening" },
  { code: "1006", description: "Rice", tooltip: "Rice in the husk (paddy or rough), husked, semi/wholly milled" },
  { code: "8703", description: "Motor Cars", tooltip: "Motor cars and other motor vehicles for transport of persons" },
  { code: "3304", description: "Beauty Products", tooltip: "Lip, eye, face make-up preparations, manicure/pedicure products" },
  { code: "3004", description: "Medicines", tooltip: "Medicaments consisting of mixed or unmixed products for therapeutic use" },
  { code: "2202", description: "Beverages", tooltip: "Waters including mineral & aerated with added sugar/flavoring" },
  // Consultancy & Professional
  { code: "9982", description: "Legal Services", tooltip: "Legal advisory, representation, documentation, arbitration services" },
  { code: "998311", description: "Management Consultancy", tooltip: "General management, financial management, HR, marketing consulting" },
  { code: "998312", description: "Business Consultancy", tooltip: "Strategy, operations, supply chain, and organizational consulting" },
  { code: "998313", description: "IT Consultancy", tooltip: "IT strategy, systems planning, architecture design consulting" },
  { code: "998314", description: "Tax Consultancy", tooltip: "Tax advisory, planning, compliance, and representation services" },
  { code: "998315", description: "Accounting Services", tooltip: "Bookkeeping, auditing, tax preparation, payroll services" },
  // Architecture & Engineering
  { code: "9974", description: "Architecture Services", tooltip: "Architectural design, advisory, planning, urban planning services" },
  { code: "998341", description: "Architectural Advisory", tooltip: "Architectural consulting and preliminary design services" },
  { code: "998342", description: "Architectural Design", tooltip: "Building design, drafting, model making, project management" },
  { code: "998343", description: "Urban Planning", tooltip: "Urban and regional planning, landscape architecture services" },
  { code: "998344", description: "Engineering Design", tooltip: "Engineering design services for buildings, infrastructure" },
  { code: "998345", description: "Engineering Advisory", tooltip: "Integrated engineering services, project management engineering" },
  { code: "998346", description: "Surveying & Mapping", tooltip: "Surface surveying, hydrographic, sub-surface, map making" },
  // Rental & Leasing
  { code: "997311", description: "Machinery Rental", tooltip: "Leasing/rental of machinery & equipment without operator" },
  { code: "997312", description: "Vehicle Rental", tooltip: "Leasing/rental of motor vehicles without driver" },
  { code: "997313", description: "Office Equipment Rental", tooltip: "Leasing/rental of computers, telecom equipment, office machinery" },
  { code: "997314", description: "Property Rental", tooltip: "Rental of commercial/residential property, office space" },
  { code: "997319", description: "Other Rental Services", tooltip: "Rental of other goods including textiles, furniture, containers" },
  // Education & Training
  { code: "9992", description: "Education Services", tooltip: "Primary, secondary, higher education, and training services" },
  { code: "999210", description: "Primary Education", tooltip: "Pre-primary and primary education services" },
  { code: "999220", description: "Secondary Education", tooltip: "Secondary and higher secondary education services" },
  { code: "999230", description: "Higher Education", tooltip: "University, college, polytechnic education services" },
  { code: "999240", description: "Vocational Training", tooltip: "Specialized vocational training, coaching, skill development" },
  { code: "999250", description: "Coaching Services", tooltip: "Coaching classes, test prep, tutoring services" },
  // Healthcare
  { code: "9993", description: "Healthcare Services", tooltip: "Hospital, medical, dental, paramedical services" },
  { code: "999311", description: "Hospital Services", tooltip: "Inpatient hospital, nursing home, sanatorium services" },
  { code: "999312", description: "Medical Services", tooltip: "General/specialist medical practitioner services" },
  { code: "999313", description: "Dental Services", tooltip: "Dental practitioner services, oral surgery" },
  { code: "999314", description: "Paramedical Services", tooltip: "Physiotherapy, optometry, nursing, ambulance services" },
  // Transport
  { code: "9965", description: "Goods Transport", tooltip: "Freight transport by road, rail, water, or air" },
  { code: "9964", description: "Passenger Transport", tooltip: "Passenger transport by road, rail, air, water" },
  { code: "996511", description: "Road Freight", tooltip: "Freight transport by road including courier, tanker services" },
  { code: "996512", description: "Rail Freight", tooltip: "Freight transport by railways, container train operations" },
  { code: "996521", description: "Coastal Shipping", tooltip: "Coastal and transoceanic water transport of goods" },
  { code: "996531", description: "Air Freight", tooltip: "Transport of freight by aircraft including charter" },
  // Food & Restaurant
  { code: "9963", description: "Restaurant Services", tooltip: "Food & beverage serving, catering, takeaway services" },
  { code: "996331", description: "Catering Services", tooltip: "Event catering, institutional catering, contract catering" },
  { code: "2106", description: "Food Preparations", tooltip: "Food preparations not elsewhere specified" },
  { code: "2101", description: "Coffee & Tea Extracts", tooltip: "Extracts, essences and concentrates of coffee, tea" },
  { code: "1905", description: "Bread & Bakery", tooltip: "Bread, pastry, cakes, biscuits, and other bakery products" },
  // Construction
  { code: "9954", description: "Construction Services", tooltip: "Building, civil engineering, installation construction services" },
  { code: "995411", description: "Residential Construction", tooltip: "Construction of residential buildings and houses" },
  { code: "995412", description: "Commercial Construction", tooltip: "Construction of commercial buildings, offices, shopping malls" },
  { code: "995421", description: "Road Construction", tooltip: "Construction of highways, roads, bridges, tunnels" },
  { code: "995422", description: "Utility Construction", tooltip: "Construction of utility projects - water, gas, power" },
  // Insurance
  { code: "997131", description: "Life Insurance", tooltip: "Life insurance, annuity, pension fund services" },
  { code: "997132", description: "Non-life Insurance", tooltip: "Accident, health, motor, fire, property insurance" },
  { code: "997133", description: "Reinsurance", tooltip: "Reinsurance of life and non-life insurance" },
  { code: "997134", description: "Insurance Auxiliary", tooltip: "Insurance broking, actuarial, risk assessment services" },
  // Advertising & Media
  { code: "9983", description: "Advertising Services", tooltip: "Advertising, market research, public opinion polling" },
  { code: "998361", description: "Print Advertising", tooltip: "Newspaper, magazine, directory advertising space sale" },
  { code: "998362", description: "TV & Radio Advertising", tooltip: "Television and radio advertising time sale" },
  { code: "998363", description: "Digital Advertising", tooltip: "Online advertising, social media, search engine marketing" },
  { code: "998364", description: "Outdoor Advertising", tooltip: "Billboard, transit, cinema, digital signage advertising" },
  // Travel & Hospitality
  { code: "9963", description: "Accommodation Services", tooltip: "Hotel, inn, camping, holiday center lodging services" },
  { code: "9995", description: "Tour Operator Services", tooltip: "Tour operator, travel agency, tourist guide services" },
  { code: "996311", description: "5-Star Hotel", tooltip: "Room/unit accommodation in five-star hotels/resorts" },
  { code: "996312", description: "Hotel (below 5-Star)", tooltip: "Room/unit accommodation in hotels rated below 5-star" },
  { code: "996321", description: "Homestay Services", tooltip: "Home-sharing, homestay, vacation rental accommodation" },
  // Electronics & Technology
  { code: "8443", description: "Printers & Scanners", tooltip: "Printing machinery, printers, copying machines, scanners" },
  { code: "8528", description: "TV & Monitors", tooltip: "Monitors, projectors, television receivers" },
  { code: "8523", description: "Storage Media", tooltip: "Discs, tapes, solid-state storage, smart cards for recording" },
  { code: "8504", description: "Transformers/Chargers", tooltip: "Electrical transformers, static converters, chargers, UPS" },
  { code: "8544", description: "Cables & Wires", tooltip: "Insulated wire, cable, optical fiber cables, connectors" },
  // Textiles & Garments
  { code: "6101", description: "Men's Overcoats", tooltip: "Men's/boys' overcoats, jackets, cloaks of knitted fabric" },
  { code: "6104", description: "Women's Suits", tooltip: "Women's/girls' suits, dresses, skirts of knitted fabric" },
  { code: "6110", description: "Sweaters & Pullovers", tooltip: "Jerseys, pullovers, cardigans, waistcoats, knitted" },
  { code: "6203", description: "Men's Trousers", tooltip: "Men's/boys' suits, trousers, shorts of woven fabric" },
  { code: "6204", description: "Women's Dresses", tooltip: "Women's/girls' suits, dresses, skirts of woven fabric" },
  // Furniture & Interiors
  { code: "9401", description: "Chairs & Seats", tooltip: "Seats, chairs (including dentists'), swivel chairs, parts" },
  { code: "9403", description: "Office Furniture", tooltip: "Other furniture - desks, cabinets, bookcases, shelves" },
  { code: "9404", description: "Mattresses", tooltip: "Mattress supports, mattresses, sleeping bags, bed items" },
  { code: "9405", description: "Lighting Fixtures", tooltip: "Lamps, light fittings, illuminated signs, chandeliers" },
  // Automobiles & Parts
  { code: "8711", description: "Motorcycles", tooltip: "Motorcycles, mopeds, scooters, motorized cycles" },
  { code: "8708", description: "Auto Parts", tooltip: "Parts and accessories of motor vehicles (bodies, brakes)" },
  { code: "4011", description: "Tyres (New)", tooltip: "New pneumatic rubber tyres for cars, buses, trucks" },
  { code: "8507", description: "Batteries", tooltip: "Electric accumulators/batteries including Li-ion, lead-acid" },
  // Cosmetics & Personal Care
  { code: "3305", description: "Hair Care Products", tooltip: "Shampoos, hair lacquers, hair dyes, conditioners" },
  { code: "3306", description: "Oral Care Products", tooltip: "Toothpaste, dental floss, mouthwash, denture preparations" },
  { code: "3307", description: "Perfumes & Deodorants", tooltip: "Perfumes, eau de toilette, deodorants, bath preparations" },
  { code: "3401", description: "Soap & Detergents", tooltip: "Soap, organic surface-active agents, washing preparations" },
  // Stationery & Printing
  { code: "4820", description: "Stationery", tooltip: "Registers, notebooks, letter pads, diaries, folders of paper" },
  { code: "4901", description: "Books & Publications", tooltip: "Printed books, brochures, leaflets, and similar materials" },
  { code: "4911", description: "Printed Materials", tooltip: "Trade advertising, commercial catalogs, printed maps" },
  // Sports & Fitness
  { code: "9506", description: "Sports Equipment", tooltip: "Articles and equipment for sports, outdoor games, swimming" },
  { code: "9504", description: "Gaming Equipment", tooltip: "Video game consoles, table games, billiards, bowling" },
  // Gems & Jewellery
  { code: "7113", description: "Gold Jewellery", tooltip: "Articles of jewellery of precious metal, gold, silver" },
  { code: "7117", description: "Imitation Jewellery", tooltip: "Imitation jewellery, fashion jewellery, costume jewellery" },
  { code: "7108", description: "Gold (Unwrought)", tooltip: "Gold in unwrought, semi-manufactured, or powder form" },
  // Petroleum & Energy
  { code: "2710", description: "Petroleum Products", tooltip: "Petroleum oils - diesel, petrol, kerosene, lubricating oils" },
  { code: "2711", description: "LPG & Natural Gas", tooltip: "Petroleum gases - LPG, natural gas, propane, butane" },
  { code: "8541", description: "Solar Cells/Panels", tooltip: "Semiconductor devices, solar cells, photovoltaic panels" },
  // Agriculture
  { code: "0713", description: "Pulses (Dried)", tooltip: "Dried leguminous vegetables - peas, chickpeas, lentils, beans" },
  { code: "0804", description: "Dates & Figs", tooltip: "Dates, figs, pineapples, avocados, guavas, mangoes" },
  { code: "1001", description: "Wheat", tooltip: "Wheat and meslin, durum wheat, seed wheat" },
  { code: "1201", description: "Soya Beans", tooltip: "Soya beans, whether or not broken, for oil extraction" },
  // Packaging
  { code: "3923", description: "Plastic Packaging", tooltip: "Articles for conveyance or packing of goods, of plastics" },
  { code: "4819", description: "Paper Packaging", tooltip: "Cartons, boxes, cases, bags of paper or paperboard" },
  // Miscellaneous Services
  { code: "9981", description: "R&D Services", tooltip: "Research and experimental development in sciences" },
  { code: "9961", description: "Maintenance Services", tooltip: "Maintenance and repair of fabricated metal products, machinery" },
  { code: "9962", description: "Cleaning Services", tooltip: "General cleaning, specialized cleaning, janitorial services" },
  { code: "9967", description: "Event Management", tooltip: "Convention, trade show, event management, exhibition services" },
  { code: "9968", description: "Courier & Postal", tooltip: "Postal and courier services, P.O. box rental" },
  { code: "9969", description: "Waste Management", tooltip: "Sewage, waste collection, treatment, disposal, recycling" },
  { code: "9996", description: "Recreation Services", tooltip: "Sporting, amusement, recreation, cultural, entertainment" },
  { code: "9997", description: "Other Services", tooltip: "Washing, dry-cleaning, hairdressing, funeral, other services" },
];

const validateGSTIN = (gstin: string): boolean => {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.toUpperCase());
};

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

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Software Development Services", hsnCode: "9985", qty: 1, rate: 100000, gstRate: 18, discount: 0 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), description: "", hsnCode: "", qty: 1, rate: 0, gstRate: 18, discount: 0 }]);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleReset = () => {
    setSellerGSTIN("");
    setBuyerGSTIN("");
    setSellerName("");
    setBuyerName("");
    setSellerState("29");
    setBuyerState("29");
    setInvoiceNo("INV-2026-001");
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setIsInterState(false);
    setReverseCharge(false);
    setItems([{ id: "1", description: "", hsnCode: "", qty: 1, rate: 0, gstRate: 18, discount: 0 }]);
  };

  const totals = useMemo(() => {
    let subtotal = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalDiscount = 0;
    items.forEach(item => {
      const lineTotal = item.qty * item.rate;
      const discountAmt = (lineTotal * item.discount) / 100;
      const taxableValue = lineTotal - discountAmt;
      const gstAmt = (taxableValue * item.gstRate) / 100;
      subtotal += taxableValue;
      totalDiscount += discountAmt;
      if (isInterState) {
        totalIGST += gstAmt;
      } else {
        totalCGST += gstAmt / 2;
        totalSGST += gstAmt / 2;
      }
    });
    return { subtotal, totalCGST, totalSGST, totalIGST, totalDiscount, grandTotal: subtotal + totalCGST + totalSGST + totalIGST };
  }, [items, isInterState]);

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isSellerGSTINValid = validateGSTIN(sellerGSTIN);
  const isBuyerGSTINValid = !buyerGSTIN || validateGSTIN(buyerGSTIN);

  const filteredHsnCodes = useMemo(() => {
    if (!hsnSearchQuery.trim()) return hsnCodesData;
    const q = hsnSearchQuery.toLowerCase();
    return hsnCodesData.filter(
      h => h.code.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.tooltip.toLowerCase().includes(q)
    );
  }, [hsnSearchQuery]);

  const states: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
    "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar",
    "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
    "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat", "27": "Maharashtra",
    "29": "Karnataka", "32": "Kerala", "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh"
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("TAX INVOICE", 105, 18, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceNo}`, 14, 30);
    doc.text(`Date: ${invoiceDate}`, 160, 30);
    doc.text(`Supply Type: ${isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}`, 14, 36);
    if (reverseCharge) doc.text("Reverse Charge: Yes", 160, 36);

    doc.setFontSize(11);
    doc.text("Seller", 14, 46);
    doc.setFontSize(9);
    doc.text(sellerName || "-", 14, 52);
    doc.text(`GSTIN: ${sellerGSTIN || "-"}`, 14, 57);
    doc.text(`State: ${states[sellerState] || "-"}`, 14, 62);

    doc.setFontSize(11);
    doc.text("Buyer", 110, 46);
    doc.setFontSize(9);
    doc.text(buyerName || "-", 110, 52);
    doc.text(`GSTIN: ${buyerGSTIN || "B2C (Unregistered)"}`, 110, 57);
    doc.text(`State: ${states[buyerState] || "-"}`, 110, 62);

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

    autoTable(doc, { head: tableHead, body: tableBody, startY: 70, styles: { fontSize: 8 }, headStyles: { fillColor: [41, 128, 185] } });

    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(totals.subtotal)}`, 140, finalY + 10);
    if (isInterState) {
      doc.text(`IGST: ${formatCurrency(totals.totalIGST)}`, 140, finalY + 16);
    } else {
      doc.text(`CGST: ${formatCurrency(totals.totalCGST)}`, 140, finalY + 16);
      doc.text(`SGST: ${formatCurrency(totals.totalSGST)}`, 140, finalY + 22);
    }
    const grandY = isInterState ? finalY + 24 : finalY + 30;
    doc.setFontSize(12);
    doc.text(`Grand Total: ${formatCurrency(totals.grandTotal)}`, 140, grandY);

    doc.setFontSize(7);
    doc.text("This is a computer-generated invoice.", 14, 285);

    doc.save(`GST_Invoice_${invoiceNo}.pdf`);
  };

  const generateWord = () => {
    const taxRows = items.map((item, i) => {
      const lineTotal = item.qty * item.rate;
      const discAmt = (lineTotal * item.discount) / 100;
      const taxable = lineTotal - discAmt;
      const gst = (taxable * item.gstRate) / 100;
      const taxCols = isInterState
        ? `<td>${formatCurrency(gst)}</td>`
        : `<td>${formatCurrency(gst / 2)}</td><td>${formatCurrency(gst / 2)}</td>`;
      return `<tr><td>${i + 1}</td><td>${item.description}</td><td>${item.hsnCode}</td><td>${item.qty}</td><td>${formatCurrency(item.rate)}</td><td>${item.discount}%</td><td>${formatCurrency(taxable)}</td>${taxCols}<td>${formatCurrency(taxable + gst)}</td></tr>`;
    }).join("");

    const taxHeader = isInterState ? "<th>IGST</th>" : "<th>CGST</th><th>SGST</th>";
    const taxSummary = isInterState
      ? `<p>IGST: ${formatCurrency(totals.totalIGST)}</p>`
      : `<p>CGST: ${formatCurrency(totals.totalCGST)}</p><p>SGST: ${formatCurrency(totals.totalSGST)}</p>`;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>GST Invoice</title>
      <style>body{font-family:Calibri,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 8px;font-size:11px}th{background:#2980b9;color:#fff}h1{text-align:center;color:#2c3e50}.info{display:flex;justify-content:space-between}.summary{text-align:right;margin-top:16px}</style>
      </head><body>
      <h1>TAX INVOICE</h1>
      <p>Invoice No: ${invoiceNo} | Date: ${invoiceDate} | ${isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}${reverseCharge ? " | Reverse Charge: Yes" : ""}</p>
      <table style="width:100%;border:none;margin-bottom:16px"><tr>
        <td style="border:none;width:50%;vertical-align:top"><strong>Seller</strong><br>${sellerName}<br>GSTIN: ${sellerGSTIN}<br>State: ${states[sellerState] || "-"}</td>
        <td style="border:none;width:50%;vertical-align:top"><strong>Buyer</strong><br>${buyerName || "-"}<br>GSTIN: ${buyerGSTIN || "B2C (Unregistered)"}<br>State: ${states[buyerState] || "-"}</td>
      </tr></table>
      <table><thead><tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Disc%</th><th>Taxable</th>${taxHeader}<th>Total</th></tr></thead><tbody>${taxRows}</tbody></table>
      <div class="summary">
        <p>Subtotal: ${formatCurrency(totals.subtotal)}</p>
        ${taxSummary}
        <p><strong>Grand Total: ${formatCurrency(totals.grandTotal)}</strong></p>
      </div>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => goBack()}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">GST Invoice Generator</h1>
              <p className="text-muted-foreground text-sm">Generate GST-compliant invoices with HSN/SAC codes & GSTIN validation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={generatePDF}>
                  <FileText className="h-4 w-4 mr-2" /> Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={generateWord}>
                  <FileText className="h-4 w-4 mr-2" /> Download as Word (.doc)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seller Details */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Seller Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Business Name</Label>
                <Input value={sellerName} onChange={e => setSellerName(e.target.value)} />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value.toUpperCase())} maxLength={15} />
                {sellerGSTIN && <p className={`text-xs mt-1 ${isSellerGSTINValid ? 'text-green-500' : 'text-destructive'}`}>
                  {isSellerGSTINValid ? "✓ Valid GSTIN format" : "✗ Invalid GSTIN format"}
                </p>}
              </div>
              <div>
                <Label>State</Label>
                <Select value={sellerState} onValueChange={v => { setSellerState(v); setIsInterState(v !== buyerState); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(states).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Buyer Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Buyer Name</Label>
                <Input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Buyer business name" />
              </div>
              <div>
                <Label>GSTIN (optional for B2C)</Label>
                <Input value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value.toUpperCase())} maxLength={15} placeholder="Leave blank for B2C" />
                {buyerGSTIN && <p className={`text-xs mt-1 ${isBuyerGSTINValid ? 'text-green-500' : 'text-destructive'}`}>
                  {isBuyerGSTINValid ? "✓ Valid GSTIN format" : "✗ Invalid GSTIN format"}
                </p>}
              </div>
              <div>
                <Label>State</Label>
                <Select value={buyerState} onValueChange={v => { setBuyerState(v); setIsInterState(v !== sellerState); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(states).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Meta */}
        <Card className="mt-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>Invoice No.</Label><Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
              <div><Label>Invoice Date</Label><Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Badge variant={isInterState ? "default" : "secondary"}>{isInterState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}</Badge>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={reverseCharge} onCheckedChange={setReverseCharge} />
                <Label className="text-sm">Reverse Charge</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
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
                    <TableHead>Description</TableHead>
                    <TableHead>HSN/SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate (₹)</TableHead>
                    <TableHead className="text-right">GST %</TableHead>
                    <TableHead className="text-right">Disc %</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
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
                        <TableCell><Input className="w-20" value={item.hsnCode} onChange={e => updateItem(item.id, "hsnCode", e.target.value)} /></TableCell>
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
                <a
                  href="https://cbic-gst.gov.in/gst-goods-services-rates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Official CBIC HSN/SAC Search <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code, name, or description..."
                    value={hsnSearchQuery}
                    onChange={e => setHsnSearchQuery(e.target.value)}
                    className="pl-9"
                  />
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
                      <TooltipContent side="top" className="max-w-[250px]">
                        <p className="text-xs">{h.tooltip}</p>
                      </TooltipContent>
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
