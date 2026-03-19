"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, FileSpreadsheet, Filter, FileText, Receipt, Package2, BarChart3 } from "lucide-react";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";

interface GSTFilingRow {
  [key: string]: string | number;
}

interface GSTFilingTableProps {
  initialData?: GSTFilingRow[];
}

export default function GSTFilingTable({ initialData = [] }: GSTFilingTableProps) {
  const [reportType, setReportType] = useState("b2b");
  const [dateType, setDateType] = useState("yearly");
  const [data] = useState<GSTFilingRow[]>(initialData);

  const totalInvoices = data.length;
  const totalTaxableValue = data.reduce((sum, row) => sum + (Number(row.taxableValue) || 0), 0);
  const totalCGST = data.reduce((sum, row) => sum + (Number(row.cgst) || 0), 0);
  const totalSGST = data.reduce((sum, row) => sum + (Number(row.sgst) || 0), 0);
  const totalIGST = data.reduce((sum, row) => sum + (Number(row.igst) || 0), 0);

  const renderTableHeaders = () => {
    switch (reportType) {
      case "b2b":
        return (
          <TableRow className="bg-[rgba(255,255,255,0.04)]">
            <TableHead className="font-semibold">GSTIN</TableHead>
            <TableHead className="font-semibold">Party Name</TableHead>
            <TableHead className="font-semibold">Invoice No</TableHead>
            <TableHead className="font-semibold">Invoice Date</TableHead>
            <TableHead className="text-right font-semibold">Invoice Value</TableHead>
            <TableHead className="text-right font-semibold">Taxable Value</TableHead>
            <TableHead className="font-semibold">GST Rate</TableHead>
            <TableHead className="text-right font-semibold">CGST</TableHead>
            <TableHead className="text-right font-semibold">SGST</TableHead>
            <TableHead className="text-right font-semibold">IGST</TableHead>
          </TableRow>
        );
      case "b2cl":
      case "b2cs":
        return (
          <TableRow className="bg-[rgba(255,255,255,0.04)]">
            <TableHead className="font-semibold">Invoice No</TableHead>
            <TableHead className="font-semibold">Invoice Date</TableHead>
            <TableHead className="text-right font-semibold">Invoice Value</TableHead>
            <TableHead className="text-right font-semibold">Taxable Value</TableHead>
            <TableHead className="font-semibold">GST Rate</TableHead>
            <TableHead className="text-right font-semibold">CGST</TableHead>
            <TableHead className="text-right font-semibold">SGST</TableHead>
            <TableHead className="text-right font-semibold">IGST</TableHead>
            <TableHead className="font-semibold">Place of Supply</TableHead>
          </TableRow>
        );
      case "hsn":
        return (
          <TableRow className="bg-[rgba(255,255,255,0.04)]">
            <TableHead className="font-semibold">HSN Code</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">UOM</TableHead>
            <TableHead className="text-right font-semibold">Total Qty</TableHead>
            <TableHead className="text-right font-semibold">Taxable Value</TableHead>
            <TableHead className="font-semibold">CGST Rate</TableHead>
            <TableHead className="text-right font-semibold">CGST Amount</TableHead>
            <TableHead className="font-semibold">SGST Rate</TableHead>
            <TableHead className="text-right font-semibold">SGST Amount</TableHead>
            <TableHead className="font-semibold">IGST Rate</TableHead>
            <TableHead className="text-right font-semibold">IGST Amount</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Stats Cards */}
        {data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden bg-[#0f0f14] border border-[rgba(0,200,255,0.2)] text-white shadow-lg shadow-[rgba(0,200,255,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <Receipt className="h-8 w-8 text-[#00c8ff] mb-2" />
                <p className="text-sm font-medium text-[#9ca3af]">Total Invoices</p>
                <p className="text-3xl font-bold mt-1">{totalInvoices}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-[#0f0f14] border border-[rgba(34,197,94,0.2)] text-white shadow-lg shadow-[rgba(34,197,94,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <BarChart3 className="h-8 w-8 text-[#22c55e] mb-2" />
                <p className="text-sm font-medium text-[#9ca3af]">Taxable Value</p>
                <p className="text-3xl font-bold mt-1">₹{totalTaxableValue.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-[#0f0f14] border border-[rgba(0,200,255,0.2)] text-white shadow-lg shadow-[rgba(0,200,255,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <FileText className="h-8 w-8 text-[#00c8ff] mb-2" />
                <p className="text-sm font-medium text-[#9ca3af]">CGST + SGST</p>
                <p className="text-3xl font-bold mt-1">₹{(totalCGST + totalSGST).toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-[#0f0f14] border border-[rgba(168,85,247,0.2)] text-white shadow-lg shadow-[rgba(168,85,247,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative">
                <Package2 className="h-8 w-8 text-[#a855f7] mb-2" />
                <p className="text-sm font-medium text-[#9ca3af]">IGST</p>
                <p className="text-3xl font-bold mt-1">₹{totalIGST.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Panel */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-[#161620] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(168,85,247,0.15)] text-[#a855f7]">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">GST Filing Filters</CardTitle>
                <CardDescription className="text-xs">Configure report parameters for GST filing</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Date
                </Label>
                <Select value={dateType} onValueChange={setDateType}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="current_month">Current Month</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="half_yearly">Half Yearly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateType === "yearly" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Year
                  </Label>
                  <Input type="number" defaultValue={new Date().getFullYear()} className="h-9 w-full" />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Transaction Type
                </Label>
                <Select defaultValue="sales">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sales_return">Sales Return</SelectItem>
                    <SelectItem value="purchase_return">Purchase Return</SelectItem>
                    <SelectItem value="exempted_sales">Exempted Sales</SelectItem>
                    <SelectItem value="exempted_purchase">Exempted Purchase</SelectItem>
                    <SelectItem value="exempted_sales_return">Exempted Sales Return</SelectItem>
                    <SelectItem value="exempted_purchase_return">Exempted Purchase Return</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Report Type Radio Group */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Report Type
              </Label>
              <RadioGroup value={reportType} onValueChange={setReportType} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b2b" id="b2b" />
                  <Label htmlFor="b2b" className="cursor-pointer font-normal text-sm">B2B</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b2cl" id="b2cl" />
                  <Label htmlFor="b2cl" className="cursor-pointer font-normal text-sm">B2CL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b2cs" id="b2cs" />
                  <Label htmlFor="b2cs" className="cursor-pointer font-normal text-sm">B2CS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hsn" id="hsn" />
                  <Label htmlFor="hsn" className="cursor-pointer font-normal text-sm">HSN</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t">
              <div className="flex-1" />
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export to CSV</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export to Excel</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">GST Filing Report</CardTitle>
                <CardDescription>
                  {reportType === "b2b" && "Business to Business transactions"}
                  {reportType === "b2cl" && "Business to Consumer Large transactions"}
                  {reportType === "b2cs" && "Business to Consumer Small transactions"}
                  {reportType === "hsn" && "HSN-wise summary"}
                </CardDescription>
              </div>
              {data.length > 0 && (
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {reportType.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {renderTableHeaders()}
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No GST data found</p>
                        <p className="text-sm">Select filters above to generate GST filing report</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/50">
                        {Object.values(row).map((value, cellIdx) => (
                          <TableCell 
                            key={cellIdx}
                            className={typeof value === 'number' && cellIdx > 3 ? 'text-right font-medium' : ''}
                          >
                            {typeof value === 'number' && cellIdx > 3 
                              ? `₹${value.toLocaleString()}` 
                              : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant */}
      <ModuleAIAssistant
        moduleName="GST Filing"
        moduleData={{ data, reportType, dateType, totalInvoices, totalTaxableValue, totalCGST, totalSGST, totalIGST }}
      />
    </TooltipProvider>
  );
}
