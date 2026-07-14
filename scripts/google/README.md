# Backend Apps Script — Quản lý thu chi

`Code.gs` là backend chạy trên Google Apps Script, dùng Google Sheet
"Quản lý chi tiêu Gia đình" làm database.

## Cài đặt

1. Mở Google Sheet → **Tiện ích mở rộng (Extensions) → Apps Script**.
2. Dán toàn bộ nội dung `Code.gs` vào file `Code.gs` trong editor (thay code cũ,
   nhưng file này ĐÃ gồm sẵn `onEdit` + `capQuyen` cũ của bạn nên cứ dán đè hết).
3. Sửa hằng `TOKEN` thành một chuỗi bí mật ngẫu nhiên của riêng bạn. **Giữ kín.**
4. Đảm bảo sheet `Chi tiết` đã có tiêu đề `ID` ở ô **H1**.
5. Chạy tay hàm `capIdChoDongCu` một lần để cấp ID cho các dòng cũ
   (chọn hàm trên thanh công cụ → ▶ Run → cấp quyền khi được hỏi).

## Deploy Web App

1. Góc phải trên → **Deploy → New deployment**.
2. Bánh răng → chọn **Web app**.
3. **Execute as:** Me. **Who has access:** Anyone.
4. **Deploy** → copy **Web app URL** (dạng `https://script.google.com/macros/s/XXXX/exec`).
5. Mỗi lần sửa code phải **Deploy → Manage deployments → chỉnh (bút chì) →
   Version: New version → Deploy** để URL cập nhật code mới.

## API

Tất cả request kèm `token`.

| Method | Tham số / Body | Kết quả |
|---|---|---|
| GET | `?action=categories&token=T` | `{ ok, data:{ loai, thu, chi } }` |
| GET | `?action=list&token=T[&month=7&year=2026]` | `{ ok, data:[ ... ] }` |
| POST | `{ action:"create", token, data:{ date, type, content, note, amount } }` | `{ ok, data:{ id } }` |
| POST | `{ action:"update", token, id, data:{ ...field cần đổi } }` | `{ ok, data:{ id, updated } }` |
| POST | `{ action:"delete", token, id }` | `{ ok, data:{ id, deleted } }` |

- `date` dạng `"yyyy-MM-dd"`. `type` là `"Thu"` hoặc `"Chi"`.
- `month`/`year` được backend tự tính từ `date` khi create/update.

## Test nhanh bằng curl

```bash
URL="https://script.google.com/macros/s/XXXX/exec"
TOKEN="doi-thanh-chuoi-bi-mat-cua-ban-123xyz"

# Đọc danh mục
curl -L "$URL?action=categories&token=$TOKEN"

# Thêm giao dịch
curl -L "$URL" -H 'Content-Type: application/json' -d '{
  "action":"create","token":"'"$TOKEN"'",
  "data":{"date":"2026-07-13","type":"Chi","content":"Ăn uống","note":"Test từ curl","amount":50000}
}'

# Danh sách tháng 7/2026
curl -L "$URL?action=list&token=$TOKEN&month=7&year=2026"
```

> `-L` để curl đi theo redirect của Google (Apps Script hay 302 sang googleusercontent).
