# Đặc tả chức năng tạo phiếu xuất kho

## 1. Mục đích

Phiếu xuất kho ghi nhận một lần hàng hóa được lấy ra khỏi kho để bán hàng, cấp cho sản xuất, sử dụng nội bộ, chuyển kho hoặc phục vụ mục đích khác.

Chức năng phải giúp xác định:

- Hàng được xuất từ kho nào.
- Xuất vào ngày nào và theo lý do nào.
- Người hoặc bộ phận nào nhận hàng.
- Sản phẩm, số lượng và giá trị hàng xuất.
- Ai lập phiếu, ai phụ trách kho và ai duyệt.
- Phiếu đang là bản nháp, đã ghi sổ hay đã hủy.

## 2. Thông tin chung của phiếu

### 2.1. Trường bắt buộc

| Trường | Kiểu dữ liệu | Mô tả |
| --- | --- | --- |
| Số phiếu | Chuỗi | Tự sinh theo dạng `PXK00001`; phải duy nhất. |
| Ngày lập | Ngày | Ngày tạo chứng từ. |
| Ngày hạch toán | Ngày | Ngày nghiệp vụ được ghi nhận vào tồn kho. |
| Kho xuất | Khóa ngoại | Kho thực hiện xuất hàng. |
| Lý do xuất | Chuỗi | Ví dụ: xuất bán, xuất dùng cho sản xuất, chuyển kho. |
| Người nhận hàng | Chuỗi hoặc khóa ngoại | Tên người nhận; có thể là người ngoài hệ thống. |
| Đơn vị | Khóa ngoại | Đơn vị thực hiện hoặc yêu cầu xuất hàng. |
| Bộ phận | Khóa ngoại | Bộ phận thuộc đơn vị và liên quan đến việc nhận hàng. |

### 2.2. Trường bổ sung

| Trường | Kiểu dữ liệu | Mô tả |
| --- | --- | --- |
| Địa điểm xuất | Chuỗi | Địa chỉ hoặc vị trí kho xuất. |
| Đối tượng nhận | Khóa ngoại | Khách hàng, bộ phận, dự án hoặc đơn vị nhận nếu hệ thống có danh mục tương ứng. |
| Mã đơn hàng/yêu cầu xuất | Chuỗi | Chứng từ làm căn cứ cho việc xuất kho. |
| Tài khoản Nợ | Chuỗi | Tài khoản kế toán ghi Nợ. |
| Tài khoản Có | Chuỗi | Tài khoản kế toán ghi Có. |
| Ghi chú | Chuỗi dài | Thông tin bổ sung cho nghiệp vụ. |
| Tổng tiền bằng chữ | Chuỗi | Dùng khi in phiếu theo mẫu kế toán. |
| Số chứng từ kèm theo | Số nguyên | Tự tính theo số attachment thực tế, không nhập tay. |

## 3. Người liên quan

Các vị trí nội bộ nên chọn từ bảng `users` và lưu bằng ID:

| Trường | Quy tắc chọn |
| --- | --- |
| `nguoi_lap_id` | Chọn bất kỳ user đang hoạt động. |
| `thu_kho_id` | Chỉ chọn user đang hoạt động có role `STOREKEEPER`. |
| `ke_toan_truong_id` | Chỉ chọn user đang hoạt động có role `CHIEF_ACCOUNTANT`. |

Người nhận hàng có thể không có tài khoản trong hệ thống nên có thể lưu dạng chuỗi. Nếu người nhận là nhân viên nội bộ, có thể bổ sung `nguoi_nhan_id` và vẫn lưu tên tại thời điểm lập phiếu để phục vụ lịch sử.

## 4. Chi tiết hàng hóa

Một phiếu phải có ít nhất một dòng hàng.

| Trường | Kiểu dữ liệu | Quy tắc |
| --- | --- | --- |
| Sản phẩm | Khóa ngoại | Chọn từ danh mục sản phẩm đang hoạt động. |
| Mã sản phẩm | Hiển thị | Lấy từ sản phẩm, không nhập lại. |
| Đơn vị tính | Hiển thị | Lấy từ sản phẩm. |
| Số lượng yêu cầu | Số thập phân | Số lượng được đề nghị xuất; không âm. |
| Số lượng thực xuất | Số thập phân | Bắt buộc lớn hơn 0. |
| Đơn giá xuất | Số thập phân | Không âm. |
| Thành tiền | Số thập phân | Tự tính: `số lượng thực xuất × đơn giá`. |
| Chênh lệch | Số thập phân | Tự tính: `thực xuất − yêu cầu`. |
| Ghi chú dòng | Chuỗi | Ghi nhận lô hàng, vị trí hoặc tình trạng đặc biệt. |

Không nên cho thêm cùng một sản phẩm nhiều lần, trừ trường hợp cần phân biệt theo lô, hạn sử dụng hoặc vị trí kho.

## 5. Chứng từ đính kèm

Người tạo được chọn file ngay trong lúc tạo phiếu. File ở trạng thái chờ cho đến khi phiếu được lưu và có ID.

Các loại file đề xuất:

- Phiếu yêu cầu xuất hàng.
- Đơn bán hàng.
- Lệnh sản xuất.
- Biên bản giao nhận.
- PDF, DOC, DOCX, XLS, XLSX hoặc ZIP.

Quy tắc:

- Tối đa 20 MB cho mỗi file.
- Lưu metadata trong database và nội dung file trong vùng lưu trữ riêng.
- Số chứng từ kèm theo được tính từ số file thực tế.
- Cho phép xem danh sách, tải xuống và xóa file khi phiếu còn được phép chỉnh sửa.

