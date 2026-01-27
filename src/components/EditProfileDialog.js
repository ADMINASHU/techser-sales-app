"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileFields } from "./Profile/ProfileFields";
import { RegionalFields } from "./Profile/RegionalFields";
import { PasswordFields } from "./Profile/PasswordFields";
import { ReverificationConfirm } from "./Profile/ReverificationConfirm";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

export default function EditProfileDialog({ user, trigger, session }) {
  const [open, setOpen] = useState(false);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

  // Profile State
  const [formData, setFormData] = useState({
    name: user.name || "",
    contactNumber: user.contactNumber || "",
    address: user.address || "",
    region: user.region || "",
    branch: user.branch || "",
    designation: user.designation || "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const {
    loading,
    showConfirm,
    setShowConfirm,
    checkReverification,
    handleUpdate,
  } = useUpdateProfile(user, () => setOpen(false));

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkReverification(formData)) {
      setShowConfirm(true);
    } else {
      handleUpdate(formData, passwordData, isPasswordSectionOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Profile</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto hide-scrollbar bg-[#1a1f2e] border-white/10 shadow-2xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <ProfileFields
            formData={formData}
            onChange={handleProfileChange}
            setFormData={setFormData}
          />

          <RegionalFields
            formData={formData}
            onSelectChange={handleSelectChange}
            setFormData={setFormData}
          />

          <PasswordFields
            passwordData={passwordData}
            onChange={handlePasswordChange}
            isOpen={isPasswordSectionOpen}
            setOpen={setIsPasswordSectionOpen}
          />

          <DialogFooter>
            <LoadingButton
              type="submit"
              loading={loading}
              className="bg-linear-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-fuchsia-500/20"
            >
              Save changes
            </LoadingButton>
          </DialogFooter>
        </form>

        <ReverificationConfirm
          open={showConfirm}
          onOpenChange={setShowConfirm}
          onConfirm={() =>
            handleUpdate(formData, passwordData, isPasswordSectionOpen)
          }
        />
      </DialogContent>
    </Dialog>
  );
}
