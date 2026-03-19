"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface InvoiceNotesProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function InvoiceNotes({ notes, onNotesChange }: InvoiceNotesProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <Label>Notes / Terms & Conditions</Label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any additional notes, terms, or conditions..."
          className="flex min-h-[80px] w-full rounded-md border border-[rgba(255,255,255,0.1)] bg-[#1a1a24] px-3 py-2 text-sm text-white placeholder:text-[#4b5563] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,200,255,0.4)]"
          rows={3}
        />
      </CardContent>
    </Card>
  );
}
