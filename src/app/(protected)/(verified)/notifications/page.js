import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Bell className="mr-2 h-5 w-5" /> Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Real-time notifications (verification, stamp events) appear as alerts in the bottom-right corner.
                        <br />
                        History of notifications will be available here in future updates.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
