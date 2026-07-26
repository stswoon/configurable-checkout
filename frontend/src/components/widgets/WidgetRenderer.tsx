import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, type IdpUser, type Quote, type WidgetDefinition } from "@/lib/api";
import { CreditCard, User, FileText, Mail, LayoutTemplate } from "lucide-react";

interface WidgetProps {
  widget: WidgetDefinition;
  quote?: Quote;
  user?: IdpUser;
}

function HeaderWidget({ widget }: WidgetProps) {
  const title = (widget.props?.title as string) ?? "Checkout";
  const subtitle = widget.props?.subtitle as string | undefined;
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function UserProfileWidget({ user }: WidgetProps) {
  if (!user) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading user profile…
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
          <User />
        </div>
        <div>
          <CardTitle className="text-base">{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        {user.roles.map((role) => (
          <Badge key={role} variant="secondary">
            {role}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

function QuoteSummaryWidget({ quote }: WidgetProps) {
  if (!quote) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Loading quote…
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FileText />
          <CardTitle className="text-base">Quote {quote.id}</CardTitle>
        </div>
        <Badge variant={quote.status === "sent" ? "default" : "secondary"}>
          {quote.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-sm text-muted-foreground">
          Customer: {quote.customerName}
        </p>
        <Separator />
        <ul className="flex flex-col gap-2">
          {quote.lineItems.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.quantity * item.unitPrice, quote.currency)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatCurrency(quote.total, quote.currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactFormWidget({ widget }: WidgetProps) {
  const fields = (widget.props?.fields as string[]) ?? ["email"];
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Mail />
          <CardTitle className="text-base">Contact details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {fields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-sm font-medium capitalize">{field}</label>
            <input
              type={field === "email" ? "email" : "text"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              placeholder={`Enter ${field}`}
              readOnly
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PaymentWidget({ widget }: WidgetProps) {
  const methods = (widget.props?.methods as string[]) ?? ["card"];
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CreditCard />
          <CardTitle className="text-base">Payment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        {methods.map((method) => (
          <Badge key={method} variant="outline" className="capitalize">
            {method.replace("_", " ")}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

function UnknownWidget({ widget }: WidgetProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-4 text-sm text-muted-foreground">
        Unknown widget type: <code>{widget.type}</code>
      </CardContent>
    </Card>
  );
}

const WIDGET_REGISTRY: Record<string, ComponentType<WidgetProps>> = {
  header: HeaderWidget,
  userProfile: UserProfileWidget,
  quoteSummary: QuoteSummaryWidget,
  contactForm: ContactFormWidget,
  payment: PaymentWidget,
};

export function WidgetRenderer({ widget, quote, user }: WidgetProps) {
  const Component = WIDGET_REGISTRY[widget.type] ?? UnknownWidget;
  return <Component widget={widget} quote={quote} user={user} />;
}

export function RuntimeViewHeader() {
  return (
    <div className="flex items-center gap-2 border-b px-6 py-4">
      <LayoutTemplate />
      <div>
        <h2 className="font-semibold">Runtime View</h2>
        <p className="text-sm text-muted-foreground">Live widget preview from config</p>
      </div>
    </div>
  );
}
