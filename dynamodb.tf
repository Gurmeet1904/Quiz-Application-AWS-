resource "aws_dynamodb_table" "quiz_questions" {
  name           = "QuizQuestionsTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "QuestionId"

  attribute {
    name = "QuestionId"
    type = "S"
  }

  attribute {
    name = "Category"
    type = "S"
  }

  attribute {
    name = "Difficulty"
    type = "S"
  }

  global_secondary_index {
    name               = "CategoryIndex"
    hash_key           = "Category"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "DifficultyIndex"
    hash_key           = "Difficulty"
    projection_type    = "ALL"
  }
}
