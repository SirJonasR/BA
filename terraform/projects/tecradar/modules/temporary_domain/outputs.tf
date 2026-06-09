output "tecradar_certificate_arn" {
  description = "ARN of the tecradar SSL certificate"
  value       = aws_acm_certificate.tecradar_cert.arn
}

output "tecradar_zone_id" {
  description = "Zone ID of the tecradar subdomain"
  value       = aws_route53_zone.tecradar_subdomain_zone.zone_id
}

output "tecradar_domain_name" {
  description = "Full domain name for tecradar"
  value       = "tecradar.${var.tld}"
}