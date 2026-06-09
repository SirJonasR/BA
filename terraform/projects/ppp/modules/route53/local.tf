# DNS Configuration Frontend
locals {
  frontend_zone_id = var.environment == "prod" ? data.aws_route53_zone.parent_zone.zone_id : aws_route53_zone.frontend_subdomain_zone[0].zone_id
}
