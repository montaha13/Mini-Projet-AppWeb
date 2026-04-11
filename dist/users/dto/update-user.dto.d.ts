import { UserRole } from '../entities/user.entity';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
}
