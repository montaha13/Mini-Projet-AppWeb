import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
export declare class UsersService {
    private userRepository;
    private mailService;
    private readonly logger;
    constructor(userRepository: Repository<User>, mailService: MailService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    softDelete(id: string): Promise<void>;
    getUserRole(id: string): Promise<{
        role: UserRole;
    }>;
    validateUser(email: string, password: string): Promise<User | null>;
}
