"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";

export function PurchaseOrdersClient() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Purchase Orders" subtitle="Manage purchase orders to suppliers" />
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No purchase orders created</p>
        </CardContent>
      </Card>
    </div>
  );
}
