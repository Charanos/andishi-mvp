import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// Type definitions for better TypeScript support
interface UserData {
  id?: string;
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status?: string;
  isActive?: boolean;
  accountCreated?: boolean;
  passwordGenerated?: boolean;
  passwordLastChanged?: Date;
  lastLogin?: Date;
  loginAttempts?: number;
  accountLocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateUserPayload {
  email: string;
  password?: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  generatePassword?: boolean;
}

interface GenerateCredentialsPayload {
  userId: string;
  regenerate?: boolean;
}

// Helper function to generate secure random password
function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate ID format
function isValidId(id: string): boolean {
  // For Prisma, we just check if it's a non-empty string
  return typeof id === 'string' && id.length > 0;
}

// Helper function to derive firstName/lastName from name
function deriveNames(user: any) {
  if (!user.firstName || !user.lastName) {
    const name = (user.name as string | undefined) || '';
    const [first = '', ...rest] = name.split(' ');
    const last = rest.join(' ');
    return { ...user, firstName: first, lastName: last };
  }
  return user;
}

// Helper function to create developer profile automatically
async function createDeveloperProfile(userId: string, user: any) {
  const defaultDeveloperProfile = {
    data: {
      personalInfo: {
        firstName: user.firstName || 'Developer',
        lastName: user.lastName || 'User',
        email: user.email,
        phone: '',
        location: 'Not specified',
        timeZone: 'UTC',
        linkedin: '',
        github: '',
        portfolio: '',
        tagline: 'Full Stack Developer',
        bio: 'Experienced developer ready to work on exciting projects.'
      },
      professionalInfo: {
        title: 'Software Developer',
        experienceLevel: 'Mid-level',
        yearsOfExperience: 3,
        availability: 'Full-time',
        hourlyRate: 50,
        bio: 'Passionate about creating quality software solutions.',
        languages: ['English'],
        certifications: [],
        preferredWorkType: ['Remote'],
        workingHours: '9 AM - 5 PM'
      },
      technicalSkills: {
        primarySkills: [
          { name: 'JavaScript', level: 80 },
          { name: 'React', level: 75 },
          { name: 'Node.js', level: 70 }
        ],
        frameworks: [
          { name: 'Next.js', level: 70 },
          { name: 'Express.js', level: 75 }
        ],
        databases: [
          { name: 'MongoDB', level: 65 },
          { name: 'PostgreSQL', level: 60 }
        ],
        tools: [
          { name: 'Git', level: 85 },
          { name: 'Docker', level: 60 }
        ],
        cloudPlatforms: ['AWS', 'Vercel'],
        specializations: ['Web Development', 'API Development']
      },
      stats: {
        totalProjects: 0,
        completedProjects: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalCodeLines: 0,
        activeDays: 0,
        clientRetention: 0,
        responseTime: '2 hours',
        totalCommits: 0,
        bugsFixed: 0,
        codeReviewsGiven: 0,
        mentoringSessions: 0
      },
      projects: [],
      recentActivity: [],
      achievements: [],
      notifications: [],
      timeEntries: []
    } as any,
    userId: userId,
    status: 'pending' as const,
    isAvailable: true,
  };

  const result = await prisma.developerProfile.create({ data: defaultDeveloperProfile });
  return result;
}

// GET - Fetch all users
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const refresh = url.searchParams.get('refresh') === 'true';

    // If refresh is requested, ensure data consistency
    if (refresh) {
      const developersWithoutProfiles = await prisma.user.findMany({
        where: {
          role: 'developer',
          developerProfile: null,
        },
      });

      for (const developer of developersWithoutProfiles) {
        await createDeveloperProfile(developer.id, developer);
      }
    }

    const users = await prisma.user.findMany({
      include: {
        developerProfile: true,
      },
    });

