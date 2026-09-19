// "use client"
//
// import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
// import type { User } from "@/src/app/components/lib/types"
//
// interface AuthContextType {
//     user: User | null
//     loading: boolean
//     login: (email: string, password: string) => Promise<void>
//     register: (email: string, name: string, password: string) => Promise<void>
//     logout: () => void
//     isAdmin: boolean
// }
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined)
//
// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<User | null>(null)
//     const [loading, setLoading] = useState(true)
//
//     useEffect(() => {
//         const checkAuth = async () => {
//             try {
//                 const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/me`)
//                 if (response.ok) {
//                     const userData = await response.json()
//                     setUser(userData)
//                 }
//             } catch (error) {
//                 console.error("Auth check failed:", error)
//             } finally {
//                 setLoading(false)
//             }
//         }
//
//         checkAuth()
//     }, [])
//
//     const login = async (email: string, password: string) => {
//         const response = await fetch("/api/auth/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password }),
//         })
//         if (!response.ok) throw new Error("Login failed")
//         const userData = await response.json()
//         setUser(userData)
//     }
//
//     const register = async (email: string, name: string, password: string) => {
//         const response = await fetch("/api/auth/register", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, name, password }),
//         })
//         if (!response.ok) throw new Error("Registration failed")
//         const userData = await response.json()
//         setUser(userData)
//     }
//
//     const logout = () => {
//         setUser(null)
//         fetch("/api/auth/logout", { method: "POST" })
//     }
//
//     const isAdmin = user?.role === "admin"
//
//     return (
//         <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>{children}</AuthContext.Provider>
//     )
// }
//
// export function useAuth() {
//     const context = useContext(AuthContext)
//     if (!context) {
//         throw new Error("useAuth must be used within AuthProvider")
//     }
//     return context
// }
