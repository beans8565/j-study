const xlsx = require('xlsx');
const workbook = xlsx.readFile('D:/제이스터디/사우/관리폴더/2602_ 특이사항 보고서.xlsx');
const sheet_name_list = workbook.SheetNames;
console.log(sheet_name_list);
const sheet = workbook.Sheets[sheet_name_list[0]];
const data = xlsx.utils.sheet_to_json(sheet, {header: 1, defval: ''});
console.log('Columns:', Object.keys(data[0] || {}));
console.log('Row 1:', data[1]);
console.log('Row 2:', data[2]);