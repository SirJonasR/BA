################################################################
# Public ALB - Listener Rules
################################################################
resource "aws_lb_listener_certificate" "tecradar_cert_atos_net" {
    # Erstelle diese Ressource nur für "dev", nicht für "prod" TODO: Prod Domain freigeben und Prod Zertifikat verwenden
    count           = var.environment == "prod" ? 0 : 1
    listener_arn    = var.shared_alb_https_listener_arn
    certificate_arn = var.cert_validation_certificate_atos_arn
  }

# Rule 1: Route tecradar.atos.net/api/* to backend (highest priority)
resource "aws_lb_listener_rule" "backend_api_rule" {
  listener_arn = var.shared_alb_https_listener_arn
  priority     = 400

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_ecs_target_group.arn
  }

  condition {
    host_header {
      values = ["tecradar.3p-ams.de", var.domain_name, "www.${var.domain_name}"]
    }
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  tags = {
    Name        = "${var.project}.${var.environment}-backend-api-rule"
    Project     = var.project
    Environment = var.environment
  }
}

# Rule 2: Route to keycloak
resource "aws_lb_listener_rule" "keycloak_rule" {
  listener_arn = var.shared_alb_https_listener_arn
  priority     = 500

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.keycloak_ecs_target_group.arn
  }

  condition {
    host_header {
      values = ["tecradar.3p-ams.de", "tecradar.atos.net",  "www.tecradar.atos.net"]
    }
  }
  condition {
    path_pattern {
      values = ["/keycloak/*"]
    }
  }

  tags = {
    Name        = "${var.project}.${var.environment}-keycloak-rule"
    Project     = var.project
    Environment = var.environment
  }
}

# Rule 3: Route tecradar.atos.net (all other paths) to frontend
# Note: This is technically redundant since the default action already points to frontend,
# but included for explicitness and easier maintenance
resource "aws_lb_listener_rule" "frontend_rule" {
  listener_arn = var.shared_alb_https_listener_arn
  priority     = 600

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_ecs_target_group.arn
  }

  condition {
    host_header {
      values = ["tecradar.3p-ams.de", "tecradar.atos.net",  "www.tecradar.atos.net"]
    }
  }

  tags = {
    Name        = "${var.project}.${var.environment}-frontend-rule"
    Project     = var.project
    Environment = var.environment
  }
}