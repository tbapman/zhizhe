import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import TreeNode from '@/models/Tree';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

// PUT /api/tree/[id] - 更新目标树节点
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未提供认证信息',
        errorCode: 'NO_TOKEN'
      }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: '无效的认证信息',
        errorCode: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    const { title, stage, status, achievementValue, position } = await request.json();

    const treeNode = await TreeNode.findOne({ _id: params.id, userId: decoded.userId });
    if (!treeNode) {
      return NextResponse.json({
        success: false,
        message: '目标不存在',
        errorCode: 'NOT_FOUND'
      }, { status: 404 });
    }

    // 验证输入
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return NextResponse.json({
          success: false,
          message: '标题不能为空',
          errorCode: 'MISSING_TITLE'
        }, { status: 400 });
      }
      if (title.length > 50) {
        return NextResponse.json({
          success: false,
          message: '标题长度不能超过50个字符',
          errorCode: 'TITLE_TOO_LONG'
        }, { status: 400 });
      }
      treeNode.title = title.trim();
    }

    if (stage !== undefined) {
      if (!['flower', 'apple', 'root'].includes(stage)) {
        return NextResponse.json({
          success: false,
          message: '阶段只能是flower、apple或root',
          errorCode: 'INVALID_STAGE'
        }, { status: 400 });
      }
      treeNode.stage = stage;
    }

    if (status !== undefined) {
      if (!['active', 'completed', 'archived'].includes(status)) {
        return NextResponse.json({
          success: false,
          message: '状态只能是active、completed或archived',
          errorCode: 'INVALID_STATUS'
        }, { status: 400 });
      }
      treeNode.status = status;
    }

    if (achievementValue !== undefined) {
      if (achievementValue < 0 || achievementValue > 100) {
        return NextResponse.json({
          success: false,
          message: '完成度必须在0-100之间',
          errorCode: 'INVALID_ACHIEVEMENT_VALUE'
        }, { status: 400 });
      }
      treeNode.achievementValue = achievementValue;
    }

    if (position !== undefined) {
      treeNode.position = position;
    }

    await treeNode.save();

    return NextResponse.json({
      success: true,
      message: '更新目标成功',
      data: treeNode
    });
  } catch (error) {
    console.error('Update tree node error:', error);
    return NextResponse.json({
      success: false,
      message: '更新目标失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// DELETE /api/tree/[id] - 删除目标树节点（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未提供认证信息',
        errorCode: 'NO_TOKEN'
      }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: '无效的认证信息',
        errorCode: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    const treeNode = await TreeNode.findOne({ _id: params.id, userId: decoded.userId });
    if (!treeNode) {
      return NextResponse.json({
        success: false,
        message: '目标不存在',
        errorCode: 'NOT_FOUND'
      }, { status: 404 });
    }

    // 软删除 - 标记为archived
    treeNode.status = 'archived';
    await treeNode.save();

    return NextResponse.json({
      success: true,
      message: '删除目标成功'
    });
  } catch (error) {
    console.error('Delete tree node error:', error);
    return NextResponse.json({
      success: false,
      message: '删除目标失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}