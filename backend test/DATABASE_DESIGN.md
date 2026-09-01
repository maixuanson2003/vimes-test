# Thiết kế database hệ thống quản lý tồn kho cơ bản

## 1. Mục tiêu

Thiết kế PostgreSQL phục vụ các nghiệp vụ:

- Quản lý sản phẩm, danh mục và đơn vị tính.
- Quản lý nhiều kho.
- Nhập hàng từ nhà cung cấp.
- Xuất hàng phục vụ bán hàng hoặc sử dụng nội bộ.
- Kiểm kê và ghi nhận chênh lệch thực tế.
- Điều chỉnh tồn kho có lý do và lịch sử.
- Chuyển hàng giữa các kho.
- Theo dõi tồn hiện tại và cảnh báo tồn thấp.
- Tra cứu toàn bộ lịch sử tăng/giảm của một sản phẩm.

## 2. Nguyên tắc thiết kế

### 2.1. Không chỉ lưu số tồn trong bảng sản phẩm

Số lượng tồn phụ thuộc đồng thời vào sản phẩm và kho. Vì vậy, không đặt `current_stock` trực tiếp trong bảng `products` khi hệ thống hỗ trợ nhiều kho.

Tồn hiện tại được lưu tại:

```text
inventory_balances(product_id, warehouse_id, quantity)
```

### 2.2. Mọi thay đổi tồn phải có lịch sử

Không cập nhật số lượng tồn một cách vô danh. Mỗi lần nhập, xuất, kiểm kê, điều chỉnh hoặc chuyển kho đều phải tạo bản ghi tại `stock_movements`.

```text
Chứng từ nghiệp vụ
        ↓
Stock movement — lịch sử bất biến
        ↓
Inventory balance — số dư hiện tại
```

`inventory_balances` giúp đọc tồn nhanh. `stock_movements` dùng để giải trình, kiểm tra và có thể tái dựng số tồn khi cần.

### 2.3. Chỉ chứng từ đã xác nhận mới ảnh hưởng tồn kho

- `DRAFT`: đang nhập liệu, chưa thay đổi tồn.
- `CONFIRMED`: đã xác nhận và đã cập nhật tồn.
- `CANCELLED`: đã hủy.

Một chứng từ chỉ được xác nhận một lần. Không được sửa trực tiếp chứng từ đã xác nhận. Nếu dữ liệu sai, tạo chứng từ điều chỉnh hoặc nghiệp vụ đảo.

### 2.4. Dùng transaction và khóa dữ liệu

Khi xác nhận nghiệp vụ, việc tạo movement và cập nhật balance phải nằm trong cùng một database transaction.

Đối với nghiệp vụ giảm tồn, cần khóa dòng tồn bằng `SELECT ... FOR UPDATE` trước khi kiểm tra và cập nhật để tránh hai request đồng thời cùng xuất một lượng hàng.

## 3. Sơ đồ quan hệ tổng quát

```text
categories ───────< products >────── units
                        │
warehouses ───< inventory_balances
     │                  │
     └──────────< stock_movements >──── products

suppliers ───< goods_receipts ───< goods_receipt_items >── products

warehouses ──< goods_issues ─────< goods_issue_items >──── products

warehouses ──< stock_counts ─────< stock_count_items >──── products

warehouses ──< stock_adjustments ─< stock_adjustment_items > products

warehouses ──< stock_transfers ───< stock_transfer_items > products
                  │       │
              source    destination
```

## 4. Kiểu enum đề xuất

Có thể dùng PostgreSQL enum hoặc `varchar` kết hợp `CHECK`. Dùng `varchar + CHECK` giúp migration thay đổi trạng thái dễ hơn.

### `document_status`

```text
DRAFT
CONFIRMED
CANCELLED
```

### `product_status`

```text
ACTIVE
INACTIVE
DISCONTINUED
```

### `movement_type`

```text
RECEIPT
ISSUE
COUNT_ADJUSTMENT
MANUAL_ADJUSTMENT
TRANSFER_IN
TRANSFER_OUT
REVERSAL
```

### `adjustment_reason`

```text
DAMAGED
LOST
SURPLUS
WRONG_RECEIPT
WRONG_ISSUE
COUNT_DIFFERENCE
OTHER
```

