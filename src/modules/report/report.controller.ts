import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import type { Response } from 'express';
import { Employee } from '../employee/employee.model.js';
import { Project } from '../project/project.model.js';
import { Task } from '../task/task.model.js';
import type { AuthRequest } from '../../types/auth.js';
import { asyncHandler } from '../../utils/async-handler.js';

export const reportController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const [employees, projects, tasks] = await Promise.all([
    Employee.countDocuments({ tenantId, isDeleted: false }),
    Project.countDocuments({ tenantId, isDeleted: false }),
    Task.aggregate([{ $match: { tenantId, isDeleted: false } }, { $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  res.json({ success: true, data: { employees, projects, tasks, period: req.query.period ?? 'monthly' } });
});

export const reportExcelController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rows = [
    ['Metric', 'Value'],
    ['Tenant', req.user!.tenantId],
    ['Period', String(req.query.period ?? 'monthly')]
  ];
  const sheetData = rows
    .map(
      (row) =>
        `<row>${row
          .map((cell) => `<c t="inlineStr"><is><t>${String(cell).replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[char]!)}</t></is></c>`)
          .join('')}</row>`
    )
    .join('');
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  zip.folder('_rels')?.file('.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.folder('xl')?.file('workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="ERP Report" sheetId="1" r:id="rId1"/></sheets></workbook>');
  zip.folder('xl')?.folder('_rels')?.file('workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  zip.folder('xl')?.folder('worksheets')?.file('sheet1.xml', `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetData}</sheetData></worksheet>`);
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="cybernaut-report.xlsx"');
  res.end(buffer);
});

export const reportPdfController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doc = new PDFDocument({ margin: 48 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="cybernaut-report.pdf"');
  doc.pipe(res);
  doc.fontSize(18).text('Cybernaut Minutos ERP Report');
  doc.moveDown().fontSize(11).text(`Tenant: ${req.user!.tenantId}`);
  doc.text(`Period: ${req.query.period ?? 'monthly'}`);
  doc.end();
});
