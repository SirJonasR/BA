# AWS Backup Restore Testing Plan
resource "aws_backup_restore_testing_plan" "rds_restore_testing_plan" {
  name                = "${var.project}_${var.environment}_rds_restore_test_plan"
  schedule_expression = "cron(0 4 ? * TUE *)" # Every Tuesday at 4 AM
  start_window_hours  = 1

  recovery_point_selection {
    algorithm            = "LATEST_WITHIN_WINDOW"
    include_vaults       = [aws_backup_vault.rds_backup_vault.arn]
    recovery_point_types = ["SNAPSHOT"]
  }

  tags = {
    Project     = var.project
    Environment = var.environment
    Purpose     = "Restore Testing"
  }
}

locals {
  restore_metadata_overrides = {
    "dbinstanceclass"              = var.environment != "prod" ? "db.t3.small" : null,
    "dbparametergroupname"         = var.environment != "prod" ? "default.mysql8.0" : null,
    "dbsubnetgroupname"            = var.db_subnet_group_names.private,
    "multiaz"                      = var.environment != "prod" ? "false" : null,
    "publiclyaccessible"           = var.environment != "prod" ? "false" : null,
    "vpcSecurityGroupIds"          = [aws_security_group.rds_sg.id, var.vpc_security_group_id],
    "dbclusterparametergroupname"  = var.environment == "prod" ? "default.aurora-mysql8.0" : null
  }
}

resource "aws_backup_restore_testing_selection" "rds_restore_testing_selection_dev" {
  count = var.environment == "dev" ? 1 : 0

  name                      = "${var.project}_${var.environment}_rds_restore_test_selection"
  restore_testing_plan_name = aws_backup_restore_testing_plan.rds_restore_testing_plan.name
  protected_resource_type   = var.environment != "prod" ? "RDS" : "Aurora"
  iam_role_arn              = aws_iam_role.backup_role.arn
  region                    = var.region

  # Dynamically select the appropriate database resource based on environment
  protected_resource_arns = [aws_db_instance.mysql[0].arn]

  # Add validation window for testing
  validation_window_hours = 12

  # Add restore metadata overrides for testing configuration using only allowed keys
  restore_metadata_overrides = {
    "dbinstanceclass"      = "db.t3.small"
    "dbparametergroupname" = "default.mysql8.4"
    "dbsubnetgroupname"    = var.db_subnet_group_names.private
    "multiaz"              = "false"
    "publiclyaccessible"   = "false"
    "vpcSecurityGroupIds"  = jsonencode([aws_security_group.rds_sg.id, var.vpc_security_group_id])
  }
}

resource "aws_backup_restore_testing_selection" "rds_restore_testing_selection_prod" {
  count = var.environment == "prod" ? 1 : 0

  name                      = "${var.project}_${var.environment}_rds_restore_test_selection"
  restore_testing_plan_name = aws_backup_restore_testing_plan.rds_restore_testing_plan.name
  protected_resource_type   = var.environment != "prod" ? "RDS" : "Aurora"
  iam_role_arn              = aws_iam_role.backup_role.arn
  region                    = var.region

  # Dynamically select the appropriate database resource based on environment
  protected_resource_arns = [aws_rds_cluster.aurora_cluster[0].arn]

  # Add validation window for testing
  validation_window_hours = 12

  # Add restore metadata overrides for testing configuration using only allowed keys
  restore_metadata_overrides = {
    # "dbinstanceclass"      = "db.t4g.medium"
    "dbclusterparametergroupname" = "default.aurora-mysql8.0"
    "dbsubnetgroupname"           = var.db_subnet_group_names.private
    # "multiaz"              = "false"
    # "publiclyaccessible"   = "false"
    "vpcSecurityGroupIds" = jsonencode([aws_security_group.rds_sg.id, var.vpc_security_group_id])
    # "optiongroupname"     = "default.aurora-mysql8.0"
  }
}

