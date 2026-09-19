
export interface User {
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
