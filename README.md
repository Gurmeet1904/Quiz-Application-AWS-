# Quiz Application Deployment with Terraform

This project uses Terraform to deploy the infrastructure required for a serverless quiz application on AWS. The setup includes an S3 bucket for hosting static files, a Lambda function for handling quiz logic, an API Gateway for exposing the Lambda function, a DynamoDB table for storing quiz questions, and CloudWatch for monitoring.

## Link of deployment
    http://myterraformquizapp.s3-website-us-east-1.amazonaws.com

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) v1.0.0 or later
- [AWS CLI](https://aws.amazon.com/cli/) configured with the necessary permissions
- An AWS account

## Resources Created

### S3 Bucket

- **Bucket Name**: Defined by `var.bucketname`
- **Bucket Ownership**: Configured to prefer bucket owner for object ownership.
- **Public Access Settings**: Public ACLs and policies are not blocked.
- **Bucket ACL**: Set to `public-read` to allow public access to objects.
- **Static Website Hosting**: The bucket is configured to serve a static website.

### Lambda Function

- **Function Name**: `quiz_handler`
- **Runtime**: Node.js 18.x
- **Environment Variable**: `DYNAMODB_TABLE` set to the name of the DynamoDB table.
- **IAM Role**: `lambda_exec_role` with basic Lambda execution permissions.

### API Gateway

- **API Name**: `QuizAPI`
- **Protocol**: HTTP
- **Integration**: Lambda function proxy integration.
- **Route**: `ANY /quiz`
- **Stage**: `$default` with auto-deploy enabled.

### DynamoDB Table

- **Table Name**: `QuizQuestionsTable`
- **Billing Mode**: Pay-per-request
- **Primary Key**: `QuestionId` (String)
- **Global Secondary Indexes**:
  - `CategoryIndex` (String)
  - `DifficultyIndex` (String)

### CloudWatch

- **Log Groups**: Created for Lambda function and API Gateway.
- **Alarms**:
  - `LambdaErrors`: Alerts when the Lambda function has errors.
  - `ApiGatewayLatency`: Alerts when API Gateway latency exceeds 5000 ms.

## Terraform run commands
    
#### Initialize the Terraform working directory
    terraform init

#### Review the terraform plan
    terraform plan

#### Apply the configuration
    terraform apply -auto-approve

#### Delete all the resources created by terraform
    terraform destroy 

## Screenshots

### S3 Bucket
![Screenshot from 2024-09-01 23-24-24](https://github.com/user-attachments/assets/380ac52f-d769-48b4-9406-3c343a0f4634)

![Screenshot from 2024-09-01 23-24-48](https://github.com/user-attachments/assets/58e6d289-7938-41af-9a3d-311fb5de5c24)

### Lambda

![Screenshot from 2024-09-01 23-26-57](https://github.com/user-attachments/assets/6bbeff77-2896-4fd8-b2b7-b8559d5d8d5b)

### API Gateway
![Screenshot from 2024-09-01 23-27-55](https://github.com/user-attachments/assets/5500a7b7-d900-4479-b9b6-e1cc6440582f)

### DynamoDB
![Screenshot from 2024-09-01 23-28-36](https://github.com/user-attachments/assets/dda4cd79-99b8-4187-a3dc-5ebd722cfd5b)
