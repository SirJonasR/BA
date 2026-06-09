output "keycloak_subdomain_zone" {
  value = aws_route53_zone.keycloak_subdomain_zone
}

output "frontend_subdomain_zone" {
  value = aws_route53_zone.frontend_subdomain_zone
}

output "frontend_cert_validation_certificate_arn" {
  description = "ACM Certificate Validation Records for Frontend"
  value       = aws_acm_certificate_validation.frontend_cert_validation.certificate_arn
}

output "keycloak_cert_validation_certificate_arn" {
  description = "ACM Certificate Validation Records for Keycloak"
  value       = aws_acm_certificate_validation.keycloak_cert_validation.certificate_arn
}
