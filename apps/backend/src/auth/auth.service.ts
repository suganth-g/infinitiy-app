import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(password: string, hash: string): boolean {
    const computed = this.hashPassword(password);
    return computed === hash;
  }

  async registerCompany(dto: {
    companyName: string;
    email: string;
    phone: string;
    password: string;
    fullName: string;
    gstin?: string;
    address?: string;
    state?: string;
  }) {
    if (!dto.companyName?.trim() || !dto.fullName?.trim() || !dto.email?.trim() || !dto.password?.trim()) {
      throw new BadRequestException('Please fill in all required fields (Company Name, Full Name, Email, Password)');
    }

    const cleanEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    const existingCompany = await this.prisma.company.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser || existingCompany) {
      throw new BadRequestException('Email address is already registered');
    }

    // Set trial end date (14 days from today)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const defaultPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { tier: 'STARTER' },
    });

    let company;
    try {
      company = await this.prisma.company.create({
        data: {
          name: dto.companyName.trim(),
          email: cleanEmail,
          phone: dto.phone || '',
          gstin: dto.gstin,
          address: dto.address,
          state: dto.state || 'Tamil Nadu',
          subscriptionStatus: 'TRIALING',
          planId: defaultPlan ? defaultPlan.id : null,
          subscriptionEndDate: trialEndDate,
        },
      });
    } catch (err: any) {
      throw new BadRequestException('Failed to create company. Email or company name may already be registered.');
    }

    const passwordHash = this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        companyId: company.id,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: 'COMPANY_OWNER',
        phone: dto.phone,
      },
    });

    // Create default starter categories for convenience
    await this.prisma.category.createMany({
      data: [
        { companyId: company.id, name: 'General', description: 'General merchandise' },
        { companyId: company.id, name: 'Electronics', description: 'Gadgets and parts' },
        { companyId: company.id, name: 'Groceries', description: 'Daily essential items' },
      ],
    });

    const token = this.jwtService.sign({
      userId: user.id,
      companyId: company.id,
      role: user.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: company.id,
        companyName: company.name,
      },
      company,
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = this.verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name,
      },
      company: user.company,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId,
      company: user.company,
    };
  }
}
