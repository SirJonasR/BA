# Create an AWS backup vault to store database backups
resource "aws_backup_vault" "rds_backup_vault" {
  name        = "${var.project}-${var.environment}-rds-backup-vault"
  kms_key_arn = aws_kms_key.backup_key.arn

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Set up a backup plan that runs daily at 1 AM UTC with a 7-day retention period
resource "aws_backup_plan" "rds_backup_plan" {
  name = "${var.project}-${var.environment}-rds-backup-plan"

  rule {
    rule_name         = "${var.project}-${var.environment}-daily-backup-rule"
    target_vault_name = aws_backup_vault.rds_backup_vault.name
    schedule          = "cron(0 1 * * ? *)" # Daily at 1 AM UTC

    lifecycle {
      delete_after = 7 # 7-day retention period
    }
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Added a backup selection that intelligently targets either:
# - The MySQL instance in development environment
# - The Aurora cluster in production environment
resource "aws_backup_selection" "rds_backup_selection" {
  name         = "${var.project}-${var.environment}-rds-backup-selection"
  iam_role_arn = aws_iam_role.backup_role.arn
  plan_id      = aws_backup_plan.rds_backup_plan.id

  resources = var.environment != "prod" ? [
    aws_db_instance.mysql[0].arn
  ] : [
    aws_rds_cluster.aurora_cluster[0].arn
  ]
}

# Create the necessary IAM role with appropriate permissions for AWS Backup to perform backup and restore operations
resource "aws_iam_role" "backup_role" {
  name = "${var.project}-${var.environment}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "backup_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_iam_role_policy_attachment" "restore_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
  role       = aws_iam_role.backup_role.name
}

# Add KMS key for backup encryption
resource "aws_kms_key" "backup_key" {
  description             = "KMS key for ${var.project}-${var.environment} backup encryption"
  deletion_window_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-backup-key"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_kms_alias" "backup_key_alias" {
  name          = "alias/${var.project}-${var.environment}-backup-key"
  target_key_id = aws_kms_key.backup_key.key_id
}

# Add additional IAM policies for backup operations
resource "aws_iam_role_policy_attachment" "backup_s3_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AWSBackupServiceRolePolicyForS3Backup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_iam_role_policy_attachment" "backup_s3_restore_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AWSBackupServiceRolePolicyForS3Restore"
  role       = aws_iam_role.backup_role.name
}

# Custom policy for KMS permissions
resource "aws_iam_role_policy" "backup_kms_policy" {
  name = "${var.project}-${var.environment}-backup-kms-policy"
  role = aws_iam_role.backup_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:ReEncrypt*"
        ]
        Resource = aws_kms_key.backup_key.arn
      }
    ]
  })
}