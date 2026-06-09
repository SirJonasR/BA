resource "aws_secretsmanager_secret" "keycloak_admin" {
  name                    = "${var.project}-${var.environment}-keycloak-admin"
  description             = "Keycloak admin credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "keycloak_admin_version" {
  secret_id = aws_secretsmanager_secret.keycloak_admin.id
  secret_string = jsonencode({
    username = var.keycloak_admin_username
    password = var.keycloak_admin_password
  })
}

###
resource "aws_secretsmanager_secret" "next_auth" {
  name                    = "${var.project}-${var.environment}-next-auth"
  description             = "Next Auth secret for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "next_auth_version" {
  secret_id = aws_secretsmanager_secret.next_auth.id
  secret_string = jsonencode({
    secret = var.next_auth_secret
  })
}

###
resource "aws_secretsmanager_secret" "keycloak_secret" {
  name                    = "${var.project}-${var.environment}-keycloak-secret"
  description             = "Keycloak client secret for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "keycloak_secret_version" {
  secret_id = aws_secretsmanager_secret.keycloak_secret.id
  secret_string = jsonencode({
    secret = var.keycloak_secret
  })
}

###
resource "aws_secretsmanager_secret" "smtp_credentials" {
  name                    = "${var.project}-${var.environment}-smtp-credentials"
  description             = "SMTP credentials for ${var.project} in ${var.environment}"
  recovery_window_in_days = 0

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "smtp_credentials_version" {
  secret_id = aws_secretsmanager_secret.smtp_credentials.id
  secret_string = jsonencode({
    username = var.smtp_username
    password = var.smtp_password
  })
}