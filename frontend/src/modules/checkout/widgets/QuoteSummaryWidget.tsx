import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { formatCurrency, quoteOrderTotal } from "@/lib/api";
import { FileText } from "lucide-react";
import type { WidgetProps } from "./types";

export function QuoteSummaryWidget({ quote }: WidgetProps) {
  if (!quote) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading quote…
        </CardContent>
      </Card>
    );
  }

  const total = quoteOrderTotal(quote);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FileText />
          <CardTitle className="text-base">Quote {quote.id}</CardTitle>
        </div>
        <Badge variant={quote.status === "SUBMITTED" ? "default" : "secondary"}>
          {quote.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-sm text-muted-foreground">
          {quote.userInfo.documentType}: {quote.userInfo.documentId}
        </p>
        <p className="text-sm text-muted-foreground">
          Delivery: {quote.delivery.address} ({quote.delivery.date})
        </p>
        <Separator />
        <ul className="flex flex-col gap-2">
          {quote.order.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.count}
              </span>
              <span>{formatCurrency(item.priceInfo.totalPrice)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
