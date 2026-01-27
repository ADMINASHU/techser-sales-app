import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: December 14, 2025</p>
        </div>

        <Card className="bg-[#1e293b]/50 border-white/5 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-6 text-gray-300">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                1. Introduction
              </h2>
              <p>
                Welcome to Techser Sales Management (&quot;we,&quot;
                &quot;our,&quot; or &quot;us&quot;). We respect your privacy and
                are committed to protecting your personal data. This privacy
                policy will inform you as to how we look after your personal
                data when you visit our website and tell you about your privacy
                rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                2. Data We Collect
              </h2>
              <p>
                We may collect, use, store and transfer different kinds of
                personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Identity Data:</strong> First name, last name,
                  username, and employee ID.
                </li>
                <li>
                  <strong>Contact Data:</strong> Email address and phone
                  numbers.
                </li>
                <li>
                  <strong>Location Data:</strong> Precise GPS location data
                  collected during specific actions (Check-In, Check-Out) to
                  verify field visits.
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, device
                  information, login data, and browser type.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                3. How We Use Your Data
              </h2>
              <p>
                We use your data to operate the Techser Sales Application
                service, specifically for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Verifying employee attendance and field visits via
                  Geolocation.
                </li>
                <li>
                  Sending critical operational alerts via Push Notifications.
                </li>
                <li>Managing customer databases and sales territories.</li>
                <li>
                  Preventing duplicate customer entries using proximity
                  detection.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                4. Third-Party Services
              </h2>
              <p>
                We rely on trusted third-party service providers to facilitate
                our services:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Google Maps Platform:</strong> For map rendering,
                  geocoding, and location verification.
                </li>
                <li>
                  <strong>Firebase (Google):</strong> For authentication and
                  Cloud Messaging (push notifications).
                </li>
                <li>
                  <strong>Vercel:</strong> For cloud hosting and analytics.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                5. Data Security
              </h2>
              <p>
                We have put in place appropriate security measures to prevent
                your personal data from being accidentally lost, used or
                accessed in an unauthorized way, altered or disclosed.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
