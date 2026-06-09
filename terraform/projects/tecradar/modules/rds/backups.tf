# Create an AWS backup vault to store database backups
resource "aws_backup_vault" "rds_backup_vault" {
  name        = "${var.project}-${var.environment}-rds-backup-vault"
  kms_key_arn = aws_kms_key.backup_key.arn

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Set up a backup plan with multiple retention rules:
# - Daily backups: kept for 7 days
# - Weekly backups: kept for 4 weeks (28 days)
# - Monthly backups: kept for 6 months (180 days)
resource "aws_backup_plan" "rds_backup_plan" {
  name = "${var.project}-${var.environment}-rds-backup-plan"

  # Daily backups - kept for 1 week
  rule {
    rule_name         = "${var.project}-${var.environment}-daily-backup-rule"
    target_vault_name = aws_backup_vault.rds_backup_vault.name
    schedule          = "cron(0 1 * * ? *)" # Daily at 1 AM UTC

    lifecycle {
      delete_after = 7 # 7 days
    }
  }

  # Weekly backups - kept for 4 weeks
  rule {
    rule_name         = "${var.project}-${var.environment}-weekly-backup-rule"
    target_vault_name = aws_backup_vault.rds_backup_vault.name
    schedule          = "cron(0 2 ? * SUN *)" # Every Sunday at 2 AM UTC

    lifecycle {
      delete_after = 28 # 4 weeks
    }
  }

  # Monthly backups - kept for 6 months
  rule {
    rule_name         = "${var.project}-${var.environment}-monthly-backup-rule"
    target_vault_name = aws_backup_vault.rds_backup_vault.name
    schedule          = "cron(0 3 1 * ? *)" # First day of each month at 3 AM UTC

    lifecycle {
      delete_after = 180 # 6 months (approximately)
    }
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Backup selection for the PostgreSQL instance
resource "aws_backup_selection" "rds_backup_selection" {
  name         = "${var.project}-${var.environment}-rds-backup-selection"
  iam_role_arn = aws_iam_role.backup_role.arn
  plan_id      = aws_backup_plan.rds_backup_plan.id

  resources = [
    aws_db_instance.postgresql.arn
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