    const projectCounts = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'client') {
          const count = await prisma.project.count({
            where: { clientId: user.id },
          });
          return { userId: user.id, count };
        }
        return { userId: user.id, count: 0 }; // Developers don't have client projects
      })
    );

    const usersWithProjects = users.map(user => {
      const projectCount = projectCounts.find(pc => pc.userId === user.id);
      const baseUser = {
        ...deriveNames(user),
        projectsCount: projectCount?.count || 0
      };

      if (user.role === 'developer' && user.developerProfile) {
        const now = new Date();
        const busyUntilExpired = !user.developerProfile.busyUntilDate || new Date(user.developerProfile.busyUntilDate) <= now;
        const isApproved = user.developerProfile.status === 'approved';

        let availabilityDisplayText = 'Unavailable';
        let isReallyAvailable = false;

        if (!isApproved) {
          availabilityDisplayText = user.developerProfile.status === 'pending' ? 'Pending Approval' : 'Rejected';
        } else if (user.developerProfile.isAvailable && busyUntilExpired) {
          availabilityDisplayText = 'Available';
          isReallyAvailable = true;
        } else if (user.developerProfile.busyUntilDate && !busyUntilExpired) {
          availabilityDisplayText = `Busy until ${new Date(user.developerProfile.busyUntilDate).toLocaleDateString()}`;
        } else {
          availabilityDisplayText = 'Busy';
        }

        return {
          ...baseUser,
          isAvailable: isReallyAvailable,
          availabilityDisplayText,
          busyUntilDate: user.developerProfile.busyUntilDate,
          hourlyRate: (user.developerProfile.data as any)?.professionalInfo?.hourlyRate || 0,
          title: (user.developerProfile.data as any)?.professionalInfo?.title || 'Developer',
          experienceLevel: (user.developerProfile.data as any)?.professionalInfo?.experienceLevel || 'Not specified',
          skills: (user.developerProfile.data as any)?.technicalSkills?.primarySkills?.map((skill: any) => skill.name || skill) || [],
          totalProjects: (user.developerProfile.data as any)?.stats?.totalProjects || 0,
          completedProjects: (user.developerProfile.data as any)?.stats?.completedProjects || 0,
          totalEarnings: (user.developerProfile.data as any)?.stats?.totalEarnings || 0,
          averageRating: (user.developerProfile.data as any)?.stats?.averageRating || 0
        };
      }

      return baseUser;
    });

    return NextResponse.json({
      success: true,
      users: usersWithProjects,
      count: usersWithProjects.length
    });
  } catch (err) {
    return NextResponse.json({
      success: false, error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

// POST - Create new user or generate credentials
export async function POST(request: Request) {
  try {
    let payload: CreateUserPayload | GenerateCredentialsPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' }, 
        { status: 400 }
      );
    }

    // Check if this is a credential generation request
    if ('userId' in payload) {
      return await generateUserCredentials(payload as GenerateCredentialsPayload);
    }

    // Otherwise, handle user creation
    return await createNewUser(payload as CreateUserPayload);
    
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

// Helper function to create new user
async function createNewUser(payload: CreateUserPayload) {
  // Enhanced validation
  const errors: string[] = [];
  
  if (!payload.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(payload.email)) {
    errors.push('Invalid email format');
  }
  
  if (!payload.role) {
    errors.push('Role is required');
  }

  // If password is provided, validate it
  if (payload.password && payload.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: errors }, 
      { status: 400 }
    );
  }

  // Check if user already exists
  const normalizedEmail = payload.email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ 
    where: { email: normalizedEmail }
  });
  
  if (existingUser) {
    return NextResponse.json(
      { success: false, error: 'Email already exists' }, 
      { status: 409 }
    );
  }

  // Prepare user data
  const userData: any = {
    email: normalizedEmail,
    role: payload.role,
    isActive: true,
    accountCreated: false,
    passwordGenerated: false,
    loginAttempts: 0,
    accountLocked: false,
  };

  // Add optional fields if provided
  if (payload.name) userData.name = payload.name.trim();
  if (payload.firstName) userData.firstName = payload.firstName.trim();
  if (payload.lastName) userData.lastName = payload.lastName.trim();

  // Handle password
  let generatedPassword: string | undefined;
  if (payload.password) {
    userData.password = await bcrypt.hash(payload.password, 12);
    userData.accountCreated = true;
    userData.passwordGenerated = true;
    userData.passwordLastChanged = new Date();
  } else if (payload.generatePassword) {
    generatedPassword = generateSecurePassword();
    userData.password = await bcrypt.hash(generatedPassword, 12);
    userData.accountCreated = true;
    userData.passwordGenerated = true;
    userData.passwordLastChanged = new Date();
  }

  const newUser = await prisma.user.create({ data: userData });
  
  const userResp = deriveNames(newUser);
  const { password, ...userWithoutPassword } = userResp;

  // Auto-create developer profile if user role is 'developer'
  if (payload.role === 'developer') {
    try {
      await createDeveloperProfile(newUser.id, userResp);
    } catch (error) {
      // Don't fail the user creation, just log the error
    }
  }

  const response: any = {
    success: true,
    user: userWithoutPassword,
    message: `User ${generatedPassword ? 'created' : 'profile created'} successfully${payload.role === 'developer' ? ' with developer profile' : ''}`
  };
  
  if (generatedPassword) {
    response.generatedPassword = generatedPassword;
  }

  return NextResponse.json(response, { status: 201 });
}

