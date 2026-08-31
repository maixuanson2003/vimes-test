# Kế hoạch thực hiện bài test quản lý tồn kho

## 1. Mục tiêu

Xây dựng chức năng nhập và lưu thông tin **Phiếu nhập kho** theo mẫu 01-VT trong đề bài. Hệ thống cần đáp ứng các yêu cầu:

1. Thiết kế cấu trúc bảng cơ sở dữ liệu để lưu trữ.
2. Thiết kế giao diện nhập liệu.
3. Viết chương trình cho phép nhập và lưu dữ liệu.
4. Viết unit test cho các nghiệp vụ chính.

## 2. Phạm vi thực hiện

### Chức năng bắt buộc

- Tạo mới phiếu nhập kho.
- Nhập thông tin chung của phiếu.
- Thêm, sửa, xóa nhiều dòng hàng hóa trong một phiếu.
- Tự động tính thành tiền từng dòng và tổng tiền phiếu.
- Kiểm tra dữ liệu trước khi lưu.
- Lưu phiếu và chi tiết phiếu vào PostgreSQL trong cùng một transaction.
- Hiển thị kết quả lưu thành công hoặc lỗi phù hợp.
- Viết unit test cho phần tính toán, kiểm tra dữ liệu và lưu phiếu.

### Ngoài phạm vi phiên bản bài test

- Đăng nhập và phân quyền.
- Quy trình duyệt phiếu.
- Ký số, in phiếu hoặc xuất PDF/Excel.
- Quản lý tồn kho theo thời gian thực sau khi nhập phiếu.
- Quản lý danh mục hàng hóa, nhà cung cấp và kho bằng màn hình riêng.

## 3. Công nghệ đề xuất

- Ngôn ngữ: TypeScript.
- Backend: Node.js + Express.
- Cơ sở dữ liệu: PostgreSQL.
- Kết nối cơ sở dữ liệu: thư viện `pg` sử dụng giao thức libpq/PostgreSQL.
- Giao diện: HTML/CSS/TypeScript; có thể dùng React nếu cần tổ chức form động thuận tiện hơn.
- Kiểm thử: Jest hoặc Vitest; Supertest cho API.
- Quản lý migration: node-pg-migrate hoặc migration SQL thuần.

Lý do chọn phương án này: phù hợp trực tiếp với công nghệ được đề bài cho phép, dễ xây dựng API, transaction và unit test trong phạm vi bài test.

## 4. Phân tích dữ liệu từ mẫu phiếu

### Thông tin chung

- Đơn vị.
- Bộ phận.
- Ngày lập phiếu.
- Số phiếu.
- Nợ.
- Có.
- Họ tên người giao hàng.
- Số và ngày chứng từ/hóa đơn.
- Đơn vị phát hành chứng từ.
- Nội dung nhập kho.
- Địa điểm/kho nhập.
- Tổng số tiền bằng chữ.
- Số chứng từ gốc kèm theo.
- Người lập phiếu.
- Người giao hàng.
- Thủ kho.
- Kế toán trưởng/người được ủy quyền.

### Thông tin từng dòng hàng

- Số thứ tự.
- Tên, nhãn hiệu, quy cách/phẩm chất vật tư, dụng cụ, sản phẩm hoặc hàng hóa.
- Mã số hàng hóa.
- Đơn vị tính.
- Số lượng theo chứng từ.
- Số lượng thực nhập.
- Đơn giá.
- Thành tiền.

### Quy tắc tính toán

- `thành tiền = số lượng thực nhập × đơn giá`.
- `tổng tiền = tổng thành tiền của tất cả dòng hàng`.
- Thành tiền và tổng tiền do hệ thống tính, không cho người dùng sửa trực tiếp.

## 5. Thiết kế cơ sở dữ liệu

### Bảng `warehouse_receipts`

Lưu phần đầu và phần ký xác nhận của phiếu nhập kho.

