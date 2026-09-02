import type {LucideIcon} from "lucide-react";
import type {ReactNode} from "react";
import {cn} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/ui/card";

interface CheckoutWidgetCardProps {
    icon: LucideIcon;
    title: string;
    errorClassName?: string;
    badge?: ReactNode;
    children: ReactNode;
}

export function CheckoutWidgetCard({
    icon: Icon,
    title,
    errorClassName,
    badge,
    children,
}: CheckoutWidgetCardProps) {
    return (
        <Card className={cn(errorClassName)}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Icon />
                    <CardTitle className="text-base">{title}</CardTitle>
                    {badge}
                </div>
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    );
}

export function WidgetForm({children}: {children: ReactNode}) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
            }}
        >
            {children}
        </form>
    );
}
