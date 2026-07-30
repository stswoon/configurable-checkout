import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { User } from "lucide-react";
import type { WidgetProps } from "./types";

export function UserProfileWidget({ user }: WidgetProps) {
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
