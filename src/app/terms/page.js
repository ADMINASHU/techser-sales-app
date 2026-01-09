"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-400">Last updated: December 14, 2025</p>
        </div>

        <Card className="bg-[#1e293b]/50 border-white/5 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-6 text-gray-300">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using our website, you agree to be bound by
                these Terms of Service and all applicable laws and regulations.
                If you do not agree with any of these terms, you are prohibited
                from using or accessing this site.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using the Techser Sales Application (&quot;the
                App&quot;), you agree to be bound by these Terms of Service.
                This App is a workforce management tool intended for authorized
                employees and contractors.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                2. User Responsibilities
              </h2>
              <p>As a user of this App, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Provide accurate and truthful information regarding customer
                  interactions and visits.
                </li>
                <li>
                  <strong>Location Integrity:</strong> not use any GPS spoofing,
                  location masking, or other methods to falsify your physical
                  location during check-ins or check-outs.
                </li>
                <li>
                  Maintain the confidentiality of your account credentials.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                3. Use License
              </h2>
              <p>
                Permission is granted to use the App strictly for official
                business purposes related to sales and customer management. This
                license does not allow:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Modifying or copying the software or materials.</li>
                <li>
                  Using the materials for any commercial purpose unrelated to
                  the company&apos;s business.
                </li>
                <li>
                  Attempting to decompile or reverse engineer any software
                  contained in the App.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                4. Disclaimer
              </h2>
              <p>
                The materials on the App are provided &quot;as is&quot;. We make
                no warranties regarding the accuracy of third-party map data or
                the continuous availability of the service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
