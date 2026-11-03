import ts from 'typescript';
import {createHash} from 'node:crypto';

// Compare the authored motion values, treating cached DOM writes exactly like
// their original assignments. This lets render optimizations coexist with an
// exact choreography rollback.
export function motionStyleFingerprint(text,file) {
  const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const printer=ts.createPrinter({removeComments:true}),values=[];
  const print=node=>printer.printNode(ts.EmitHint.Unspecified,node,source);
  function visit(node) {
    if(ts.isCallExpression(node)) {
      const fn=node.expression,args=node.arguments;
      if(ts.isIdentifier(fn)&&fn.text==='writeMotionStyle')values.push([print(args[0]),args[1].text,print(args[2])]);
      else if(ts.isPropertyAccessExpression(fn)&&fn.name.text==='setProperty'&&print(fn.expression).endsWith('.style'))values.push([print(fn.expression),args[0].text,print(args[1])]);
    } else if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isPropertyAccessExpression(node.left)) {
      const target=node.left;
      if(print(target.expression).endsWith('.style'))values.push([print(target.expression),target.name.text==='zIndex'?'z-index':target.name.text,print(node.right)]);
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
  return createHash('sha256').update(JSON.stringify(values)).digest('hex');
}
