/// <reference path='rule.ts'/>
/// <reference path='baseRule.ts'/>

module Lint.Rules {

  export class WhitespaceRule extends BaseRule {
    constructor() {
      super("enclosing_whitespace");
    }

    public isEnabled() : boolean {
      return this.getValue() === true;
    }

    public apply(syntaxTree: TypeScript.SyntaxTree): RuleFailure[] {
      return this.applyWithWalker(syntaxTree, new WhitespaceWalker(syntaxTree.fileName()));
    }
  }

  class WhitespaceWalker extends Lint.RuleWalker {
    static FAILURE_STRING = "missing whitespace";

    // check for trailing space for the given tokens
    public visitToken(token: TypeScript.ISyntaxToken): void {
      super.visitToken(token);

      var kind = token.kind();
      if (kind === TypeScript.SyntaxKind.CatchKeyword ||
          kind === TypeScript.SyntaxKind.ColonToken ||
          kind === TypeScript.SyntaxKind.CommaToken ||
          kind === TypeScript.SyntaxKind.EqualsToken ||
          kind === TypeScript.SyntaxKind.ForKeyword ||
          kind === TypeScript.SyntaxKind.IfKeyword ||
          kind === TypeScript.SyntaxKind.SemicolonToken ||
          kind === TypeScript.SyntaxKind.SwitchKeyword ||
          kind === TypeScript.SyntaxKind.WhileKeyword ||
          kind === TypeScript.SyntaxKind.WithKeyword) {

        this.checkForLeadingSpace(this.position(), token.trailingTrivia());
      }
    }

    // check for spaces between the operator symbol
    public visitBinaryExpression(node: TypeScript.BinaryExpressionSyntax): void {
      var position = this.positionAfter(node.left);
      this.checkForLeadingSpace(position, node.left.trailingTrivia());

      position += node.operatorToken.fullWidth();
      this.checkForLeadingSpace(position, node.operatorToken.trailingTrivia());

      super.visitBinaryExpression(node);
    }

    // check for spaces between ternary operator symbols
    public visitConditionalExpression(node: TypeScript.ConditionalExpressionSyntax): void {
      var position = this.positionAfter(node.condition);
      this.checkForLeadingSpace(position, node.condition.trailingTrivia());

      position += node.questionToken.fullWidth();
      this.checkForLeadingSpace(position, node.questionToken.trailingTrivia());

      position += node.whenTrue.fullWidth();
      this.checkForLeadingSpace(position, node.whenTrue.trailingTrivia());

      super.visitConditionalExpression(node);
    }

    // check for spaces in variable declarations
    public visitVariableDeclarator(node: TypeScript.VariableDeclaratorSyntax): void {
      var position = this.positionAfter(node.identifier, node.typeAnnotation);

      if (node.equalsValueClause !== null) {
        if (node.typeAnnotation !== null) {
          this.checkForLeadingSpace(position, node.typeAnnotation.trailingTrivia());
        } else {
          this.checkForLeadingSpace(position, node.identifier.trailingTrivia());
        }
      }

      super.visitVariableDeclarator(node);
    }

    // check for spaces within imports
    public visitImportDeclaration(node: TypeScript.ImportDeclarationSyntax): void {
      var position = this.positionAfter(node.importKeyword, node.identifier);
      this.checkForLeadingSpace(position, node.identifier.trailingTrivia());

      super.visitImportDeclaration(node);
    }

    // check for spaces within exports
    public visitExportAssignment(node: TypeScript.ExportAssignmentSyntax): void {
      var position = this.positionAfter(node.exportKeyword);
      this.checkForLeadingSpace(position, node.exportKeyword.trailingTrivia());

      super.visitExportAssignment(node);
    }

    private checkForLeadingSpace(position: number, trivia: TypeScript.ISyntaxTriviaList) {
      var failure = null;

      if(trivia.count() < 1) {
        failure = new Lint.RuleFailure(this.getFileName(), position, WhitespaceWalker.FAILURE_STRING);
      } else {
        var kind = trivia.syntaxTriviaAt(0).kind();
        if(kind !== TypeScript.SyntaxKind.WhitespaceTrivia && kind !== TypeScript.SyntaxKind.NewLineTrivia) {
          failure = new Lint.RuleFailure(this.getFileName(), position, WhitespaceWalker.FAILURE_STRING);
        }
      }

      if(failure) {
        this.addFailure(failure);
      }
    }
  }

}