## 5. Các bảng danh mục

### 5.1. `categories`

Quản lý danh mục sản phẩm.

| Cột          | Kiểu           | Ràng buộc/ý nghĩa                           |
| ------------ | -------------- | ------------------------------------------- |
| `id`         | `uuid`         | Khóa chính                                  |
| `code`       | `varchar(50)`  | Bắt buộc, duy nhất                          |
| `name`       | `varchar(255)` | Bắt buộc                                    |
| `parent_id`  | `uuid`         | FK tự tham chiếu, cho phép danh mục cha-con |
| `is_active`  | `boolean`      | Mặc định `true`                             |
| `created_at` | `timestamptz`  | Ngày tạo                                    |
| `updated_at` | `timestamptz`  | Ngày cập nhật                               |

### 5.2. `units`

Danh mục đơn vị tính như cái, hộp, kg, mét hoặc thùng.

| Cột         | Kiểu           | Ràng buộc/ý nghĩa  |
| ----------- | -------------- | ------------------ |
| `id`        | `uuid`         | Khóa chính         |
| `code`      | `varchar(30)`  | Bắt buộc, duy nhất |
| `name`      | `varchar(100)` | Bắt buộc           |
| `is_active` | `boolean`      | Mặc định `true`    |

### 5.3. `products`

| Cột              | Kiểu            | Ràng buộc/ý nghĩa                    |
| ---------------- | --------------- | ------------------------------------ |
| `id`             | `uuid`          | Khóa chính                           |
| `sku`            | `varchar(100)`  | Bắt buộc, duy nhất                   |
| `name`           | `varchar(255)`  | Bắt buộc                             |
| `category_id`    | `uuid`          | FK tới `categories`                  |
| `unit_id`        | `uuid`          | FK tới `units`, bắt buộc             |
| `purchase_price` | `numeric(18,2)` | Giá nhập tham khảo, không âm         |
| `sale_price`     | `numeric(18,2)` | Giá bán tham khảo, không âm          |
| `min_stock`      | `numeric(18,3)` | Mức tồn tối thiểu mặc định, không âm |
| `status`         | `varchar(20)`   | `ACTIVE`, `INACTIVE`, `DISCONTINUED` |
| `description`    | `text`          | Mô tả tùy chọn                       |
| `created_at`     | `timestamptz`   | Ngày tạo                             |
| `updated_at`     | `timestamptz`   | Ngày cập nhật                        |

Ghi chú:

- Giá trên `products` là giá hiện tại/tham khảo.
- Giá thực tế của từng giao dịch phải lưu trong dòng chi tiết chứng từ để bảo toàn lịch sử.
- Không xóa cứng sản phẩm đã phát sinh giao dịch; chuyển trạng thái sang `INACTIVE` hoặc `DISCONTINUED`.

### 5.4. `warehouses`

| Cột            | Kiểu           | Ràng buộc/ý nghĩa  |
| -------------- | -------------- | ------------------ |
| `id`           | `uuid`         | Khóa chính         |
| `code`         | `varchar(50)`  | Bắt buộc, duy nhất |
| `name`         | `varchar(255)` | Bắt buộc           |
| `address`      | `text`         | Địa chỉ kho        |
| `manager_name` | `varchar(255)` | Người phụ trách    |
| `is_active`    | `boolean`      | Mặc định `true`    |
| `created_at`   | `timestamptz`  | Ngày tạo           |
| `updated_at`   | `timestamptz`  | Ngày cập nhật      |

### 5.5. `suppliers`

| Cột          | Kiểu           | Ràng buộc/ý nghĩa                        |
| ------------ | -------------- | ---------------------------------------- |
| `id`         | `uuid`         | Khóa chính                               |
| `code`       | `varchar(50)`  | Bắt buộc, duy nhất                       |
| `name`       | `varchar(255)` | Bắt buộc                                 |
| `tax_code`   | `varchar(50)`  | Mã số thuế, có thể unique khi có dữ liệu |
| `phone`      | `varchar(30)`  | Số điện thoại                            |
| `email`      | `varchar(255)` | Email                                    |
| `address`    | `text`         | Địa chỉ                                  |
| `is_active`  | `boolean`      | Mặc định `true`                          |
| `created_at` | `timestamptz`  | Ngày tạo                                 |
| `updated_at` | `timestamptz`  | Ngày cập nhật                            |

