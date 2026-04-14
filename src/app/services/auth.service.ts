import { Injectable } from "@angular/core";
import axios from "axios";
import { API_URL } from "../../environment/environment";
import { API_ENDPOINT } from "../config/end-point.config";

@Injectable({
    providedIn: 'root',
})

export class AuthService {
    login(form: any) {
        return axios.post(API_URL + API_ENDPOINT.auth.login, {
            email: form.email.trim(),
            password: form.password,
        });
    }

    register(form: any) {
        return axios.post(API_URL + API_ENDPOINT.auth.register, {
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            password: form.password,
        });
    }

    registerAdmin(form: any) {
        const token = localStorage.getItem("token");

        return axios.post(
            API_URL + "/users/admin-register",
            {
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                password: form.password,
            },
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );
    }

    saveToken(token: string) {
        localStorage.setItem('token', token);
    }
}