| Cột | Kiểu dữ liệu | Ràng buộc/ý nghĩa |
| --- | --- | --- |
| `id` | `uuid` | Khóa chính |
| `receipt_no` | `varchar(50)` | Số phiếu, bắt buộc, duy nhất |
| `receipt_date` | `date` | Ngày nhập phiếu, bắt buộc |
| `organization_name` | `varchar(255)` | Đơn vị |
| `department_name` | `varchar(255)` | Bộ phận |
| `debit_account` | `varchar(50)` | Tài khoản Nợ |
| `credit_account` | `varchar(50)` | Tài khoản Có |
| `deliverer_name` | `varchar(255)` | Họ tên người giao hàng |
| `source_document_no` | `varchar(100)` | Số chứng từ/hóa đơn |
| `source_document_date` | `date` | Ngày chứng từ/hóa đơn |
| `source_organization` | `varchar(255)` | Đơn vị phát hành chứng từ |
| `reason` | `text` | Nội dung/lý do nhập kho |
| `warehouse_name` | `varchar(255)` | Kho hoặc địa điểm nhập |
| `total_amount` | `numeric(18,2)` | Tổng tiền, không âm |
| `total_amount_in_words` | `text` | Tổng tiền bằng chữ |
| `attached_document_count` | `integer` | Số chứng từ gốc, không âm |
| `prepared_by` | `varchar(255)` | Người lập phiếu |
| `delivered_by` | `varchar(255)` | Người giao hàng ký |
| `storekeeper` | `varchar(255)` | Thủ kho |
| `chief_accountant` | `varchar(255)` | Kế toán trưởng/người ủy quyền |
| `created_at` | `timestamptz` | Thời điểm tạo |
| `updated_at` | `timestamptz` | Thời điểm cập nhật |

### Bảng `warehouse_receipt_items`

Lưu các dòng hàng thuộc phiếu.

| Cột | Kiểu dữ liệu | Ràng buộc/ý nghĩa |
| --- | --- | --- |
| `id` | `uuid` | Khóa chính |
| `receipt_id` | `uuid` | Khóa ngoại tới `warehouse_receipts.id`, xóa cascade |
| `line_no` | `integer` | Số thứ tự dòng, lớn hơn 0 |
| `item_name` | `varchar(500)` | Tên/nhãn hiệu/quy cách hàng hóa, bắt buộc |
| `item_code` | `varchar(100)` | Mã hàng hóa |
| `unit_name` | `varchar(50)` | Đơn vị tính, bắt buộc |
| `document_quantity` | `numeric(18,3)` | Số lượng theo chứng từ, không âm |
| `actual_quantity` | `numeric(18,3)` | Số lượng thực nhập, không âm |
| `unit_price` | `numeric(18,2)` | Đơn giá, không âm |
| `line_amount` | `numeric(18,2)` | Thành tiền, không âm |
| `created_at` | `timestamptz` | Thời điểm tạo |
| `updated_at` | `timestamptz` | Thời điểm cập nhật |

Ràng buộc bổ sung:

- Unique `(receipt_id, line_no)`.
- Ít nhất một dòng hàng cho mỗi phiếu khi tạo mới.
- Không dùng kiểu `float` cho số tiền; sử dụng `numeric` và thư viện decimal ở tầng ứng dụng để tránh sai số.
- Backend luôn tính lại `line_amount` và `total_amount`, không tin giá trị tổng gửi từ giao diện.

### Chỉ mục đề xuất

- Unique index trên `warehouse_receipts(receipt_no)`.
- Index trên `warehouse_receipts(receipt_date)`.
- Index trên `warehouse_receipt_items(receipt_id)`.
- Index trên `warehouse_receipt_items(item_code)` nếu có nhu cầu tìm kiếm theo mã hàng.

## 6. Thiết kế API

### `POST /api/warehouse-receipts`

Tạo phiếu nhập kho mới.

Luồng xử lý:

1. Nhận dữ liệu phần thông tin chung và mảng `items`.
2. Chuẩn hóa chuỗi, ngày tháng và số thập phân.
3. Kiểm tra dữ liệu đầu vào.
4. Kiểm tra số phiếu không bị trùng.
5. Tính lại thành tiền từng dòng và tổng tiền.
6. Mở transaction.
7. Ghi bảng phiếu và các dòng chi tiết.
8. Commit khi toàn bộ thao tác thành công; rollback nếu có lỗi.
9. Trả HTTP `201` cùng dữ liệu phiếu đã lưu.

### API bổ trợ nên có

- `GET /api/warehouse-receipts/:id`: xem lại phiếu đã lưu.
- `GET /api/warehouse-receipts?receiptNo=&fromDate=&toDate=`: tìm kiếm danh sách phiếu.
- `PUT /api/warehouse-receipts/:id`: cập nhật phiếu nếu phạm vi thời gian cho phép.
- `DELETE /api/warehouse-receipts/:id`: xóa phiếu; chỉ triển khai nếu được yêu cầu.

### Mã lỗi chính

- `400 Bad Request`: dữ liệu sai định dạng hoặc thiếu trường bắt buộc.
- `404 Not Found`: không tìm thấy phiếu.
- `409 Conflict`: số phiếu đã tồn tại.
- `500 Internal Server Error`: lỗi ngoài dự kiến; không trả chi tiết nội bộ hoặc thông tin kết nối DB.

## 7. Thiết kế giao diện nhập liệu

### Khu vực thông tin chung