## 6. Tồn hiện tại và lịch sử tồn

### 6.1. `inventory_balances`

Mỗi sản phẩm có tối đa một dòng số dư tại mỗi kho.

| Cột            | Kiểu            | Ràng buộc/ý nghĩa                           |
| -------------- | --------------- | ------------------------------------------- |
| `id`           | `uuid`          | Khóa chính                                  |
| `warehouse_id` | `uuid`          | FK tới `warehouses`, bắt buộc               |
| `product_id`   | `uuid`          | FK tới `products`, bắt buộc                 |
| `quantity`     | `numeric(18,3)` | Tồn khả dụng hiện tại, mặc định `0`         |
| `min_stock`    | `numeric(18,3)` | Ngưỡng riêng của sản phẩm tại kho; nullable |
| `version`      | `integer`       | Hỗ trợ optimistic locking nếu cần           |
| `updated_at`   | `timestamptz`   | Lần cập nhật tồn gần nhất                   |

Ràng buộc:

- Unique `(warehouse_id, product_id)`.
- `quantity >= 0` nếu hệ thống tuyệt đối không cho tồn âm.
- `min_stock >= 0`.
- Nếu `inventory_balances.min_stock` là `NULL`, sử dụng `products.min_stock`.

### 6.2. `stock_movements`

Sổ cái kho bất biến, ghi lại mọi lần tăng hoặc giảm tồn.

| Cột                 | Kiểu            | Ràng buộc/ý nghĩa                         |
| ------------------- | --------------- | ----------------------------------------- |
| `id`                | `uuid`          | Khóa chính                                |
| `warehouse_id`      | `uuid`          | Kho bị ảnh hưởng                          |
| `product_id`        | `uuid`          | Sản phẩm bị ảnh hưởng                     |
| `movement_type`     | `varchar(30)`   | Loại biến động                            |
| `quantity_delta`    | `numeric(18,3)` | Dương khi tăng, âm khi giảm, khác `0`     |
| `quantity_before`   | `numeric(18,3)` | Tồn trước giao dịch                       |
| `quantity_after`    | `numeric(18,3)` | Tồn sau giao dịch                         |
| `unit_cost`         | `numeric(18,2)` | Đơn giá tại thời điểm giao dịch, nullable |
| `reference_type`    | `varchar(50)`   | Loại chứng từ nguồn                       |
| `reference_id`      | `uuid`          | ID chứng từ nguồn                         |
| `reference_item_id` | `uuid`          | ID dòng chi tiết nguồn                    |
| `reason`            | `text`          | Lý do, đặc biệt với điều chỉnh            |
| `occurred_at`       | `timestamptz`   | Thời điểm nghiệp vụ                       |
| `created_by`        | `uuid`          | Người thực hiện, nếu có bảng người dùng   |
| `created_at`        | `timestamptz`   | Thời điểm ghi DB                          |

Ràng buộc:

- `quantity_delta <> 0`.
- `quantity_after = quantity_before + quantity_delta`.
- Unique `(reference_type, reference_item_id, movement_type)` để chống ghi tồn hai lần khi API được gọi lại.
- Không update hoặc delete movement trong luồng thông thường. Sai sót được sửa bằng movement đảo hoặc chứng từ điều chỉnh mới.

## 7. Phiếu nhập kho

### 7.1. `goods_receipts`

| Cột            | Kiểu            | Ràng buộc/ý nghĩa         |
| -------------- | --------------- | ------------------------- |
| `id`           | `uuid`          | Khóa chính                |
| `receipt_no`   | `varchar(50)`   | Mã phiếu, duy nhất        |
| `warehouse_id` | `uuid`          | Kho nhận hàng, bắt buộc   |
| `supplier_id`  | `uuid`          | Nhà cung cấp              |
| `receipt_date` | `date`          | Ngày nhập                 |
| `received_by`  | `uuid`          | Người nhập hàng           |
| `status`       | `varchar(20)`   | DRAFT/CONFIRMED/CANCELLED |
| `total_amount` | `numeric(18,2)` | Tổng tiền do backend tính |
| `note`         | `text`          | Ghi chú                   |
| `confirmed_at` | `timestamptz`   | Thời điểm xác nhận        |
| `confirmed_by` | `uuid`          | Người xác nhận            |
| `created_at`   | `timestamptz`   | Ngày tạo                  |
| `updated_at`   | `timestamptz`   | Ngày cập nhật             |

