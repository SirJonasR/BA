# Root database credentials
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
  secret_id = aws_secretsmanager_secret.db_credentials_root.id
  secret_string = jsonencode({
    username = var.db_username_root
    password = var.db_password_root
  })
}

# Generate random passwords for database users
resource "random_password" "keycloak_user" {
  length  = 32
  special = true

  lifecycle {
    ignore_changes = all
  }
}

resource "random_password" "quarkus_user" {
  length  = 32
  special = true

  lifecycle {
    ignore_changes = all
  }
}

# Keycloak database credentials
resource "aws_secretsmanager_secret" "db_credentials_keycloak" {
  name_prefix             = "${var.project}-${var.environment}-db-keycloak-"
  description             = "Keycloak database credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_keycloak_version" {
  secret_id = aws_secretsmanager_secret.db_credentials_keycloak.id
  secret_string = jsonencode({
    username = "keycloak_user"
    password = random_password.keycloak_user.result
  })
}

# Quarkus database credentials
resource "aws_secretsmanager_secret" "db_credentials_quarkus" {
  name_prefix             = "${var.project}-${var.environment}-db-quarkus-"
  description             = "Quarkus database credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_quarkus_version" {
  secret_id = aws_secretsmanager_secret.db_credentials_quarkus.id
  secret_string = jsonencode({
    username = "quarkus_user"
    password = random_password.quarkus_user.result
  })
}