import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    try {
      const user = await this.userService.create(createUserDto);
      const payload = {
        userId: user.id,
        sub: user.id,
        email: user.email,
        role: user.role,
        roles: [user.role],
      };
      
      const token = this.jwtService.sign(payload);
      
      return { user, token };
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      sub: user.id,
      email: user.email,
      role: user.role,
      roles: [user.role],
    };
    
    const token = this.jwtService.sign(payload);
    
    return { user, token };
  }

  async validateUser(email: string, password: string): Promise<any> {
    return this.userService.validateUser(email, password);
  }
}
