"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export function PasswordFields({ passwordData, onChange, isOpen, setOpen }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border-t border-white/5 pt-4 mt-2">
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center transition-colors"
        >
          {isOpen ? "- Cancel Password Change" : "+ Change Password"}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="currentPassword" className="text-gray-300">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={onChange}
                required={isOpen}
                className="bg-[#1e293b]/50 border-white/10 text-white focus-visible:ring-fuchsia-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword" className="text-gray-300">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={onChange}
                required={isOpen}
                className="bg-[#1e293b]/50 border-white/10 text-white focus-visible:ring-fuchsia-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={onChange}
                required={isOpen}
                className="bg-[#1e293b]/50 border-white/10 text-white focus-visible:ring-fuchsia-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
