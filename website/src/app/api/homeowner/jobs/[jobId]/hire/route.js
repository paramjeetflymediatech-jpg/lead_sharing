import { NextResponse } from "next/server";
import db from "../../../../../../../config/db"

export async function POST(req, context) {
  try {
    // ✅ Await params in Next.js 15+
    const params = await context.params;
    const jobId = params.jobId;

    const { leadId } = await req.json();

    // ✅ Validate jobId
    if (!jobId || jobId === 'undefined') {
      return NextResponse.json(
        { success: false, message: "Invalid job ID" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    // 🔐 Auth check
    if (!userId || role !== "HOMEOWNER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // ❌ Validate leadId
    if (!leadId) {
      return NextResponse.json(
        { success: false, message: "leadId is required" },
        { status: 400 }
      );
    }

    console.log("Hiring for jobId:", jobId, "leadId:", leadId, "userId:", userId);

    // 🔎 Check if job exists and belongs to this homeowner
    const [jobs] = await db.query(
      `SELECT * FROM jobs WHERE id = ? AND homeowner_id = ? LIMIT 1`,
      [jobId, userId]
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    const job = jobs[0];

    // 🔎 Check if job is already hired
    if (job.status === "HIRED") {
      return NextResponse.json(
        { success: false, message: "This job already has a hired tradesperson" },
        { status: 400 }
      );
    }

    // 🔎 Verify lead exists for this job
    const [leads] = await db.query(
      `SELECT * FROM leads WHERE id = ? AND job_id = ? LIMIT 1`,
      [leadId, jobId]
    );

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lead not found for this job" },
        { status: 404 }
      );
    }

    const lead = leads[0];

    // ✅ Start transaction for atomic updates
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // ✅ UPDATE JOB STATUS TO HIRED
      await connection.query(
        `UPDATE jobs 
         SET status = 'HIRED', 
             hired_tradesperson_id = ?,
             hired_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [lead.tradesperson_id, jobId]
      );

      // ✅ Check if leads table has a status column
      const [statusColumns] = await connection.query(
        `SHOW COLUMNS FROM leads LIKE '%status%'`
      );
      
      // Determine if we should update status in leads table
      let shouldUpdateLeadsStatus = false;
      let statusColumnName = null;
      
      if (statusColumns.length > 0) {
        shouldUpdateLeadsStatus = true;
        statusColumnName = statusColumns[0].Field;
      } else {
        // Check for common alternative column names
        const [allColumns] = await connection.query(`SHOW COLUMNS FROM leads`);
        const columnNames = allColumns.map(col => col.Field.toLowerCase());
        
        // Look for any column that might be used for status
        const possibleStatusColumns = ['lead_status', 'state', 'status_code', 'lead_state', 'current_status'];
        for (const possibleCol of possibleStatusColumns) {
          if (columnNames.includes(possibleCol.toLowerCase())) {
            // Find the exact case-sensitive column name
            const exactColumn = allColumns.find(col => 
              col.Field.toLowerCase() === possibleCol.toLowerCase()
            );
            if (exactColumn) {
              shouldUpdateLeadsStatus = true;
              statusColumnName = exactColumn.Field;
              break;
            }
          }
        }
        
        if (!shouldUpdateLeadsStatus) {
          console.warn("No status column found in leads table. Status updates will be skipped.");
        }
      }

      // ✅ UPDATE LEADS STATUS ONLY IF COLUMN EXISTS
      if (shouldUpdateLeadsStatus && statusColumnName) {
        console.log(`Updating leads status using column: ${statusColumnName}`);
        
        // Update all other leads to REJECTED
        await connection.query(
          `UPDATE leads 
           SET ?? = 'REJECTED', 
               updated_at = NOW()
           WHERE job_id = ? AND id != ?`,
          [statusColumnName, jobId, leadId]
        );

        // Update the hired lead to HIRED
        await connection.query(
          `UPDATE leads 
           SET ?? = 'HIRED', 
               updated_at = NOW()
           WHERE id = ?`,
          [statusColumnName, leadId]
        );
      } else {
        console.log("Skipping leads status update - no status column found");
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      console.log("Successfully hired tradesperson for job:", jobId);

      // Fetch updated job details
      const [updatedJob] = await db.query(
        `SELECT 
          j.*,
          tp.company_name as hired_tradesperson_name
         FROM jobs j
         LEFT JOIN tradesperson_profiles tp ON j.hired_tradesperson_id = tp.id
         WHERE j.id = ?
         LIMIT 1`,
        [jobId]
      );

      return NextResponse.json({
        success: true,
        message: "Tradesperson hired successfully",
        data: {
          job: updatedJob[0],
        },
      });
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("HIRE API ERROR:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error", 
        error: error.message,
        sqlMessage: error.sqlMessage
      },
      { status: 500 }
    );
  }
}




