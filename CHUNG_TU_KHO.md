# Giải thích chứng từ trong hệ thống quản lý kho

## 1. Chứng từ là gì?

Trong nghiệp vụ kho, **chứng từ** là tài liệu ghi nhận và làm căn cứ cho một nghiệp vụ làm thay đổi hàng hóa trong kho.

Ví dụ:

- Hàng được đưa vào kho: lập **phiếu nhập kho**.
- Hàng được lấy ra khỏi kho: lập **phiếu xuất kho**.
- Số lượng thực tế khác với số lượng đang được ghi nhận: lập **điều chỉnh tồn kho**.

Chứng từ giúp trả lời các câu hỏi:

- Nghiệp vụ nào đã xảy ra?
- Xảy ra vào ngày nào?
- Liên quan đến nhà cung cấp, người giao hoặc người nhận nào?
- Hàng hóa nào được nhập hoặc xuất?
- Số lượng và giá trị là bao nhiêu?
- Ai lập và ai chịu trách nhiệm xác nhận?
- Chứng từ đang là bản nháp, đã xác nhận hay đã hủy?

## 2. Chứng từ khác bản ghi chi tiết như thế nào?

Một chứng từ gồm hai phần:

### Phần thông tin chung

Đây là phần đầu của phiếu, ví dụ:

- Số phiếu.
- Ngày lập.
- Đơn vị và bộ phận.
- Nhà cung cấp.
- Người giao hoặc người nhận hàng.
- Kho và địa điểm.
- Tài khoản Nợ, tài khoản Có.
- Trạng thái chứng từ.
- Tổng giá trị.

Trong hệ thống, phần này tương ứng với entity `GoodsReceipt` hoặc `GoodsIssue`.

### Phần chi tiết hàng hóa

Mỗi dòng trong bảng hàng hóa là một bản ghi chi tiết, gồm:

- Sản phẩm.
- Số lượng.
- Đơn giá.
- Thành tiền.

Trong hệ thống, phần này tương ứng với entity `GoodsReceiptItem` hoặc `GoodsIssueItem`.

Một phiếu có thể chứa nhiều dòng chi tiết. Không nên hiểu mỗi dòng hàng là một chứng từ riêng.

## 3. Phiếu nhập kho

**Phiếu nhập kho** ghi nhận hàng hóa được đưa vào kho.

Một số trường quan trọng:

- `receiptNumber`: số phiếu nhập, ví dụ `PNK00001`.
- `receiptDate`: ngày lập phiếu.
- `supplierId`: nhà cung cấp.
- `delivererName`: họ tên người giao hàng.
- `sourceDocument`: chứng từ làm căn cứ nhập kho, chẳng hạn số hóa đơn hoặc số đơn mua hàng.
- `warehouseName`: kho nhận hàng.
- `location`: địa điểm nhập kho.
- `debitAccount`: tài khoản ghi Nợ.
- `creditAccount`: tài khoản ghi Có.
- `totalAmount`: tổng giá trị phiếu.

Mỗi dòng chi tiết phiếu nhập có:

- `documentQuantity`: số lượng ghi trên chứng từ gốc.
- `actualQuantity`: số lượng thực tế kho nhận được.
- `unitPrice`: đơn giá nhập.
- `lineAmount`: thành tiền của dòng hàng.

### “Theo chứng từ” nghĩa là gì?

Trong mẫu phiếu nhập, cụm từ **“Theo chứng từ”** có hai cách sử dụng:

1. Ở phần thông tin chung, nó chỉ tài liệu làm căn cứ cho việc nhập hàng, ví dụ hóa đơn `HD00025 ngày 31/08/2026`.
2. Ở cột số lượng, nó là số lượng được ghi trên tài liệu đó.

Ví dụ hóa đơn ghi giao 100 sản phẩm nhưng kho kiểm đếm thực tế chỉ nhận 98:

- Số lượng theo chứng từ: `100`.
- Số lượng thực nhập: `98`.

Việc lưu cả hai số giúp phát hiện chênh lệch giao nhận.

## 4. Phiếu xuất kho

**Phiếu xuất kho** ghi nhận hàng hóa được lấy ra khỏi kho để bán, chuyển kho, sử dụng trong sản xuất hoặc phục vụ mục đích khác.

Một số trường quan trọng:

- `issueNumber`: số phiếu xuất, ví dụ `PXK00001`.
- `issueDate`: ngày lập phiếu.
- `reason`: lý do xuất kho.
- `recipient`: người nhận hàng.
- `totalAmount`: tổng giá trị hàng xuất.

