import AuditLog from '../models/AuditLog';

export async function logAudit(params: {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
}): Promise<void> {
  try {
    await AuditLog.create({
      user: params.userId,
      userName: params.userName,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      description: params.description,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    // Log the error but don't throw — audit logging should never break the main flow
    console.error('Audit log error:', error);
  }
}
