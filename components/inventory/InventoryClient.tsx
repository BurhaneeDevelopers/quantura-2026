"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getProducts, addProduct, updateProduct, deleteProduct, formatCurrency } from "@/lib/store";
import { Product, PRODUCT_CATEGORIES, GST_RATES, UNITS } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";
import {
  Plus, Search, Edit, Trash2, Package, AlertTriangle, Filter, LayoutGrid, LayoutList,
  TrendingUp, IndianRupee, ArrowUpDown, Copy, PackageOpen, Boxes, X, Download,
  FileSpreadsheet, FileText, ChevronDown, ArrowDownAZ, ArrowUpAZ,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Electronics": { bg: "bg-[rgba(0,200,255,0.1)]", text: "text-[#00c8ff]", border: "border-[rgba(0,200,255,0.2)]" },
  "Clothing & Apparel": { bg: "bg-[rgba(236,72,153,0.1)]", text: "text-pink-400", border: "border-[rgba(236,72,153,0.2)]" },
  "Grocery & FMCG": { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-[#22c55e]", border: "border-[rgba(34,197,94,0.2)]" },
  "Pharmacy & Health": { bg: "bg-[rgba(239,68,68,0.1)]", text: "text-[#ef4444]", border: "border-[rgba(239,68,68,0.2)]" },
  "Hardware & Tools": { bg: "bg-[rgba(148,163,184,0.1)]", text: "text-slate-400", border: "border-[rgba(148,163,184,0.2)]" },
  "Stationery & Office": { bg: "bg-[rgba(234,179,8,0.1)]", text: "text-yellow-400", border: "border-[rgba(234,179,8,0.2)]" },
  "Automobile Parts": { bg: "bg-[rgba(156,163,175,0.1)]", text: "text-gray-400", border: "border-[rgba(156,163,175,0.2)]" },
  "Jewellery & Accessories": { bg: "bg-[rgba(245,158,11,0.1)]", text: "text-[#f59e0b]", border: "border-[rgba(245,158,11,0.2)]" },
  "Furniture & Home": { bg: "bg-[rgba(249,115,22,0.1)]", text: "text-orange-400", border: "border-[rgba(249,115,22,0.2)]" },
  "Sports & Fitness": { bg: "bg-[rgba(20,184,166,0.1)]", text: "text-[#00c8ff]", border: "border-[rgba(20,184,166,0.2)]" },
  "Beauty & Personal Care": { bg: "bg-[rgba(168,85,247,0.1)]", text: "text-[#a855f7]", border: "border-[rgba(168,85,247,0.2)]" },
  "Books & Media": { bg: "bg-[rgba(99,102,241,0.1)]", text: "text-indigo-400", border: "border-[rgba(99,102,241,0.2)]" },
  "Toys & Games": { bg: "bg-[rgba(6,182,212,0.1)]", text: "text-cyan-400", border: "border-[rgba(6,182,212,0.2)]" },
  "Other": { bg: "bg-[rgba(113,113,122,0.1)]", text: "text-zinc-400", border: "border-[rgba(113,113,122,0.2)]" },
};

const productSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required").min(2, "Min 2 characters"),
  sku: Yup.string().required("SKU is required"),
  barcode: Yup.string(),
  category: Yup.string().required("Category is required"),
  brand: Yup.string(),
  description: Yup.string(),
  costPrice: Yup.number().required("Cost price is required").min(0),
  sellingPrice: Yup.number().required("Selling price is required").min(0),
  mrp: Yup.number().required("MRP is required").min(0),
  gstRate: Yup.number().required("GST rate is required"),
  hsnCode: Yup.string(),
  unit: Yup.string().required("Unit is required"),
  stock: Yup.number().required("Stock is required").min(0),
  lowStockThreshold: Yup.number().required("Threshold is required").min(0),
});

type ProductFormValues = Yup.InferType<typeof productSchema>;
type SortKey = "name" | "stock" | "sellingPrice" | "costPrice" | "category";
type SortDir = "asc" | "desc";

const emptyProduct: ProductFormValues = {
  name: "", sku: "", barcode: "", category: "", brand: "", description: "",
  costPrice: 0, sellingPrice: 0, mrp: 0, gstRate: 18, hsnCode: "", unit: "Pcs", stock: 0, lowStockThreshold: 5,
};

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return <Badge className="text-[10px] bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]">Out</Badge>;
  if (stock <= threshold) return <Badge className="text-[10px] bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]">Low</Badge>;
  return <Badge className="text-[10px] bg-[rgba(34,197,94,0.15)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]">In Stock</Badge>;
}

