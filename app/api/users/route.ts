import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

// Type definitions for better TypeScript support
interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateUserPayload {
  email: string;
  password: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
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

// GET - Fetch all users
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Exclude sensitive fields like password
    let users = await db
      .collection('users')
      .find({}, { 
        projection: { 
          password: 0,
          // You might want to exclude other sensitive fields
          // resetToken: 0,
          // loginAttempts: 0
        } 
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    // Derive firstName/lastName if missing
    users = users.map(deriveNames);

    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length 
    });
  } catch (err) {
    console.error('Users API error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    let payload: CreateUserPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' }, 
        { status: 400 }
      );
    }

    // Enhanced validation
    const errors: string[] = [];
    
    if (!payload.email) {
      errors.push('Email is required');
    } else if (!isValidEmail(payload.email)) {
      errors.push('Invalid email format');
    }
    
    if (!payload.password) {
      // Auto-generate a random 10-character password if none supplied
      const randomString = Array.from({ length: 10 }, () =>
        Math.random().toString(36).charAt(2)
      ).join("");
      payload.password = randomString;
    } else if (payload.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!payload.role) {
      errors.push('Role is required');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors }, 
        { status: 400 }
      );
    }

    // Check if user already exists
    const normalizedEmail = payload.email.toLowerCase().trim();
    const existingUser = await db.collection('users').findOne({ 
      email: normalizedEmail 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' }, 
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 12); // Increased rounds for better security

    // Prepare user document
    const userDoc: User = {
      email: normalizedEmail,
      password: hashedPassword,
      role: payload.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add optional fields if provided
    if (payload.name) userDoc.name = payload.name.trim();
    if (payload.firstName) userDoc.firstName = payload.firstName.trim();
    if (payload.lastName) userDoc.lastName = payload.lastName.trim();

    const result = await db.collection('users').insertOne(userDoc);
    
    const returnUser: any = { ...userDoc, _id: result.insertedId };
    delete returnUser.password;
    const userResp = deriveNames(returnUser);

    return NextResponse.json({
      success: true,
      user: userResp,
      message: 'User created successfully'
    }, { status: 201 });
    
  } catch (err) {
    console.error('User create error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' }, 
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' }, 
        { status: 400 }
      );
    }

    const { _id, ...updates } = payload;
    
    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Missing _id field' }, 
        { status: 400 }
      );
    }

    if (!isValidObjectId(_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid _id format' }, 
        { status: 400 }
      );
    }

    const objectId = new ObjectId(_id);

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ _id: objectId });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Validate email if being updated
    if (updates.email) {
      const normalizedEmail = updates.email.toLowerCase().trim();
      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' }, 
          { status: 400 }
        );
      }
      
      // Check if email is already taken by another user
      const emailExists = await db.collection('users').findOne({ 
        email: normalizedEmail,
        _id: { $ne: objectId }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' }, 
          { status: 409 }
        );
      }
      
      updates.email = normalizedEmail;
    }

    // Hash password if being updated
    if (updates.password) {
      if (updates.password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' }, 
          { status: 400 }
        );
      }
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    // Trim string fields
    ['name', 'firstName', 'lastName', 'role'].forEach(field => {
      if (updates[field] && typeof updates[field] === 'string') {
        updates[field] = updates[field].trim();
      }
    });

    const result = await db.collection('users').updateOne(
      { _id: objectId }, 
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'User updated successfully',
      modifiedCount: result.modifiedCount
    });
    
  } catch (err) {
    console.error('User update error:', err);
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

    if (!isValidObjectId(idParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid id format' }, 
        { status: 400 }
      );
    }

    const objectId = new ObjectId(idParam);
    const client = await clientPromise;
    const db = client.db();

    // Check if user exists before deletion
    const existingUser = await db.collection('users').findOne({ _id: objectId });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 404 }
      );
    }

    const result = await db.collection('users').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (err) {
    console.error('User delete error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' }, 
      { status: 500 }
    );
  }
}