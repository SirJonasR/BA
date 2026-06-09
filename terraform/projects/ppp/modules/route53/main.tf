################################################################
# Keycloak Domain Entries
################################################################
resource "aws_route53_zone" "keycloak_subdomain_zone" {
  name = var.environment == "prod" ? "keycloak.${var.tld}" : "${var.environment}.keycloak.${var.tld}"

  tags = {
    Name        = var.environment == "prod" ? "keycloak.${var.tld}" : "${var.environment}.keycloak.${var.tld}"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_route53_record" "keycloak_dev_subdomain_delegation" {
  count = var.environment != "prod" ? 1 : 0

  zone_id = data.aws_route53_zone.keycloak_zone.zone_id # This is the parent zone: keycloak.3p-ams.de
  name    = "${var.environment}.keycloak.${var.tld}"    # dev.keycloak.3p-ams.de
  type    = "NS"

  ttl     = 300
  records = aws_route53_zone.keycloak_subdomain_zone.name_servers
}

resource "aws_route53_record" "keycloak_subdomain_delegation" {
  zone_id = data.aws_route53_zone.parent_zone.zone_id
  name    = var.environment == "prod" ? "keycloak.${var.tld}" : "${var.environment}.keycloak.${var.tld}"
  type    = "NS"

  ttl     = 300
  records = aws_route53_zone.keycloak_subdomain_zone.name_servers
}


################################################################
# Frontend  Domain Entries
################################################################
resource "aws_route53_zone" "frontend_subdomain_zone" {
  count = var.environment != "prod" ? 1 : 0

  name = "${var.environment}.${var.tld}"

  tags = {
    Name        = "${var.environment}.${var.tld}"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_route53_record" "frontend_subdomain_delegation" {
  count = var.environment != "prod" ? 1 : 0

  zone_id = data.aws_route53_zone.parent_zone.zone_id
  name    = "${var.environment}.${var.tld}"
  type    = "NS"

  records = aws_route53_zone.frontend_subdomain_zone[0].name_servers
  ttl     = 300
}


#################################################################################
# Keycloak - Link to ALB and Certificate
#################################################################################
resource "aws_route53_record" "alb_record" {
  zone_id = aws_route53_zone.keycloak_subdomain_zone.zone_id
  name    = var.environment == "prod" ? "keycloak.${var.tld}" : "${var.environment}.keycloak.${var.tld}"
  type    = "A"

  alias {
    name                   = var.alb_public.dns_name
    zone_id                = var.alb_public.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "keycloak_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = aws_route53_zone.keycloak_subdomain_zone.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate" "cert" {
  domain_name               = var.environment == "prod" ? "keycloak.${var.tld}" : "${var.environment}.keycloak.${var.tld}"
  validation_method         = "DNS"
  subject_alternative_names = var.environment == "prod" ? ["www.keycloak.${var.tld}"] : ["www.${var.environment}.keycloak.${var.tld}"]

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_acm_certificate_validation" "keycloak_cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.keycloak_cert_validation : record.fqdn]
}


#################################################################################
# Frontend - Link to ALB and Certificate
#################################################################################
resource "aws_route53_record" "frontend_alb_record" {
  zone_id = local.frontend_zone_id
  name    = var.environment == "prod" ? var.tld : "${var.environment}.${var.tld}"
  type    = "A"

  alias {
    name                   = var.alb_public.dns_name
    zone_id                = var.alb_public.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = local.frontend_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate" "frontend_cert" {
  domain_name               = var.environment == "prod" ? var.tld : "${var.environment}.${var.tld}"
  validation_method         = "DNS"
  subject_alternative_names = var.environment == "prod" ? ["www.${var.tld}"] : ["www.${var.environment}.${var.tld}"]

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "aws_acm_certificate_validation" "frontend_cert_validation" {
  certificate_arn         = aws_acm_certificate.frontend_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_cert_validation : record.fqdn]
}
