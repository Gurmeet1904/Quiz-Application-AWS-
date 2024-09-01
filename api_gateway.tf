resource "aws_apigatewayv2_api" "quiz_api" {
  name          = "QuizAPI"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "quiz_integration" {
  api_id             = aws_apigatewayv2_api.quiz_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.quiz_handler.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "quiz_route" {
  api_id    = aws_apigatewayv2_api.quiz_api.id
  route_key = "ANY /quiz"
  target    = "integrations/${aws_apigatewayv2_integration.quiz_integration.id}"
}

resource "aws_apigatewayv2_stage" "quiz_stage" {
  api_id      = aws_apigatewayv2_api.quiz_api.id
  name        = "$default"
  auto_deploy = true
}
