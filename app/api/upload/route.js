import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { getAdminSession } from "@/lib/auth";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

async function uploadToCloudinary(file, cloudName, apiKey, apiSecret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "literacy_school_news";
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url;
}

export async function POST(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "لم يتم اختيار أي صورة" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const useCloudinary = Boolean(cloudName && apiKey && apiSecret);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!useCloudinary) {
      await mkdir(uploadDir, { recursive: true });
    }

    const urls = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") continue;
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "يُسمح فقط برفع الصور (JPG, PNG, WEBP, GIF)" },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: "حجم الصورة يجب أن لا يتجاوز 5 ميغابايت" },
          { status: 400 }
        );
      }

      if (useCloudinary) {
        const secureUrl = await uploadToCloudinary(file, cloudName, apiKey, apiSecret);
        urls.push(secureUrl);
      } else {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
        const filePath = path.join(uploadDir, fileName);

        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));
        urls.push(`/uploads/${fileName}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "فشل رفع الصور" }, { status: 500 });
  }
}
