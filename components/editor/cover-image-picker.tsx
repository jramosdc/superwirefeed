"use client";

import { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useAuth } from "@/lib/firebase/auth-context";
import { uploadPublicImage } from "@/lib/db/client";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

const ASPECT = 16 / 9;

export function CoverImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { user } = useAuth();
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10 MB or smaller.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, ASPECT, width, height),
        width,
        height,
      ),
    );
  }

  async function save() {
    if (!user || !imgRef.current || !completed) return;
    setBusy(true);
    setError("");
    try {
      const blob = await cropToBlob(imgRef.current, completed);
      const url = await uploadPublicImage(user.uid, blob, "cover");
      onChange(url);
      setSrc("");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {value && !src && (
        <div className="relative mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="cover" className="w-full rounded-lg border border-zinc-200" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
          >
            Remove
          </button>
        </div>
      )}

      {src && (
        <div className="mb-2 rounded-lg border border-zinc-200 p-2">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompleted(c)}
            aspect={ASPECT}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt="" onLoad={onImageLoad} className="max-h-80" />
          </ReactCrop>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={save} disabled={busy} className="btn-primary">
              {busy ? "Uploading…" : "Use photo"}
            </button>
            <button type="button" onClick={() => setSrc("")} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      <label className="btn-secondary cursor-pointer">
        {value ? "Change cover image" : "Add cover image"}
        <input type="file" accept="image/*" onChange={pick} className="hidden" />
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

async function cropToBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.9,
    );
  });
}
