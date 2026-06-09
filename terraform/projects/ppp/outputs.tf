output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "workspace" {
  value = var.environment
}

output "public_alb_dns" {
  value = local.alb.public_dns_name
}

output "private_alb_dns" {
  value = local.alb.private_dns_name
}

output "keycloak_url" {
  value = module.route53.keycloak_subdomain_zone.name
}

output "frontend_url" {
  value = var.environment != "prod" && length(module.route53.frontend_subdomain_zone) > 0 ? module.route53.frontend_subdomain_zone[0].name : var.tld
}

output "ec2_public_dns" {
  value = module.rds.bastion_host.public_dns
}

output "database_url" {
  value = var.environment != "prod" && length(module.rds.aws_db_instance_mysql) > 0 ? module.rds.aws_db_instance_mysql_endpoint : module.rds.aws_db_aurora_cluster_endpoint
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = module.rds.bastion_host.id
}
