const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function generateDatabaseReport() {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    try {
        const connection = await mysql.createConnection({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE
        });

        console.log('📊 Generating database report...\n');

        // Fetch all data
        const [users] = await connection.query('SELECT * FROM users ORDER BY created_at DESC');
        const [jobs] = await connection.query('SELECT * FROM jobs ORDER BY created_at DESC');
        const [leads] = await connection.query('SELECT * FROM leads ORDER BY created_at DESC');
        const [categories] = await connection.query('SELECT * FROM categories ORDER BY name');
        const [subCategories] = await connection.query('SELECT * FROM sub_categories ORDER BY name');
        const [profiles] = await connection.query('SELECT * FROM tradesperson_profiles ORDER BY created_at DESC');

        // Calculate stats
        const homeowners = users.filter(u => u.role === 'HOMEOWNER').length;
        const tradespeople = users.filter(u => u.role === 'TRADESPERSON').length;
        const admins = users.filter(u => u.role === 'ADMIN').length;

        // Generate HTML
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Report - Lead Sharing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { color: #667eea; font-size: 2.5em; margin-bottom: 10px; }
        .header p { color: #666; font-size: 1.1em; }
        .timestamp {
            display: inline-block;
            padding: 8px 20px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-card h3 { color: #667eea; font-size: 1.2em; margin-bottom: 15px; }
        .stat-number { font-size: 3em; font-weight: bold; color: #333; }
        .stat-label { color: #999; font-size: 0.9em; margin-top: 5px; }
        .table-section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .table-section h2 { color: #667eea; margin-bottom: 20px; font-size: 1.8em; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 0.9em;
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #f8f9fa; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-admin { background: #fbbf24; color: #78350f; }
        .badge-homeowner { background: #3b82f6; color: white; }
        .badge-tradesperson { background: #10b981; color: white; }
        .badge-open { background: #10b981; color: white; }
        .badge-in_progress { background: #f59e0b; color: white; }
        .badge-completed { background: #6366f1; color: white; }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
            font-style: italic;
        }
        .refresh-note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .refresh-note strong { color: #92400e; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Database Report</h1>
            <p>Live snapshot of your MySQL database</p>
            <span class="timestamp">Generated: ${new Date().toLocaleString()}</span>
        </div>

        <div class="refresh-note">
            <strong>📌 Note:</strong> This is a static report. To see updated data, run: <code>node generate-db-report.js</code> again.
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>👥 Total Users</h3>
                <div class="stat-number">${users.length}</div>
                <div class="stat-label">Registered users</div>
            </div>
            <div class="stat-card">
                <h3>🏠 Homeowners</h3>
                <div class="stat-number">${homeowners}</div>
                <div class="stat-label">Looking for services</div>
            </div>
            <div class="stat-card">
                <h3>🔧 Tradespeople</h3>
                <div class="stat-number">${tradespeople}</div>
                <div class="stat-label">Service providers</div>
            </div>
            <div class="stat-card">
                <h3>👑 Admins</h3>
                <div class="stat-number">${admins}</div>
                <div class="stat-label">System administrators</div>
            </div>
            <div class="stat-card">
                <h3>💼 Total Jobs</h3>
                <div class="stat-number">${jobs.length}</div>
                <div class="stat-label">Posted jobs</div>
            </div>
            <div class="stat-card">
                <h3>📋 Total Leads</h3>
                <div class="stat-number">${leads.length}</div>
                <div class="stat-label">Generated leads</div>
            </div>
        </div>
        
        <div class="table-section">
            <h2>👥 Users (${users.length})</h2>
            ${users.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-${user.role.toLowerCase()}">${user.role}</span></td>
                            <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<div class="empty-state">No users found</div>'}
        </div>
        
        <div class="table-section">
            <h2>🔧 Tradesperson Profiles (${profiles.length})</h2>
            ${profiles.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Company Name</th>
                        <th>Phone</th>
                        <th>Credits</th>
                        <th>Skills</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${profiles.map(profile => `
                        <tr>
                            <td>${profile.id}</td>
                            <td>${profile.company_name || 'N/A'}</td>
                            <td>${profile.phone || 'N/A'}</td>
                            <td><strong>${profile.credits}</strong></td>
                            <td>${profile.skills || 'None'}</td>
                            <td>${new Date(profile.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<div class="empty-state">No tradesperson profiles yet</div>'}
        </div>
        
        <div class="table-section">
            <h2>💼 Jobs (${jobs.length})</h2>
            ${jobs.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Location</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobs.map(job => `
                        <tr>
                            <td>${job.id}</td>
                            <td>${job.description ? job.description.substring(0, 60) + '...' : 'N/A'}</td>
                            <td><span class="badge badge-${job.status.toLowerCase()}">${job.status}</span></td>
                            <td>£${job.budget_min || 0} - £${job.budget_max || 0}</td>
                            <td>${job.postcode || 'N/A'}</td>
                            <td>${new Date(job.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<div class="empty-state">No jobs posted yet</div>'}
        </div>
        
        <div class="table-section">
            <h2>📋 Leads (${leads.length})</h2>
            ${leads.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Job ID</th>
                        <th>Tradesperson ID</th>
                        <th>Price Estimate</th>
                        <th>Unlocked</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => `
                        <tr>
                            <td>${lead.id}</td>
                            <td>${lead.job_id}</td>
                            <td>${lead.tradesperson_id}</td>
                            <td>${lead.price_estimate || 'Not provided'}</td>
                            <td>${lead.is_unlocked ? '✅ Yes' : '❌ No'}</td>
                            <td>${new Date(lead.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<div class="empty-state">No leads generated yet</div>'}
        </div>
        
        <div class="table-section">
            <h2>📁 Categories (${categories.length})</h2>
            ${categories.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(cat => `
                        <tr>
                            <td>${cat.id}</td>
                            <td>${cat.name}</td>
                            <td>${cat.slug}</td>
                            <td>${new Date(cat.created_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<div class="empty-state">No categories yet - run seed script</div>'}
        </div>
    </div>
</body>
</html>`;

        // Save HTML file
        fs.writeFileSync('database-report.html', html);

        console.log('✅ Report generated successfully!');
        console.log('📄 Open: database-report.html');
        console.log('');
        console.log('Summary:');
        console.log(`  👥 Users: ${users.length}`);
        console.log(`  🏠 Homeowners: ${homeowners}`);
        console.log(`  🔧 Tradespeople: ${tradespeople}`);
        console.log(`  👑 Admins: ${admins}`);
        console.log(`  💼 Jobs: ${jobs.length}`);
        console.log(`  📋 Leads: ${leads.length}`);
        console.log(`  📁 Categories: ${categories.length}`);
        console.log('');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

generateDatabaseReport();
