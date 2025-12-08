import api from "./axiosInstance";

export const login = async ({username, password}) => {
    const body = new URLSearchParams();
    body.append("username", username);  
    body.append("password", password);

    const res = await api.post("/auth/login", body.toString(), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    return res.data;
};

export const fetchCurrentUser = async () => {
    const res = await api.get("/auth/me");
    return res.data;
};