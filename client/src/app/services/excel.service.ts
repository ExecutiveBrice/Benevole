import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import {Benevole, Croisement, Stand} from '../models';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  constructor() { }
  public multiExportAsExcelBenevoles(benevoles: Benevole[], excelFileName: string): void {
    /* generate workbook and add the worksheet */
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    var worksheet = XLSX.utils.aoa_to_sheet([
    ]);

    let line = 0;

    benevoles.forEach(benevole => {

      XLSX.utils.sheet_add_aoa(worksheet, [
        [benevole.nom,
        benevole.prenom,
        benevole.email,
       benevole.telephone
      ]], { origin: line });
      line++;

    });

    XLSX.utils.book_append_sheet(workbook, worksheet, "benevoles");

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public multiExportAsExcelFile(stands: Stand[], excelFileName: string): void {
    /* generate workbook and add the worksheet */
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    var worksheet = XLSX.utils.aoa_to_sheet([
    ]);

    let line = 0;

    stands.forEach(stand => {

      XLSX.utils.sheet_add_aoa(worksheet, [
        [stand.nom],
        []
      ], { origin: line });
      line++;

      console.log(stand);
      stand.croisements.forEach(croisement => {
        XLSX.utils.sheet_add_aoa(worksheet, [
          [croisement.creneau.plage]
        ], { origin: line });
        line++;
        croisement.benevoles.forEach(benevole => {
          XLSX.utils.sheet_add_aoa(worksheet, [
            [benevole.prenom +' '+benevole.nom, benevole.email, benevole.telephone]
          ], { origin: line });
          line++;
        });
        XLSX.utils.sheet_add_aoa(worksheet, [
          []
        ], { origin: line });
        line++;
    });
    XLSX.utils.sheet_add_aoa(worksheet, [
      []
    ], { origin: line });
    line++;
    XLSX.utils.sheet_add_aoa(worksheet, [
      []
    ], { origin: line });
    line++;
  });

    XLSX.utils.book_append_sheet(workbook, worksheet, "stands");

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }


  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

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
