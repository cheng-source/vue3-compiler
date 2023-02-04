function compile(template) {
    // 生成模板 AST
    const ast = parse(template);
    // 将模板AST转换为 JavaScript AST
    transforms(ast);
    // 代码生成
    const code = generate(ast.jsNode)
    return code;
}