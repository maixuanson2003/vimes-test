# Backend Test — TypeScript + TypeORM + PostgreSQL

## Kiến trúc

```text
Request → Route → Middleware → Controller → Logic → Repository → TypeORM → PostgreSQL
```

Các lớp chính nằm trong `src/modules/warehouse-receipts`:

- `models`: TypeORM entities ánh xạ bảng PostgreSQL.
- `controllers`: xử lý HTTP request/response.
- `logic`: nghiệp vụ, điều phối luồng xử lý và là lớp duy nhất gọi repository.
- `repositories`: cô lập truy cập dữ liệu bằng TypeORM.
- `schemas`: validate dữ liệu với Zod.
- `routes`: khai báo endpoint và dependency wiring.

## Chạy dự án

```powershell
npm install
Copy-Item .env.example .env
npm run migration:run
npm run dev
```

## API

- `GET /health`
- `POST /api/warehouse-receipts`
- `GET /api/warehouse-receipts/:id`
- `POST /api/goods-receipts/:id/confirm`: xác nhận phiếu nháp và cộng số lượng thực nhập vào tồn kho.
- `POST /api/goods-receipts/:id/cancel`: hủy phiếu nháp; phiếu đã xác nhận hoặc đã hủy không thể chuyển trạng thái lại.

## Kiểm tra

```powershell
npm run typecheck
npm test
npm run build
```

TypeORM được cấu hình `synchronize: false`; schema chỉ thay đổi qua migration để an toàn cho dữ liệu.

## CRUD API dùng chung

Mỗi resource có các endpoint:

```text
GET    /api/{resource}
GET    /api/{resource}/:id
POST   /api/{resource}
PUT    /api/{resource}/:id
PATCH  /api/{resource}/:id
DELETE /api/{resource}/:id
```

Các resource hiện có:

```text
suppliers
products
goods-receipts
goods-receipt-items
goods-issues
goods-issue-items
inventory-adjustments
```

Để thêm CRUD cho entity mới: tạo repository kế thừa `BaseRepository`, tạo logic kế thừa `BaseLogic`, rồi truyền logic vào controller tương ứng.

> CRUD generic chỉ dành cho thao tác dữ liệu cơ bản. Xác nhận nhập kho, xuất kho hoặc điều chỉnh làm thay đổi tồn phải dùng service nghiệp vụ riêng với transaction và khóa dòng sản phẩm.
