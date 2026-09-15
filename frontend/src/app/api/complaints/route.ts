import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ComplaintModel } from '@/lib/models/Complaint';
import { calculateDeterministicPriority } from '@/lib/utils';
import { SeverityLevel } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const citizenId = searchParams.get('citizenId');
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: true, complaints: [] });
    }

    const query: any = {};
    if (departmentId) query.departmentId = departmentId;
    if (citizenId) query.citizenId = citizenId;
    if (status) query.status = status;
    if (zoneId) query.zoneId = zoneId;

    const complaints = await ComplaintModel.find(query).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      citizenId = 'c1000000-0000-0000-0000-000000000001',
      citizenName = 'Rahul Sharma',
      citizenPhone = '+91-9829012345',
      categoryId,
      categoryName,
      categoryCode = 'POTHOLE',
      departmentId = 'a1000000-0000-0000-0000-000000000001',
      departmentName = 'Roads & Infrastructure',
      departmentColor = '#F97316',
      zoneId = 'b1000000-0000-0000-0000-000000000001',
      zoneName = 'Mansarovar Zone',
      title,
      description,
      severity = 'MEDIUM' as SeverityLevel,
      affectedCount = 1,
      latitude,
      longitude,
      address,
      landmark,
      city = 'Jaipur',
      pincode,
      images = [],
      videos = [],
      categoryWeight = 1.5,
    } = body;

    if (!title || !description || latitude === undefined || longitude === undefined || !address) {
      return NextResponse.json(
        { error: 'Title, description, location coordinates, and address are required' },
        { status: 400 }
      );
    }

    // Deterministic Priority Engine Calculation
    const level = calculateDeterministicPriority(
      categoryWeight,
      severity as SeverityLevel,
      affectedCount,
      false,
      0
    );
    // Compute numeric score for display
    const severityScoreMap: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const sev = severityScoreMap[severity as string] || 1;
    const crowd = affectedCount > 500 ? 1.6 : affectedCount > 100 ? 1.4 : affectedCount > 25 ? 1.2 : 1.0;
    const score = Math.round((categoryWeight * 20) + (sev * 15) * crowd);

    // SLA calculation based on priority
    const slaHours = level === 'CRITICAL' ? 12 : level === 'HIGH' ? 24 : level === 'MEDIUM' ? 48 : 72;
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000);
    const complaintNumber = `CP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await connectToDatabase();

    const newComplaint = await ComplaintModel.create({
      complaintNumber,
      citizenId,
      citizenName,
      citizenPhone,
      categoryId,
      categoryName,
      categoryCode,
      departmentId,
      departmentName,
      departmentColor,
      zoneId,
      zoneName,
      title,
      description,
      status: 'REPORT_SUBMITTED',
      priority: level,
      priorityScore: score,
      severity,
      affectedCount,
      latitude,
      longitude,
      address,
      landmark,
      city,
      pincode,
      images,
      videos,
      slaDeadline,
      slaBreached: false,
      isEmergency: level === 'CRITICAL',
      reopenCount: 0,
      upvotes: 1,
      statusHistory: [
        {
          toStatus: 'REPORT_SUBMITTED',
          changedBy: citizenId,
          changedByName: citizenName,
          changedByRole: 'CITIZEN',
          notes: 'Issue reported with photographic evidence and GPS location.',
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint successfully filed and routed to department',
        complaint: newComplaint,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Complaint creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}
