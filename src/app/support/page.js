"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";

export default function Support() {
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
            Support
          </h1>
          <p className="text-gray-400">Need help? We&apos;re here for you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#1e293b]/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Email Support
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Send us an email and we&apos;ll get back to you within 24
                  hours.
                </p>
              </div>
              <Button
                asChild
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-900/20"
              >
                <a href="mailto:techserdrive@gmail.com">Email Us</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b]/50 border-white/5 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  WhatsApp Chat
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Chat with our support team on WhatsApp for quick assistance.
                </p>
              </div>
              <Button
                asChild
                className="w-full bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0"
              >
                <a
                  href="https://wa.me/919448992154"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Chat with WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
