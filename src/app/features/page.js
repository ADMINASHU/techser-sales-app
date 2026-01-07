import React from "react";
import { 
    Fingerprint, 
    MapPin, 
    Users, 
    BarChart3, 
    Bell, 
    ShieldCheck, 
    Database, 
    Layers, 
    Smartphone, 
    Globe, 
    Zap, 
    FileSpreadsheet,
    Map as MapIcon,
    CheckCircle2,
    UserPlus,
    Search,
    RefreshCcw,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Features & Specifications | Techser Sales App",
    description: "Detailed overview of the features and technical specifications of the Techser Sales Application.",
};

const FeatureCard = ({ icon: Icon, title, description, tags }) => (
    <Card className="bg-[#1a1f2e] border-white/5 shadow-lg overflow-hidden group h-full flex flex-col">
        <CardHeader className="pb-2 flex-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <CardDescription className="text-muted-foreground/80">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex flex-wrap gap-2 mt-4 pb-6">
            {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/5 text-[10px] uppercase tracking-wider">
                    {tag}
                </Badge>
            ))}
        </CardContent>
    </Card>
);

const SpecItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1f2e] border border-white/5 group hover:bg-white/5 transition-colors h-full">
        <div className="mt-1">
            <Icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-base font-semibold text-foreground/90">{value}</p>
        </div>
    </div>
);

export default async function FeaturesPage() {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        redirect("/dashboard");
    }

    const coreFeatures = [
        {
            icon: Fingerprint,
            title: "Smart Attendance (Stamping)",
            description: "Geofenced check-in/out system with strict Region/Branch access control and real-time IST synchronization.",
            tags: ["Location Verified", "Region Locked", "Audit Trail"]
        },
        {
            icon: MapPin,
            title: "Visit Location Verification",
            description: "Precise GPS coordinate capture during Check-In and Check-Out actions to authenticate field visit locations.",
            tags: ["Google Maps", "Event-Based", "GPS Snapshot"]
        },
        {
            icon: ShieldCheck,
            title: "Smart Duplicate Shield",
            description: "Proximity-based detection system that prevents data redundancy by warning users of existing customers within 50m.",
            tags: ["50m Radius", "Haversine Algo", "Data Integrity"]
        },
        {
            icon: Users,
            title: "Admin Command Center",
            description: "Comprehensive user management, account verification, and system-wide visibility for administrators.",
            tags: ["RBAC", "User Approval", "Admin Tools"]
        },
        {
            icon: Bell,
            title: "Omnichannel Notifications",
            description: "Real-time alerts via Knock for in-app feeds for critical events.",
            tags: ["Knock", "Check-in", "Check-out" ]
        },
        {
            icon: FileSpreadsheet,
            title: "Data Sync & Export",
            description: "Automatic background syncing with Google Sheets plus matching Excel exports for seamless reporting.",
            tags: ["Google Sheets", "Excel", "Auto-Sync"]
        }
    ];

    const techSpecs = [
        { label: "Frontend Framework", value: "Next.js 16 (Turbopack)", icon: Globe },
        { label: "Styling & UI", value: "Tailwind CSS 4, Shadcn UI, Lucide Icons", icon: Layers },
        { label: "Primary Database", value: "MongoDB with Mongoose ODM", icon: Database },
        { label: "Authentication", value: "NextAuth.js v5 (Beta)", icon: ShieldCheck },
        { label: "Notifications", value: "Knock.app integration", icon: Zap },
        { label: "Maps Integration", value: "Google Maps Platform", icon: MapIcon },
        { label: "PWA Support", value: "Service Workers & Web App Manifest", icon: Smartphone },
        { label: "Analytics", value: "Vercel Analytics & Speed Insights", icon: BarChart3 }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 space-y-16">
            <Link href="/releases">
                <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Releases
                </Button>
            </Link>

            {/* Hero Section */}
            <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Badge variant="outline" className="px-4 py-1 border-primary/30 bg-primary/5 text-primary mb-4">
                    Product Overview
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-linear-to-r from-white via-white/80 to-white/50 tracking-tight">
                    Features & Specifications
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto">
                    A comprehensive look at the capabilities and technical architecture driving the Techser Sales Application.
                </p>
            </section>

            {/* Core Features Grid */}
            <section className="space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Core Features</h2>
                    <p className="text-muted-foreground">The essential tools designed to empower field sales professionals.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coreFeatures.map((feature, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                            <FeatureCard {...feature} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Detailed Specs Section */}
            <section className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Technical Architecture</h2>
                    <p className="text-muted-foreground max-w-lg">
                        Built with a modern, high-performance stack ensuring scalability, security, and real-time responsiveness.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {techSpecs.map((spec, index) => (
                            <SpecItem key={index} {...spec} />
                        ))}
                    </div>

                    <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-8 space-y-8 animate-in zoom-in-95 duration-700 h-full">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" /> System Capabilities
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/5">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Search className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <span>Advanced Filtering & Search</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                Powerful text-based search across customer names and contacts, combined with multi-parameter filtering by date, status, and assignment.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/5">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <RefreshCcw className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span>Background Sync & Export</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                Implements seamless synchronization with Google Sheets API plus strict parity with Excel exports for robust reporting and backups.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/5">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <UserPlus className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span>User Onboarding & Profiling</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                Automated onboarding flow including profile setup, avatar upload, and administrative verification for secure access control.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-white/5">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <MapIcon className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span>Geospatial Intelligence</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                Uses Haversine logic for both stamp-in proximity validation and 50m radius duplicate customer detection.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-5" className="border-white/5">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <span>Infinite Performance</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                Optimized mobile experience using virtualization (react-virtuoso) for infinite scrolling on massive datasets without lag.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6" className="border-white/5">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-pink-500" />
                                    </div>
                                    <span>Lifecycle Management</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                Active/Inactive status toggles to maintain a clean workspace and filter out dormant customers from daily views.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    </div>
    );
}