### 7.2. `goods_receipt_items`

| Cột           | Kiểu            | Ràng buộc/ý nghĩa                                        |
| ------------- | --------------- | -------------------------------------------------------- |
| `id`          | `uuid`          | Khóa chính                                               |
| `receipt_id`  | `uuid`          | FK tới `goods_receipts`, xóa cascade khi phiếu còn draft |
| `line_no`     | `integer`       | Số thứ tự dòng                                           |
| `product_id`  | `uuid`          | Sản phẩm                                                 |
| `quantity`    | `numeric(18,3)` | Số lượng nhập, lớn hơn `0`                               |
| `unit_price`  | `numeric(18,2)` | Đơn giá nhập, không âm                                   |
| `line_amount` | `numeric(18,2)` | `quantity × unit_price`                                  |
| `note`        | `text`          | Ghi chú dòng                                             |

Ràng buộc:

- Unique `(receipt_id, line_no)`.
- Có thể unique `(receipt_id, product_id)` nếu không cho phép một sản phẩm xuất hiện nhiều dòng.

Khi xác nhận phiếu:

1. Khóa hoặc tạo dòng `inventory_balances`.
2. Cộng `quantity` vào tồn.
3. Tạo movement `RECEIPT` với delta dương.
4. Cập nhật phiếu sang `CONFIRMED`.
5. Thực hiện toàn bộ trong một transaction.

## 8. Phiếu xuất kho

### 8.1. `goods_issues`

| Cột              | Kiểu            | Ràng buộc/ý nghĩa                |
| ---------------- | --------------- | -------------------------------- |
| `id`             | `uuid`          | Khóa chính                       |
| `issue_no`       | `varchar(50)`   | Mã phiếu, duy nhất               |
| `warehouse_id`   | `uuid`          | Kho xuất                         |
| `issue_date`     | `date`          | Ngày xuất                        |
| `issue_reason`   | `varchar(100)`  | Bán hàng, nội bộ hoặc lý do khác |
| `recipient_name` | `varchar(255)`  | Người/bộ phận nhận               |
| `issued_by`      | `uuid`          | Người xuất                       |
| `status`         | `varchar(20)`   | DRAFT/CONFIRMED/CANCELLED        |
| `total_amount`   | `numeric(18,2)` | Tổng giá trị xuất                |
| `note`           | `text`          | Ghi chú                          |
| `confirmed_at`   | `timestamptz`   | Thời điểm xác nhận               |
| `confirmed_by`   | `uuid`          | Người xác nhận                   |
| `created_at`     | `timestamptz`   | Ngày tạo                         |
| `updated_at`     | `timestamptz`   | Ngày cập nhật                    |

### 8.2. `goods_issue_items`

| Cột           | Kiểu            | Ràng buộc/ý nghĩa          |
| ------------- | --------------- | -------------------------- |
| `id`          | `uuid`          | Khóa chính                 |
| `issue_id`    | `uuid`          | FK tới `goods_issues`      |
| `line_no`     | `integer`       | Số thứ tự                  |
| `product_id`  | `uuid`          | Sản phẩm                   |
| `quantity`    | `numeric(18,3)` | Số lượng xuất, lớn hơn `0` |
| `unit_cost`   | `numeric(18,2)` | Giá vốn tại thời điểm xuất |
| `line_amount` | `numeric(18,2)` | Giá trị dòng xuất          |
| `note`        | `text`          | Ghi chú                    |

Khi xác nhận phiếu xuất:

```sql
BEGIN;

SELECT quantity
FROM inventory_balances
WHERE warehouse_id = :warehouse_id
  AND product_id = :product_id
FOR UPDATE;

-- Backend kiểm tra quantity >= quantity_export.
-- Sau đó giảm balance, tạo ISSUE movement và xác nhận phiếu.

COMMIT;
```

