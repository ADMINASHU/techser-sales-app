"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateAvatar } from "@/app/actions/userActions";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AvatarUploader({ user, className }) {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const router = useRouter();
    const { update } = useSession();

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: Max size 1MB
        if (file.size > 1024 * 1024) {
            toast.error("Image size must be less than 1MB");
            return;
        }

        setLoading(true);

        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result;

                // Call Server Action
                const result = await updateAvatar(base64data);

                if (result.error) {
                    throw new Error(result.error);
                }

                toast.success("Avatar updated successfully");
                await update({ image: base64data }); // Force session refresh with new image
                router.refresh();
            };
        } catch (error) {
            toast.error(error.message || "Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group cursor-pointer" onClick={handleClick}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
            />

            <div className="relative inline-block">
                <Avatar className={`h-20 w-20 border-2 border-transparent group-hover:border-primary transition-all ${className}`}>
                    <AvatarImage src={user.image} alt={user.name} className={`object-cover ${loading ? "opacity-50" : ""}`} />
                    <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-white font-bold text-xl uppercase">
                        {user.name
                            ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                            : "U"
                        }
                    </AvatarFallback>
                </Avatar>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>
            <p className="sr-only">Click to upload avatar</p>
        </div>
    );
}
