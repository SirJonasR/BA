output "frontend_service" {
  value = aws_ecs_service.frontend_service
}

output "backend_service" {
  value = aws_ecs_service.backend_service
}

output "keycloak_service" {
  value = aws_ecs_service.keycloak_service
}

output "cluster" {
  value = aws_ecs_cluster.main
}
