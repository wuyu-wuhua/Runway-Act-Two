import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (![...allowedVideoTypes, ...allowedImageTypes].includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小 (500MB for video, 5MB for image)
    const maxSize = file.type.startsWith('video/') ? 500 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超出限制' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    
    // 确定存储路径
    const folder = file.type.startsWith('video/') ? 'videos' : 'images';
    const filePath = `${folder}/${fileName}`;

    // 将文件转换为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传到Supabase存储桶
    const { data, error } = await supabase.storage
      .from('runway-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase上传错误:', error);
      return NextResponse.json(
        { error: '文件上传失败: ' + error.message },
        { status: 500 }
      );
    }

    // 获取文件的公共URL
    const { data: urlData } = supabase.storage
      .from('runway-files')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      file_url: urlData.publicUrl, // 这是HTTPS URL
      file_name: fileName,
      file_size: file.size,
      file_type: file.type,
      file_path: filePath
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: '不支持GET请求' },
    { status: 405 }
  );
} 