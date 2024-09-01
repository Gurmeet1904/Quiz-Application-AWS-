resource "null_resource" "populate_quiz_questions" {
  depends_on = [aws_dynamodb_table.quiz_questions]

  provisioner "local-exec" {
    command = <<EOT
      aws dynamodb put-item --table-name QuizQuestionsTable --item '{
        "QuestionId": {"S": "1"},
        "Category": {"S": "Science"},
        "Difficulty": {"S": "Medium"},
        "QuestionText": {"S": "What is the boiling point of water?"},
        "Options": {"M": {
          "A": {"S": "90°C"},
          "B": {"S": "100°C"},
          "C": {"S": "110°C"},
          "D": {"S": "120°C"}
        }},
        "CorrectAnswer": {"S": "B"}
      }'
    EOT
  }
}
