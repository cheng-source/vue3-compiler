function traverseNode(ast, context) {
    context.currentNode = ast;
    // 1. 增加退出阶段的回调函数数组
    const exitFns = []
    const transforms = context.nodeTransform;
    for (let i = 0; i < transforms.length; i++) {
        // 2. 转换函数可以返回另外一个函数，该函数即作为退出阶段的回调函数
        const onExit = transforms[i](context.currentNode, context);
        if (onExit) {
            exitFns.push(onExit);
        }
        // 由于任何转换函数都可能移除当前节点，因此每个转换函数执行完毕后，
        if (!context.currentNode) return
    }
    const children = context.currentNode.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            // 递归地调用 traverseNode 转换子节点之前，将当前节点设置为父节点
            // 都应该检查当前节点是否已经被移除，如果被移除了，直接返回即可
            context.parent = context.currentNode;
            // 设置位置索引
            context.childIndex = i;
            traverseNode(children[i], context);
        }
    }

    let i = exitFns.length;
    while (i--) {
        exitFns[i]()
    }
}
// 转换 Root 根节点
function transformRoot(node) {
    return () => {
        if (node.type !== 'Root') {
            return
        }
        const vnodeJSAST = node.children[0].jsNode;
        node.jsNode = {
            type: 'FunctionDecl',
            id: { type: 'Identifier', name: 'render' },
            params: [],
            body: [{
                type: 'ReturnStatement',
                return: vnodeJSAST
            }]
        }
    }
}

function transformElement(node) {
    // if (node.type === 'Element' && node.tag === 'p') {
    //     node.tag = 'h1'
    // }
    // 在这里编写退出节点的逻辑，当这里的代码运行时，当前转换节点的子节点一定处理完毕了
    return () => {
        if (node.type !== 'Element') {
            return
        }
        // 创建 h 函数调用语句
        const callExp = createCallExpression('h', [
                createStringLiteral(node.tag)
            ])
            // 处理 h 函数调用的参数
        node.children.length === 1 ? callExp.arguments.push(node.children[0].jsNode) : callExp.arguments.push(
            createArrayExpression(node.children.map(c => c.jsNode))
        )
        node.jsNode = callExp;

    }
}
// 转换文本节点
function transformText(node, context) {
    if (node.type !== 'Text') {
        // context.replaceNode({
        //     type: 'Element',
        //     tag: 'span'
        // })
        // context.removeNode();
        return
    }
    node.jsNode = createStringLiteral(node.content);
}

function transforms(ast) {
    const context = {
        // 当前正在转换的节点
        currentNode: null,
        // 当前节点在父节点的 children 中的位置索引
        childIndex: 0,
        // 当前转换节点的父节点
        parent: null,
        // 用于替换节点的函数，接收新节点作为参数
        replaceNode(node) {
            context.parent.children[context.childIndex] = node;
            context.currentNode = node;
        },
        // 用于删除当前节点
        removeNode() {
            context.parent.children.splice(context.childIndex, 1);
            context.currentNode = null;
        },
        nodeTransform: [
            transformElement,
            transformText,
            transformRoot
        ]
    }
    traverseNode(ast, context);
}