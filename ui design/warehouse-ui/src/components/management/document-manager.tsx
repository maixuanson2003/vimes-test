"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Pencil, Plus, Search, Trash2, X, XCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Department, GoodsIssue, GoodsIssueItem, GoodsReceipt, GoodsReceiptAttachment, GoodsReceiptItem, Organization, Product, Supplier, User, UserRole } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { Attachments } from "@/features/goods-receipt/attachments";

type Kind = "receipt" | "issue";
type Document = GoodsReceipt | GoodsIssue;
type ItemDraft = { key: number; productId: number; quantity: number; documentQuantity: number; unitPrice: number };
type ReceiptMeta = { organizationId?: number; departmentId?: number; debitAccount: string; creditAccount: string; totalAmountInWords: string; attachedDocuments: string; deliveredBy: string; preparedById?: number; storekeeperId?: number; chiefAccountantId?: number; pendingFiles?: File[] };
const today = () => new Date().toISOString().slice(0, 10);
const money = new Intl.NumberFormat("vi-VN");
const statusText = { DRAFT: "Bản nháp", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy" } as const;
const statusClass = { DRAFT: "bg-amber-50 text-amber-700", CONFIRMED: "bg-emerald-50 text-emerald-700", CANCELLED: "bg-red-50 text-red-700" } as const;

function ReceiptMetaFields({ value, onChange }: { value: ReceiptMeta; onChange: (patch: Partial<ReceiptMeta>) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  useEffect(() => {
    api<User[]>("/users").then(setUsers).catch(() => setUsers([]));
  }, []);
  useEffect(() => { Promise.all([api<Organization[]>("/organizations"), api<Department[]>("/departments")]).then(([organizationData, departmentData]) => { setOrganizations(organizationData); setDepartments(departmentData); }).catch(() => undefined); }, []);
  const field = (key: "debitAccount" | "creditAccount" | "totalAmountInWords" | "attachedDocuments" | "deliveredBy", label: string, className = "") => <label className={`text-sm font-medium ${className}`}>{label}<Input className="mt-1.5" value={value[key]} readOnly={key === "attachedDocuments"} onChange={e => onChange({ [key]: e.target.value })}/></label>;
  const userField = (key: "preparedById" | "storekeeperId" | "chiefAccountantId", role: UserRole | null, label: string) => <label className="text-sm font-medium">{label}<Select className="mt-1.5" value={value[key] ?? 0} onChange={e => onChange({ [key]: Number(e.target.value) || undefined })}><option value={0}>-- Chọn người dùng --</option>{users.filter(user => user.isActive && (role === null || user.role === role)).map(user => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}</Select></label>;
  return <>
    <div className="md:col-span-2 mt-2 border-t border-slate-200 pt-4"><h3 className="font-semibold text-brand-900">Thông tin theo mẫu phiếu</h3></div>
    <label className="text-sm font-medium">Đơn vị<Select className="mt-1.5" value={value.organizationId ?? 0} onChange={e => onChange({ organizationId: Number(e.target.value) || undefined, departmentId: undefined })}><option value={0}>-- Chọn đơn vị --</option>{organizations.filter(item => item.isActive).map(item => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</Select></label>
    <label className="text-sm font-medium">Bộ phận<Select className="mt-1.5" value={value.departmentId ?? 0} onChange={e => onChange({ departmentId: Number(e.target.value) || undefined })}><option value={0}>-- Chọn bộ phận --</option>{departments.filter(item => item.isActive && item.organizationId === value.organizationId).map(item => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</Select></label>
    {field("debitAccount", "Tài khoản Nợ")}{field("creditAccount", "Tài khoản Có")}
    <div className="md:col-span-2 mt-2 border-t border-slate-200 pt-4"><h3 className="font-semibold text-brand-900">Tổng hợp và người ký</h3></div>
    {field("totalAmountInWords", "Tổng số tiền (viết bằng chữ)", "md:col-span-2")}
    {field("attachedDocuments", "Số chứng từ gốc kèm theo", "md:col-span-2")}
    {userField("preparedById", null, "Người lập phiếu")}
    {userField("storekeeperId", "STOREKEEPER", "Thủ kho")}{userField("chiefAccountantId", "CHIEF_ACCOUNTANT", "Kế toán trưởng")}
    <div className="md:col-span-2">
      <Attachments
        pendingFiles={value.pendingFiles ?? []}
        onPendingFilesChange={(pendingFiles) => onChange({ pendingFiles, attachedDocuments: String(pendingFiles.length) })}
      />
    </div>
  </>;
}

export function DocumentManager({ kind }: { kind: Kind }) {
  const receipt = kind === "receipt"; const endpoint = receipt ? "/goods-receipts" : "/goods-issues"; const itemEndpoint = receipt ? "/goods-receipt-items" : "/goods-issue-items";
  const [documents, setDocuments] = useState<Document[]>([]); const [products, setProducts] = useState<Product[]>([]); const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<(GoodsReceiptItem | GoodsIssueItem)[]>([]); const [selected, setSelected] = useState<Document | null>(null); const [editing, setEditing] = useState<Document | null>(null);
  const [detailUsers, setDetailUsers] = useState<User[]>([]); const [detailOrganizations, setDetailOrganizations] = useState<Organization[]>([]); const [detailDepartments, setDetailDepartments] = useState<Department[]>([]); const [detailAttachments, setDetailAttachments] = useState<GoodsReceiptAttachment[]>([]);
  const [formOpen, setFormOpen] = useState(false); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [message, setMessage] = useState("");
  const [number, setNumber] = useState(""); const [date, setDate] = useState(today); const [person, setPerson] = useState(""); const [reason, setReason] = useState(""); const [supplierId, setSupplierId] = useState(0); const [warehouse, setWarehouse] = useState(""); const [location, setLocation] = useState(""); const [drafts, setDrafts] = useState<ItemDraft[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<ItemDraft | null>(null);
  const [receiptMeta, setReceiptMeta] = useState<ReceiptMeta>({ debitAccount: "", creditAccount: "", totalAmountInWords: "", attachedDocuments: "", deliveredBy: "" });
  const load = useCallback(async () => { try { const requests: Promise<unknown>[] = [api<Document[]>(endpoint), api<Product[]>("/products")]; if (receipt) requests.push(api<Supplier[]>("/suppliers")); const [docs, productData, supplierData] = await Promise.all(requests); setDocuments(docs as Document[]); setProducts(productData as Product[]); setSuppliers((supplierData as Supplier[]) ?? []); } catch (e) { setMessage(e instanceof Error ? e.message : "Không tải được dữ liệu"); } finally { setLoading(false); } }, [endpoint, receipt]);
  // Dữ liệu đến từ REST API; effect này đồng bộ component với nguồn dữ liệu ngoài.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => documents.filter(d => JSON.stringify(d).toLowerCase().includes(query.toLowerCase())), [documents, query]);
  const docNumber = (d: Document) => receipt ? (d as GoodsReceipt).receiptNumber : (d as GoodsIssue).issueNumber;
  const docDate = (d: Document) => receipt ? (d as GoodsReceipt).receiptDate : (d as GoodsIssue).issueDate;
  const openCreate = () => { setEditing(null); setNumber(""); setDate(today()); setPerson(""); setReason(""); setSupplierId(suppliers[0]?.id ?? 0); setWarehouse(""); setLocation(""); setReceiptMeta({ debitAccount: "", creditAccount: "", totalAmountInWords: "", attachedDocuments: "0", deliveredBy: "" }); setDrafts([]); setFormOpen(true); if (receipt) api<{ receiptNumber: string }>("/goods-receipts/next-number").then(data => setNumber(data.receiptNumber)).catch(error => setMessage(error instanceof Error ? error.message : "Không sinh được số phiếu")); };
  const openEdit = (d: Document) => { setEditing(d); setNumber(docNumber(d)); setDate(docDate(d)); if (receipt) { const r = d as GoodsReceipt; setPerson(r.delivererName ?? ""); setSupplierId(r.supplierId ?? 0); setWarehouse(r.warehouseName ?? ""); setLocation(r.location ?? ""); setReceiptMeta({ organizationId: r.organizationId ?? undefined, departmentId: r.departmentId ?? undefined, debitAccount: r.debitAccount ?? "", creditAccount: r.creditAccount ?? "", totalAmountInWords: r.totalAmountInWords ?? "", attachedDocuments: r.attachedDocuments ?? "", deliveredBy: r.deliveredBy ?? "", preparedById: r.preparedById ?? undefined, storekeeperId: r.storekeeperId ?? undefined, chiefAccountantId: r.chiefAccountantId ?? undefined }); setReason(""); } else { const i = d as GoodsIssue; setPerson(i.recipient ?? ""); setReason(i.reason ?? ""); } setFormOpen(true); };
  const addItem = () => { const p = products.find(x => !drafts.some(d => d.productId === x.id)) ?? products[0]; if (!p) { setMessage("Chưa có sản phẩm để thêm vào phiếu."); return; } setPendingItem({ key: Date.now(), productId: p.id, quantity: 1, documentQuantity: 1, unitPrice: receipt ? p.purchasePrice : p.salePrice }); setItemModalOpen(true); };
  const savePendingItem = () => { if (!pendingItem) return; if (pendingItem.quantity <= 0) { setMessage("Số lượng phải lớn hơn 0."); return; } if (pendingItem.unitPrice < 0) { setMessage("Đơn giá không được âm."); return; } setDrafts(current => [...current, pendingItem]); setPendingItem(null); setItemModalOpen(false); };
  const patchItem = (key: number, patch: Partial<ItemDraft>) => setDrafts(current => current.map(x => x.key === key ? {...x, ...patch} : x));
  const save = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { pendingFiles = [], ...receiptMetaFields } = receiptMeta;
      const receiptFields = {
        ...receiptMetaFields,
        attachedDocuments: editing
          ? receiptMetaFields.attachedDocuments
          : String(pendingFiles.length),
        delivererName: person,
        deliveredBy: person,
        supplierId: supplierId || null,
        warehouseName: warehouse || null,
        location: location || null,
      };
      let savedDocument: Document;
      if (editing) {
        const body = receipt
          ? { receiptNumber: number, receiptDate: date, postingDate: date, ...receiptFields }
          : { issueNumber: number, issueDate: date, recipient: person || null, reason: reason || null };
        savedDocument = await api<Document>(`${endpoint}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        if (!drafts.length) throw new Error("Phiếu phải có ít nhất một dòng hàng.");
        if (receipt && !person.trim()) throw new Error("Họ tên người giao là bắt buộc.");
        const body = receipt
          ? {
              receiptNumber: number,
              receiptDate: date,
              postingDate: date,
              ...receiptFields,
              supplierId: supplierId || undefined,
              ItemReceipt: drafts.map((item) => ({
                productId: item.productId,
                documentQuantity: item.documentQuantity,
                actualQuantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            }
          : {
              issueNumber: number,
              issueDate: date,
              recipient: person || undefined,
              reason: reason || undefined,
              ItemIssue: drafts.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            };
        savedDocument = await api<Document>(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        setEditing(savedDocument);
        setNumber(docNumber(savedDocument));
      }
      if (receipt && pendingFiles.length) {
        for (const file of pendingFiles) {
          await api(`${endpoint}/${savedDocument.id}/attachments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "X-File-Name": encodeURIComponent(file.name),
            },
            body: file,
          });
          setReceiptMeta((current) => ({
            ...current,
            pendingFiles: current.pendingFiles?.filter((item) => item !== file),
          }));
        }
      }
      setMessage(
        editing
          ? `Đã cập nhật ${docNumber(savedDocument)}.`
          : `Đã tạo ${receipt ? "phiếu nhập" : "phiếu xuất"} mới.`,
      );
      setFormOpen(false);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không lưu được phiếu");
      setLoading(false);
    }
  };
  const view = async (d: Document) => { setSelected(d); try { const requests: Promise<unknown>[] = [api<(GoodsReceiptItem | GoodsIssueItem)[]>(itemEndpoint)]; if (receipt) requests.push(api<User[]>("/users"), api<Organization[]>("/organizations"), api<Department[]>("/departments"), api<GoodsReceiptAttachment[]>(`/goods-receipts/${d.id}/attachments`)); const [all, users, organizations, departments, attachments] = await Promise.all(requests); setItems((all as (GoodsReceiptItem | GoodsIssueItem)[]).filter(x => receipt ? (x as GoodsReceiptItem).receiptId === d.id : (x as GoodsIssueItem).issueId === d.id)); setDetailUsers((users as User[]) ?? []); setDetailOrganizations((organizations as Organization[]) ?? []); setDetailDepartments((departments as Department[]) ?? []); setDetailAttachments((attachments as GoodsReceiptAttachment[]) ?? []); } catch (e) { setMessage(e instanceof Error ? e.message : "Không tải được chi tiết"); } };
  const action = async (d: Document, name: "confirm" | "cancel") => { try { await api(`${endpoint}/${d.id}/${name}`, { method: "POST" }); setMessage(name === "confirm" ? `Đã xác nhận ${docNumber(d)}.` : `Đã hủy ${docNumber(d)}.`); setSelected(null); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Không thực hiện được thao tác"); } };
  const remove = async (d: Document) => { if (!window.confirm(`Xóa ${docNumber(d)}?`)) return; try { await api(`${endpoint}/${d.id}`, { method: "DELETE" }); setMessage(`Đã xóa ${docNumber(d)}.`); await load(); } catch (e) { setMessage(e instanceof Error ? e.message : "Không xóa được phiếu"); } };
  const productName = (id: number) => products.find(p => p.id === id)?.name ?? `#${id}`;
  const detailUserName = (id: number | null) => detailUsers.find(user => user.id === id)?.name ?? "—";
  return <div className="mx-auto max-w-[1380px] p-4 md:p-7">
    <div className="mb-5 flex flex-wrap items-end gap-4"><div><p className="text-sm font-medium text-brand-700">CHỨNG TỪ KHO</p><h1 className="mt-1 text-3xl font-semibold">{receipt ? "Phiếu nhập kho" : "Phiếu xuất kho"}</h1><p className="mt-1 text-sm text-slate-500">Danh sách, trạng thái và thao tác xử lý chứng từ.</p></div><Button variant="primary" className="ml-auto" onClick={openCreate}><Plus size={17}/>Tạo mới</Button></div>
    {message && <div className="mb-4 rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</div>}
    <Card><div className="border-b p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-2.5 text-slate-400" size={18}/><Input className="pl-10" placeholder="Tìm số phiếu, người nhận..." value={query} onChange={e => setQuery(e.target.value)}/></div></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Số phiếu</th><th className="px-4 py-3">Ngày lập</th><th className="px-4 py-3">{receipt ? "Người giao" : "Người nhận"}</th><th className="px-4 py-3 text-right">Tổng tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead><tbody>{filtered.map(d => <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-brand-700">{docNumber(d)}</td><td className="px-4 py-3">{docDate(d)}</td><td className="px-4 py-3">{receipt ? (d as GoodsReceipt).delivererName : (d as GoodsIssue).recipient || "—"}</td><td className="px-4 py-3 text-right font-medium">{money.format(d.totalAmount)} ₫</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[d.status]}`}>{statusText[d.status]}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" className="h-8 px-2" title="Xem chi tiết" onClick={() => void view(d)}><Eye size={16}/></Button><Button variant="ghost" className="h-8 px-2" title="Sửa" disabled={d.status !== "DRAFT"} onClick={() => openEdit(d)}><Pencil size={15}/></Button><Button variant="ghost" className="h-8 px-2 text-red-600" title="Xóa" onClick={() => void remove(d)}><Trash2 size={15}/></Button></div></td></tr>)}</tbody></table>{loading && <div className="p-10 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>}{!loading && !filtered.length && <div className="p-10 text-center text-sm text-slate-500">Chưa có phiếu nào.</div>}</div></Card>
    {formOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl"><div className="flex items-center border-b px-5 py-4"><h2 className="text-lg font-semibold">{editing ? `Sửa ${docNumber(editing)}` : `Tạo ${receipt ? "phiếu nhập" : "phiếu xuất"}`}</h2><button className="ml-auto rounded p-1 hover:bg-slate-100" onClick={() => setFormOpen(false)}><X size={20}/></button></div><div className="grid gap-4 p-5 md:grid-cols-2"><label className="text-sm font-medium">Số phiếu<Input className="mt-1.5" value={number} onChange={e => setNumber(e.target.value)} placeholder="Để trống để tự sinh"/></label><label className="text-sm font-medium">Ngày lập *<Input className="mt-1.5" type="date" value={date} onChange={e => setDate(e.target.value)}/></label>{receipt && <label className="text-sm font-medium">Nhà cung cấp<Select className="mt-1.5" value={supplierId} onChange={e => setSupplierId(Number(e.target.value))}><option value={0}>-- Chọn nhà cung cấp --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></label>}<label className="text-sm font-medium">{receipt ? "Người giao *" : "Người nhận"}<Input className="mt-1.5" value={person} onChange={e => setPerson(e.target.value)}/></label>{receipt ? <><label className="text-sm font-medium">Kho nhập<Input className="mt-1.5" value={warehouse} onChange={e => setWarehouse(e.target.value)}/></label><label className="text-sm font-medium">Địa điểm<Input className="mt-1.5" value={location} onChange={e => setLocation(e.target.value)}/></label></> : <label className="text-sm font-medium md:col-span-2">Lý do xuất<Textarea className="mt-1.5" value={reason} onChange={e => setReason(e.target.value)}/></label>}{receipt && <ReceiptMetaFields value={receiptMeta} onChange={patch => setReceiptMeta(current => ({ ...current, ...patch }))}/>}</div>{!editing && <div className="border-t px-5 py-4"><div className="mb-3 flex items-center"><h3 className="font-semibold">Chi tiết hàng hóa</h3><Button className="ml-auto" onClick={addItem}><Plus size={16}/>Thêm dòng</Button></div><div className="space-y-2">{drafts.map((item, index) => <div key={item.key} className="grid items-end gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-[36px_2fr_1fr_1fr_1fr_40px]"><span className="pb-2 text-center text-sm text-slate-400">{index + 1}</span><label className="text-xs font-medium">Sản phẩm<Select className="mt-1" value={item.productId} onChange={e => { const id=Number(e.target.value); const p=products.find(x=>x.id===id); patchItem(item.key,{productId:id,unitPrice:receipt?p?.purchasePrice??0:p?.salePrice??0}); }}>{products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}</Select></label>{receipt && <label className="text-xs font-medium">Theo chứng từ<Input className="mt-1" type="number" min="0" step="any" value={item.documentQuantity} onChange={e => patchItem(item.key,{documentQuantity:Number(e.target.value)})}/></label>}<label className="text-xs font-medium">{receipt ? "Thực nhập" : "Số lượng"}<Input className="mt-1" type="number" min="0.001" step="any" value={item.quantity} onChange={e => patchItem(item.key,{quantity:Number(e.target.value)})}/></label><label className="text-xs font-medium">Đơn giá<Input className="mt-1" type="number" min="0" step="any" value={item.unitPrice} onChange={e => patchItem(item.key,{unitPrice:Number(e.target.value)})}/></label><button className="mb-1 grid size-9 place-items-center rounded text-red-600 hover:bg-red-50" onClick={() => setDrafts(x => x.filter(y => y.key !== item.key))}><Trash2 size={16}/></button></div>)}{!drafts.length && <div className="rounded-lg border border-dashed p-7 text-center text-sm text-slate-500">Chưa có dòng hàng. Chọn “Thêm dòng” để bắt đầu.</div>}</div></div>}<div className="flex justify-end gap-3 border-t bg-slate-50 px-5 py-4"><Button onClick={() => setFormOpen(false)}>Đóng</Button><Button variant="primary" disabled={loading} onClick={() => void save()}>{loading ? "Đang lưu..." : "Lưu phiếu"}</Button></div></div></div>}
    {itemModalOpen && pendingItem && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setItemModalOpen(false); }}><div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"><div className="flex items-center border-b border-slate-200 px-5 py-4"><div><h2 className="text-lg font-semibold">Thêm hàng hóa vào phiếu</h2><p className="mt-1 text-sm text-slate-500">Chọn sản phẩm và nhập thông tin của dòng hàng.</p></div><button className="ml-auto rounded p-1 hover:bg-slate-100" onClick={() => setItemModalOpen(false)}><X size={20}/></button></div><div className="grid gap-4 p-5 md:grid-cols-2"><label className="text-sm font-medium md:col-span-2">Sản phẩm *<Select className="mt-1.5" value={pendingItem.productId} onChange={e => { const productId=Number(e.target.value); const p=products.find(x=>x.id===productId); setPendingItem({...pendingItem,productId,unitPrice:receipt?p?.purchasePrice??0:p?.salePrice??0}); }}>{products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}</Select></label>{(() => { const p=products.find(x=>x.id===pendingItem.productId); return <><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="text-xs text-slate-500">Mã sản phẩm</span><p className="mt-1 font-semibold">{p?.sku ?? "—"}</p></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="text-xs text-slate-500">Đơn vị tính / Tồn hiện tại</span><p className="mt-1 font-semibold">{p?.unit ?? "—"} / {money.format(p?.stockQuantity ?? 0)}</p></div></>; })()}{receipt && <label className="text-sm font-medium">Số lượng theo chứng từ *<Input className="mt-1.5" type="number" min="0" step="any" value={pendingItem.documentQuantity} onChange={e => setPendingItem({...pendingItem,documentQuantity:Number(e.target.value)})}/></label>}<label className="text-sm font-medium">{receipt ? "Số lượng thực nhập" : "Số lượng xuất"} *<Input className="mt-1.5" type="number" min="0.001" step="any" value={pendingItem.quantity} onChange={e => setPendingItem({...pendingItem,quantity:Number(e.target.value)})}/></label><label className="text-sm font-medium">Đơn giá *<Input className="mt-1.5" type="number" min="0" step="any" value={pendingItem.unitPrice} onChange={e => setPendingItem({...pendingItem,unitPrice:Number(e.target.value)})}/></label><div className="rounded-lg bg-brand-50 p-3"><span className="text-xs text-brand-700">Thành tiền</span><p className="mt-1 text-lg font-semibold text-brand-900">{money.format(pendingItem.quantity * pendingItem.unitPrice)} ₫</p></div></div><div className="flex justify-end gap-3 border-t bg-slate-50 px-5 py-4"><Button onClick={() => { setItemModalOpen(false); setPendingItem(null); }}>Hủy</Button><Button variant="primary" onClick={savePendingItem}>Lưu dòng hàng</Button></div></div></div>}
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl">
      <div className="flex items-center border-b px-5 py-4"><div><h2 className="text-xl font-semibold">{docNumber(selected)}</h2><p className="mt-1 text-sm text-slate-500">Ngày lập: {docDate(selected)}</p></div><span className={`ml-4 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[selected.status]}`}>{statusText[selected.status]}</span><button className="ml-auto rounded p-1 hover:bg-slate-100" onClick={() => setSelected(null)}><X size={20}/></button></div>
      {receipt ? (() => { const data = selected as GoodsReceipt; const organization = detailOrganizations.find(item => item.id === data.organizationId); const department = detailDepartments.find(item => item.id === data.departmentId); const supplier = suppliers.find(item => item.id === data.supplierId); return <>
        <div className="grid gap-4 border-b bg-slate-50 p-5 text-sm md:grid-cols-4">
          <div><span className="text-slate-500">Đơn vị</span><p className="mt-1 font-medium">{organization?.name ?? "—"}</p></div><div><span className="text-slate-500">Bộ phận</span><p className="mt-1 font-medium">{department?.name ?? "—"}</p></div><div><span className="text-slate-500">Nhà cung cấp</span><p className="mt-1 font-medium">{supplier?.name ?? "—"}</p></div><div><span className="text-slate-500">Người giao</span><p className="mt-1 font-medium">{data.delivererName || "—"}</p></div>
          <div><span className="text-slate-500">Kho nhập</span><p className="mt-1 font-medium">{data.warehouseName ?? "—"}</p></div><div><span className="text-slate-500">Địa điểm</span><p className="mt-1 font-medium">{data.location ?? "—"}</p></div><div><span className="text-slate-500">Tài khoản Nợ / Có</span><p className="mt-1 font-medium">{data.debitAccount ?? "—"} / {data.creditAccount ?? "—"}</p></div><div><span className="text-slate-500">Tổng giá trị</span><p className="mt-1 font-semibold text-brand-700">{money.format(data.totalAmount)} ₫</p></div>
          <div><span className="text-slate-500">Người lập phiếu</span><p className="mt-1 font-medium">{detailUserName(data.preparedById)}</p></div><div><span className="text-slate-500">Thủ kho</span><p className="mt-1 font-medium">{detailUserName(data.storekeeperId)}</p></div><div><span className="text-slate-500">Kế toán trưởng</span><p className="mt-1 font-medium">{detailUserName(data.chiefAccountantId)}</p></div><div><span className="text-slate-500">Chứng từ kèm theo</span><p className="mt-1 font-medium">{detailAttachments.length} file</p></div>
        </div>
      </>; })() : <div className="grid gap-3 border-b bg-slate-50 p-5 text-sm md:grid-cols-3"><div><span className="text-slate-500">Người nhận</span><p className="mt-1 font-medium">{(selected as GoodsIssue).recipient || "—"}</p></div><div><span className="text-slate-500">Tổng giá trị</span><p className="mt-1 font-semibold text-brand-700">{money.format(selected.totalAmount)} ₫</p></div><div><span className="text-slate-500">Số dòng hàng</span><p className="mt-1 font-medium">{items.length}</p></div></div>}
      <div className="overflow-x-auto p-5"><h3 className="mb-3 font-semibold">Chi tiết hàng hóa</h3><table className="w-full min-w-[850px] text-sm"><thead className="bg-slate-50 text-left"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Sản phẩm</th>{receipt && <th className="px-3 py-2 text-right">Theo chứng từ</th>}<th className="px-3 py-2 text-right">{receipt ? "Thực nhập" : "Số lượng"}</th>{receipt && <th className="px-3 py-2 text-right">Chênh lệch</th>}<th className="px-3 py-2 text-right">Đơn giá</th><th className="px-3 py-2 text-right">Thành tiền</th></tr></thead><tbody>{items.map((item,index) => { const qty=receipt?(item as GoodsReceiptItem).actualQuantity:(item as GoodsIssueItem).quantity; const documentQty=receipt?(item as GoodsReceiptItem).documentQuantity:qty; return <tr key={item.id} className="border-t"><td className="px-3 py-3">{index+1}</td><td className="px-3 py-3 font-medium">{productName(item.productId)}</td>{receipt && <td className="px-3 py-3 text-right">{money.format(documentQty)}</td>}<td className="px-3 py-3 text-right">{money.format(qty)}</td>{receipt && <td className={`px-3 py-3 text-right ${qty !== documentQty ? "font-semibold text-amber-700" : ""}`}>{money.format(qty-documentQty)}</td>}<td className="px-3 py-3 text-right">{money.format(item.unitPrice)}</td><td className="px-3 py-3 text-right font-medium">{money.format(item.lineAmount)} ₫</td></tr>; })}</tbody></table>{!items.length && <div className="p-7 text-center text-sm text-slate-500">Không có dòng chi tiết.</div>}</div>
      {receipt && detailAttachments.length > 0 && <div className="border-t px-5 py-4"><h3 className="mb-3 font-semibold">File chứng từ</h3><div className="grid gap-2 md:grid-cols-2">{detailAttachments.map(file => <div key={file.id} className="rounded-md border px-3 py-2 text-sm"><p className="truncate font-medium">{file.originalName}</p><p className="text-xs text-slate-500">{Math.ceil(file.size/1024)} KB</p></div>)}</div></div>}
      <div className="flex flex-wrap justify-end gap-3 border-t bg-slate-50 px-5 py-4"><Button onClick={() => setSelected(null)}>Đóng</Button><Button variant="danger" disabled={selected.status !== "DRAFT"} onClick={() => void action(selected,"cancel")}><XCircle size={16}/>Hủy phiếu</Button><Button variant="primary" disabled={selected.status !== "DRAFT"} onClick={() => void action(selected,"confirm")}><CheckCircle2 size={16}/>Xác nhận</Button></div>
    </div></div>}
  </div>;
}
