"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Undo2 } from "lucide-react";

export function SalesReturnsClient() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Sales Returns" subtitle="Manage product returns from customers" />
      <Card>
        <CardContent className="p-12 text-center">
          <Undo2 className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No sales returns recorded</p>
        </CardContent>
      </Card>
    </div>
  );
}