Nếu tồn hiện tại nhỏ hơn số lượng xuất, rollback và trả lỗi nghiệp vụ `INSUFFICIENT_STOCK`.

## 9. Kiểm kê kho

### 9.1. `stock_counts`

| Cột            | Kiểu          | Ràng buộc/ý nghĩa          |
| -------------- | ------------- | -------------------------- |
| `id`           | `uuid`        | Khóa chính                 |
| `count_no`     | `varchar(50)` | Mã phiếu kiểm kê, duy nhất |
| `warehouse_id` | `uuid`        | Kho kiểm kê                |
| `count_date`   | `date`        | Ngày kiểm kê               |
| `status`       | `varchar(20)` | DRAFT/CONFIRMED/CANCELLED  |
| `counted_by`   | `uuid`        | Người kiểm kê              |
| `note`         | `text`        | Ghi chú                    |
| `confirmed_at` | `timestamptz` | Thời điểm xác nhận         |
| `confirmed_by` | `uuid`        | Người xác nhận             |
| `created_at`   | `timestamptz` | Ngày tạo                   |
| `updated_at`   | `timestamptz` | Ngày cập nhật              |

### 9.2. `stock_count_items`

| Cột                   | Kiểu            | Ràng buộc/ý nghĩa                       |
| --------------------- | --------------- | --------------------------------------- |
| `id`                  | `uuid`          | Khóa chính                              |
| `count_id`            | `uuid`          | FK tới `stock_counts`                   |
| `product_id`          | `uuid`          | Sản phẩm                                |
| `system_quantity`     | `numeric(18,3)` | Tồn hệ thống tại thời điểm chốt kiểm kê |
| `counted_quantity`    | `numeric(18,3)` | Số lượng đếm thực tế                    |
| `difference_quantity` | `numeric(18,3)` | `counted_quantity - system_quantity`    |
| `reason`              | `text`          | Giải thích chênh lệch                   |

Lưu ý quan trọng:

- `system_quantity` phải được chụp lại tại thời điểm bắt đầu/chốt kiểm kê, không tính động khi xem lại chứng từ cũ.
- Khi xác nhận, khóa dòng balance và kiểm tra tồn chưa thay đổi ngoài dự kiến.
- Chênh lệch tạo movement `COUNT_ADJUSTMENT`.
- Sau điều chỉnh, `quantity_after` phải bằng `counted_quantity` nếu không có giao dịch xen giữa.

## 10. Điều chỉnh tồn kho

### 10.1. `stock_adjustments`

| Cột               | Kiểu          | Ràng buộc/ý nghĩa            |
| ----------------- | ------------- | ---------------------------- |
| `id`              | `uuid`        | Khóa chính                   |
| `adjustment_no`   | `varchar(50)` | Mã phiếu, duy nhất           |
| `warehouse_id`    | `uuid`        | Kho điều chỉnh               |
| `adjustment_date` | `date`        | Ngày điều chỉnh              |
| `reason_code`     | `varchar(30)` | Hỏng, mất, thừa, nhập sai... |
| `status`          | `varchar(20)` | DRAFT/CONFIRMED/CANCELLED    |
| `note`            | `text`        | Lý do chi tiết, nên bắt buộc |
| `created_by`      | `uuid`        | Người tạo                    |
| `confirmed_at`    | `timestamptz` | Thời điểm xác nhận           |
| `confirmed_by`    | `uuid`        | Người xác nhận               |
| `created_at`      | `timestamptz` | Ngày tạo                     |
| `updated_at`      | `timestamptz` | Ngày cập nhật                |

### 10.2. `stock_adjustment_items`

| Cột              | Kiểu            | Ràng buộc/ý nghĩa                         |
| ---------------- | --------------- | ----------------------------------------- |
| `id`             | `uuid`          | Khóa chính                                |
| `adjustment_id`  | `uuid`          | FK tới phiếu điều chỉnh                   |
| `product_id`     | `uuid`          | Sản phẩm                                  |
| `quantity_delta` | `numeric(18,3)` | Số dương để tăng, số âm để giảm, khác `0` |
| `unit_cost`      | `numeric(18,2)` | Đơn giá tham khảo                         |
| `reason`         | `text`          | Lý do riêng của dòng                      |

