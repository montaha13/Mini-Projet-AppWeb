export declare enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
}
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    generateId(): Promise<void>;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
