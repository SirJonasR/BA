# ECS Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project}-${var.environment}-backend-container"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.be_cpu
  memory                   = var.be_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${aws_ecr_repository.backend.repository_url}:latest"

      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        { # this one can probably be removed
          name  = "QUARKUS_DATASOURCE_JDBC_URL"
          value = var.db_jdbc_url
        },
        {
          name  = "QUARKUS_DATASOURCE_URL"
          value = var.db_jdbc_url
        },
        {
          name  = "QUARKUS_MIGRATE_AT_START"
          value = "true"
        },
        {
          name  = "QUARKUS_PROFILE"
          value = "prod"
        },
        {
          name  = "QUARKUS_OIDC_AUTH_SERVER_URL"
          value = "https://${var.domain_name}/keycloak/realms/tecradar"
        },
        {
          name  = "QUARKUS_OIDC_CLIENT_ID"
          value = "tecradar-backend"
        },
        {
          name  = "DEPLOYMENT_ENVIRONMENT"
          value = "${var.environment}"
        },
        { # this is relevant for liquibase db migrations, that grant permissions to this user
        # this should be replaced by a separate user with limited permissions but was set to root user for now
          name  = "APP_USER"
          value = "example_db_user"
        }
      ]

      secrets = [
        { name = "QUARKUS_DATASOURCE_USERNAME", valueFrom = "${var.db_credentials_quarkus.arn}:username::" },
        { name = "QUARKUS_DATASOURCE_PASSWORD", valueFrom = "${var.db_credentials_quarkus.arn}:password::" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command = ["CMD-SHELL", "curl --head -fsS http://localhost:8080/q/health/started >> /var/log/backend-health.log 2>&1 || exit 0"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      essential = true
    }
  ])

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "backend" {
  name              = "${var.project}/${var.environment}/ecs/backend"
  retention_in_days = 30

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

# ECS Service
resource "aws_ecs_service" "backend" {
  name            = "${var.project}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = var.subnet_ids
    assign_public_ip = var.assign_ecs_public_ip
  }

  load_balancer {
    target_group_arn = var.backend_ecs_target_group.arn
    container_name   = "backend"
    container_port   = 8080
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}