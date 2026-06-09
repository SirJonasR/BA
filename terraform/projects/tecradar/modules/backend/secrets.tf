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