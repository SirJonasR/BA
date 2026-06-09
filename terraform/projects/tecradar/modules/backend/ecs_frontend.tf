################################################################
# Frontend
################################################################
resource "aws_ecs_service" "frontend_service" {
  name                          = "frontend-service"
  cluster                       = aws_ecs_cluster.main.id
  task_definition               = aws_ecs_task_definition.frontend_ecs_task.arn
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
    subnets          = var.subnet_ids
    assign_public_ip = var.assign_ecs_public_ip
    security_groups  = [var.ecs_security_group_id]
  }

  load_balancer {
    # target_group_arn = aws_lb_target_group.frontend_ecs_target_group.arn
    target_group_arn = var.frontend_ecs_target_group.arn
    container_name   = "${var.project}-${var.environment}-frontend-container"
    container_port   = 80
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
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_execution.arn
  network_mode             = "awsvpc"

  container_definitions = jsonencode([
    {
      name      = "${var.project}-${var.environment}-frontend-container"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      memory    = var.fe_memory
      cpu       = var.fe_cpu
      essential = true
      portMappings = [
        { containerPort = 80, protocol = "tcp" }
      ]
    }
  ])

  tags = {
    Name        = "${var.project}-${var.environment}-frontend-ecs-task"
    Project     = var.project
    Environment = var.environment
  }
}
