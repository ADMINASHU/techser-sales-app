"use client";

import UserCard from "./UserCard";
import UserProfileModal from "./UserProfileModal";
import { useState } from "react";

/**
 * EntryUserCard is a wrapper around UserCard that adds the UserProfileModal
 * for use in the Entry Detail page.
 */
export default function EntryUserCard({ user }) {
    const [showProfile, setShowProfile] = useState(false);

    if (!user) return null;

    return (
        <>
            <UserCard 
                user={user} 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" 
                onClick={() => setShowProfile(true)}
            />
            <UserProfileModal 
                user={user} 
                open={showProfile} 
                onOpenChange={setShowProfile} 
                showActions={false}
            />
        </>
    );
}
