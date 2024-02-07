import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  async generateExcel(judul, sheet, headers, items) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(sheet,  {
      pageSetup:{paperSize: 9, fitToPage: true},
    });

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, number) => {
      cell.font = { size: 12, bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.fill = {
        type : 'pattern',
        pattern: 'solid',
        fgColor: {argb: 'FF99FF99'}
      }
    });
    headerRow.height = 30;
    headerRow.alignment = { vertical:'middle', horizontal: 'left' };
    items.forEach(data => {
      const rowValues = Object.keys(data).map(key => data[key]);
      const row = worksheet.addRow(rowValues);
    });
    if (items.length == 0) {
      worksheet.addRow(['tidak ada data']);
    }

    worksheet.addRow([]);
    const footerRow = worksheet.addRow(['Diunduh pada ' + new Date().toLocaleDateString('ID')]);
    worksheet.addRow(['Source: Cordova Souvenir Web Admin']);
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const textLength = (cell.text || '').length;
        if (textLength > maxLength) {
          maxLength = textLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, judul + '.xlsx');
    });
  }
  
}
