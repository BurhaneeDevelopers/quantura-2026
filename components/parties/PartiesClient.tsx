"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { getParties, addParty, updateParty, deleteParty, formatCurrency } from "@/lib/store";
import { Party, INDIAN_STATES } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Plus, Edit, Trash2, Users, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ModuleAIAssistant } from "@/components/ModuleAIAssistant";

const partySchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string().required("Phone is required").matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: Yup.string().email("Invalid email"),
  gstin: Yup.string().matches(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  pincode: Yup.string().matches(/^$|^\d{6}$/, "Invalid pincode"),
});

type PartyFormValues = Yup.InferType<typeof partySchema>;

export function PartiesClient() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"customer" | "supplier">("customer");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: parties = [] } = useQuery({
    queryKey: ["parties", tab],
    queryFn: () => getParties(tab),
  });

  const filtered = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.gstin && p.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBalance = parties.reduce((sum, p) => sum + p.balance, 0);

  const handleSubmit = (values: PartyFormValues) => {
    if (editingParty) {
      updateParty(editingParty.id, values);
      toast.success(`${tab === "customer" ? "Customer" : "Supplier"} updated`);
    } else {
      addParty({ ...values, type: tab, balance: 0 } as Omit<Party, "id" | "createdAt">);
      toast.success(`${tab === "customer" ? "Customer" : "Supplier"} added`);
    }
    queryClient.invalidateQueries({ queryKey: ["parties"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setDialogOpen(false);
    setEditingParty(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteParty(deleteId);
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      setDeleteId(null);
    }
  };

  const initialValues: PartyFormValues = editingParty ? {
    name: editingParty.name,
    phone: editingParty.phone,
    email: editingParty.email || "",
    gstin: editingParty.gstin || "",
    address: editingParty.address || "",
    city: editingParty.city || "",
    state: editingParty.state || "",
    pincode: editingParty.pincode || "",
  } : { name: "", phone: "", email: "", gstin: "", address: "", city: "", state: "", pincode: "" };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Parties"
        subtitle="Manage customers & suppliers"
        action={
          <Button onClick={() => { setEditingParty(null); setDialogOpen(true); }} className="gap-2 bg-[#00c8ff] hover:bg-[#00b8ef] text-black font-bold shadow-lg shadow-[rgba(0,200,255,0.3)]">
            <Plus className="h-4 w-4" />
            Add {tab === "customer" ? "Customer" : "Supplier"}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as "customer" | "supplier")}>
        <TabsList>
          <TabsTrigger value="customer" className="gap-2"><Users className="h-3.5 w-3.5" />Customers</TabsTrigger>
          <TabsTrigger value="supplier" className="gap-2"><Users className="h-3.5 w-3.5" />Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label={`Total ${tab === "customer" ? "Customers" : "Suppliers"}`}
              value={parties.length}
              icon={Users}
              iconColor="text-[#ec4899]"
              iconBg="bg-[rgba(236,72,153,0.1)]"
              borderColor="border-l-pink-500"
            />
            <MetricCard
              label={tab === "customer" ? "Total Receivable" : "Total Payable"}
              value={formatCurrency(Math.abs(totalBalance))}
              icon={Phone}
              iconColor={tab === "customer" ? "text-[#22c55e]" : "text-[#f59e0b]"}
              iconBg={tab === "customer" ? "bg-[rgba(34,197,94,0.1)]" : "bg-[rgba(245,158,11,0.1)]"}
              borderColor={tab === "customer" ? "border-l-emerald-500" : "border-l-amber-500"}
              valueColor={tab === "customer" ? "text-[#22c55e]" : "text-[#f59e0b]"}
            />
            <MetricCard
              label="With Balance"
              value={parties.filter((p) => p.balance !== 0).length}
              icon={MapPin}
              iconColor="text-[#6366f1]"
              iconBg="bg-[rgba(99,102,241,0.1)]"
              borderColor="border-l-indigo-500"
            />
          </div>

          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, or GSTIN..." />

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyState icon={Users} message={`No ${tab === "customer" ? "customers" : "suppliers"} found`} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((party) => (
                      <TableRow key={party.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                        <TableCell>
                          <p className="font-medium text-sm">{party.name}</p>
                          {party.email && <p className="text-xs text-muted-foreground">{party.email}</p>}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />{party.phone}
                          </span>
                        </TableCell>
                        <TableCell>
                          {party.city ? (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />{party.city}{party.state ? `, ${party.state}` : ""}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {party.gstin ? <span className="font-mono text-xs">{party.gstin}</span> : <span className="text-xs text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          {party.balance !== 0 ? (
                            <Badge variant={party.balance > 0 ? "default" : "secondary"} className="text-xs">
                              {formatCurrency(Math.abs(party.balance))}
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">Settled</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingParty(party); setDialogOpen(true); }}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(party.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingParty(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingParty ? "Edit" : "Add"} {tab === "customer" ? "Customer" : "Supplier"}</DialogTitle>
          </DialogHeader>
          <Formik initialValues={initialValues} validationSchema={partySchema} onSubmit={handleSubmit} enableReinitialize>
            {({ setFieldValue, values, isSubmitting }) => (
              <Form className="grid gap-4">
                <FormField name="name" label="Name *" />
                <FormField name="phone" label="Phone * (10-digit)" />
                <FormField name="email" label="Email" />
                <FormField name="gstin" label="GSTIN" placeholder="e.g. 07AAACR5055K1Z5" />
                <FormField name="address" label="Address" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField name="city" label="City" />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">State</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={values.state}
                      onChange={(e) => setFieldValue("state", e.target.value)}
                    >
                      <option value="">Select</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <FormField name="pincode" label="Pincode" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {editingParty ? "Update" : "Add"} {tab === "customer" ? "Customer" : "Supplier"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {tab === "customer" ? "Customer" : "Supplier"}</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All related data will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModuleAIAssistant moduleName={tab === "customer" ? "Customers" : "Suppliers"} moduleData={{ parties, tab }} />
    </div>
  );
}
