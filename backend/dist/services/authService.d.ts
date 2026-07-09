interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}
interface LoginPayload {
    email: string;
    password: string;
}
export declare function registerUser(payload: RegisterPayload): Promise<{
    token: string;
    user: any;
}>;
export declare function loginUser(payload: LoginPayload): Promise<{
    token: string;
    user: any;
}>;
export declare function verifyToken(token: string): {
    userId: string;
};
export {};
//# sourceMappingURL=authService.d.ts.map