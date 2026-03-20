"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export function CreatePurchaseClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="New Purchase" subtitle="Record a new purchase from supplier" />
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Purchase entry form coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
