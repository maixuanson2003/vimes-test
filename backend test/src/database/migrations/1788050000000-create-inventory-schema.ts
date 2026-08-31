import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventorySchema1788050000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE');
      CREATE TABLE nha_cung_cap (id SERIAL PRIMARY KEY, ten_ncc VARCHAR(200) NOT NULL, dia_chi VARCHAR(255), sdt VARCHAR(20));
      CREATE TABLE san_pham (id SERIAL PRIMARY KEY, ma_sp VARCHAR(50) NOT NULL UNIQUE, ten_sp VARCHAR(255) NOT NULL, don_vi_tinh VARCHAR(50) NOT NULL, gia_nhap NUMERIC(18,2) NOT NULL DEFAULT 0, gia_ban NUMERIC(18,2) NOT NULL DEFAULT 0, so_luong_ton NUMERIC(18,3) NOT NULL DEFAULT 0, ton_toi_thieu NUMERIC(18,3) NOT NULL DEFAULT 0, trang_thai product_status NOT NULL DEFAULT 'ACTIVE', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE phieu_nhap_kho (id SERIAL PRIMARY KEY, so_phieu VARCHAR(30) NOT NULL UNIQUE, ngay_lap DATE NOT NULL, don_vi VARCHAR(255), bo_phan VARCHAR(255), tk_no VARCHAR(20), tk_co VARCHAR(20), nha_cung_cap_id INTEGER REFERENCES nha_cung_cap(id) ON DELETE SET NULL, ho_ten_nguoi_giao VARCHAR(150) NOT NULL, theo_chung_tu VARCHAR(255), nhap_tai_kho VARCHAR(150), dia_diem VARCHAR(255), tong_tien NUMERIC(18,2) NOT NULL DEFAULT 0, tong_tien_bang_chu VARCHAR(500), chung_tu_goc_kem VARCHAR(255), nguoi_lap_phieu VARCHAR(150), nguoi_giao_hang VARCHAR(150), thu_kho VARCHAR(150), ke_toan_truong VARCHAR(150), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE phieu_nhap_kho_chi_tiet (id SERIAL PRIMARY KEY, phieu_nhap_id INTEGER NOT NULL REFERENCES phieu_nhap_kho(id) ON DELETE CASCADE, san_pham_id INTEGER NOT NULL REFERENCES san_pham(id) ON DELETE RESTRICT, so_luong_theo_ct NUMERIC(18,3) NOT NULL DEFAULT 0, so_luong_thuc_nhap NUMERIC(18,3) NOT NULL, don_gia NUMERIC(18,2) NOT NULL, thanh_tien NUMERIC(18,2) GENERATED ALWAYS AS (so_luong_thuc_nhap * don_gia) STORED);
      CREATE TABLE phieu_xuat_kho (id SERIAL PRIMARY KEY, so_phieu VARCHAR(30) NOT NULL UNIQUE, ngay_lap DATE NOT NULL, ly_do_xuat VARCHAR(255), nguoi_nhan VARCHAR(150), tong_tien NUMERIC(18,2) NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE phieu_xuat_kho_chi_tiet (id SERIAL PRIMARY KEY, phieu_xuat_id INTEGER NOT NULL REFERENCES phieu_xuat_kho(id) ON DELETE CASCADE, san_pham_id INTEGER NOT NULL REFERENCES san_pham(id) ON DELETE RESTRICT, so_luong_xuat NUMERIC(18,3) NOT NULL, don_gia NUMERIC(18,2) NOT NULL, thanh_tien NUMERIC(18,2) GENERATED ALWAYS AS (so_luong_xuat * don_gia) STORED);
      CREATE TABLE dieu_chinh_ton_kho (id SERIAL PRIMARY KEY, san_pham_id INTEGER NOT NULL REFERENCES san_pham(id) ON DELETE RESTRICT, so_luong_dieu_chinh NUMERIC(18,3) NOT NULL, ly_do VARCHAR(255) NOT NULL, ngay_dieu_chinh DATE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      INSERT INTO nha_cung_cap (ten_ncc, dia_chi, sdt) VALUES ('Công ty TNHH Thép Việt', 'Số 28, Đường Láng, Đống Đa, Hà Nội', '02437661234');
      INSERT INTO san_pham (ma_sp, ten_sp, don_vi_tinh, gia_nhap, so_luong_ton, ton_toi_thieu) VALUES
        ('THEP-COIL-01','Thép cuộn CB240','kg',14200,5000,500), ('THEP-TT16','Thép thanh vằn Φ16','kg',13600,3050,300),
        ('XI-MANG-PCB30','Xi măng PCB30','bao',95000,200,30), ('CAT-VANG','Cát vàng','m³',280000,16,5), ('DA-1X2','Đá 1x2','m³',240000,20,5);
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS dieu_chinh_ton_kho, phieu_xuat_kho_chi_tiet, phieu_xuat_kho, phieu_nhap_kho_chi_tiet, phieu_nhap_kho, san_pham, nha_cung_cap CASCADE; DROP TYPE IF EXISTS product_status;`);
  }
}