- Đơn vị, bộ phận.
- Số phiếu và ngày nhập.
- Tài khoản Nợ/Có.
- Người giao hàng.
- Thông tin chứng từ gốc.
- Nội dung nhập và kho nhập.

### Bảng chi tiết hàng hóa

Mỗi dòng gồm:

- STT.
- Tên/quy cách hàng hóa.
- Mã hàng.
- Đơn vị tính.
- Số lượng theo chứng từ.
- Số lượng thực nhập.
- Đơn giá.
- Thành tiền chỉ đọc.
- Nút xóa dòng.

Các thao tác:

- Thêm dòng hàng mới.
- Xóa dòng hàng.
- Tự đánh lại STT sau khi thêm/xóa.
- Tính thành tiền và tổng tiền ngay khi số lượng hoặc đơn giá thay đổi.

### Khu vực tổng hợp và xác nhận

- Tổng tiền dạng số, chỉ đọc.
- Tổng tiền bằng chữ.
- Số chứng từ kèm theo.
- Người lập phiếu, người giao hàng, thủ kho và kế toán trưởng.
- Nút `Lưu phiếu` và `Nhập lại`.

### Trải nghiệm và kiểm tra trên giao diện

- Đánh dấu rõ trường bắt buộc.
- Hiển thị lỗi ngay gần trường nhập.
- Chặn bấm lưu nhiều lần trong lúc gửi yêu cầu.
- Cảnh báo khi rời trang nếu có dữ liệu chưa lưu.
- Định dạng số lượng, đơn giá và tiền dễ đọc nhưng gửi dữ liệu ở dạng chuẩn cho API.
- Sau khi lưu thành công, hiển thị số phiếu và đường dẫn xem lại phiếu.

## 8. Quy tắc kiểm tra dữ liệu

- Số phiếu bắt buộc, không được trùng và giới hạn 50 ký tự.
- Ngày phiếu bắt buộc và phải là ngày hợp lệ.
- Phải có ít nhất một dòng hàng hợp lệ.
- Tên hàng và đơn vị tính là bắt buộc.
- Số lượng theo chứng từ, số lượng thực nhập và đơn giá phải là số, không âm.
- Cần ít nhất một trong hai giá trị số lượng; đề xuất bắt buộc `actual_quantity > 0` khi lưu phiếu hoàn chỉnh.
- Số chứng từ kèm theo là số nguyên không âm.
- Không chấp nhận `NaN`, số vô hạn hoặc số có phần thập phân vượt quy định.
- Kiểm tra ở cả frontend và backend; backend là lớp xác thực quyết định.

## 9. Cấu trúc mã nguồn dự kiến

```text
src/
  config/
    database.ts
  modules/warehouse-receipts/
    warehouse-receipt.routes.ts
    warehouse-receipt.controller.ts
    warehouse-receipt.service.ts
    warehouse-receipt.repository.ts
    warehouse-receipt.validation.ts
    warehouse-receipt.types.ts
  shared/
    errors/
    middleware/
    utils/
  app.ts
  server.ts
migrations/
tests/
  unit/
  integration/
web/
  src/
```

Phân lớp trách nhiệm:

- Controller: nhận/trả HTTP, không chứa nghiệp vụ chính.
- Validation: kiểm tra cấu trúc và giá trị đầu vào.
- Service: tính toán, điều phối transaction và xử lý nghiệp vụ.
- Repository: thực thi truy vấn PostgreSQL bằng câu lệnh có tham số.
- UI: quản lý form và gọi API; không quyết định số tiền cuối cùng được lưu.

## 10. Kế hoạch kiểm thử

### Unit test

- Tính đúng thành tiền từ số lượng thực nhập và đơn giá.
- Tính đúng tổng tiền của nhiều dòng.
- Làm tròn số tiền theo quy tắc đã chọn.
- Báo lỗi khi thiếu số phiếu hoặc ngày phiếu.
- Báo lỗi khi danh sách hàng rỗng.
- Báo lỗi khi thiếu tên hàng/đơn vị tính.
- Báo lỗi với số lượng, đơn giá hoặc số chứng từ âm.
- Chuẩn hóa khoảng trắng và dữ liệu chuỗi.
- Không sử dụng tổng tiền do client gửi lên.

### Integration test API và database

- Tạo thành công phiếu có một và nhiều dòng hàng.
- Lưu đúng quan hệ giữa phiếu và chi tiết.
- Trả `409` khi trùng số phiếu.
- Rollback toàn bộ khi một dòng chi tiết lưu thất bại.
- Trả đúng dữ liệu khi xem lại phiếu.
- Câu truy vấn có tham số, không bị SQL injection với dữ liệu đầu vào đặc biệt.