Mỗi dòng chi tiết phiếu xuất có:

- `productId`: sản phẩm được xuất.
- `quantity`: số lượng xuất.
- `unitPrice`: đơn giá.
- `lineAmount`: thành tiền.

## 5. Trạng thái chứng từ

Phiếu nhập và phiếu xuất có ba trạng thái:

| Trạng thái | Ý nghĩa |
| --- | --- |
| `DRAFT` | Bản nháp. Phiếu mới được lập, còn có thể chỉnh sửa và chưa tác động đến tồn kho. |
| `CONFIRMED` | Đã xác nhận. Nghiệp vụ chính thức được ghi nhận và số lượng tồn kho được cập nhật. |
| `CANCELLED` | Đã hủy. Phiếu không còn được tiếp tục xử lý. |

## 6. Confirm có ý nghĩa gì?

**Confirm** là thao tác xác nhận chứng từ chính thức.

- Confirm phiếu nhập: cộng số lượng thực nhập vào tồn kho sản phẩm.
- Confirm phiếu xuất: trừ số lượng xuất khỏi tồn kho sản phẩm.
- Phiếu xuất không được confirm nếu số lượng tồn không đủ.
- Một phiếu đã confirm không được confirm lần thứ hai.

Vì confirm làm thay đổi tồn kho nên đây là thao tác nghiệp vụ quan trọng, khác với thao tác lưu thông thường.

## 7. Cancel có ý nghĩa gì?

**Cancel** là đánh dấu chứng từ không còn hiệu lực xử lý.

Theo luồng giao diện hiện tại, thao tác cancel chỉ được cung cấp khi phiếu đang ở trạng thái `DRAFT` để tránh làm sai lệch tồn kho đã được ghi nhận.

Cancel khác delete:

- **Cancel** giữ lại chứng từ và lịch sử của nó, nhưng đổi trạng thái thành đã hủy.
- **Delete** xóa bản ghi khỏi hệ thống.

Trong hệ thống nghiệp vụ thực tế, thường nên ưu tiên cancel để bảo đảm khả năng truy vết.

## 8. Chứng từ gốc kèm theo

**Chứng từ gốc kèm theo** là các tài liệu bên ngoài được dùng để chứng minh và đối chiếu nghiệp vụ, ví dụ:

- Hóa đơn mua hàng.
- Đơn mua hàng.
- Biên bản giao nhận.
- Phiếu vận chuyển.
- Biên bản kiểm đếm.

Trường `attachedDocuments` hiện lưu thông tin mô tả hoặc số lượng chứng từ gốc đi kèm. Nó không phải là các dòng hàng của phiếu.

## 9. Điều chỉnh tồn kho có phải chứng từ không?

Điều chỉnh tồn kho cũng là một dạng ghi nhận nghiệp vụ kho, dùng khi số lượng thực tế khác số lượng trong hệ thống.

Thông tin chính gồm:

- Sản phẩm cần điều chỉnh.
- Số lượng tăng hoặc giảm.
- Lý do điều chỉnh.
- Ngày điều chỉnh.

Giá trị dương biểu thị tăng tồn; giá trị âm biểu thị giảm tồn.

## 10. Quan hệ giữa các entity và API

| Nghiệp vụ | Entity chính | Entity chi tiết | API chính |
| --- | --- | --- | --- |
| Nhập kho | `GoodsReceipt` | `GoodsReceiptItem` | `/goods-receipts` |
| Xuất kho | `GoodsIssue` | `GoodsIssueItem` | `/goods-issues` |
| Điều chỉnh tồn | `InventoryAdjustment` | Không có entity con | `/inventory-adjustments` |

Các thao tác trạng thái của phiếu:

- `POST /goods-receipts/:id/confirm`
- `POST /goods-receipts/:id/cancel`
- `POST /goods-issues/:id/confirm`
- `POST /goods-issues/:id/cancel`

## 11. Tóm tắt

Có thể hiểu ngắn gọn:

> Chứng từ là bằng chứng và căn cứ nghiệp vụ cho một lần nhập, xuất hoặc điều chỉnh hàng hóa. Phần đầu phiếu mô tả nghiệp vụ; các dòng chi tiết mô tả từng sản phẩm; thao tác confirm mới làm nghiệp vụ chính thức tác động đến tồn kho.
