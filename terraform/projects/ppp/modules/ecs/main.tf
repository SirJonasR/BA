# An ECS (Elastic Container Service) cluster is a logical grouping of containerized applications running on AWS.
# It allows to deploy, manage, and scale Docker containers using AWS Fargate (serverless) or EC2 instances (self-managed).
resource "aws_ecs_cluster" "main" {
  name = "${var.project}-${var.environment}-cluster"

  tags = {
    Name        = "${var.project}-${var.environment}-ecs-cluster"
    Project     = var.project
    Environment = var.environment
  }
}

################################################################
# Keycloak
################################################################
resource "aws_ecs_service" "keycloak_service" {
  name                          = "keycloak-service"
  cluster                       = aws_ecs_cluster.main.id
  task_definition               = "${aws_ecs_task_definition.keycloak_ecs_task.family}:${data.aws_ecs_task_definition.keycloak_current.revision}"
  launch_type                   = "FARGATE"
  scheduling_strategy           = "REPLICA"
  desired_count                 = 1
  force_new_deployment          = true
  availability_zone_rebalancing = "DISABLED"

  propagate_tags = "TASK_DEFINITION"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.private_subnets[*].id
    assign_public_ip = false
    security_groups  = [var.ecs_cluster_sg.id]
  }

  load_balancer {
    target_group_arn = var.keycloak_ecs_target_group.arn
    container_name   = "${var.project}-${var.environment}-keycloak-container"
    container_port   = 8443
  }

  depends_on = [aws_ecs_task_definition.keycloak_ecs_task]

  tags = {
    Name        = "${var.project}-${var.environment}-keycloak-service"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "keycloak_ecs_task" {
  family                   = "${var.project}-${var.environment}-keycloak-task"
  requires_compatibilities = ["FARGATE"]
  memory                   = var.kc_memory
  cpu                      = var.kc_cpu
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTaskExecutionRole.arn
  network_mode             = "awsvpc"

  container_definitions = jsonencode([
    {
      name      = "${var.project}-${var.environment}-keycloak-container"
      image     = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.keycloak_repo}:${local.kc_image_tag}"
      memory    = var.kc_memory
      cpu       = var.kc_cpu
      essential = true
      portMappings = [
        { containerPort = 8443, protocol = "tcp" },
        { containerPort = 8080, protocol = "tcp" },
        { containerPort = 9000, protocol = "tcp" }
      ]

      environment = [
        { name = "KC_DB", value = "mysql" },
        { name = "KC_DB_URL", value = "jdbc:mysql://${var.db_endpoint}/${var.db_name}" },
        { name = "DB_DATABASE", value = var.db_name },
        { name = "KC_HEALTH_ENABLED", value = "true" },
        { name = "KC_METRICS_ENABLED", value = "true" },
        { name = "KC_HOSTNAME", value = var.environment == "prod" ? "keycloak.${var.tld}" : "${var.environment}.keycloak.${var.tld}" },
        { name = "KC_HOSTNAME_STRICT", value = "true" },
        { name = "KC_HOSTNAME_STRICT_HTTPS", value = "true" },
        { name = "KC_BOOTSTRAP_ADMIN_USERNAME", value = "admin-tmp" },
        { name = "KC_REALM_NAME", value = var.realm_name },
        { name = "KC_SMTP_HOST", value = var.smtp_host },
        { name = "KC_SMTP_PORT", value = var.smtp_port },
        { name = "KC_SMTP_FROM", value = var.smtp_from },
        { name = "KC_SECRET", value = var.keycloak_secret },
        { name = "KC_USER_ENABLED", value = var.environment == "prod" ? "false" : "true" },
        { name = "KC_CLIENT_URL", value = var.environment == "prod" ? "https://3p-ams.de/" : "https://dev.3p-ams.de/" },
        { name = "KC_2FA", value = var.environment == "prod" ? "REQUIRED" : "DISABLED" }
      ]

      secrets = [
        { name = "KC_BOOTSTRAP_ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:password::" },
        { name = "KC_ADMIN_USERNAME", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:username::" },
        { name = "KC_ADMIN_PASSWORD", valueFrom = "${aws_secretsmanager_secret.keycloak_admin.arn}:password::" },
        { name = "KC_DB_USERNAME", valueFrom = "${var.db_credentials_admin.arn}:username::" },
        { name = "KC_DB_PASSWORD", valueFrom = "${var.db_credentials_admin.arn}:password::" },
        { name = "KC_SMTP_USER", valueFrom = "${aws_secretsmanager_secret.smtp_credentials.arn}:username::" },
        { name = "KC_SMTP_PASSWORD", valueFrom = "${aws_secretsmanager_secret.smtp_credentials.arn}:password::" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.keycloak_log_group.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "keycloak"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl --head -fsS https://localhost:9000/health >> /var/log/keycloak-health.log 2>&1 || exit 0"]
        interval    = 30
        timeout     = 10
        retries     = 5
        startPeriod = 90
      }

      tags = {
        Name        = "${var.project}-${var.environment}-keycloak-container-definition"
        Project     = var.project
        Environment = var.environment
      }
    }
  ])

  tags = {
    Name        = "${var.project}-${var.environment}-keycloak-ecs-task"
    Project     = var.project
    Environment = var.environment
  }
}

# Logging
resource "aws_cloudwatch_log_group" "keycloak_log_group" {
  name              = "${var.project}-${var.environment}-keycloak"
  retention_in_days = 30

  tags = {
    Name        = "${var.project}-${var.environment}-keycloak-log-group"
    Project     = var.project
    Environment = var.environment
  }
}

# Scaling
resource "aws_appautoscaling_target" "ecs_scaling" {
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.keycloak_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  min_capacity       = 1
  max_capacity       = 1
}

resource "aws_appautoscaling_scheduled_action" "keycloak_scale_up" {
  name               = "scale-up-action"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.ecs_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_scaling.scalable_dimension
  schedule           = var.start_day_time
  timezone           = "Europe/Berlin"
  scalable_target_action {
    min_capacity = var.scaling_target_day_min
    max_capacity = var.scaling_target_day_max
  }
}

resource "aws_appautoscaling_scheduled_action" "keycloak_scale_down" {
  name               = "scale-down-action"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.ecs_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_scaling.scalable_dimension
  schedule           = var.start_night_time
  scalable_target_action {
    min_capacity = var.scaling_target_night_min
    max_capacity = var.scaling_target_night_max
  }
}


################################################################
# Backend
################################################################
resource "aws_ecs_service" "backend_service" {
  name                          = "backend-service"
  cluster                       = aws_ecs_cluster.main.id
  task_definition               = "${aws_ecs_task_definition.backend_ecs_task.family}:${data.aws_ecs_task_definition.backend_current.revision}"
  launch_type                   = "FARGATE"
  scheduling_strategy           = "REPLICA"
  desired_count                 = 1
  force_new_deployment          = true
  availability_zone_rebalancing = "DISABLED"

  propagate_tags = "TASK_DEFINITION"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.private_subnets[*].id
    assign_public_ip = false
    security_groups  = [var.ecs_cluster_sg.id]
  }

  load_balancer {
    # target_group_arn = aws_lb_target_group.backend_private_ecs_target_group.arn
    target_group_arn = var.backend_ecs_target_group.arn
    container_name   = "${var.project}-${var.environment}-backend-container"
    container_port   = 8080
  }

  depends_on = [aws_ecs_task_definition.backend_ecs_task]

  tags = {
    Name        = "${var.project}-${var.environment}-backend-service"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "backend_ecs_task" {
  family                   = "${var.project}-${var.environment}-backend-task"
  requires_compatibilities = ["FARGATE"]
  memory                   = var.be_memory
  cpu                      = var.be_cpu
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTaskExecutionRole.arn
  network_mode             = "awsvpc"

  container_definitions = jsonencode([
    {
      name      = "${var.project}-${var.environment}-backend-container"
      image     = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.backend_repo}:${local.be_image_tag}"
      memory    = var.be_memory
      cpu       = var.be_cpu
      essential = true
      portMappings = [
        { containerPort = 8080, protocol = "tcp" }
      ]

      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${var.db_endpoint}/${var.db_name_app}?createDatabaseIfNotExist=true" },
        { name = "SPRING_LIQUIBASE_URL", value = "jdbc:mysql://${var.db_endpoint}/${var.db_name_app}?createDatabaseIfNotExist=true" },
        { name = "SPRING_LIQUIBASE_LIQUIBASE_SCHEMA", value = var.db_name_app },
        { name = "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI", value = "https://${var.keycloak_subdomain_zone.name}/realms/${var.realm_name}" },
        { name = "SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK_SET_URI", value = "https://${var.keycloak_subdomain_zone.name}/realms/${var.realm_name}/protocol/openid-connect/certs" }
      ]

      secrets = [
        { name = "SPRING_DATASOURCE_USERNAME", valueFrom = "${var.db_credentials.arn}:username::" },
        { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = "${var.db_credentials.arn}:password::" },
        { name = "SPRING_LIQUIBASE_USERNAME", valueFrom = "${var.db_credentials_admin.arn}:username::" },
        { name = "SPRING_LIQUIBASE_PASSWORD", valueFrom = "${var.db_credentials_admin.arn}:password::" }
      ]

      healthCheck = {
        command = ["CMD-SHELL", "curl --head -fsS https://localhost:8080/actuator/health >> /var/log/backend-health.log 2>&1 || exit 0"]
        # command     = [ "CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1" ]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend_log_group.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "backend"
        }
      }

    }
  ])

  tags = {
    Name        = "${var.project}-${var.environment}-backend-ecs-task"
    Project     = var.project
    Environment = var.environment
  }
}

