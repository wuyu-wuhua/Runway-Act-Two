import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';

// 定义任务响应类型
interface TaskResponse {
  id: string;
  status: string;
  result?: any;
  error?: string;
}

// 配置Runway客户端（仅在服务器端）
const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY || '',
  timeout: 300000, // 5分钟超时
  maxRetries: 3,
});

// Runway SDK会自动处理认证和请求头

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    // 添加调试信息
    console.log('Runway API request:', { action, params });
    console.log('API Key configured:', !!process.env.RUNWAY_API_KEY);
    console.log('Full request body:', body);
    
    // 检查账户信息
    if (action === 'checkAccount') {
      try {
        const orgInfo = await client.organization.retrieve();
        console.log('Organization info:', orgInfo);
        return NextResponse.json({
          success: true,
          organization: orgInfo
        });
      } catch (error) {
        console.error('Failed to retrieve organization info:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to retrieve account information'
        });
      }
    }

    switch (action) {
      case 'createTask':
        const { imageUrl, videoUrl } = params;
        
        console.log('Processing files for Runway...');
        console.log('First file (Character Image):', imageUrl);
        console.log('Second file (Reference Performance Video):', videoUrl);
        console.log('Using CharacterImage + ReferenceVideo combination');
        
                           // 验证URL格式
          if (!imageUrl || !videoUrl) {
            return NextResponse.json({
              success: false,
              error: '角色图片和参考表演视频URL都是必需的',
              details: '请提供有效的角色图片文件和参考表演视频文件URL。使用CharacterImage + ReferenceVideo组合。'
            }, { status: 400 });
          }
         
                   // 检查URL格式和协议
          try {
            const imageUrlObj = new URL(imageUrl);
            const videoUrlObj = new URL(videoUrl);
            
            console.log('URL protocols:', { image: imageUrlObj.protocol, video: videoUrlObj.protocol });
            
            // 检查是否是HTTPS URL
            if (imageUrlObj.protocol !== 'https:' || videoUrlObj.protocol !== 'https:') {
              console.log('HTTPS validation failed - returning error');
              return NextResponse.json({
                success: false,
                error: 'Runway API 只支持 HTTPS URL',
                details: '请使用 HTTPS URL 或配置公网可访问的文件服务。localhost 和 HTTP URL 不被支持。'
              }, { status: 400 });
            }
          } catch (error) {
            return NextResponse.json({
              success: false,
              error: '无效的URL格式',
              details: '请提供有效的HTTPS URL'
            }, { status: 400 });
          }
        
                 // 根据文件扩展名判断类型
         const isVideoFile = (url: string) => {
           const extension = url.split('.').pop()?.toLowerCase();
           return ['mp4', 'mov', 'avi', 'webm'].includes(extension || '');
         };
         
         const isImageFile = (url: string) => {
           const extension = url.split('.').pop()?.toLowerCase();
           return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
         };
         
                   // 确定角色和参考的类型
          const characterType = isImageFile(imageUrl) ? 'image' : 'video';  // 第一个文件作为角色
          const referenceType = isVideoFile(videoUrl) ? 'video' : 'image';  // 第二个文件作为参考
         
         console.log('File types detected:', { characterType, referenceType });
         
         // 验证参考文件必须是视频（根据API文档要求）
         if (referenceType !== 'video') {
           console.log('Reference file type validation failed - returning error');
           return NextResponse.json({
             success: false,
             error: '参考文件必须是视频格式',
             details: '根据Runway API要求，reference参数必须是3-30秒的视频文件，不能是图片。角色可以是视频或图片，但参考必须是视频。'
           }, { status: 400 });
         }
         
         // 验证角色文件类型（根据用户需求）
         if (characterType !== 'image') {
           console.log('Character file type validation failed - user wants CharacterImage + ReferenceVideo');
           return NextResponse.json({
             success: false,
             error: '角色文件必须是图片格式',
             details: '您选择了CharacterImage + ReferenceVideo组合，请上传图片作为角色文件，视频作为参考表演文件。'
           }, { status: 400 });
         }
         
                   console.log('Creating character performance task with params:', {
            character: {
              type: characterType,
              uri: imageUrl  // 第一个文件作为角色
            },
            reference: {
              type: referenceType,
              uri: videoUrl  // 第二个文件作为参考
            },
            model: 'act_two',
            ratio: '1280:720'
          });

          // 调用Runway API - 使用Character Performance API
          try {
            // 使用正确的Runway SDK方法调用角色表演API
            const task = await client.characterPerformance.create({
              character: {
                type: characterType,
                uri: imageUrl  // 第一个文件作为角色
              },
              reference: {
                type: referenceType,
                uri: videoUrl  // 第二个文件作为参考
              },
              model: 'act_two',
              ratio: '1280:720'
            }) as TaskResponse;
          
          console.log('Task created successfully:', task);
          
          return NextResponse.json({
            success: true,
            task: {
              ...task
            }
          });
                 } catch (apiError: any) {
           console.error('Runway API call failed:', apiError);
           
           // 检查是否是积分不足的问题
           const errorMessage = typeof apiError.error === 'string' ? apiError.error : 
                               (apiError.error?.error || apiError.message || 'Unknown error');
           
           if (apiError.status === 402 || errorMessage.includes('credit') || errorMessage.includes('quota')) {
             return NextResponse.json({
               success: false,
               error: '账户积分不足或已达到使用限制。请检查您的 Runway 账户余额。',
               details: errorMessage
             }, { status: 402 });
           }
           
           // 检查是否是认证问题
           if (apiError.status === 401) {
             return NextResponse.json({
               success: false,
               error: 'API 密钥无效或已过期。请检查您的 Runway API 密钥。',
               details: errorMessage
             }, { status: 401 });
           }
           
           // 检查是否是HTTPS URL问题
           if (apiError.status === 400 && errorMessage.includes('Only HTTPS URLs are allowed')) {
             return NextResponse.json({
               success: false,
               error: 'Runway API 只支持 HTTPS URL',
               details: '请配置HTTPS URL。开发环境建议使用ngrok，生产环境建议使用Vercel等托管服务。详细配置请参考HTTPS_SETUP.md文件。'
             }, { status: 400 });
           }
           
           // 检查是否是URL访问问题
           if (apiError.status === 400 && (errorMessage.includes('uri') || errorMessage.includes('character') || errorMessage.includes('reference'))) {
             return NextResponse.json({
               success: false,
               error: 'Runway无法访问提供的文件URL。请确保视频和图片文件可以通过公网访问。',
               details: errorMessage
             }, { status: 400 });
           }
           
           // 其他错误
           return NextResponse.json({
             success: false,
             error: 'Runway API 调用失败',
             details: errorMessage
           }, { status: apiError.status || 500 });
         }

            case 'getTaskStatus':
        const { taskId } = params;
        try {
          const taskStatus = await client.tasks.retrieve(taskId) as TaskResponse;
          
          console.log('Task status retrieved:', taskStatus);
          console.log('Full task object:', JSON.stringify(taskStatus, null, 2));
          
          // 返回完整的任务对象，包括所有可能的字段
          return NextResponse.json({
            success: true,
            task: {
              ...taskStatus
            }
          });
        } catch (error: any) {
          console.error('Failed to retrieve task status:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to retrieve task status',
            details: error.message
          }, { status: 500 });
        }

      case 'deleteTask':
        const { taskId: deleteTaskId } = params;
        try {
          await client.tasks.delete(deleteTaskId);
          
          console.log('Task deleted successfully:', deleteTaskId);
          
          return NextResponse.json({
            success: true,
            message: 'Task deleted successfully'
          });
        } catch (error: any) {
          console.error('Failed to delete task:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to delete task',
            details: error.message
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Runway API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 