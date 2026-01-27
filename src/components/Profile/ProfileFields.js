"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileFields({ formData, onChange, setFormData }) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-gray-300">
          Display Name
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Your Name"
          className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contactNumber" className="text-gray-300">
          Contact Number (10 Digits)
        </Label>
        <Input
          id="contactNumber"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            setFormData((prev) => ({ ...prev, contactNumber: val }));
          }}
          type="tel"
          maxLength={10}
          pattern="[0-9]{10}"
          className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="designation" className="text-gray-300">
          Designation
        </Label>
        <Input
          id="designation"
          name="designation"
          value={formData.designation}
          onChange={onChange}
          placeholder="e.g. Sales Executive"
          className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address" className="text-gray-300">
          Address
        </Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={onChange}
          className="bg-[#1e293b]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-fuchsia-500/50"
        />
      </div>
    </>
  );
}
