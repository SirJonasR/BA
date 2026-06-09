################################################################
# Public ALB
################################################################
# Add Target Groups for Keycloak and Frontend
resource "aws_lb_target_group" "keycloak_ecs_target_group" {
  name        = "${var.project}-${var.environment}-keycloak-ecs-tg"
  port        = 8443
  protocol    = "HTTPS"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/"
    port                = 9000
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 10
    matcher             = "200"
    protocol            = "HTTPS"
  }

  tags = {
    Name        = "${var.project}.${var.environment}-keycloak-ecs-tg"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "frontend_ecs_target_group" {
  name        = "${var.project}-${var.environment}-frontend-ecs-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/healthz"
    interval            = 60
    timeout             = 20
    healthy_threshold   = 3
    unhealthy_threshold = 5
    matcher             = "200"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "${var.project}.${var.environment}-frontend-ecs-tg"
    Project     = var.project
    Environment = var.environment
  }
}

# Add Http Listener which redirects to HTTPS Listener
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = var.public_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      protocol    = "HTTPS"
      port        = "443"
      status_code = "HTTP_301"
    }
  }
}

# Add HTTPS Listener for Keycloak and Frontend
resource "aws_lb_listener" "https_listener" {
  load_balancer_arn = var.public_alb.arn
  port              = 443
  protocol          = "HTTPS"

  ssl_policy      = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.keycloak_cert_validation_certificate_arn # Keycloak certificate

  default_action { # As default if not defined in the rules
    type             = "forward"
    target_group_arn = aws_lb_target_group.keycloak_ecs_target_group.arn
  }
}

# Attach additional SSL certificate to the HTTPS listener
resource "aws_lb_listener_certificate" "frontend_certificate" {
  listener_arn    = aws_lb_listener.https_listener.arn
  certificate_arn = var.frontend_cert_validation_certificate_arn # Frontend certificate
}


# Add Listener Rule, which matches the host header and redirects to keycloak
resource "aws_lb_listener_rule" "keycloak_rule" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.keycloak_ecs_target_group.arn
  }

  condition {
    host_header {
      values = var.environment == "prod" ? ["keycloak.${var.tld}"] : ["${var.environment}.keycloak.${var.tld}"]
    }
  }
}

# Add Listener Rule, which matches the host header and redirects to Frontend
resource "aws_lb_listener_rule" "frontend_rule" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_ecs_target_group.arn
  }

  condition {
    host_header {
      values = var.environment == "prod" ? [var.tld] : ["${var.environment}.${var.tld}"]
    }
  }
}


################################################################
# Private ALB
################################################################
resource "aws_lb_target_group" "backend_ecs_target_group" {
  name        = "${var.project}-${var.environment}-backend-private-ecs-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path = "/actuator/health"
    # port                = 80
    interval            = 60
    timeout             = 10
    healthy_threshold   = 5
    unhealthy_threshold = 5
    matcher             = "200"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "${var.project}.${var.environment}-backend-private-ecs-tg"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_lb_listener" "private_http_listener" {
  load_balancer_arn = var.private_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_ecs_target_group.arn
  }
}
