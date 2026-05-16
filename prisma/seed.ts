import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const COACHES = [
  {
    name: "Dr. Sarah Mitchell",
    email: "sarah@example.com",
    bio: "With 15 years in executive coaching, I help leaders break through barriers and build high-performing teams. Former Fortune 500 VP turned coach, I bring real-world business insight to every session.",
    specialties: ["Career & Leadership", "Mindset & Confidence", "Business & Finance"],
    hourlyRate: 180,
    experience: 15,
    location: "New York, NY",
    rating: 4.9,
    reviewCount: 127,
    sessionCount: 312,
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    name: "Marcus Thompson",
    email: "marcus@example.com",
    bio: "I specialize in life transitions — career changes, relationship challenges, and personal reinvention. My evidence-based approach blends positive psychology with practical action steps that create lasting change.",
    specialties: ["Life Balance", "Relationships", "Stress Management"],
    hourlyRate: 120,
    experience: 8,
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 89,
    sessionCount: 215,
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "16:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "14:00" },
    ],
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya@example.com",
    bio: "As a health & wellness coach with a background in psychology, I help clients achieve sustainable lifestyle transformations. I work on the intersection of mental and physical well-being to build a healthier, happier you.",
    specialties: ["Health & Wellness", "Mindset & Confidence", "Stress Management"],
    hourlyRate: 150,
    experience: 10,
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 102,
    sessionCount: 267,
    availability: [
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
    ],
  },
  {
    name: "James O'Brien",
    email: "james@example.com",
    bio: "Startup founder turned business coach. I've built and sold two companies and now help entrepreneurs scale their vision. From fundraising strategy to team building, I give you the playbook.",
    specialties: ["Business & Finance", "Career & Leadership", "Productivity"],
    hourlyRate: 200,
    experience: 12,
    location: "Boston, MA",
    rating: 4.7,
    reviewCount: 65,
    sessionCount: 145,
    availability: [
      { dayOfWeek: 1, startTime: "13:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "13:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "13:00", endTime: "18:00" },
    ],
  },
  {
    name: "Emma Larsson",
    email: "emma@example.com",
    bio: "Relationships are the foundation of a fulfilling life. As a certified relationship coach, I help individuals and couples communicate better, resolve conflict, and build deeper connections.",
    specialties: ["Relationships", "Communication Skills", "Emotional Intelligence"],
    hourlyRate: 95,
    experience: 6,
    location: "Seattle, WA",
    rating: 4.8,
    reviewCount: 74,
    sessionCount: 188,
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
    ],
  },
  {
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    bio: "I help professionals achieve peak performance through mindset coaching and habit engineering. My clients include Olympic athletes, C-suite executives, and everyday people wanting extraordinary results.",
    specialties: ["Mindset & Confidence", "Productivity", "Career & Leadership"],
    hourlyRate: 140,
    experience: 9,
    location: "Chicago, IL",
    rating: 4.6,
    reviewCount: 51,
    sessionCount: 132,
    availability: [
      { dayOfWeek: 2, startTime: "07:00", endTime: "15:00" },
      { dayOfWeek: 4, startTime: "07:00", endTime: "15:00" },
      { dayOfWeek: 6, startTime: "08:00", endTime: "12:00" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const coach of COACHES) {
    const password = await bcrypt.hash("password123", 10);
    const user = await prisma.user.upsert({
      where: { email: coach.email },
      update: {},
      create: { name: coach.name, email: coach.email, password, role: "coach" },
    });

    const existing = await prisma.coachProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.coachProfile.create({
        data: {
          userId: user.id,
          bio: coach.bio,
          specialties: JSON.stringify(coach.specialties),
          hourlyRate: coach.hourlyRate,
          experience: coach.experience,
          location: coach.location,
          rating: coach.rating,
          reviewCount: coach.reviewCount,
          sessionCount: coach.sessionCount,
          isAvailable: true,
          availability: { create: coach.availability },
        },
      });
    }
    console.log(`✓ ${coach.name}`);
  }

  const clientPassword = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: { name: "Alex Johnson", email: "client@example.com", password: clientPassword, role: "client" },
  });
  console.log("✓ Client: Alex Johnson");

  console.log("\nDone! Login with:");
  console.log("  Coach:  sarah@example.com / password123");
  console.log("  Client: client@example.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