Điều chỉnh giảm vẫn phải kiểm tra không tạo tồn âm. Khi xác nhận, tạo movement `MANUAL_ADJUSTMENT`.

## 11. Chuyển kho

### 11.1. `stock_transfers`

| Cột                        | Kiểu          | Ràng buộc/ý nghĩa         |
| -------------------------- | ------------- | ------------------------- |
| `id`                       | `uuid`        | Khóa chính                |
| `transfer_no`              | `varchar(50)` | Mã phiếu, duy nhất        |
| `source_warehouse_id`      | `uuid`        | Kho nguồn                 |
| `destination_warehouse_id` | `uuid`        | Kho đích                  |
| `transfer_date`            | `date`        | Ngày chuyển               |
| `status`                   | `varchar(20)` | DRAFT/CONFIRMED/CANCELLED |
| `transferred_by`           | `uuid`        | Người thực hiện           |
| `note`                     | `text`        | Ghi chú                   |
| `confirmed_at`             | `timestamptz` | Thời điểm xác nhận        |
| `confirmed_by`             | `uuid`        | Người xác nhận            |
| `created_at`               | `timestamptz` | Ngày tạo                  |
| `updated_at`               | `timestamptz` | Ngày cập nhật             |

Ràng buộc: `source_warehouse_id <> destination_warehouse_id`.

### 11.2. `stock_transfer_items`

| Cột           | Kiểu            | Ràng buộc/ý nghĩa            |
| ------------- | --------------- | ---------------------------- |
| `id`          | `uuid`          | Khóa chính                   |
| `transfer_id` | `uuid`          | FK tới phiếu chuyển kho      |
| `line_no`     | `integer`       | Số thứ tự                    |
| `product_id`  | `uuid`          | Sản phẩm                     |
| `quantity`    | `numeric(18,3)` | Số lượng chuyển, lớn hơn `0` |
| `unit_cost`   | `numeric(18,2)` | Giá vốn tại thời điểm chuyển |

Khi xác nhận trong cùng một transaction:

1. Khóa balance kho nguồn và kho đích theo thứ tự ID cố định để giảm nguy cơ deadlock.
2. Kiểm tra kho nguồn đủ tồn.
3. Giảm tồn kho nguồn và tạo `TRANSFER_OUT` movement.
4. Tăng tồn kho đích và tạo `TRANSFER_IN` movement.
5. Hai movement cùng tham chiếu một dòng chuyển kho.
6. Xác nhận phiếu.

Tổng tồn toàn hệ thống không thay đổi sau chuyển kho.

## 12. Cảnh báo tồn kho thấp

Không nhất thiết lưu trạng thái `LOW_STOCK` vào bảng vì trạng thái thay đổi theo số tồn. Có thể tính động qua query hoặc view.

```sql
CREATE VIEW product_stock_status AS
SELECT
    ib.warehouse_id,
    ib.product_id,
    ib.quantity,
    COALESCE(ib.min_stock, p.min_stock) AS min_stock,
    CASE
        WHEN ib.quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN ib.quantity <= COALESCE(ib.min_stock, p.min_stock) THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status
FROM inventory_balances ib
JOIN products p ON p.id = ib.product_id;
```

Nếu cần gửi thông báo, có thể bổ sung `stock_alerts` để ghi nhận một cảnh báo đã tạo/gửi, tránh gửi lặp liên tục.

## 13. Chỉ mục quan trọng

```text
products(sku) UNIQUE
products(category_id, status)
warehouses(code) UNIQUE
suppliers(code) UNIQUE
inventory_balances(warehouse_id, product_id) UNIQUE
stock_movements(warehouse_id, product_id, occurred_at DESC)
stock_movements(reference_type, reference_id)
stock_movements(reference_type, reference_item_id, movement_type) UNIQUE
goods_receipts(receipt_no) UNIQUE
goods_receipts(warehouse_id, receipt_date, status)
goods_issues(issue_no) UNIQUE
goods_issues(warehouse_id, issue_date, status)
stock_counts(count_no) UNIQUE
stock_adjustments(adjustment_no) UNIQUE
stock_transfers(transfer_no) UNIQUE
```

