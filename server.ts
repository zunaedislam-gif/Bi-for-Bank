import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getOverview,
  getBranches,
  getBranchDetail,
  getBranchMonthlyTrend,
  getDepositsTrends,
  getLoansSummary,
  getCustomersSegments,
  getProductsAdoption,
  getDataQualityReport,
  authenticateUser,
  getUsersList,
  createInternalUser,
  toggleUserLock,
  toggleUserActive,
  resetUserPassword,
  getSecurityAuditLogs,
  FilterParams,
} from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT: number = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Extract filter parameters from query
  function parseFilters(req: Request): FilterParams {
    return {
      branchId: req.query.branchId as string,
      region: req.query.region as string,
      customerSegment: req.query.customerSegment as string,
      accountType: req.query.accountType as string,
      loanType: req.query.loanType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
  }

  // 1. Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'HEALTHY',
      service: 'BankBI Analytics Server',
      database: 'SQLite (sql.js) Relational Engine Active',
      synthetic_data: true,
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================================================
  // Banking Authentication & Internal User Provisioning Endpoints
  // ============================================================================

  // 1b. Login Endpoint (Strictly Internal - No Self-Registration Allowed)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Corporate identifier and password are required.' });
      }

      const result = await authenticateUser(identifier, password);
      if (!result.success) {
        return res.status(result.statusCode || 401).json(result);
      }

      // Generate realistic JWT simulation token
      const sessionToken = `bankbi_jwt_${Buffer.from(JSON.stringify({ id: result.user?.id, role: result.user?.role, exp: Date.now() + 3600000 })).toString('base64')}`;

      res.json({
        success: true,
        token: sessionToken,
        user: result.user,
        message: 'Authentication successful. Banking session established.',
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
  });

  // 1c. Logout Endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ success: true, message: 'Session terminated. Access token revoked.' });
  });

  // 1d. Get List of Internal Users (Accessible to Admin, Manager, Auditor)
  app.get('/api/auth/users', async (req: Request, res: Response) => {
    try {
      const users = await getUsersList();
      res.json(users);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      res.status(500).json({ error: 'Failed to retrieve internal users.' });
    }
  });

  // 1e. Internal Register User (Only Admin and Manager inside the platform)
  app.post('/api/auth/users', async (req: Request, res: Response) => {
    try {
      const { email, username, password, fullName, role, branchId, phone, nidNumber } = req.body;

      if (!email || !username || !password || !fullName || !role) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing: email, username, password, fullName, and role are required.',
        });
      }

      const allowedRoles = ['admin', 'manager', 'auditor', 'customer'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid banking role specified.' });
      }

      const result = await createInternalUser({
        email,
        username,
        password,
        fullName,
        role,
        branchId,
        phone,
        nidNumber,
      });

      if (!result.success) {
        return res.status(409).json(result);
      }

      res.status(201).json(result);
    } catch (err: any) {
      console.error('Create user error:', err);
      res.status(500).json({ success: false, error: 'Internal server error during user creation.' });
    }
  });

  // 1f. Toggle Lock Status
  app.patch('/api/auth/users/:userId/lock', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const success = await toggleUserLock(userId);
      if (!success) return res.status(404).json({ error: 'User not found.' });
      res.json({ success: true, message: 'User lock status updated.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user lock status.' });
    }
  });

  // 1g. Toggle Active Status
  app.patch('/api/auth/users/:userId/active', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const success = await toggleUserActive(userId);
      if (!success) return res.status(404).json({ error: 'User not found.' });
      res.json({ success: true, message: 'User active status updated.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user status.' });
    }
  });

  // 1h. Reset Password
  app.post('/api/auth/users/:userId/reset-password', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) return res.status(400).json({ error: 'New password is required.' });
      const success = await resetUserPassword(userId, newPassword);
      if (!success) return res.status(404).json({ error: 'User not found.' });
      res.json({ success: true, message: 'Password reset successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to reset password.' });
    }
  });

  // 1i. Security Audit Logs
  app.get('/api/auth/audit-logs', async (req: Request, res: Response) => {
    try {
      const logs = await getSecurityAuditLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve security audit logs.' });
    }
  });


  // 2. Executive Overview
  app.get('/api/overview', async (req: Request, res: Response) => {
    try {
      const filters = parseFilters(req);
      const data = await getOverview(filters);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching overview:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 3. Branches List & Performance
  app.get('/api/branches', async (req: Request, res: Response) => {
    try {
      const filters = parseFilters(req);
      const data = await getBranches(filters);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 4. Branch Specific Performance
  app.get('/api/branches/:branchId/performance', async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      const data = await getBranchDetail(branchId);
      if (!data) {
        return res.status(404).json({ error: `Branch ${branchId} not found` });
      }
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching branch detail:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 4b. Branch Monthly Financial Trends
  app.get('/api/branches/:branchId/monthly', async (req: Request, res: Response) => {
    try {
      const { branchId } = req.params;
      const data = await getBranchMonthlyTrend(branchId);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching branch monthly trend:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 5. Deposit Trends & Breakdown
  app.get('/api/deposits/trends', async (req: Request, res: Response) => {
    try {
      const filters = parseFilters(req);
      const data = await getDepositsTrends(filters);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching deposits trends:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 6. Loan Portfolio Summary & Risk
  app.get('/api/loans/summary', async (req: Request, res: Response) => {
    try {
      const filters = parseFilters(req);
      const data = await getLoansSummary(filters);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching loan summary:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 7. Customer Segmentation
  app.get('/api/customers/segments', async (req: Request, res: Response) => {
    try {
      const filters = parseFilters(req);
      const data = await getCustomersSegments(filters);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching customer segments:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 8. Product Adoption
  app.get('/api/products/adoption', async (req: Request, res: Response) => {
    try {
      const filters = parseFilters(req);
      const data = await getProductsAdoption(filters);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching product adoption:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 9. Data Quality & Audit Log
  app.get('/api/analytics/data-quality', async (req: Request, res: Response) => {
    try {
      const data = await getDataQualityReport();
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching data quality:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 10. Reports CSV Export
  app.get('/api/reports/export', async (req: Request, res: Response) => {
    try {
      const reportType = (req.query.reportType as string) || 'branches';
      const filters = parseFilters(req);

      if (reportType === 'branches') {
        const branches = await getBranches(filters);
        const headers = ['branch_id', 'branch_name', 'region', 'total_customers', 'active_customers', 'total_deposits', 'total_loans', 'npl_loans', 'npl_ratio_pct', 'annual_revenue', 'annual_net_contribution'];
        const csvRows = [
          headers.join(','),
          ...branches.map((b: any) =>
            headers.map((h) => JSON.stringify(b[h] !== undefined ? b[h] : '')).join(',')
          ),
        ];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="bankbi_branch_performance_${Date.now()}.csv"`);
        return res.send(csvRows.join('\n'));
      } else if (reportType === 'deposits') {
        const depData = await getDepositsTrends(filters);
        const headers = ['account_type', 'account_count', 'total_balance', 'avg_balance', 'avg_interest_rate_pct'];
        const csvRows = [
          headers.join(','),
          ...depData.by_account_type.map((d: any) =>
            headers.map((h) => JSON.stringify(d[h] !== undefined ? d[h] : '')).join(',')
          ),
        ];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="bankbi_deposit_analytics_${Date.now()}.csv"`);
        return res.send(csvRows.join('\n'));
      } else if (reportType === 'loans') {
        const loanData = await getLoansSummary(filters);
        const headers = ['loan_type', 'loan_count', 'total_principal', 'total_outstanding', 'avg_interest_rate_pct', 'npl_balance', 'npl_ratio_pct'];
        const csvRows = [
          headers.join(','),
          ...loanData.by_loan_type.map((l: any) =>
            headers.map((h) => JSON.stringify(l[h] !== undefined ? l[h] : '')).join(',')
          ),
        ];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="bankbi_loan_portfolio_${Date.now()}.csv"`);
        return res.send(csvRows.join('\n'));
      } else {
        const quality = await getDataQualityReport();
        res.json(quality);
      }
    } catch (err: any) {
      console.error('Error generating export:', err);
      res.status(500).json({ error: err.message || 'Export generation failed' });
    }
  });

  // Vite Integration in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BankBI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
