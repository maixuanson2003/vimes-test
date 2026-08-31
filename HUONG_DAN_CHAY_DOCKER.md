# Hướng dẫn chạy dự án bằng Docker Compose

## 1. Yêu cầu

Máy cần cài:

- Docker Desktop.
- Docker Compose (đã tích hợp sẵn trong Docker Desktop).

Kiểm tra Docker đang hoạt động:

```powershell
docker --version
docker compose version
```

## 2. Khởi động dự án

Mở PowerShell hoặc Terminal tại thư mục gốc của dự án:

```powershell
cd "C:\Users\DPC\Desktop\test"
```

Chạy một lệnh:

```powershell
docker compose up -d --build
```

Lệnh này tự động:

1. Tạo PostgreSQL database.
2. Build và khởi động backend.
3. Chạy database migration.
4. Khởi tạo tài khoản và dữ liệu mẫu.
5. Build và khởi động frontend.

Không cần chạy `npm install`, migration hoặc seed thủ công.

## 3. Truy cập ứng dụng

Sau khi các container khởi động:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- Backend health check: [http://localhost:3001/health](http://localhost:3001/health)

Tài khoản quản trị mặc định:

```text
Email:    admin@vimes.local
Mật khẩu: Admin@123
```

## 4. Kiểm tra trạng thái

```powershell
docker compose ps
```

Kết quả bình thường có ba service:

```text
warehouse-database
warehouse-backend
warehouse-frontend
```

Database và backend cần có trạng thái `healthy`.

## 5. Xem log

Xem log toàn bộ hệ thống:

```powershell
docker compose logs -f
```

Chỉ xem backend:

```powershell
docker compose logs -f backend
```

Chỉ xem frontend:

```powershell
docker compose logs -f frontend
```

Nhấn `Ctrl + C` để thoát màn hình log. Các container vẫn tiếp tục chạy.

## 6. Dừng và chạy lại

Dừng hệ thống nhưng giữ database và file attachment:

```powershell
docker compose down
```

Chạy lại:

```powershell
docker compose up -d
```

Sau khi sửa code hoặc dependency, rebuild:

```powershell
docker compose up -d --build
```

## 7. Dữ liệu được lưu ở đâu?

Docker sử dụng volume để giữ dữ liệu:

- `warehouse-postgres-data`: dữ liệu PostgreSQL.
- `warehouse-upload-data`: file chứng từ đính kèm.

Lệnh `docker compose down` không xóa các volume này.

> Cảnh báo: lệnh dưới đây xóa toàn bộ database và attachment, không thể khôi phục nếu chưa sao lưu.

```powershell
docker compose down -v
```

Sau khi xóa volume, chạy lại dự án bằng:

```powershell
docker compose up -d --build
```

Migration và dữ liệu mẫu sẽ được tạo lại từ đầu.

## 8. Biến môi trường tùy chọn

Dự án có giá trị mặc định để chạy ngay. Nếu cần thay đổi tài khoản hoặc mật khẩu, tạo file `.env` ở thư mục gốc:

```env
JWT_SECRET=thay-bang-chuoi-bi-mat-toi-thieu-32-ky-tu
ADMIN_EMAIL=admin@vimes.local
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Quản trị viên
SEED_USER_PASSWORD=User@123456
JWT_EXPIRES_IN_SECONDS=28800
```

Sau khi đổi `.env`, chạy lại:

```powershell
docker compose up -d --build
```

## 9. Các tài khoản dữ liệu mẫu

Ngoài tài khoản quản trị, backend tự tạo các user mẫu:

| Email | Role |
| --- | --- |
| `user@vimes.local` | `USER` |
| `preparer@vimes.local` | `USER` |
| `storekeeper@vimes.local` | `STOREKEEPER` |
| `accountant@vimes.local` | `CHIEF_ACCOUNTANT` |

Mật khẩu mặc định của các user mẫu:

```text
User@123456
```

## 10. Xử lý lỗi thường gặp

### Docker Desktop chưa chạy

Mở Docker Desktop, đợi Docker Engine khởi động rồi chạy lại:

```powershell
docker compose up -d --build
```

### Cổng 3000 hoặc 3001 đang được sử dụng

Kiểm tra container đang chạy:

```powershell
docker ps
```

Dừng phiên bản cũ của dự án:

```powershell
docker compose down
```

Sau đó chạy lại.

### Giao diện chưa cập nhật sau khi sửa code

```powershell
docker compose up -d --build frontend
```

Sau đó tải lại trình duyệt bằng `Ctrl + F5`.

### Backend không healthy

```powershell
docker compose logs backend --tail 100
docker compose logs database --tail 100
```

## 11. Lệnh chạy nhanh

```powershell
# Khởi động toàn bộ dự án
docker compose up -d --build

# Kiểm tra trạng thái
docker compose ps

# Xem log
docker compose logs -f

# Dừng dự án, giữ dữ liệu
docker compose down
```
