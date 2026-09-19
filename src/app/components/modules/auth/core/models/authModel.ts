export interface User {
    username: string;
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    image: string;
    is_verified: boolean;
    token: string;
    created_at?: string;
    updated_at?: string;
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterCredentials {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterResponse extends LoginResponse {}