Các bảng item cần index trên khóa ngoại chứng từ và `product_id`.

## 14. Quy tắc toàn vẹn dữ liệu

- SKU và mã chứng từ không được trùng.
- Số lượng nhập, xuất và chuyển phải lớn hơn `0`.
- Giá tiền dùng `numeric`, không dùng `float`.
- Backend tính lại `line_amount` và `total_amount`; không tin tổng tiền từ client.
- Không xuất hoặc điều chỉnh giảm vượt quá tồn khả dụng.
- Kho nguồn và kho đích của phiếu chuyển phải khác nhau.
- Chứng từ `CONFIRMED` không được xác nhận lần thứ hai.
- Mỗi dòng chứng từ chỉ tạo movement một lần.
- Không sửa/xóa movement đã tạo; tạo giao dịch đảo hoặc điều chỉnh.
- Không xóa cứng danh mục đã được tham chiếu bởi giao dịch.
- Mọi cập nhật tồn và trạng thái chứng từ phải nằm trong cùng transaction.

## 15. Quy trình cập nhật tồn chuẩn

Pseudo code xác nhận một dòng chứng từ:

```text
BEGIN TRANSACTION

1. Khóa chứng từ.
2. Kiểm tra status = DRAFT.
3. Khóa inventory_balance của sản phẩm tại kho.
4. Kiểm tra điều kiện nghiệp vụ, đặc biệt với giao dịch giảm tồn.
5. Ghi stock_movement gồm before, delta và after.
6. Cập nhật inventory_balance.
7. Sau khi xử lý đủ các dòng, chuyển chứng từ thành CONFIRMED.

COMMIT
```

Nếu bất kỳ bước nào lỗi, rollback toàn bộ.

## 16. Ví dụ tính tồn

```text
Tồn đầu:          50
Nhập kho:        +20
Xuất kho:         -5
Điều chỉnh mất:   -3
Chuyển sang kho B:-10
---------------------
Tồn kho A:        52
```

Các movement tương ứng:

| Loại              | Delta | Trước | Sau |
| ----------------- | ----: | ----: | --: |
| RECEIPT           |   +20 |    50 |  70 |
| ISSUE             |    -5 |    70 |  65 |
| MANUAL_ADJUSTMENT |    -3 |    65 |  62 |
| TRANSFER_OUT      |   -10 |    62 |  52 |

Kho B nhận thêm một movement `TRANSFER_IN` có delta `+10`.

## 17. Phạm vi triển khai đề xuất

### Giai đoạn 1 — MVP

- Categories, units, products, suppliers và warehouses.
- Inventory balances và stock movements.
- Nhập kho và xuất kho.
- Cảnh báo tồn thấp.

### Giai đoạn 2

- Kiểm kê.
- Điều chỉnh tồn.
- Chuyển kho.
- Báo cáo lịch sử nhập–xuất–tồn.

### Giai đoạn 3

- Lô hàng, hạn sử dụng và số serial.
- Vị trí kệ/bin trong kho.
- Giữ hàng/reserved stock.
- Phương pháp tính giá vốn FIFO hoặc bình quân.
- Phân quyền, phê duyệt và audit log người dùng.

## 18. Điểm cần chốt trước khi code

- Hệ thống có cho phép tồn âm hay không; đề xuất không cho phép.
- Giá vốn dùng giá nhập gần nhất, bình quân gia quyền hay FIFO.
- Kiểm kê có khóa toàn bộ giao dịch của kho trong lúc đếm hay dùng mốc chụp tồn.
- Phiếu chuyển kho hoàn tất ngay hay có hai bước gửi hàng/nhận hàng.
- Mức tồn tối thiểu dùng chung cho sản phẩm hay cấu hình riêng theo từng kho.
- Chứng từ đã xác nhận được hủy bằng movement đảo hay bắt buộc tạo phiếu điều chỉnh.
- Có cần theo dõi lô, hạn sử dụng hoặc serial trong phiên bản đầu hay không.
