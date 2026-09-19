"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import usericon from "@/src/app/components/assets/icons/user.svg";
import { useNotification } from "@/src/app/components/helpers/components/CustomAlert";
import {
  LogIn,
  UserPlus,
  User as UserIcon,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { User } from "@/src/app/components/modules/auth/core/models/authModel";
import { authService } from "@/src/app/components/modules/auth/core/services/authService";

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
    authService.initTokenWatcher();
    if (currentUser) {
      authService.initPusherWatcher(); // <-- added: starts the deactivation listener
    }

    const onAuthUpdate = (e: Event) => {
      const reason = (e as CustomEvent)?.detail?.reason;
      const currentUser = authService.getStoredUser();
      setUser(currentUser);
      setIsOpen(false); // <-- added: close dropdown on any auth change

      if (!currentUser && reason === "expired") {
        showNotification(
          "Your session has expired. Please log in again.",
          "error",
        );
        router.push("/login");
        router.refresh();
      }

      if (!currentUser && reason === "deactivated") {
        // <-- added
        showNotification(
          "Your account has been deactivated. Please contact support.",
          "error",
        );
        router.push("/login");
        router.refresh();
      }
    };

    const onStorageUpdate = (e: StorageEvent) => {
      if (e.key === "auth_user" || e.key === "auth_token") {
        const currentUser = authService.getStoredUser();
        setUser(currentUser);
        if (!currentUser) {
          router.push("/login");
          router.refresh();
        }
      }
    };
    window.addEventListener("auth-updated", onAuthUpdate);
    window.addEventListener("storage", onStorageUpdate);
    return () => {
      window.removeEventListener("auth-updated", onAuthUpdate);
      window.removeEventListener("storage", onStorageUpdate);
    };
  }, [router]);
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    showNotification("Logged out successfully", "success");
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="relative inline-flex items-center h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="hover:text-red-500 transition-colors focus:outline-none py-2">
        <Image
          src={usericon}
          alt="Account"
          width={22}
          height={22}
          className="cursor-pointer icon-theme"
        />
      </button>
      {isOpen && (
        <div className="absolute top-full pt-6 z-50 w-[260px] right-[-80px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="card-theme rounded-[28px] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col items-center text-center font-sans">
            {!user ? (
              /* Unauthenticated View (Compact) */
              <div className="w-full flex flex-col gap-2.5 items-center">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-1.5 w-full py-3 input-theme text-gray-700 border-2 border-gray-100 text-[16px] font-bold rounded-[20px] hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
                >
                  <UserPlus size={16} />
                  Create Account
                </Link>
                <div className="flex items-center w-full gap-3">
                  <div className="h-[1px] flex-1 bg-gray-200" />
                  <span className="text-gray-400 text-[12px] font-semibold uppercase tracking-wider">
                    Or
                  </span>
                  <div className="h-[1px] flex-1 bg-gray-200" />
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 w-full py-3 custom-main-color-button text-white text-[16px] font-bold rounded-[20px] custom-main-color-button-hover active:scale-[0.97] transition-all shadow-md cursor-pointer"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              </div>
            ) : (
              /* Authenticated View (Scaled Down / Small) */
              <div className="w-full flex flex-col items-center">
                {/* User Profile Image Container */}
                <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-sm border border-gray-200/60 mb-2.5 flex items-center justify-center overflow-hidden relative">
                  {user.image ? (
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <Image
                        src={user.image}
                        alt={`${user.first_name} profile`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#009cb9] to-[#007a91] flex items-center justify-center text-white font-black text-sm uppercase">
                      {user.first_name?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                {/* Header Info */}
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5">
                  Welcome Back
                </span>
                <h3 className="text-[16px] font-black text-[var(--header-text)] tracking-tight leading-tight mb-0.5 truncate max-w-full">
                  Hi, {user.first_name} {user.last_name}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium mb-0.5 truncate max-w-full">
                  @
                  {user.username ||
                    `${user.first_name.toLowerCase()}${user.id || "user"}`}
                </p>
                <span className="text-[12px] custom-main-color-text font-semibold mb-4 block cursor-pointer truncate max-w-full">
                  {user.email}
                </span>
                {/* Menu Actions */}
                <div className="w-full flex flex-col gap-2 mb-4">
                  {/* Profile */}
                  <Link
                    href="/account/overview"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 card-theme hover:bg-gray-50 border-2 border-gray-100 text-[var(--header-text)] font-extrabold text-[14px] rounded-full transition-all active:scale-[0.98]"
                  >
                    <UserIcon size={15} strokeWidth={2.5} />
                    Profile
                  </Link>

                  <div className="my-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#fde2e4] hover:bg-[#fcd2d5] text-[#eb5757] font-extrabold text-[14px] rounded-full transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <LogOut size={15} strokeWidth={2.5} />
                      Logout
                    </button>
                  </div>
                </div>
                {/* Footer divider & Help option */}
                <div className="w-full h-[1px] bg-gray-300/40 mb-3" />
                <Link
                  href="/help"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  <HelpCircle size={14} className="text-gray-400" />
                  Need Help?
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;