### Kiểm thử giao diện

- Thêm/xóa dòng và đánh lại STT đúng.
- Tính tiền tức thời đúng khi người dùng thay đổi dữ liệu.
- Hiển thị lỗi đúng vị trí.
- Không gửi lặp request khi bấm lưu liên tục.
- Form hoạt động ở kích thước màn hình desktop phổ biến.

## 11. Các giai đoạn thực hiện

### Giai đoạn 1 — Khởi tạo và thống nhất nghiệp vụ

- Khởi tạo dự án TypeScript, Express và cấu hình môi trường.
- Chốt trường bắt buộc, quy tắc làm tròn và cách sinh số phiếu.
- Tạo file `.env.example`; không commit thông tin kết nối thật.

Kết quả: dự án chạy được, kết nối PostgreSQL và có tài liệu cấu hình.

### Giai đoạn 2 — Cơ sở dữ liệu

- Viết migration tạo hai bảng, khóa ngoại, constraint và index.
- Chuẩn bị migration rollback.
- Kiểm tra migration trên database sạch.

Kết quả: schema có thể tạo lại tự động và đúng thiết kế.

### Giai đoạn 3 — Backend và API

- Xây dựng validation, service, repository và endpoint tạo phiếu.
- Thực hiện tính toán tiền ở backend.
- Thực hiện transaction và xử lý lỗi chuẩn.
- Thêm endpoint xem chi tiết để kiểm tra kết quả đã lưu.

Kết quả: có thể tạo và đọc lại phiếu qua API.

### Giai đoạn 4 — Giao diện

- Tạo form thông tin chung.
- Tạo bảng hàng hóa động.
- Tính toán hiển thị và validate phía client.
- Kết nối API và hiển thị trạng thái lưu.

Kết quả: người dùng nhập và lưu được phiếu hoàn chỉnh từ giao diện.

### Giai đoạn 5 — Kiểm thử và hoàn thiện

- Viết unit test và integration test.
- Chạy test với database riêng.
- Kiểm tra các trường hợp biên, thông báo lỗi và transaction rollback.
- Viết README hướng dẫn cài đặt, migration, chạy ứng dụng và chạy test.

Kết quả: toàn bộ test đạt và người chấm có thể chạy dự án theo README.

## 12. Tiêu chí nghiệm thu

- Migration tạo đúng bảng, ràng buộc và chỉ mục trên PostgreSQL.
- Giao diện thể hiện đầy đủ các trường chính trong mẫu phiếu.
- Người dùng thêm/xóa được nhiều dòng hàng.
- Thành tiền và tổng tiền được tính chính xác ở cả UI và backend.
- Một request hợp lệ tạo đúng một phiếu cùng toàn bộ dòng chi tiết.
- Dữ liệu không hợp lệ không được ghi một phần vào database.
- Số phiếu trùng được xử lý bằng thông báo rõ ràng.
- API dùng truy vấn có tham số và không làm lộ lỗi nội bộ.
- Unit test và integration test chính đều chạy thành công.
- README đủ để cài đặt và chạy dự án trên máy mới.

## 13. Rủi ro và điểm cần xác nhận

- Mẫu giấy không thể hiện rõ trường nào bắt buộc; cần thống nhất trước khi khóa validation.
- Cần xác nhận số phiếu do người dùng nhập hay hệ thống tự sinh.
- Cần chốt quy tắc làm tròn tiền và số chữ số thập phân của số lượng.
- Trường “tổng tiền bằng chữ” có thể nhập tay hoặc tự động chuyển đổi; phiên bản tối thiểu cho phép nhập tay.
- Nếu cho phép sửa/xóa phiếu, cần xác định trạng thái phiếu và quyền thao tác.
- Nếu chức năng thực tế phải cập nhật tồn kho, cần bổ sung bảng giao dịch kho và nghiệp vụ chống cập nhật trùng; nội dung này chưa nằm trong yêu cầu tối thiểu của đề.

## 14. Ước lượng tham khảo

| Hạng mục | Thời lượng dự kiến |
| --- | ---: |
| Khởi tạo và chốt nghiệp vụ | 0,5 ngày |
| Database và migration | 0,5 ngày |
| Backend/API | 1–1,5 ngày |
| Giao diện nhập liệu | 1–1,5 ngày |
| Unit test, integration test và sửa lỗi | 1 ngày |
| README và hoàn thiện | 0,5 ngày |
| **Tổng** | **4,5–5,5 ngày công** |

Ước lượng trên dành cho một lập trình viên và phiên bản bài test tối thiểu, chưa gồm đăng nhập, phân quyền, duyệt phiếu, in ấn hoặc cập nhật sổ tồn kho.
