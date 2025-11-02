import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export function useRedirectIfAuth(target = "/dashboard") {
    const token = useAuthStore((s) => s.token);
    const nav = useNavigate();
    useEffect(() => {
        if (token) {
            nav(target);
        }
    }, [token, nav, target]);
}