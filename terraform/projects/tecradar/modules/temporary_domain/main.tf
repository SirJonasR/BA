################################################################
# Data Sources
################################################################
data "aws_route53_zone" "parent_zone" {
  name         = var.tld  # 3p-ams.de
  private_zone = false
}

################################################################
# Tecradar Domain Entries
################################################################
resource "aws_route53_zone" "tecradar_subdomain_zone" {
  name = "tecradar.${var.tld}"  # tecradar.3p-ams.de

  tags = {
    Name        = "tecradar.${var.tld}"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_route53_record" "tecradar_subdomain_delegation" {
  zone_id = data.aws_route53_zone.parent_zone.zone_id
  name    = "tecradar.${var.tld}"  # tecradar.3p-ams.de
  type    = "NS"

  ttl     = 300
  records = aws_route53_zone.tecradar_subdomain_zone.name_servers
}

#################################################################################
# Tecradar - Link to ALB and Certificate
#################################################################################
resource "aws_route53_record" "tecradar_alb_record" {
  zone_id = aws_route53_zone.tecradar_subdomain_zone.zone_id
  name    = "tecradar.${var.tld}"  # tecradar.3p-ams.de
  type    = "A"

  alias {
    name                   = var.alb_public.dns_name
    zone_id                = var.alb_public.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "tecradar_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.tecradar_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = aws_route53_zone.tecradar_subdomain_zone.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate" "tecradar_cert" {
  domain_name               = "tecradar.${var.tld}"  # tecradar.3p-ams.de
  validation_method         = "DNS"
  subject_alternative_names = ["www.tecradar.${var.tld}"]

  tags = {
    Environment = "dev"
    Project     = var.project
  }
}

resource "aws_acm_certificate_validation" "tecradar_cert_validation" {
  certificate_arn         = aws_acm_certificate.tecradar_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.tecradar_cert_validation : record.fqdn]
}