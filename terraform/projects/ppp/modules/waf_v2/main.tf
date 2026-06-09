# Associate WAF with the public ALB for file upload protection
resource "aws_wafv2_web_acl_association" "alb_waf_association" {
  resource_arn = var.public_alb.arn
  web_acl_arn  = aws_wafv2_web_acl.file_upload_protection.arn
}


#######################################################################
# Rules
#######################################################################
resource "aws_wafv2_web_acl" "file_upload_protection" {
  name  = "${var.project}-${var.environment}-file-upload-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rule 1: Block oversized requests (file size limit)
  rule {
    name     = "FileSizeLimit"
    priority = 1

    statement {
      size_constraint_statement {
        field_to_match {
          body {}
        }
        comparison_operator = "GT"
        size                = 10485760 # 10 MB in bytes
        text_transformation {
          priority = local.none_transform.priority
          type     = local.none_transform.type
        }
      }
    }

    action {
      block {
        custom_response {
          response_code            = 413
          custom_response_body_key = "file_too_large"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = local.default_visibility.cloudwatch_metrics_enabled
      metric_name                = "FileSizeLimitRule"
      sampled_requests_enabled   = local.default_visibility.sampled_requests_enabled
    }
  }

  # Rule 2: Rate limiting for file uploads (all endpoints)
  rule {
    name     = "FileUploadRateLimit"
    priority = 2

    statement {
      rate_based_statement {
        limit              = 100 # requests per 5-minute window
        aggregate_key_type = "IP"

        scope_down_statement {
          or_statement {
            # Generate endpoint matchers dynamically
            dynamic "statement" {
              for_each = local.file_upload_endpoints
              content {
                byte_match_statement {
                  search_string = statement.value
                  field_to_match {
                    uri_path {}
                  }
                  text_transformation {
                    priority = local.lowercase_transform.priority
                    type     = local.lowercase_transform.type
                  }
                  positional_constraint = "CONTAINS"
                }
              }
            }
          }
        }
      }
    }

    action {
      block {
        custom_response {
          response_code            = 429
          custom_response_body_key = "rate_limit_exceeded"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = local.default_visibility.cloudwatch_metrics_enabled
      metric_name                = "FileUploadRateLimitRule"
      sampled_requests_enabled   = local.default_visibility.sampled_requests_enabled
    }
  }

  # Rule 3: Block malicious file extensions in all file upload requests
  rule {
    name     = "BlockMaliciousFileExtensions"
    priority = 3

    statement {
      and_statement {
        # Match all file upload endpoints
        statement {
          or_statement {
            dynamic "statement" {
              for_each = local.file_upload_endpoints
              content {
                byte_match_statement {
                  search_string = statement.value
                  field_to_match {
                    uri_path {}
                  }
                  text_transformation {
                    priority = local.lowercase_transform.priority
                    type     = local.lowercase_transform.type
                  }
                  positional_constraint = "CONTAINS"
                }
              }
            }
          }
        }

        # Must be POST method
        statement {
          byte_match_statement {
            search_string = "POST"
            field_to_match {
              method {}
            }
            text_transformation {
              priority = local.none_transform.priority
              type     = local.none_transform.type
            }
            positional_constraint = "EXACTLY"
          }
        }

        # Must be multipart form data
        statement {
          byte_match_statement {
            search_string = "multipart/form-data"
            field_to_match {
              single_header {
                name = "content-type"
              }
            }
            text_transformation {
              priority = local.lowercase_transform.priority
              type     = local.lowercase_transform.type
            }
            positional_constraint = "CONTAINS"
          }
        }

        # Check for dangerous file extensions in filename context only
        statement {
          or_statement {
            # Generate extension matchers dynamically
            dynamic "statement" {
              for_each = local.dangerous_extensions
              content {
                byte_match_statement {
                  search_string = statement.value
                  field_to_match {
                    body {}
                  }
                  text_transformation {
                    priority = local.lowercase_transform.priority
                    type     = local.lowercase_transform.type
                  }
                  positional_constraint = "CONTAINS"
                }
              }
            }
          }
        }
      }
    }

    action {
      block {
        custom_response {
          response_code            = 403
          custom_response_body_key = "forbidden_file_type"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = local.default_visibility.cloudwatch_metrics_enabled
      metric_name                = "MaliciousFileExtensionsRule"
      sampled_requests_enabled   = local.default_visibility.sampled_requests_enabled
    }
  }

  # Rule 4: Content type validation for file uploads (only for actual file uploads)
  rule {
    name     = "FileUploadContentTypeValidation"
    priority = 4

    statement {
      and_statement {
        # Match Backend API endpoint only (not Next.js Server Actions)
        statement {
          byte_match_statement {
            search_string = local.backend_api_endpoint
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = local.lowercase_transform.priority
              type     = local.lowercase_transform.type
            }
            positional_constraint = "CONTAINS"
          }
        }

        # Must be POST method
        statement {
          byte_match_statement {
            search_string = "POST"
            field_to_match {
              method {}
            }
            text_transformation {
              priority = local.none_transform.priority
              type     = local.none_transform.type
            }
            positional_constraint = "EXACTLY"
          }
        }

        # Must NOT be multipart/form-data (block invalid content types for file uploads)
        statement {
          not_statement {
            statement {
              byte_match_statement {
                search_string = "multipart/form-data"
                field_to_match {
                  single_header {
                    name = "content-type"
                  }
                }
                text_transformation {
                  priority = local.lowercase_transform.priority
                  type     = local.lowercase_transform.type
                }
                positional_constraint = "CONTAINS"
              }
            }
          }
        }
      }
    }

    action {
      block {
        custom_response {
          response_code            = 415
          custom_response_body_key = "unsupported_media_type"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = local.default_visibility.cloudwatch_metrics_enabled
      metric_name                = "FileUploadContentTypeRule"
      sampled_requests_enabled   = local.default_visibility.sampled_requests_enabled
    }
  }

  # Rule 5: HTTP method validation for file uploads (only for Backend API)
  rule {
    name     = "FileUploadMethodValidation"
    priority = 5

    statement {
      and_statement {
        # Match Backend API endpoint only (not Next.js Server Actions)
        statement {
          byte_match_statement {
            search_string = local.backend_api_endpoint
            field_to_match {
              uri_path {}
            }
            text_transformation {
              priority = local.lowercase_transform.priority
              type     = local.lowercase_transform.type
            }
            positional_constraint = "CONTAINS"
          }
        }

        # Must have multipart/form-data content type (file upload indicator)
        statement {
          byte_match_statement {
            search_string = "multipart/form-data"
            field_to_match {
              single_header {
                name = "content-type"
              }
            }
            text_transformation {
              priority = local.lowercase_transform.priority
              type     = local.lowercase_transform.type
            }
            positional_constraint = "CONTAINS"
          }
        }

        # Must NOT be POST method (block invalid methods for file uploads)
        statement {
          not_statement {
            statement {
              byte_match_statement {
                search_string = "POST"
                field_to_match {
                  method {}
                }
                text_transformation {
                  priority = local.none_transform.priority
                  type     = local.none_transform.type
                }
                positional_constraint = "EXACTLY"
              }
            }
          }
        }
      }
    }

    action {
      block {
        custom_response {
          response_code            = 405
          custom_response_body_key = "method_not_allowed"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = local.default_visibility.cloudwatch_metrics_enabled
      metric_name                = "FileUploadMethodRule"
      sampled_requests_enabled   = local.default_visibility.sampled_requests_enabled
    }
  }

  # Custom response bodies for blocked requests
  custom_response_body {
    key          = "file_too_large"
    content      = "File size exceeds the maximum allowed limit of 10MB"
    content_type = "TEXT_PLAIN"
  }

  custom_response_body {
    key          = "rate_limit_exceeded"
    content      = "Rate limit exceeded. Please try again later"
    content_type = "TEXT_PLAIN"
  }

  custom_response_body {
    key          = "forbidden_file_type"
    content      = "File type not allowed. Only Excel files (.xlsx, .xls) are permitted. Macro-enabled files (.xlsm, .xltm) and executable files are blocked for security."
    content_type = "TEXT_PLAIN"
  }

  custom_response_body {
    key          = "unsupported_media_type"
    content      = "Unsupported media type. Please use multipart/form-data for file uploads"
    content_type = "TEXT_PLAIN"
  }

  custom_response_body {
    key          = "method_not_allowed"
    content      = "Method not allowed. Only POST requests are accepted for file uploads"
    content_type = "TEXT_PLAIN"
  }

  tags = {
    Name        = "${var.project}-${var.environment}-file-upload-waf"
    Project     = var.project
    Environment = var.environment
    Purpose     = "FileUploadSecurity"
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "FileUploadWAF"
    sampled_requests_enabled   = true
  }
}

