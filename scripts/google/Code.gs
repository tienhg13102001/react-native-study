/**
 * Backend Apps Script cho app Quản lý thu chi.
 *
 * Sheet dùng làm database:
 *   - "Chi tiết": mỗi dòng 1 giao dịch. Cột A..H:
 *       A NGÀY THÁNG NĂM | B LOẠI (Thu/Chi) | C NỘI DUNG | D GHI CHÚ
 *       E THÀNH TIỀN | F THÁNG | G NĂM | H ID
 *   - "DS": danh mục nguồn cho dropdown.
 *       A3:A  = Loại (Thu, Chi)
 *       C3:C  = Nội dung Thu
 *       E3:E  = Nội dung Chi
 *
 * API (đều kèm token):
 *   GET  ?action=categories                 -> { loai, thu, chi }
 *   GET  ?action=list[&month=&year=]        -> [ giao dịch... ]
 *   POST {action:"create", data}            -> { id }
 *   POST {action:"update", id, data}        -> { id, updated:true }
 *   POST {action:"delete", id}              -> { id, deleted:true }
 *
 * Deploy: Deploy > New deployment > Web app,
 *   Execute as = Me, Who has access = Anyone. Xem README.md.
 */

/*** ⚙️ CẤU HÌNH ***/
const SHEET_DETAIL = "Chi tiết"; // sheet chứa giao dịch
const SHEET_DS = "DS";           // sheet danh mục

// 🔑 Token bí mật — ĐỔI thành chuỗi ngẫu nhiên của riêng bạn rồi GIỮ KÍN.
const TOKEN = "doi-thanh-chuoi-bi-mat-cua-ban-123xyz";

// Vị trí cột trong "Chi tiết" (1 = A, 2 = B, ...)
const COL = { date: 1, type: 2, content: 3, note: 4, amount: 5, month: 6, year: 7, id: 8 };

/*** 🧰 HÀM TIỆN ÍCH ***/

// Trả kết quả dạng JSON cho app
function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Kiểm tra token; sai thì ném lỗi (dừng ngay)
function checkToken(token) {
  if (token !== TOKEN) {
    throw new Error("Token không hợp lệ");
  }
}

// Lấy đối tượng sheet theo tên
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

// Múi giờ của spreadsheet (để format ngày cho đúng)
function getTZ() {
  return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
}

// Đổi chuỗi "yyyy-MM-dd" thành Date (nửa đêm, giờ địa phương)
function parseDate(str) {
  const p = String(str).split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

// Đổi 1 dòng (mảng ô) thành object gọn cho app dùng
function rowToObject(row) {
  const dateVal = row[COL.date - 1];
  return {
    id: String(row[COL.id - 1] || ""),
    date: dateVal instanceof Date
      ? Utilities.formatDate(dateVal, getTZ(), "yyyy-MM-dd")
      : String(dateVal || ""),
    type: String(row[COL.type - 1] || ""),      // "Thu" / "Chi"
    content: String(row[COL.content - 1] || ""),
    note: String(row[COL.note - 1] || ""),
    amount: Number(row[COL.amount - 1]) || 0,
    month: Number(row[COL.month - 1]) || null,
    year: Number(row[COL.year - 1]) || null,
  };
}

// Dòng cuối CÓ DỮ LIỆU THẬT, dựa trên cột A (ngày).
// Quan trọng: KHÔNG dùng getLastRow() vì công thức ở F/G có thể kéo dài cả cột.
function getLastDataRow(sh) {
  const colA = sh.getRange(1, COL.date, sh.getMaxRows(), 1).getValues();
  for (let r = colA.length - 1; r >= 1; r--) {
    // r=0 là tiêu đề (dòng 1); chỉ tính từ dòng 2 (r>=1)
    if (colA[r][0] !== "" && colA[r][0] !== null) return r + 1;
  }
  return 1; // chỉ có tiêu đề
}

// Điền tháng/năm cho 1 cột, TÔN TRỌNG công thức có sẵn:
//  - cột giá trị thường  -> ghi số
//  - cột dùng ARRAYFORMULA -> không đụng (tự lan xuống)
//  - cột công thức theo dòng -> chép công thức từ dòng 2 xuống
function fillComputedCol(sh, row, col, value) {
  const sample = sh.getRange(2, col).getFormula(); // "" nếu là giá trị thường
  if (!sample) {
    sh.getRange(row, col).setValue(value);
  } else if (sample.toUpperCase().indexOf("ARRAYFORMULA") !== -1) {
    // để yên cho ARRAYFORMULA tự tính
  } else {
    sh.getRange(2, col).copyTo(
      sh.getRange(row, col),
      SpreadsheetApp.CopyPasteType.PASTE_FORMULA,
      false
    );
  }
}

// Tìm số dòng thực theo id (trả -1 nếu không thấy)
function findRowById(sh, id) {
  const last = getLastDataRow(sh);
  if (last < 2) return -1;
  const ids = sh.getRange(2, COL.id, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // +2: bỏ tiêu đề, index 0 = dòng 2
  }
  return -1;
}

/*** 📥 doGet — mọi request ĐỌC ***/
function doGet(e) {
  try {
    const p = e.parameter;      // ?action=...&token=...
    checkToken(p.token);
    const action = p.action;

    if (action === "categories") {
      return jsonOutput({ ok: true, data: getCategories() });
    }
    if (action === "list") {
      return jsonOutput({ ok: true, data: getTransactions(p.month, p.year) });
    }
    return jsonOutput({ ok: false, error: "action không hợp lệ: " + action });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err.message || err) });
  }
}

