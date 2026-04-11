import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        user: import("../users/entities/user.entity").User;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("../users/entities/user.entity").User;
        token: string;
    }>;
}
