## Shared Terraform Projects

This Terraform project is used to create shared resources, which are used by multiple projects in the same AWS account.
Currently the following modules get shared:
- VPC
- ALB

The shared use allows to reduce costs for resources like VPC (especially all VPC Endpoints) and ALB (private and public) as they are only created once and can be used by multiple projects.

## How do shared modules work?

A shared module can be used by referencing the `terraform_remote_state` data source to access the outputs of the shared module.
The principal is, that the shared module is deployed once and the outputs can be accessed by multiple projects.
This works because Terraform stores the state of the resources in a remote backend, which is configured in the `backend` block of the Terraform configuration.
This state file contains information about the current infrastructure and the outputs of the shared module, which can be accessed by other projects.
All Projects can access the same S3 Bucket, which allows them to read the outputs of the shared module.

## How to make use of shared resources
Following is a code example which allows to access the outputs of a shared VPC module in a project.

```hcl
data "terraform_remote_state" "shared_vpc" { 
  backend = "s3"
  config = {
    bucket = "ams-projects-terraform-state-bucket"
    key    = "shared/vpc/terraform.tfstate"
    region = "eu-north-1"
  }
}

module "rds_mysql" {
  source  = "../../modules/rds_mysql"
  vpc_id  = data.terraform_remote_state.shared_vpc.outputs.vpc_id
  # weitere Variablen ...
}
```


## Terraform-Commands
**DEV-Environment**
- `terraform init -backend-config="envs/dev-state.config" -reconfigure`
- `terraform plan -var-file="envs/dev.tfvars"`
- `terraform apply -var-file="envs/dev.tfvars"`

**PROD-Environment**
- `terraform init -backend-config="envs/prod-state.config" -reconfigure`
- `terraform plan -var-file="envs/prod.tfvars"`
- `terraform apply -var-file="envs/prod.tfvars"`


