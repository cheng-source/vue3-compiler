# vue3-compiler
vue.js模板编译器

Vue.js的模板编译器用于把模板编译为渲染函数，它的工作流程大致分为三个步骤：

（1）分析模板，将其解析（parse）为模板 AST。

（2）将模板 AST 转换（transform）为用于描述渲染函数的 JavaScript AST。

（3）根据 JavaScript AST 生成（generate）渲染函数代码。


vue.js模板编译为渲染函数的完整流程如下图所示。
![image](https://user-images.githubusercontent.com/76691254/216770241-382a8ce0-ebcb-4431-bb03-985c2c4a111e.png)


parser的实现原理：用<b>有限状态自动机</b>构造一个<b>词法分析器</b>。词法分析的过程就是状态机在不同状态之间迁移的过程。在此过程中，<b>状态机会产生一个个Token，形成一个Token列表</b>。我们将使用该<b>Token列表</b>来构造用于<b>描述模板的AST</b>。具体做法是，扫描Token列表并维护一个开始标签栈。每当扫描到一个开始标签节点，就将其压入栈顶。栈顶的节点始终作为下一个扫描的节点的父节点。这样，当所有 Token 扫描完毕后，即可构建出一棵树型AST。

transform实现原理：采用深度优先的方式对AST进行<b>遍历</b>。<b>在遍历过程中，对AST节点进行各种操作</b>，从而实现对AST的转换。转换函数有一个context参数，context称为转换上下文。上下文对象中通常会维护程序的当前状态，例如当前访问的节点、当前访问的节点的父节点、当前访问的节点的位置索引等信息。有了上下文对象及其包含的重要信息后，即可轻松地实现节点的替换、删除等能力。但有时，<b>当前访问节点的转换工作依赖于其子节点的转换结果</b>，所以为了优先完成子节点的转换，将整个转换过程分为<b>“进入阶段”</b>与<b>“退出阶段”</b>。每个转换函数都分两个阶段执行，这样就可以实现更加细粒度的转换控制。

generate实现原理：代码生成的过程是<b>字符串拼接</b>的过程。我们需要为不同的AST节点编写对应的代码生成函数。为了让生成的代码具有更强的可读性，还要注意对生成的代码进行<b>缩进</b>和<b>换行</b>。

