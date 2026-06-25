"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { uploadImage } from "@/lib/storage";
import { useAuth } from "@/lib/firebase/auth";

// Pick an image, crop it (react-easy-crop replaces ng2-img-cropper), upload to
// Storage, and return the public URL via onUploaded.
export function ImageUploader({
  folder,
  aspect = 16 / 9,
  label = "Upload image",
  onUploaded,
}: {
  folder: "posts" | "profile" | "background" | "feeds";
  aspect?: number;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const { user } = useAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixels(areaPixels);
  }, []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!src || !pixels || !user) return;
    setBusy(true);
    try {
      const blob = await cropToBlob(src, pixels);
      const url = await uploadImage(blob, folder, user.uid);
      onUploaded(url);
      setSrc(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="inline-block cursor-pointer rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
        {label}
        <input type="file" accept="image/*" onChange={onPick} className="hidden" />
      </label>

      {src && (
        <div className="space-y-2">
          <div className="relative h-64 w-full bg-slate-900">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Crop & upload"}
            </button>
            <button
              type="button"
              onClick={() => setSrc(null)}
              className="text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Render the selected crop region to a PNG blob.
async function cropToBlob(src: string, area: Area): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Crop failed"));
    }, "image/png");
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
