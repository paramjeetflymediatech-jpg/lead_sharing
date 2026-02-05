import { NextResponse } from "next/server";
import  pool  from "../../../../../config/db";

export async function GET(req) {
  try {
    // Check for admin role in headers
    const role = req.headers.get("x-user-role");
    
    // Debug logging to help identify the issue
    console.log("Admin payments request - Role from header:", role);

    // Convert role to lowercase for case-insensitive comparison
    if (!role || role.toLowerCase() !== "admin") {
      console.log("Unauthorized access attempt. Role:", role);
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Admin access required" 
        },
        { status: 401 }
      );
    }

    // Get query parameters for filtering/pagination if needed
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build dynamic query based on filters
    let query = `
      SELECT 
        p.id,
        p.tradesperson_id,
        p.user_id,
        p.plan,
        p.amount,
        p.currency,
        p.credits,
        p.status,
        p.stripe_session_id,
        p.stripe_payment_intent_id,
        p.created_at,
        u.name as user_name,
        u.email as user_email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];

    // Add status filter if provided
    if (status && status !== 'ALL' && status !== 'All Statuses') {
      query += ' AND p.status = ?';
      queryParams.push(status);
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query += ` AND (
        p.id LIKE ? OR 
        p.plan LIKE ? OR 
        p.status LIKE ? OR
        u.name LIKE ? OR
        u.email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add ordering and pagination
    query += ' ORDER BY p.created_at DESC';
    
    // Get total count for pagination
    const countQuery = query.replace(
      'SELECT p.id, p.tradesperson_id, p.user_id, p.plan, p.amount, p.currency, p.credits, p.status, p.stripe_session_id, p.stripe_payment_intent_id, p.created_at, u.name as user_name, u.email as user_email',
      'SELECT COUNT(*) as total'
    );
    
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalCount = countResult[0]?.total || 0;

    // Add pagination to main query
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Execute the query
    const [rows] = await pool.query(query, queryParams);

    // Calculate totals for the dashboard
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(credits) as total_credits_issued
      FROM payments
    `);

    return NextResponse.json({
      success: true,
      count: rows.length,
      total: totalCount,
      page: page,
      totalPages: Math.ceil(totalCount / limit),
      payments: rows,
      summary: {
        total_revenue: summary[0]?.total_revenue || 0,
        total_credits_issued: summary[0]?.total_credits_issued || 0,
        total_transactions: summary[0]?.total_transactions || 0,
        completed: summary[0]?.completed || 0,
        pending: summary[0]?.pending || 0
      }
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}