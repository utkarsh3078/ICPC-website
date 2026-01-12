import prisma from '../models/prismaClient';
import bcrypt from 'bcrypt';

// Register a new alumni (requires admin approval)
export const registerAlumni = async (email: string, payload: any) => {
  const hashed = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({ 
    data: { 
      email, 
      password: hashed, 
      role: 'ALUMNI', 
      approved: false  // Require admin approval
    } 
  });
  return user;
};

// List all approved alumni with their profiles
export const listAlumni = async () => {
  return prisma.user.findMany({ 
    where: { role: 'ALUMNI', approved: true },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          name: true,
          branch: true,
          graduationYear: true,
          company: true,
          position: true,
          location: true,
          bio: true,
          linkedIn: true,
          handles: true,
        }
      }
    }
  });
};

// Get all approved students with their profiles and total points (for alumni dashboard)
export const getAllStudentsWithRanks = async () => {
  // Get all approved students with their profiles
  const students = await prisma.user.findMany({
    where: { 
      role: 'STUDENT', 
      approved: true 
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          name: true,
          branch: true,
          year: true,
          contact: true,
          handles: true,
        }
      },
      submissions: {
        where: {
          status: 'VERIFIED'
        },
        select: {
          points: true
        }
      }
    }
  });

  // Calculate total points for each student and format the response
  const studentsWithPoints = students.map(student => {
    const totalPoints = student.submissions.reduce((sum, sub) => sum + sub.points, 0);
    return {
      id: student.id,
      email: student.email,
      createdAt: student.createdAt,
      name: student.profile?.name || 'Unknown',
      branch: student.profile?.branch || 'N/A',
      year: student.profile?.year || 0,
      contact: student.profile?.contact || '',
      handles: student.profile?.handles || {},
      totalPoints,
    };
  });

  // Sort by total points (descending) and assign ranks
  studentsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Assign ranks (handle ties by giving same rank)
  let currentRank = 1;
  let previousPoints = -1;
  
  const rankedStudents = studentsWithPoints.map((student, index) => {
    if (student.totalPoints !== previousPoints) {
      currentRank = index + 1;
    }
    previousPoints = student.totalPoints;
    
    return {
      ...student,
      rank: currentRank,
    };
  });

  return rankedStudents;
};
