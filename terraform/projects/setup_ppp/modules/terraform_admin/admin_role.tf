# Create an IAM Role for Terraform Administrators
# Which will be used to assume the role for Terraform operations
resource "aws_iam_role" "TerraformAdministrator" {
  name = "${var.project}TerraformAdministrator"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::897729117054:root"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# EC2, ECS Policy
resource "aws_iam_policy" "ec2_ecs_admin_policy" {
  name        = "${var.project}-EC2-ECS-AdminPolicy"
  description = "EC2 and ECS administration permissions."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid = "EC2Admin"
      Effect = "Allow"
      Action = [
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:DeleteVpcEndpoints",
        "ec2:AttachInternetGateway",
        "ec2:CreateRoute",
        "ec2:DescribeVolumes",
        "ec2:DeleteNatGateway",
        "ec2:CreateVpc",
        "ec2:ModifySubnetAttribute",
        "ec2:ReleaseAddress",
        "ec2:DescribeSecurityGroups",
        "ec2:DeleteSubnet",
        "ec2:DeleteVpc",
        "ec2:DescribeAddresses",
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeAddressesAttribute",
        "ec2:DescribeVpcAttribute",
        "ec2:ModifyInstanceAttribute",
        "ec2:ListTagsForResource",
        "ec2:DescribeAvailabilityZones",
        "ec2:GetSecurityGroupsForVpc",
        "ec2:CreateTags",
        "ec2:RunInstances",
        "ec2:DisassociateRouteTable",
        "ec2:CreateSubnet",
        "ec2:DescribeSubnets",
        "ec2:DisassociateAddress",
        "ec2:DescribeAccountAttributes",
        "ec2:DescribeInstanceCreditSpecifications",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribePrefixLists",
        "ec2:DescribeVpcs",
        "ec2:CreateNatGateway",
        "ec2:CreateSecurityGroup",
        "ec2:DescribeVpcEndpoints",
        "ec2:DeleteTags",
        "ec2:DescribeInstanceAttribute",
        "ec2:DescribeNetworkAcls",
        "ec2:DescribeRouteTables",
        "ec2:CreateRouteTable",
        "ec2:DetachInternetGateway",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:TerminateInstances",
        "ec2:DescribeTags",
        "ec2:DeleteRoute",
        "ec2:DescribeNatGateways",
        "ec2:AllocateAddress",
        "ec2:DescribeImages",
        "ec2:CreateVpcEndpoint",
        "ec2:DescribeInstances",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteRouteTable",
        "ec2:CreateInternetGateway",
        "ec2:DeleteInternetGateway",
        "ec2:AssociateRouteTable",
        "ec2:DescribeInternetGateways",
        "ec2:ModifyVpcAttribute",
        "ec2:RevokeSecurityGroupEgress"
      ]
      Resource = "*"
    }, {
      Sid = "ECSAdmin"
      Effect = "Allow"
      Action = [
        "ecs:StartTask",
        "ecs:DescribeTaskSets",
        "ecs:TagResource",
        "ecs:SubmitTaskStateChange",
        "ecs:ListServices",
        "ecs:RunTask",
        "ecs:DescribeTasks",
        "ecs:DeleteService",
        "ecs:ListTagsForResource",
        "ecs:CreateTaskSet",
        "ecs:CreateService",
        "ecs:DescribeServices",
        "ecs:RegisterTaskDefinition",
        "ecs:DescribeContainerInstances",
        "ecs:UntagResource",
        "ecs:ListClusters",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeServiceDeployments",
        "ecs:StopTask",
        "ecs:DeregisterContainerInstance",
        "ecs:ListTaskDefinitions",
        "ecs:DeleteCluster",
        "ecs:DeleteTaskSet",
        "ecs:SubmitAttachmentStateChanges",
        "ecs:DeregisterTaskDefinition",
        "ecs:DescribeServiceRevisions",
        "ecs:UpdateTaskSet",
        "ecs:ListServicesByNamespace",
        "ecs:UpdateService",
        "ecs:UpdateCluster",
        "ecs:ListTaskDefinitionFamilies",
        "ecs:UpdateClusterSettings",
        "ecs:CreateCluster",
        "ecs:DeleteTaskDefinitions",
        "ecs:DeleteAttributes",
        "ecs:DescribeClusters"
      ]
      Resource = "*"
    }, {
      Sid = "MiscAdmin"
      Effect = "Allow"
      Action = [
        "application-autoscaling:*",
        "ec2:GetInstanceUefiData"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ecs_admin_attach" {
  role       = aws_iam_role.TerraformAdministrator.name
  policy_arn = aws_iam_policy.ec2_ecs_admin_policy.arn
}

# IAM, RDS, Route53, ECR, ACM, CLOUDWATCH, SECRETMANAGER Policy
resource "aws_iam_policy" "iam_rds_route53_ecr_acm_cw_sm_admin_policy" {
  name        = "${var.project}-IAM-RDS-ROUTE53-ECR-ACM-CW-SM-AdminPolicy"
  description = "IAM-RDS-ROUTE53-ECR-ACM-CW-SM administration permissions."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid = "IAMAdmin"
      Effect = "Allow"
      Action = [
        "iam:PutRolePolicy",
        "iam:AddRoleToInstanceProfile",
        "iam:ListRolePolicies",
        "iam:GetRole",
        "iam:TagPolicy",
        "iam:TagRole",
        "iam:ListInstanceProfilesForRole",
        "iam:PassRole",
        "iam:CreatePolicy",
        "iam:GetPolicyVersion",
        "iam:CreatePolicyVersion",
        "iam:GetInstanceProfile",
        "iam:ListPolicyVersions",
        "iam:GetRolePolicy",
        "iam:CreateInstanceProfile",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:DeleteInstanceProfile",
        "iam:DeleteRole",
        "iam:RemoveRoleFromInstanceProfile",
        "iam:GetPolicy"
      ]
      Resource = "*"
    }, {
      Sid = "RDSAdmin"
      Effect = "Allow"
      Action = [
        "rds:DescribeGlobalClusters",
        "rds:CreateDBSubnetGroup",
        "rds:DeleteDBInstance",
        "rds:CreateDBSnapshot",
        "rds:DeleteDBCluster",
        "rds:AddTagsToResource",
        "rds:ListTagsForResource",
        "rds:CreateDBCluster",
        "rds:DeleteTenantDatabase",
        "rds:DescribeDBSubnetGroups",
        "rds:CreateDBInstance",
        "rds:DescribeDBInstances",
        "rds:ModifyDBInstance",
        "rds:DeleteDBSubnetGroup",
        "rds:ModifyDBCluster",
        "rds:CreateDBClusterSnapshot",
        "rds:RemoveTagsFromResource",
        "rds:DescribeDBClusters",
        "rds:CreateTenantDatabase"
      ]
      Resource = "*"
    }, {
      Sid = "Route53Admin"
      Effect = "Allow"
      Action = [
        "route53:ListHostedZonesByName",
        "route53:GetHostedZoneCount",
        "route53:ListTagsForResources",
        "route53:ListTagsForResource",
        "route53:ListHealthChecks",
        "route53:AssociateVPCWithHostedZone",
        "route53:DeleteHealthCheck",
        "route53:ListResourceRecordSets",
        "route53:CreateHostedZone",
        "route53:DeleteHostedZone",
        "route53:UpdateHealthCheck",
        "route53:ListHostedZones",
        "route53:GetHostedZone",
        "route53:ChangeTagsForResource",
        "route53:ChangeResourceRecordSets",
        "route53:GetChange",
        "route53:GetHealthCheckCount",
        "route53:GetHealthCheckStatus",
        "route53:CreateHealthCheck",
        "route53:GetHealthCheck"
      ]
      Resource = "*"
    }, {
      Sid = "ECRAdmin"
      Effect = "Allow"
      Action = [
        "ecr:DeleteRepository",
        "ecr:TagResource",
        "ecr:GetLifecyclePolicy",
        "ecr:CreateRepository",
        "ecr:DescribeRepositories",
        "ecr:UntagResource",
        "ecr:ListTagsForResource",
        "ecr:PutLifecyclePolicy",
        "ecr:DeleteLifecyclePolicy"
      ]
      Resource = "*"
    }, {
      Sid = "ACMAdmin"
      Effect = "Allow"
      Action = [
        "acm:AddTagsToCertificate",
        "acm:DeleteCertificate",
        "acm:RequestCertificate",
        "acm:ListTagsForCertificate",
        "acm:DescribeCertificate"
      ]
      Resource = "*"
    }, {
      Sid = "CloudWatchAdmin"
      Effect = "Allow"
      Action = [
        "cloudwatch:DescribeAlarms",
        "cloudwatch:TagResource",
        "cloudwatch:UntagResource"
      ]
      Resource = "*"
    }, {
      Sid = "AutoScalingAdmin"
      Effect = "Allow"
      Action = [
        "autoscaling:DeleteAutoScalingGroup",
        "autoscaling:DeleteScheduledAction",
        "autoscaling:DetachInstances",
        "autoscaling:CreateOrUpdateTags",
        "autoscaling:DeleteTags",
        "autoscaling:DescribeScheduledActions",
        "autoscaling:DeletePolicy",
        "autoscaling:DetachLoadBalancerTargetGroups",
        "autoscaling:DetachLoadBalancers"
      ]
      Resource = "*"
    }, {
      Sid = "SecretsManagerAdmin"
      Effect = "Allow"
      Action = [
        "secretsmanager:TagResource",
        "secretsmanager:CreateSecret",
        "secretsmanager:PutSecretValue",
        "secretsmanager:DeleteSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:DescribeSecret",
        "secretsmanager:UntagResource"
      ]
      Resource = "*"
    }, {
      Sid = "BackupAdmin"
      Effect = "Allow"
      Action = ["backup:*", "backup-storage:*"]
      Resource = "*"
    }, {
      Sid = "IAMReadGroupUser"
      Effect = "Allow"
      Action = [
        "iam:GetGroup",
        "iam:GetUser"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "iam_rds_route53_ecr_acm_admin_attach" {
  role       = aws_iam_role.TerraformAdministrator.name
  policy_arn = aws_iam_policy.iam_rds_route53_ecr_acm_cw_sm_admin_policy.arn
}

# SNS, KMS, BUDGET, SSM Policy
resource "aws_iam_policy" "sns_kms_budget_ssm_admin_policy" {
  name        = "${var.project}-SNS-KMS-BUDGET-SSM-AdminPolicy"
  description = "SNS-KMS-BUDGET-SSM administration permissions."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid = "SNSAdmin"
      Effect = "Allow"
      Action = [
        "sns:GetTopicAttributes",
        "sns:ListTagsForResource",
        "sns:GetSubscriptionAttributes",
        "sns:DeleteTopic",
        "sns:SetTopicAttributes",
        "sns:CreateTopic",
        "sns:Subscribe",
        "sns:ListSubscriptionsByTopic",
        "sns:TagResource",
        "sns:Unsubscribe",
        "sns:UntagResource"
      ]
      Resource = "*"
    }, {
      Sid = "KMSAdmin"
      Effect = "Allow"
      Action = [
        "kms:Encrypt",
        "kms:UntagResource",
        "kms:CreateGrant",
        "kms:Decrypt",
        "kms:TagResource",
        "kms:DescribeKey",
        "kms:GenerateDataKey",
        "kms:GenerateRandom",
        "kms:DescribeCustomKeyStores",
        "kms:DeleteCustomKeyStore",
        "kms:UpdateCustomKeyStore",
        "kms:CreateKey",
        "kms:ListRetirableGrants",
        "kms:CreateCustomKeyStore",
        "kms:ListKeys",
        "kms:ListAliases",
        "kms:DisconnectCustomKeyStore",
        "kms:ConnectCustomKeyStore"
      ]
      Resource = "*"
    }, {
      Sid = "KMSResourceSpecific"
      Effect = "Allow"
      Action = ["kms:*"]
      Resource = [
        "arn:aws:kms:*:897729117054:alias/*",
        "arn:aws:kms:*:897729117054:key/*"
      ]
    }, {
      Sid = "BudgetsAdmin"
      Effect = "Allow"
      Action = [
        "budgets:*"
      ]
      Resource = "*"
    }, {
      Sid = "SSMAdmin"
      Effect = "Allow"
      Action = [
        "ssm:GetParameters",
        "ssm:GetParameter"
      ]
      Resource = [
        "arn:aws:ssm:eu-north-1:897729117054:parameter/backend_ppp_prod_tag",
        "arn:aws:ssm:eu-north-1:897729117054:parameter/frontend_ppp_prod_tag",
        "arn:aws:ssm:eu-north-1:897729117054:parameter/keycloak_ppp_prod_tag"
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sns_kms_budget_ssm_admin_attach" {
  role       = aws_iam_role.TerraformAdministrator.name
  policy_arn = aws_iam_policy.sns_kms_budget_ssm_admin_policy.arn
}

# ELB, LOGS, LAMBDA, EVENTS Policy
resource "aws_iam_policy" "elb_logs_lambda_events_admin_policy" {
  name        = "${var.project}-ELB-LOGS-LAMBDA-EVENTS-AdminPolicy"
  description = "ELB-LOGS-LAMBDA-EVENTS administration permissions."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid = "ELBAdmin"
      Effect = "Allow"
      Action = [
        "elasticloadbalancing:*"
      ]
      Resource = "*"
    },
      {
        Sid = "LogsAdmin"
        Effect = "Allow"
        Action = [
          "logs:ListTagsForResource",
          "logs:DeleteRetentionPolicy",
          "logs:TagResource",
          "logs:CreateLogGroup",
          "logs:PutRetentionPolicy",
          "logs:DescribeLogGroups",
          "logs:DeleteLogGroup"
        ]
        Resource = "*"
      },
      {
        Sid = "STSAdmin"
        Effect = "Allow"
        Action = [
          "sts:TagSession",
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      },
      {
        Sid = "LambdaAdmin"
        Effect = "Allow"
        Action = [
          "lambda:DeleteFunction",
          "lambda:UntagResource",
          "lambda:GetFunction",
          "lambda:AddPermission",
          "lambda:CreateFunction",
          "lambda:TagResource",
          "lambda:GetFunctionCodeSigningConfig",
          "lambda:RemovePermission",
          "lambda:ListVersionsByFunction",
          "lambda:GetPolicy",
          "lambda:ListLayerVersions",
          "lambda:ListLayers",
          "lambda:PublishLayerVersion",
          "lambda:GetLayerVersion",
          "lambda:GetLayerVersionPolicy",
          "lambda:UpdateFunctionConfiguration",
          "lambda:UpdateFunctionCode",
          "lambda:DeleteLayerVersion",
          "lambda:PublishVersion"
        ]
        Resource = "*"
      },
      {
        Sid = "LambdaResourceSpecific"
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:GetLayerVersion",
          "lambda:GetFunction",
          "lambda:UpdateFunctionConfiguration",
          "lambda:GetFunctionConfiguration",
          "lambda:GetLayerVersionPolicy",
          "lambda:UpdateFunctionCode",
          "lambda:DeleteLayerVersion",
          "lambda:PublishVersion"
        ]
        Resource = [
          "arn:aws:lambda:*:897729117054:layer:*:*",
          "arn:aws:lambda:*:897729117054:function:*"
        ]
      },
      {
        Sid = "LambdaLayerSpecific"
        Effect = "Allow"
        Action = ["lambda:GetLayerVersion"]
        Resource = [
          "arn:aws:lambda:eu-north-1:770693421928:layer:Klayers-p312-boto3:*",
          "arn:aws:lambda:eu-north-1:770693421928:layer:Klayers-p312-mysql-connector-python:*"
        ]
      },
      {
        Sid = "EventsAdmin"
        Effect = "Allow"
        Action = [
          "events:PutRule",
          "events:ListRuleNamesByTarget",
          "events:ListRules",
          "events:RemoveTargets",
          "events:ListTargetsByRule",
          "events:DescribeRule",
          "events:DeleteRule",
          "events:PutTargets",
          "events:ListTagsForResource"
        ]
        Resource = "*"
      }]
  })
}

resource "aws_iam_role_policy_attachment" "elb_logs_lambda_events_admin_attach" {
  role       = aws_iam_role.TerraformAdministrator.name
  policy_arn = aws_iam_policy.elb_logs_lambda_events_admin_policy.arn
}

# WAFv2 Policy
resource "aws_iam_policy" "wafv2_admin_policy" {
  name        = "${var.project}-WAFv2AdminPolicy"
  description = "WAFv2 administration permissions."
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid = "WAFv2Admin"
        Effect = "Allow"
        Action = [
          "wafv2:ListWebACLs",
          "wafv2:TagResource",
          "wafv2:ListResourcesForWebACL",
          "wafv2:AssociateWebACL",
          "wafv2:ListTagsForResource",
          "wafv2:DisassociateWebACL",
          "wafv2:GetWebACLForResource",
          "wafv2:DeleteWebACL",
          "wafv2:UpdateWebACL",
          "wafv2:GetWebACL",
          "wafv2:CreateWebACL",
          "wafv2:UntagResource"
        ]
        Resource = "*"
      },
      {
        Sid = "WAFv2ResourceSpecific"
        Effect = "Allow"
        Action = [
          "wafv2:TagResource",
          "wafv2:ListResourcesForWebACL",
          "wafv2:AssociateWebACL",
          "wafv2:ListTagsForResource",
          "wafv2:DisassociateWebACL",
          "wafv2:GetWebACLForResource",
          "wafv2:DeleteWebACL",
          "wafv2:UpdateWebACL",
          "wafv2:GetWebACL",
          "wafv2:CreateWebACL",
          "wafv2:UntagResource"
        ]
        Resource = [
          "arn:aws:wafv2:*:897729117054:*/managedruleset/*/*",
          "arn:aws:wafv2:*:897729117054:*/webacl/*/*",
          "arn:aws:wafv2:*:897729117054:*/rulegroup/*/*",
          "arn:aws:wafv2:*:897729117054:*/ipset/*/*",
          "arn:aws:wafv2:*:897729117054:*/regexpatternset/*/*"
        ]
      },
      {
        Sid = "VisualEditor2"
        Effect = "Allow"
        Action = [
          "wafv2:TagResource",
          "wafv2:ListResourcesForWebACL",
          "wafv2:AssociateWebACL",
          "wafv2:ListTagsForResource",
          "wafv2:DisassociateWebACL",
          "wafv2:GetWebACLForResource",
          "wafv2:DeleteWebACL",
          "wafv2:UpdateWebACL",
          "wafv2:GetWebACL",
          "wafv2:CreateWebACL",
          "iam:CreateServiceLinkedRole",
          "wafv2:UntagResource",
        ]
        Resource = [
          "arn:aws:apigateway:*::/restapis/*/stages/*",
          "arn:aws:elasticloadbalancing:*:897729117054:loadbalancer/app/*/*",
          "arn:aws:ec2:*:897729117054:verified-access-instance/*",
          "arn:aws:cognito-idp:*:897729117054:userpool/*",
          "arn:aws:wafv2:*:897729117054:*/managedruleset/*/*",
          "arn:aws:wafv2:*:897729117054:*/webacl/*/*",
          "arn:aws:wafv2:*:897729117054:*/rulegroup/*/*",
          "arn:aws:wafv2:*:897729117054:*/ipset/*/*",
          "arn:aws:amplify:*:897729117054:apps/*",
          "arn:aws:apprunner:*:897729117054:service/*/*",
          "arn:aws:wafv2:*:897729117054:*/regexpatternset/*/*",
          "arn:aws:appsync:*:897729117054:apis/*",
          "arn:aws:iam::897729117054:role/*"
        ]
      }, {
        Sid = "VisualEditor1"
        Effect = "Allow"
        Action = [
          "ec2:RevokeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupEgress",
          "lambda:PublishLayerVersion"
        ]
        Resource = [
          "arn:aws:ec2:*:897729117054:security-group/*",
          "arn:aws:ec2:*:897729117054:security-group-rule/*",
          "arn:aws:lambda:*:897729117054:layer:*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "wafv2_admin_attach" {
  role       = aws_iam_role.TerraformAdministrator.name
  policy_arn = aws_iam_policy.wafv2_admin_policy.arn
}
