import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/upload
 * Accepts multipart/form-data with a single image file.
 * Converts the image to WebP (quality 85), uploads to Supabase Storage,
 * and returns the public URL.
 *
 * Requires: admin role (owner | manager | content_editor)
 */
export async function POST(request: NextRequest) {
    // Verify the caller is an authenticated admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const allowed = ['owner', 'manager', 'content_editor'];
    if (!profile || !allowed.includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse the multipart body
    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxBytes = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxBytes) {
        return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 400 });
    }

    // Check it is an image type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/bmp', 'image/tiff'];
    if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type. Please upload JPEG, PNG, WebP, or GIF.' }, { status: 400 });
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        // Convert to WebP for best quality-to-size ratio
        // Resize to max 2000px on the longest edge to prevent massive uploads
        const webpBuffer = await sharp(buffer)
            .rotate() // auto-rotate based on EXIF orientation
            .resize(2000, 2000, {
                fit: 'inside',       // don't upscale, shrink to fit within 2000x2000
                withoutEnlargement: true,
            })
            .webp({
                quality: 85,         // good visual quality, significantly smaller file
                effort: 4,           // balanced compression speed vs size (0-6)
                smartSubsample: true,
            })
            .toBuffer();

        // Generate a unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}-${randomStr}.webp`;

        // Upload to Supabase Storage using service role (bypasses RLS)
        const storage = createServiceClient();
        const { error: uploadError } = await storage.storage
            .from('products')
            .upload(fileName, webpBuffer, {
                contentType: 'image/webp',
                cacheControl: '31536000', // 1 year cache
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
        }

        const { data: { publicUrl } } = storage.storage
            .from('products')
            .getPublicUrl(fileName);

        return NextResponse.json({
            url: publicUrl,
            fileName,
            size: webpBuffer.byteLength,
        });

    } catch (err: any) {
        console.error('Image processing error:', err);
        return NextResponse.json({ error: `Image processing failed: ${err.message}` }, { status: 500 });
    }
}