## 6. Trạng thái và thao tác

| Trạng thái | Ý nghĩa | Thao tác hợp lệ |
| --- | --- | --- |
| `DRAFT` | Phiếu đang soạn, chưa ảnh hưởng tồn kho. | Sửa, thêm/xóa dòng, attachment, ghi sổ hoặc hủy. |
| `CONFIRMED` | Phiếu đã ghi sổ và đã trừ tồn kho. | Xem, in; không sửa dữ liệu nghiệp vụ. |
| `CANCELLED` | Phiếu không còn hiệu lực. | Chỉ xem. |

Các nút chính:

- **Lưu nháp:** lưu phiếu nhưng không thay đổi tồn kho.
- **Lưu và ghi sổ:** kiểm tra dữ liệu, lưu phiếu và trừ tồn kho trong một transaction.
- **Hủy phiếu:** chỉ áp dụng với phiếu `DRAFT`.
- **In phiếu:** tạo bản in theo mẫu phiếu xuất kho.

## 7. Quy tắc kiểm tra dữ liệu

Trước khi lưu:

- Số phiếu phải đúng định dạng và không trùng.
- Ngày lập và ngày hạch toán phải hợp lệ.
- Bộ phận phải thuộc đơn vị đã chọn.
- Kho xuất phải tồn tại và đang hoạt động.
- Phiếu phải có ít nhất một dòng hàng.
- Sản phẩm phải tồn tại và đang hoạt động.
- Số lượng thực xuất phải lớn hơn 0.
- Đơn giá không được âm.
- Người được chọn phải tồn tại, đang hoạt động và đúng role yêu cầu.

Trước khi ghi sổ:

- Kiểm tra tồn kho cho từng sản phẩm.
- Không cho ghi sổ nếu bất kỳ dòng nào thiếu tồn.
- Khóa bản ghi tồn kho trong transaction để tránh hai yêu cầu xuất đồng thời làm âm kho.
- Một phiếu chỉ được ghi sổ một lần.

## 8. Tác động tồn kho

Lưu nháp không thay đổi tồn kho.

Khi ghi sổ:

```text
tồn mới = tồn hiện tại - số lượng thực xuất
```

Toàn bộ các thao tác sau phải nằm trong cùng một database transaction:

1. Khóa phiếu và các sản phẩm liên quan.
2. Kiểm tra trạng thái phiếu.
3. Kiểm tra tồn kho.
4. Trừ tồn từng sản phẩm.
5. Chuyển trạng thái phiếu sang `CONFIRMED`.

Nếu một bước thất bại, toàn bộ thay đổi phải rollback.

## 9. Database đề xuất

### 9.1. Bảng `phieu_xuat_kho`

```text
id
so_phieu
ngay_lap
ngay_hach_toan
don_vi_id
bo_phan_id
kho_id hoặc ten_kho
dia_diem
ly_do_xuat
nguoi_nhan
tk_no
tk_co
nguoi_lap_id
thu_kho_id
ke_toan_truong_id
tong_tien
tong_tien_bang_chu
so_chung_tu_kem_theo
trang_thai
created_at
updated_at
```

### 9.2. Bảng `phieu_xuat_kho_chi_tiet`

```text
id
phieu_xuat_id
san_pham_id
so_luong_yeu_cau
so_luong_thuc_xuat
don_gia
thanh_tien
ghi_chu
```

### 9.3. Bảng attachment

```text
id
phieu_xuat_id
ten_goc
ten_luu
loai_tep
kich_thuoc
created_at
```

## 10. API đề xuất

```text
GET    /goods-issues
GET    /goods-issues/next-number
GET    /goods-issues/:id
POST   /goods-issues
PATCH  /goods-issues/:id
POST   /goods-issues/:id/confirm
POST   /goods-issues/:id/cancel
DELETE /goods-issues/:id

GET    /goods-issues/:id/attachments
POST   /goods-issues/:id/attachments
GET    /goods-issues/:id/attachments/:attachmentId/download
DELETE /goods-issues/:id/attachments/:attachmentId
```

## 11. Nội dung màn hình chi tiết

Màn hình xem chi tiết nên hiển thị:

- Số phiếu, ngày lập, ngày hạch toán và trạng thái.
- Đơn vị, bộ phận, kho xuất và địa điểm.
- Lý do xuất và người nhận.
- Người lập phiếu, thủ kho, kế toán trưởng.
- Tài khoản Nợ/Có.
- Tổng số dòng, tổng số lượng và tổng giá trị.
- Bảng chi tiết hàng hóa và chênh lệch số lượng.
- Danh sách attachment.
- Lịch sử ghi sổ hoặc hủy nếu hệ thống có audit log.

## 12. Tiêu chí nghiệm thu tối thiểu

- Tự sinh số phiếu và hiển thị ngay trên form.
- Chọn được đơn vị và bộ phận tương ứng.
- Chọn đúng người liên quan theo role.
- Thêm, sửa và xóa dòng hàng khi phiếu còn `DRAFT`.
- Tự tính thành tiền và tổng tiền.
- Chọn attachment trước khi lưu và tự đếm số file.
- Lưu nháp không làm thay đổi tồn kho.
- Ghi sổ trừ tồn chính xác và không cho tồn âm.
- Không ghi sổ một phiếu hai lần.
- Không sửa hoặc hủy trực tiếp phiếu đã ghi sổ.
- Hiển thị đầy đủ chi tiết phiếu và file đính kèm.
