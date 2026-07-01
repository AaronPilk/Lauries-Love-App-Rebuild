variable "aws_region" {
  type        = string
  description = "aws_region"
  default     = "us-east-1"
}

variable "aws_profile" {
  type        = string
  description = "aws_profile"
}

variable "aws_project_name" {
  type        = string
  description = "aws_project_name"
}

variable "aws_prefix" {
  type        = string
  description = "aws_prefix"
}

variable "aws_ssl_domain" {
  type        = string
  description = "aws_ssl_domain"
}

variable "aws_root_domain" {
  type        = string
  description = "aws_root_domain"
}

variable "aws_ecs_desired_count" {
  type        = string
  description = "aws_ecs_desired_count"
}

variable "app_domain" {
  type        = string
  description = "app_domain"
}
variable "app_env" {
  type        = string
  description = "app_env"
}

variable "database_host" {
  type        = string
  description = "database_host"
}

variable "database_name" {
  type        = string
  description = "database_name"
}

variable "database_user" {
  type        = string
  description = "database_user"
}

variable "database_password" {
  type        = string
  description = "database_password"
}

variable "database_port" {
  type        = string
  description = "database_port"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "cognito_user_pool_id"
}

variable "cognito_client_id" {
  type        = string
  description = "cognito_client_id"
}

variable "aws_access_key_id" {
  type        = string
  description = "aws_access_key_id"
}

variable "aws_secret_access_key" {
  type        = string
  description = "aws_secret_access_key"
}

variable "aws_s3_bucket" {
  type       = string
  description = "aws_s3_bucket"
}


variable "authorize_payment_api_login_id" {
  type       = string
  description = "authorize_payment_api_login_id"
}

variable "authorize_transaction_key" {
  type       = string
  description = "authorize_transaction_key"
}