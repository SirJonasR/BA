################################################################
# Public ALB - Target Groups
################################################################
resource "aws_lb_target_group" "frontend_ecs_target_group" {
  name        = "${var.project}-${var.environment}-frontend-ecs-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 60
    timeout             = 20
    healthy_threshold   = 3
    unhealthy_threshold = 5
    matcher             = "200-220"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "${var.project}.${var.environment}-frontend-ecs-tg"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "backend_ecs_target_group" {
  name        = "${var.project}-${var.environment}-backend-ecs-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  
  health_check {
    path                = "/api/technology"
    interval            = 60
    timeout             = 10
    healthy_threshold   = 5
    unhealthy_threshold = 5
    matcher             = "200-401"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "${var.project}.${var.environment}-backend-ecs-tg"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "keycloak_ecs_target_group" {
  name        = "${var.project}-${var.environment}-keycloak-ecs-tg"
  port        = 8080 #8443
  protocol    = "HTTP" #HTTPS
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/keycloak/"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 10
    matcher             = "200-399"
    protocol            = "HTTP"
  }

  tags = {
    Name        = "${var.project}.${var.environment}-keycloak-ecs-tg"
    Project     = var.project
    Environment = var.environment
  }
}