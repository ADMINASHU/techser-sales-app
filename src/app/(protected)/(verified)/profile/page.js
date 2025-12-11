import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function ProfilePage() {
    const session = await auth();
    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Your personal details and account status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-semibold">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                    <Badge variant={user.status === 'verified' ? 'default' : 'secondary'} className="capitalize">{user.status}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Location</CardTitle>
                        <CardDescription>Your contact and branch information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                                <p className="font-medium">{user.contactNumber || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Branch</label>
                                <p className="font-medium">{user.branch || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Region</label>
                                <p className="font-medium">{user.region || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Address</label>
                                <p className="font-medium">{user.address || "-"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Joined On</label>
                                <p className="font-medium">{user.createdAt ? format(new Date(user.createdAt), "PPP") : "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="font-medium">{user.updatedAt ? format(new Date(user.updatedAt), "PPP") : "-"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
