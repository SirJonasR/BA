# Keycloak ECS Task Definition
# https://www.keycloak.org/server/reverseproxy
resource "aws_ecs_task_definition" "keycloak" {
  family                   = "${var.project}-${var.environment}-keycloak-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.kc_cpu
  memory                   = var.kc_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "${var.project}-${var.environment}-keycloak-container"
      image = "${aws_ecr_repository.keycloak.repository_url}:latest"
      essential = true

      portMappings = [
        { containerPort = 8443, protocol = "tcp" },
        { containerPort = 8080, protocol = "tcp" },
        { containerPort = 9000, protocol = "tcp" }
      ]

      environment = [
        {
          name  = "KC_DB"
          value = "postgres" # the type of DB
        },
        {
          name  = "KC_HOSTNAME"
          value = var.domain_name
        },
        {
          name  = "KC_DB_URL"
          value = var.kc_db_jdbc_url
        },
        {
          name  = "KC_PROXY"
          value = "edge"
        },
        {
          name  = "KC_HOSTNAME_STRICT"
          value = "false"
        },
        {
          name  = "KC_HOSTNAME_STRICT_HTTPS"
          value = "false"
        },
        {
          name = "KC_HTTP_RELATIVE_PATH"
          value = "/keycloak"
        }
      ]

      secrets = [
        { name = "KC_BOOTSTRAP_ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:password::" },
        { name = "KC_BOOTSTRAP_ADMIN_USERNAME", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:username::" },
        { name = "KC_ADMIN_USERNAME", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:username::" },
        { name = "KC_ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:password::" },
        { name = "KC_DB_USERNAME", valueFrom = "${var.db_credentials_keycloak.arn}:username::" },
        { name = "KC_DB_PASSWORD", valueFrom = "${var.db_credentials_keycloak.arn}:password::" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.keycloak.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl --head -fsS http://localhost:9000/health >> /var/log/keycloak-health.log 2>&1 || exit 0"]
        interval    = 30
        timeout     = 10
        retries     = 5
        startPeriod = 90
      }
      
    }
  ])

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# CloudWatch Log Group for Keycloak
resource "aws_cloudwatch_log_group" "keycloak" {
  name              = "${var.project}/${var.environment}/ecs/keycloak"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# Keycloak ECS Service
resource "aws_ecs_service" "keycloak" {
  name            = "${var.project}-keycloak"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.keycloak.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = var.subnet_ids
    assign_public_ip = var.assign_ecs_public_ip
  }

  load_balancer {
    target_group_arn = var.keycloak_ecs_target_group.arn
    container_name   = "${var.project}-${var.environment}-keycloak-container"
    container_port   = 8080
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}