// Đọc danh mục từ sheet DS (Loại + Nội dung thu + Nội dung chi)
function getCategories() {
  const ds = getSheet(SHEET_DS);
  const last = ds.getLastRow();
  const readCol = (colIndex, startRow) => {
    if (last < startRow) return [];
    return ds.getRange(startRow, colIndex, last - startRow + 1, 1)
      .getValues()
      .map(r => String(r[0]).trim())
      .filter(v => v !== "");
  };
  return {
    loai: readCol(1, 3), // cột A, từ A3 -> ["Thu", "Chi"]
    thu: readCol(3, 3),  // cột C, từ C3 -> nội dung Thu
    chi: readCol(5, 3),  // cột E, từ E3 -> nội dung Chi
  };
}

// Đọc danh sách giao dịch, lọc theo tháng/năm nếu có
function getTransactions(month, year) {
  const sh = getSheet(SHEET_DETAIL);
  const last = getLastDataRow(sh);
  if (last < 2) return [];
  const values = sh.getRange(2, 1, last - 1, COL.id).getValues();
  let list = values
    .filter(r => r[COL.date - 1] !== "")
    .map(rowToObject);
  if (month) list = list.filter(t => t.month === Number(month));
  if (year)  list = list.filter(t => t.year === Number(year));
  return list;
}

/*** 📤 doPost — mọi request GHI (create/update/delete) ***/
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // chờ tối đa 30s để tránh 2 request ghi đè nhau
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    checkToken(body.token);
    const action = body.action;

    if (action === "create") {
      return jsonOutput({ ok: true, data: createTransaction(body.data) });
    }
    if (action === "update") {
      return jsonOutput({ ok: true, data: updateTransaction(body.id, body.data) });
    }
    if (action === "delete") {
      return jsonOutput({ ok: true, data: deleteTransaction(body.id) });
    }
    return jsonOutput({ ok: false, error: "action không hợp lệ: " + action });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// Thêm 1 giao dịch mới, tự sinh id + tính tháng/năm từ ngày
