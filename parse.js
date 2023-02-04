// 定义状态机的状态
const state = {
    initial: 1,
    tagOpen: 2,
    tagName: 3,
    text: 4,
    tagEnd: 5,
    tagEndName: 6
}

function isAlpha(char) {
    return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

function tokenize(str) {
    let currentState = state.initial;
    const chars = []; // 用于缓存字符
    const tokens = [];
    while (str) {
        const char = str[0];
        switch (currentState) {
            case state.initial:
                if (char === '<') {
                    currentState = state.tagOpen;
                } else if (isAlpha(char)) {
                    currentState = state.text;
                    chars.push(char);
                }
                str = str.slice(1);
                break;
            case state.tagOpen:
                if (isAlpha(char)) {
                    currentState = state.tagName;
                    chars.push(char);

                } else if (char === '/') {
                    currentState = state.tagEnd;
                }
                str = str.slice(1)
                break;
            case state.tagName:
                if (isAlpha(char)) {
                    chars.push(char);
                } else if (char === '>') {
                    currentState = state.initial;
                    tokens.push({
                        type: 'tag',
                        name: chars.join('')
                    })
                    chars.length = 0;
                }
                str = str.slice(1);
                break;
            case state.text:
                if (isAlpha(char)) {
                    chars.push(char);
                } else if (char === '<') {
                    currentState = state.tagOpen;
                    tokens.push({
                        type: 'text',
                        content: chars.join('')
                    })
                    chars.length = 0;

                }
                str = str.slice(1);
                break;
            case state.tagEnd:
                if (isAlpha(char)) {
                    // 1. 遇到字母，切换到结束标签名称状态
                    currentState = state.tagEndName
                        // 2. 将当前字符缓存到 chars 数组
                    chars.push(char)
                        // 3. 消费当前字符
                    str = str.slice(1)
                }
                break
                // 状态机当前处于结束标签名称状态
            case state.tagEndName:
                if (isAlpha(char)) {
                    // 1. 遇到字母，不需要切换状态，但需要将当前字符缓存到 chars
                    chars.push(char)
                } else if (char === '>') {
                    // 1. 遇到字符 >，切换到初始状态
                    currentState = state.initial
                    tokens.push({
                        type: 'tagEnd',
                        name: chars.join('')
                    })
                    chars.length = 0;
                }
                str = str.slice(1)
                break;
        }
    }
    return tokens
}

function parse(str) {
    const tokens = tokenize(str);
    const root = {
        type: 'Root',
        children: []
    }
    const elementStack = [root];
    while (tokens.length) {
        const parent = elementStack[elementStack.length - 1];
        const t = tokens[0];
        switch (t.type) {
            case 'tag':
                const elementNode = {
                    type: 'Element',
                    tag: t.name,
                    children: []
                }
                parent.children.push(elementNode);
                elementStack.push(elementNode);
                break;
            case 'text':
                const textNode = {
                    type: 'Text',
                    content: t.content
                }
                parent.children.push(textNode);
                break
            case 'tagEnd':
                elementStack.pop();
                break;
        }
        tokens.shift()
    }
    return root;
}