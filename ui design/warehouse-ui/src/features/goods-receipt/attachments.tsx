"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { api, apiDownload } from "@/lib/api/client";
import type { GoodsReceiptAttachment } from "@/lib/api/types";

const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip"];
const maximumSize = 20 * 1024 * 1024;
const formatSize = (size: number) =>
  size >= 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(size / 1024)} KB`;

export function Attachments({
  documentId,
  basePath = "/goods-receipts",
  pendingFiles,
  onPendingFilesChange,
}: {
  documentId?: number;
  basePath?: "/goods-receipts" | "/goods-issues";
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<GoodsReceiptAttachment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!documentId) {
      return;
    }
    api<GoodsReceiptAttachment[]>(`${basePath}/${documentId}/attachments`)
      .then(setFiles)
      .catch((error) =>
        setMessage(
          error instanceof Error ? error.message : "Không tải được chứng từ",
        ),
      );
  }, [basePath, documentId, pendingFiles.length]);

  const upload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;
    setMessage("");
    const selected = Array.from(selectedFiles);
    const invalid = selected.find((file) => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      return !allowedExtensions.includes(extension) || file.size > maximumSize;
    });
    if (invalid) {
      setMessage(
        `Tệp ${invalid.name} không đúng định dạng hoặc vượt quá 20 MB`,
      );
      return;
    }
    if (!documentId) {
      onPendingFilesChange([...pendingFiles, ...selected]);
      setMessage(
        `Đã thêm ${selected.length} chứng từ, file sẽ được tải lên khi lưu phiếu`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setLoading(true);
    try {
      const uploaded: GoodsReceiptAttachment[] = [];
      for (const file of selected) {
        uploaded.push(
          await api<GoodsReceiptAttachment>(
            `${basePath}/${documentId}/attachments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "X-File-Name": encodeURIComponent(file.name),
              },
              body: file,
            },
          ),
        );
      }
      setFiles((current) => [...uploaded.reverse(), ...current]);
      setMessage(`Đã tải lên ${uploaded.length} chứng từ`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không tải được chứng từ",
      );
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = async (file: GoodsReceiptAttachment) => {
    if (!documentId) return;
    try {
      const blob = await apiDownload(
        `${basePath}/${documentId}/attachments/${file.id}/download`,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được tệp");
    }
  };

  const remove = async (file: GoodsReceiptAttachment) => {
    if (!documentId) return;
    setLoading(true);
    try {
      await api(`${basePath}/${documentId}/attachments/${file.id}`, {
        method: "DELETE",
      });
      setFiles((current) => current.filter((item) => item.id !== file.id));
      setMessage(`Đã xóa ${file.originalName}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không xóa được chứng từ",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <CardTitle>Chứng từ kèm theo</CardTitle>
      {message && <p className="mt-3 text-sm text-brand-800">{message}</p>}
      {!documentId && (
        <p className="mt-3 text-sm text-brand-800">
          Bạn có thể chọn chứng từ ngay; file sẽ tự tải lên khi lưu phiếu.
        </p>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!loading) void upload(event.dataTransfer.files);
          }}
          className={`flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-slate-400 text-center ${!loading ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed opacity-60"}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            disabled={loading}
            accept={allowedExtensions.join(",")}
            onChange={(event) => void upload(event.target.files)}
            className="sr-only"
          />
          <div className="flex items-center gap-3">
            <UploadCloud size={30} />
            <span className="text-sm">Kéo thả tệp vào đây hoặc</span>
            <Button type="button" disabled={loading} className="h-9">
              {loading ? "Đang xử lý..." : "Chọn tệp"}
            </Button>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Định dạng: .pdf, .doc, .docx, .xls, .xlsx, .zip · Dung lượng tối đa
            20MB
          </p>
        </label>
        <div className="overflow-hidden rounded-md border border-slate-200">
          {!pendingFiles.length && (!documentId || !files.length) && (
            <p className="p-4 text-sm text-slate-500">Chưa có chứng từ.</p>
          )}
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 border-b border-slate-200 p-3"
            >
              <FileText size={22} className="text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-amber-700">
                  {formatSize(file.size)} · Chờ lưu phiếu
                </p>
              </div>
              <button
                type="button"
                aria-label={`Bỏ ${file.name}`}
                onClick={() =>
                  onPendingFilesChange(
                    pendingFiles.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <Trash2 size={17} className="text-slate-500" />
              </button>
            </div>
          ))}
          {documentId &&
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 border-b border-slate-200 p-3 last:border-0"
              >
                <FileText size={22} className="text-brand-700" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{file.originalName}</p>
                  <p className="text-xs text-slate-500">
                    {formatSize(file.size)}
                  </p>
                </div>
                <time className="hidden text-xs text-slate-500 sm:block">
                  {new Date(file.createdAt).toLocaleString("vi-VN")}
                </time>
                <button
                  type="button"
                  aria-label={`Tải ${file.originalName}`}
                  onClick={() => void download(file)}
                >
                  <Download size={17} className="text-brand-700" />
                </button>
                <button
                  type="button"
                  disabled={loading}
                  aria-label={`Xóa ${file.originalName}`}
                  onClick={() => void remove(file)}
                >
                  <Trash2 size={17} className="text-slate-500" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