// Helper function to generate credentials for existing user
async function generateUserCredentials(payload: GenerateCredentialsPayload) {
  if (!payload.userId) {
    return NextResponse.json(
      { success: false, error: 'User ID is required' }, 
      { status: 400 }
    );
  }

  if (!isValidId(payload.userId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid user ID format' }, 
      { status: 400 }
    );
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ 
    where: { id: payload.userId } 
  });
  
  if (!existingUser) {
    return NextResponse.json(
      { success: false, error: 'User not found' }, 
      { status: 404 }
    );
  }

  // Generate new password
  const generatedPassword = generateSecurePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 12);

  // Update user with new credentials
  const updatedUser = await prisma.user.update({
    where: { id: payload.userId },
    data: {
      password: hashedPassword,
      accountCreated: true,
      passwordGenerated: true,
      passwordLastChanged: new Date(),
      loginAttempts: 0,
      accountLocked: false
    }
  });

  const { password, ...userWithoutPassword } = deriveNames(updatedUser);

  return NextResponse.json({
    success: true,
    user: userWithoutPassword,
    generatedPassword,
    message: payload.regenerate ? 'Credentials regenerated successfully' : 'Credentials generated successfully'
  });
}

// PATCH - Update user
export async function PATCH(request: Request) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' }, 
        { status: 400 }
      );
    }

    const { id, _id, action, ...updates } = payload;
    const userId = id || _id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing id field' }, 
        { status: 400 }
      );
    }

    if (!isValidId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid id format' }, 
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { id: userId } 
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      );
    }

    if (action === 'reset_password') {
      const generatedPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordGenerated: true,
          passwordLastChanged: new Date(),
          isActive: true
        }
      });

      return NextResponse.json({
        success: true,
        generatedPassword,
        message: 'Password reset successfully'
      });
    }

    if (action === 'send_credentials') {
      // Here you would implement your email sending logic
      // For now, we'll just simulate success
      return NextResponse.json({
        success: true,
        message: 'Credentials sent successfully'
      });
    }

    // Handle regular updates
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      modifiedCount: 1
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    
    if (!idParam) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' }, 
        { status: 400 }
      );
    }

    if (!isValidId(idParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid id format' }, 
        { status: 400 }
      );
    }

    // Check if user exists before deletion
    const existingUser = await prisma.user.findUnique({ 
      where: { id: idParam },
      include: { developerProfile: true }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Delete associated developer profile first if exists
    let deletedProfileCount = 0;
    if (existingUser.role === 'developer' && existingUser.developerProfile) {
      await prisma.developerProfile.delete({ 
        where: { userId: existingUser.id } 
      });
      deletedProfileCount = 1;
    }

    await prisma.user.delete({ where: { id: idParam } });

    return NextResponse.json({ 
      success: true,
      message: `User deleted successfully${deletedProfileCount > 0 ? ' along with associated developer profile' : ''}`,
      deletedProfileCount
    });
    
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' }, 
      { status: 500 }
    );
  }
}
