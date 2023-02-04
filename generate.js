function genReturnStatement(node, context) {
    const { push } = context;
    // 追加 return 关键字和空格
    push(`return `);
    genNode(node.return, context)
}

function genStringLiteral(node, context) {
    const { push } = context;
    push(`'${node.value}'`);
}

function genCallExpression(node, context) {
    const { push } = context;
    // 取得被调用函数名称和参数列表
    const { callee, arguments: args } = node;
    console.log(args);
    // 生成函数调用代码
    push(`${callee.name}(`);
    // 调用 genNodeList 生成参数代码
    genNodeList(args, context);
    // 补全括号
    push(`)`);
}

function genArrayExpression(node, context) {
    const { push } = context;
    push('[');
    genNodeList(node.elements, context);
    push(']')
}

function genNodeList(nodes, context) {
    const { push } = context;
    console.log(nodes);
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        genNode(node, context);
        if (i < nodes.length - 1) {
            push(', ')
        }
    }
}

function genFunctionDecl(node, context) {
    const { push, indent, deIndent } = context;
    push(`function ${node.id.name}`);
    push(`(`);
    // 为函数的参数生成代码
    genNodeList(node.params, context);
    push(`) `);
    push(`{`);
    // 缩进
    indent();
    // 为函数体生成代码，递归地调用 genNode 函数
    node.body.forEach(n => {
        genNode(n, context);
    });
    // 取消缩进
    deIndent();
    push(`}`);
}

function genNode(node, context) {
    switch (node.type) {
        case 'FunctionDecl':
            genFunctionDecl(node, context)
            break;
        case 'ReturnStatement':
            genReturnStatement(node, context)
            break;
        case 'CallExpression':
            genCallExpression(node, context)
            break;
        case 'StringLiteral':
            genStringLiteral(node, context)
            break;
        case 'ArrayExpression':
            genArrayExpression(node, context)
            break;
        default:
            break;
    }
}

function generate(node) {
    const context = {
        code: '',
        // 拼接代码
        push(code) {
            context.code += code;
        },
        // 当前缩进的级别，初始值为 0，即没有缩进
        currentIndent: 0,
        // 该函数用来换行，即在代码字符串的后面追加 \n 字符，
        // 另外，换行时应该保留缩进，所以我们还要追加 currentIndent * 2 个空格字符
        newline() {
            context.code += '\n' + '  '.repeat(context.currentIndent)
        },
        // 用来缩进，即让 currentIndent 自增后，调用换行函数
        indent() {
            context.currentIndent++;
            context.newline();
        },
        // 取消缩进，即让 currentIndent 自减后，调用换行函数
        deIndent() {
            context.currentIndent--;
            context.newline();
        }
    };
    // 代码生成
    genNode(node, context);
    // 返回渲染函数代码
    return context.code;
}