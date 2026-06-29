"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {

    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, mounted, router]);

    if (!mounted || !isAuthenticated) {
        return null; // Or a loading spinner
    }

    return children;
}