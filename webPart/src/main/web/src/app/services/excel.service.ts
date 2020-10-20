import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  constructor() { }

  public multiExportAsExcelFile(json: any[], excelFileName: string): void {
    /* generate workbook and add the worksheet */
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    var wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 }
    ];
    json.forEach(page => {
      var worksheet = XLSX.utils.aoa_to_sheet([
        [""],
        [page.nom]
      ]);

      var wsrows = [
        { hpx: 24, level: 3 },
        { hpx: 24, level: 3 },
        { hpx: 24, level: 3 },
        // { hidden: true },
        // { hidden: false }
      ];


      XLSX.utils.sheet_add_json(worksheet, page.creneaux, { origin: "A4" });

      worksheet['!cols'] = wscols;
      worksheet['!rows'] = wsrows;
      console.log('worksheet', worksheet);
      XLSX.utils.book_append_sheet(workbook, worksheet, page.nom);
    });





    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }


  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_date_' + new Date().getTime() + EXCEL_EXTENSION);
  }

}