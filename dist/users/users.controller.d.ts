import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRole } from './entities/user.entity';
export declare class UsersController {
    private readonly userService;
    constructor(userService: UsersService);
    findAll(): Promise<import("./entities/user.entity").User[]>;
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findById(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<import("./entities/user.entity").User>;
    softDelete(id: string): Promise<{
        message: string;
    }>;
    getUserRole(id: string): Promise<{
        role: UserRole;
    }>;
}
