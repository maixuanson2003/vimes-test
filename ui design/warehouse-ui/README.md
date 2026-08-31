# VIMES Warehouse UI

Giao diện tạo phiếu nhập kho được dựng từ mockup bằng Next.js, TypeScript và Tailwind CSS.

## Chạy local

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Cấu trúc chính

- `src/components/ui`: button, badge, card, input, select và textarea dùng chung.
- `src/components/form`: các thành phần form dùng chung.
- `src/components/table`: data table generic dùng lại cho nhiều loại chứng từ.
- `src/components/layout`: sidebar và topbar.
- `src/features/goods-receipt`: màn hình và các khối nghiệp vụ phiếu nhập kho.

## Kiểm tra

```bash
npm run lint
npm run build
```

## Chạy bằng Docker

Chạy lệnh từ thư mục gốc `C:\Users\DPC\Desktop\test`:

```bash
docker compose up --build -d
```

Mở `http://localhost:3000`. Dừng và xóa container bằng:

```bash
docker compose down
```