function SortButton({ label, sortKey, currentKey, dir, onSort, className }: {
  label: string; sortKey: SortKey; currentKey: SortKey; dir: SortDir; onSort: (k: SortKey) => void; className?: string;
}) {
  const isActive = currentKey === sortKey;
  return (
    <button onClick={() => onSort(sortKey)} className={`flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"} ${className}`}>
      {label}
      {isActive ? (dir === "asc" ? <ArrowDownAZ className="h-3 w-3" /> : <ArrowUpAZ className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );
}

export function InventoryClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: getProducts });

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search));
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStock = stockFilter === "all" || (stockFilter === "low" && p.stock <= p.lowStockThreshold && p.stock > 0) || (stockFilter === "out" && p.stock === 0) || (stockFilter === "in" && p.stock > p.lowStockThreshold);
      return matchesSearch && matchesCategory && matchesStock;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "stock") cmp = a.stock - b.stock;
      else if (sortKey === "sellingPrice") cmp = a.sellingPrice - b.sellingPrice;
      else if (sortKey === "costPrice") cmp = a.costPrice - b.costPrice;
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [products, search, categoryFilter, stockFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, values);
      toast.success("Product updated successfully");
    } else {
      addProduct({ ...values, isActive: true } as Omit<Product, "id" | "createdAt" | "updatedAt">);
      toast.success("Product added successfully");
    }
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name","SKU","Barcode","Category","Brand","Cost Price","Selling Price","MRP","GST Rate","HSN Code","Unit","Stock","Low Stock Threshold","Stock Value"];
    const rows = filtered.map(p => [p.name,p.sku,p.barcode||"",p.category,p.brand||"",p.costPrice,p.sellingPrice,p.mrp,p.gstRate,p.hsnCode||"",p.unit,p.stock,p.lowStockThreshold,p.stock*p.sellingPrice]);
    const csv = [headers,...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})), download: `inventory-${new Date().toISOString().split("T")[0]}.csv` });
    a.click();
    toast.success(`Exported ${filtered.length} products to CSV`);
  };

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalStockValue = products.reduce((s, p) => s + p.stock * p.sellingPrice, 0);
  const totalCostValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const activeCategories = [...new Set(products.map(p => p.category))].length;
  const activeFilters = (categoryFilter !== "all" ? 1 : 0) + (stockFilter !== "all" ? 1 : 0) + (search ? 1 : 0);

  const initialValues: ProductFormValues = editingProduct ? {
    name: editingProduct.name, sku: editingProduct.sku, barcode: editingProduct.barcode || "",
    category: editingProduct.category, brand: editingProduct.brand || "", description: editingProduct.description || "",
    costPrice: editingProduct.costPrice, sellingPrice: editingProduct.sellingPrice, mrp: editingProduct.mrp,
    gstRate: editingProduct.gstRate, hsnCode: editingProduct.hsnCode || "", unit: editingProduct.unit,
    stock: editingProduct.stock, lowStockThreshold: editingProduct.lowStockThreshold,
  } : emptyProduct;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title="Inventory"
          subtitle={`Manage your ${products.length} products across ${activeCategories} categories`}
          action={
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export<ChevronDown className="h-3.5 w-3.5 opacity-50" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer"><FileText className="h-4 w-4" />Export as CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }} className="gap-2 bg-[#00c8ff] hover:bg-[#00b8ef] text-black font-bold shadow-lg shadow-[rgba(0,200,255,0.3)]">
                <Plus className="h-4 w-4" />Add Product
              </Button>
            </div>
          }
        />

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Products", value: products.length, icon: Boxes, color: "#00c8ff", bg: "rgba(0,200,255,0.1)", border: "border-l-[#00c8ff]" },
            { label: "Stock Value", value: formatCurrency(totalStockValue), sub: `Cost: ${formatCurrency(totalCostValue)}`, icon: IndianRupee, color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "border-l-[#22c55e]" },
            { label: "Low Stock", value: lowStockCount, sub: "items need reorder", icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "border-l-[#f59e0b]", valueColor: "#f59e0b" },
            { label: "Out of Stock", value: outOfStockCount, sub: "items unavailable", icon: PackageOpen, color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "border-l-[#ef4444]", valueColor: "#ef4444" },
          ].map(({ label, value, sub, icon: Icon, color, bg, border, valueColor }) => (
            <Card key={label} className={`card-hover border-l-4 ${border} bg-[#0f0f14] border-[rgba(255,255,255,0.08)]`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-xl p-2.5" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  <p className="text-xl font-bold" style={valueColor ? { color: valueColor } : undefined}>{value}</p>
                  {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-2 shadow-sm">
          <CardContent className="p-5">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
              <Input placeholder="Search by name, SKU, or barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-12 pr-10 text-base border-2" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Filter className="h-4 w-4" />Filters:</div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={`h-9 w-auto min-w-[160px] border bg-[#1a1a24] text-white ${categoryFilter !== "all" ? "border-[#00c8ff] text-[#00c8ff]" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <Package className="mr-2 h-3.5 w-3.5" /><SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className={`h-9 w-auto min-w-[140px] border bg-[#1a1a24] text-white ${stockFilter !== "all" ? "border-[#22c55e] text-[#22c55e]" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <Boxes className="mr-2 h-3.5 w-3.5" /><SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategoryFilter("all"); setStockFilter("all"); }} className="h-9 text-xs text-muted-foreground">
                  Clear all ({activeFilters})
                </Button>
              )}
              <div className="flex-1" />
              <span className="text-sm text-muted-foreground">{filtered.length} of {products.length} products</span>
              <div className="flex gap-1 rounded-lg border-2 p-1 bg-muted/30">
                <Button variant={viewMode === "table" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("table")}><LayoutList className="h-4 w-4" /></Button>
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center py-16">
                <Package className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">No products found</p>
              </div>
            ) : filtered.map((product) => {
              const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS["Other"];
              const stockPct = Math.min(100, (product.stock / Math.max(product.lowStockThreshold * 3, 1)) * 100);
              const margin = product.sellingPrice > 0 ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1) : "0";
              return (
                <Card key={product.id} className="card-hover group relative overflow-hidden">
                  <CardContent className="p-4 pt-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge className={`text-[10px] font-medium border ${catColor.bg} ${catColor.text} ${catColor.border}`}>{product.category}</Badge>
                      <StockBadge stock={product.stock} threshold={product.lowStockThreshold} />
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</h3>
                    {product.brand && <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
                      <button onClick={() => { navigator.clipboard.writeText(product.sku); toast.success("SKU copied"); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{product.stock} {product.unit} in stock</span><span>min: {product.lowStockThreshold}</span>
                      </div>
                      <Progress value={stockPct} className="h-1.5" />
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">{formatCurrency(product.sellingPrice)}</p>
                        <p className="text-[10px] text-muted-foreground">Cost: {formatCurrency(product.costPrice)} &middot; MRP: {formatCurrency(product.mrp)}</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-[10px] gap-0.5"><TrendingUp className="h-2.5 w-2.5" />{margin}%</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Profit margin</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => { setEditingProduct(product); setDialogOpen(true); }}>
                        <Edit className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 text-[#ef4444] hover:text-[#ef4444]" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="min-w-[200px]"><SortButton label="Product" sortKey="name" currentKey={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead><SortButton label="Category" sortKey="category" currentKey={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="text-right"><SortButton label="Cost" sortKey="costPrice" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead className="text-right"><SortButton label="Price" sortKey="sellingPrice" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead className="text-right"><SortButton label="Stock" sortKey="stock" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center">
                          <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
                          <p className="mt-2 text-sm text-muted-foreground">No products found</p>
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((product) => {
                      const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS["Other"];
                      return (
                        <TableRow key={product.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                          <TableCell>
                            <p className="font-medium text-sm">{product.name}</p>
                            {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs">{product.sku}</span>
                              <button onClick={() => { navigator.clipboard.writeText(product.sku); toast.success("SKU copied"); }}>
                                <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] border ${catColor.bg} ${catColor.text} ${catColor.border}`}>{product.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(product.costPrice)}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatCurrency(product.sellingPrice)}</TableCell>
                          <TableCell className="text-right text-sm">{product.stock} {product.unit}</TableCell>
                          <TableCell className="text-center"><StockBadge stock={product.stock} threshold={product.lowStockThreshold} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProduct(product); setDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProduct(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit" : "Add"} Product</DialogTitle>
            </DialogHeader>
            <Formik initialValues={initialValues} validationSchema={productSchema} onSubmit={handleSubmit} enableReinitialize>
              {({ setFieldValue, values, isSubmitting }) => (
                <Form className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ProductField name="name" label="Product Name *" />
                    <ProductField name="sku" label="SKU *" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ProductField name="barcode" label="Barcode" />
                    <ProductField name="brand" label="Brand" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Category *</label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={values.category} onChange={(e) => setFieldValue("category", e.target.value)}>
                        <option value="">Select category</option>
                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ErrorMessage name="category" component="p" className="text-xs text-destructive" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Unit *</label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={values.unit} onChange={(e) => setFieldValue("unit", e.target.value)}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <ProductField name="costPrice" label="Cost Price (₹) *" type="number" />
                    <ProductField name="sellingPrice" label="Selling Price (₹) *" type="number" />
                    <ProductField name="mrp" label="MRP (₹) *" type="number" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">GST Rate *</label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={values.gstRate} onChange={(e) => setFieldValue("gstRate", Number(e.target.value))}>
                        {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </div>
                    <ProductField name="hsnCode" label="HSN Code" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ProductField name="stock" label="Stock *" type="number" />
                    <ProductField name="lowStockThreshold" label="Low Stock Threshold" type="number" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{editingProduct ? "Update" : "Add"} Product</Button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ModuleAIAssistant moduleName="Inventory" moduleData={{ products }} />
      </div>
    </TooltipProvider>
  );
}

function ProductField({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Field name={name} type={type} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" />
      <ErrorMessage name={name} component="p" className="text-xs text-destructive" />
    </div>
  );
}
