locals {
  # Common endpoint patterns for file uploads
  file_upload_endpoints = [
    "/api/employees/import",
    "/en/employees",
    "/de/employees"
  ]

  # Dangerous file extensions that should be blocked
  dangerous_extensions = [
    ".exe\"", ".bat\"", ".cmd\"", ".scr\"", ".sh\"", ".dll\"", # Executables
    ".js\"", ".vbs\"", ".php\"", ".jsp\"", ".asp\"",           # Scripts
    ".jar\"", ".war\"", ".class\"",                            # Java/Archive
    ".xlsm\"", ".xltm\""                                       # Macro-enabled Office
  ]

  # Common text transformations
  lowercase_transform = {
    priority = 0
    type     = "LOWERCASE"
  }

  none_transform = {
    priority = 0
    type     = "NONE"
  }

  # Common visibility config
  default_visibility = {
    cloudwatch_metrics_enabled = true
    sampled_requests_enabled   = true
  }

  # Backend API endpoint (for specific rules)
  backend_api_endpoint = "/api/employees/import"
}