# Logging
resource "aws_cloudwatch_log_group" "backend_log_group" {
  name              = "${var.project}-${var.environment}-backend"
  retention_in_days = 30

  tags = {
    Name        = "${var.project}-${var.environment}-backend-log-group"
    Project     = var.project
    Environment = var.environment
  }
}

# Scaling
resource "aws_appautoscaling_target" "backend_ecs_scaling" {
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  min_capacity       = 1
  max_capacity       = 1
}

resource "aws_appautoscaling_scheduled_action" "backend_scale_up" {
  name               = "scale-up-action"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.backend_ecs_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_ecs_scaling.scalable_dimension
  schedule           = var.start_day_time
  scalable_target_action {
    min_capacity = var.scaling_target_day_min
    max_capacity = var.scaling_target_day_max
  }
}

resource "aws_appautoscaling_scheduled_action" "backend_scale_down" {
  name               = "scale-down-action"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.backend_ecs_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.backend_ecs_scaling.scalable_dimension
  schedule           = var.start_night_time
  scalable_target_action {
    min_capacity = var.scaling_target_night_min
    max_capacity = var.scaling_target_night_max
  }
}

################################################################
# Frontend
################################################################
resource "aws_ecs_service" "frontend_service" {
  name                          = "frontend-service"
  cluster                       = aws_ecs_cluster.main.id
  task_definition               = "${aws_ecs_task_definition.frontend_ecs_task.family}:${data.aws_ecs_task_definition.frontend_current.revision}"
  launch_type                   = "FARGATE"
  scheduling_strategy           = "REPLICA"
  desired_count                 = 1
  force_new_deployment          = true
  availability_zone_rebalancing = "DISABLED"

  propagate_tags = "TASK_DEFINITION"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.private_subnets[*].id
    assign_public_ip = false
    security_groups  = [var.ecs_cluster_sg.id]
  }

  load_balancer {
    # target_group_arn = aws_lb_target_group.frontend_ecs_target_group.arn
    target_group_arn = var.frontend_ecs_target_group.arn
    container_name   = "${var.project}-${var.environment}-frontend-container"
    container_port   = 3000
  }

  depends_on = [aws_ecs_task_definition.frontend_ecs_task]

  tags = {
    Name        = "${var.project}-${var.environment}-frontend-service"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "frontend_ecs_task" {
  family                   = "${var.project}-${var.environment}-frontend-task"
  requires_compatibilities = ["FARGATE"]
  memory                   = var.fe_memory
  cpu                      = var.fe_cpu
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTaskExecutionRole.arn
  network_mode             = "awsvpc"

  container_definitions = jsonencode([
    {
      name      = "${var.project}-${var.environment}-frontend-container"
      image     = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.frontend_repo}:${local.fe_image_tag}"
      memory    = var.fe_memory
      cpu       = var.fe_cpu
      essential = true
      portMappings = [
        { containerPort = 3000, protocol = "tcp" }
      ]

      environment = [
        { name = "REACT_APP_ENVIRONMENT", value = "PROD" },

        { name = "NEXTAUTH_URL", value = var.environment == "prod" ? "https://${var.tld}" : "https://${var.environment}.${var.tld}" },

        { name = "KEYCLOAK_ISSUER_ENV", value = "https://${var.keycloak_subdomain_zone.name}/realms/${var.realm_name}" },
        { name = "KEYCLOAK_ID", value = "keycloak-react" },
        { name = "KEYCLOAK_AUTHORIZATION_ENV", value = "https://${var.keycloak_subdomain_zone.name}/realms/${var.realm_name}/protocol/openid-connect/auth" },
        { name = "KEYCLOAK_WELLKNOWN_ENV", value = "https://${var.keycloak_subdomain_zone.name}/realms/${var.realm_name}/.well-known/openid-configuration" },

        # { name = "SPRING_HOST_ENV", value = "http://${aws_lb.ppp_private_alb.dns_name}" },
        { name = "SPRING_HOST_ENV", value = "http://${var.alb_private.dns_name}" },
        { name = "SPRING_PORT_ENV", value = "80" },
      ]

      secrets = [
        { name = "NEXTAUTH_SECRET_ENV", valueFrom = "${aws_secretsmanager_secret.next_auth.arn}:secret::" }, # Used to encrypt the NextAuth.js JWT
        { name = "KEYCLOAK_SECRET_ENV", valueFrom = "${aws_secretsmanager_secret.keycloak_secret.arn}:secret::" },
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "curl --head -fsS https://localhost:3000/api/healthz >> /var/log/frontend-health.log 2>&1 || exit 0"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.frontend_log_group.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "frontend"
        }
      }

    }
  ])

  tags = {
    Name        = "${var.project}-${var.environment}-frontend-ecs-task"
    Project     = var.project
    Environment = var.environment
  }
}

# Logging
resource "aws_cloudwatch_log_group" "frontend_log_group" {
  name              = "${var.project}-${var.environment}-frontend"
  retention_in_days = 30

  tags = {
    Name        = "${var.project}-${var.environment}-frontend-log-group"
    Project     = var.project
    Environment = var.environment
  }
}

# Scaling
resource "aws_appautoscaling_target" "frontend_ecs_scaling" {
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  min_capacity       = 1
  max_capacity       = 1
}

resource "aws_appautoscaling_scheduled_action" "frontend_scale_up" {
  name               = "scale-up-action"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.frontend_ecs_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_ecs_scaling.scalable_dimension
  schedule           = var.start_day_time
  scalable_target_action {
    min_capacity = var.scaling_target_day_min
    max_capacity = var.scaling_target_day_max
  }
}

resource "aws_appautoscaling_scheduled_action" "frontend_scale_down" {
  name               = "scale-down-action"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.frontend_ecs_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend_ecs_scaling.scalable_dimension
  schedule           = var.start_night_time
  scalable_target_action {
    min_capacity = var.scaling_target_night_min
    max_capacity = var.scaling_target_night_max
  }
}
