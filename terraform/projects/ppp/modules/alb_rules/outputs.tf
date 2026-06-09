output "keycloak_ecs_target_group" {
  description = "The ARN of the Application Load Balancer"
  value       = aws_lb_target_group.keycloak_ecs_target_group
}

output "frontend_ecs_target_group" {
  description = "The ARN of the Application Load Balancer"
  value       = aws_lb_target_group.frontend_ecs_target_group
}

output "backend_ecs_target_group" {
  description = "The ARN of the Application Load Balancer"
  value       = aws_lb_target_group.backend_ecs_target_group
}