function createTransaction(data) {
  const sh = getSheet(SHEET_DETAIL);
  const d = parseDate(data.date);
  const id = Utilities.getUuid();

  // Ghi vào dòng ngay sau dòng dữ liệu cuối (theo cột A), KHÔNG dùng appendRow
  const row = getLastDataRow(sh) + 1;

  sh.getRange(row, COL.date).setValue(d);
  sh.getRange(row, COL.type).setValue(data.type);
  sh.getRange(row, COL.content).setValue(data.content);
  sh.getRange(row, COL.note).setValue(data.note || "");
  sh.getRange(row, COL.amount).setValue(Number(data.amount) || 0);
  sh.getRange(row, COL.id).setValue(id);

  // F (tháng) và G (năm): tôn trọng công thức nếu có
  fillComputedCol(sh, row, COL.month, d.getMonth() + 1);
  fillComputedCol(sh, row, COL.year, d.getFullYear());

  return { id: id };
}

// Sửa giao dịch theo id (chỉ cập nhật field được gửi lên)
function updateTransaction(id, data) {
  const sh = getSheet(SHEET_DETAIL);
  const rowNum = findRowById(sh, id);
  if (rowNum === -1) throw new Error("Không tìm thấy giao dịch id=" + id);

  if (data.date !== undefined) {
    const d = parseDate(data.date);
    sh.getRange(rowNum, COL.date).setValue(d);
    fillComputedCol(sh, rowNum, COL.month, d.getMonth() + 1);
    fillComputedCol(sh, rowNum, COL.year, d.getFullYear());
  }
  if (data.type !== undefined) sh.getRange(rowNum, COL.type).setValue(data.type);
  if (data.content !== undefined) sh.getRange(rowNum, COL.content).setValue(data.content);
  if (data.note !== undefined) sh.getRange(rowNum, COL.note).setValue(data.note);
  if (data.amount !== undefined) sh.getRange(rowNum, COL.amount).setValue(Number(data.amount) || 0);

  return { id: id, updated: true };
}

// Xóa giao dịch theo id
function deleteTransaction(id) {
  const sh = getSheet(SHEET_DETAIL);
  const rowNum = findRowById(sh, id);
  if (rowNum === -1) throw new Error("Không tìm thấy giao dịch id=" + id);
  sh.deleteRow(rowNum);
  return { id: id, deleted: true };
}

/*** 🛠️ CHẠY TAY 1 LẦN: cấp ID cho các dòng cũ chưa có ID ***/
function capIdChoDongCu() {
  const sh = getSheet(SHEET_DETAIL);
  const last = sh.getLastRow();
  if (last < 2) return;
  const range = sh.getRange(2, COL.id, last - 1, 1);
  const ids = range.getValues();
  let count = 0;
  for (let i = 0; i < ids.length; i++) {
    if (!ids[i][0]) { ids[i][0] = Utilities.getUuid(); count++; }
  }
  range.setValues(ids);
  Logger.log("Đã cấp ID cho " + count + " dòng cũ.");
}

/*** ⬇️ CODE CŨ CỦA BẠN — giữ nguyên (logic dropdown động trên sheet) ***/

function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();

  // Kiểm tra để đảm bảo code chỉ chạy trên sheet "Chi tiết"
  if (sheet.getName() !== "Chi tiết") return;

  var row = e.range.getRow();
  var col = e.range.getColumn();

  // Chỉ chạy khi chỉnh sửa ở cột B (Loại) và từ dòng 2 trở đi
  if (col === 2 && row >= 2) {
    var cellNoiDung = sheet.getRange(row, 3); // Cột C (Nội dung)
    var giaTriLoai = e.value;

    // Xóa Data validation và nội dung cũ ở ô Nội dung
    cellNoiDung.clearDataValidations();
    cellNoiDung.clearContent();

    var wsDS = e.source.getSheetByName("DS");
    var rangeDS;

    // Xác định vùng dữ liệu tùy thuộc vào giá trị Thu hoặc Chi
    if (giaTriLoai === "Thu") {
      rangeDS = wsDS.getRange("C3:C20");
    } else if (giaTriLoai === "Chi") {
      rangeDS = wsDS.getRange("E3:E20");
    }

    // Áp dụng Data Validation mới vào ô
    if (rangeDS) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(rangeDS, true)
        .setAllowInvalid(false)
        .build();
      cellNoiDung.setDataValidation(rule);
    }
  }
}

function capQuyen() {
  Logger.log("Đã cấp quyền thành công");
}
