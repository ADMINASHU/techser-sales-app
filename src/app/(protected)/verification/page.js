import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function VerificationPendingPage() {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-yellow-500" />
                    </div>
                    <CardTitle>Account Verification Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                        Thank you for completing your profile. Your account is currently under review by the administrator.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        You will receive a notification once your account is verified. access to the dashboard is restricted until then.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
