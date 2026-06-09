resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project}-${var.environment}-db-credentials"
  description             = "Database credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
  })
}

###
resource "aws_secretsmanager_secret" "db_credentials_admin" {
  name                    = "${var.project}-${var.environment}-db-credentials-admin"
  description             = "Database admin credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_admin_version" {
  secret_id = aws_secretsmanager_secret.db_credentials_admin.id
  secret_string = jsonencode({
    username = var.db_username_admin
    password = var.db_password_admin
  })
}

###
resource "aws_secretsmanager_secret" "db_credentials_root" {
  name                    = "${var.project}-${var.environment}-db-credentials-root"
  description             = "Database root credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_root_version" {
  secret_id = aws_secretsmanager_secret.db_credentials_admin.id
  secret_string = jsonencode({
    username = var.db_username_root
    password = var.db_password_root
  })
}